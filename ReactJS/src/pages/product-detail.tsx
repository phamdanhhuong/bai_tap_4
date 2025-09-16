import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Button,
  List,
  Rate,
  Input,
  message,
  Spin,
  Divider,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
} from "antd";
import {
  HeartOutlined,
  HeartFilled,
  EyeOutlined,
  ShoppingCartOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import {
  getSimilarProductsApi,
  addToViewHistoryApi,
  addToFavoritesApi,
  removeFromFavoritesApi,
  getProductStatsApi,
  getProductCommentsApi,
  addProductCommentApi,
  addToPurchaseHistoryApi,
  getProductByIdApi,
  checkFavoriteStatusApi,
} from "../util/api";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  inStock: boolean;
  viewCount?: number;
  purchaseCount?: number;
  commentCount?: number;
}

interface Comment {
  _id: string;
  comment: string;
  rating?: number;
  userId: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface ProductStats {
  viewCount: number;
  purchaseCount: number;
  commentCount: number;
  favoriteCount: number;
}

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [purchaseForm] = Form.useForm();

  useEffect(() => {
    if (productId) {
      loadProductData();
    }
  }, [productId]);

  const loadProductData = async () => {
    if (!productId) return;

    setLoading(true);
    try {
      // Lấy thông tin sản phẩm thật từ API
      const productRes: any = await getProductByIdApi(productId);
      setProduct(productRes || null);

      // Ghi lại lượt xem
      await addToViewHistoryApi(productId);

      // Load các dữ liệu khác song song
      const [similarRes, commentsRes, statsRes, favoriteRes]: any =
        await Promise.allSettled([
          getSimilarProductsApi(productId, 4),
          getProductCommentsApi(productId, 1, 5),
          getProductStatsApi(productId),
          checkFavoriteStatusApi(productId),
        ]);

      if (similarRes.status === "fulfilled") {
        setSimilarProducts(similarRes.value.similarProducts || []);
      }

      if (commentsRes.status === "fulfilled") {
        setComments(commentsRes.value.comments || []);
      }

      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value || null);
      }

      if (favoriteRes.status === "fulfilled") {
        setIsFavorite(favoriteRes.value?.isFavorite || false);
      }
    } catch (error) {
      console.error("Error loading product data:", error);
      message.error("Lỗi khi tải thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!productId) return;

    try {
      if (isFavorite) {
        await removeFromFavoritesApi(productId);
        message.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        await addToFavoritesApi(productId);
        message.success("Đã thêm vào danh sách yêu thích");
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      message.error("Có lỗi xảy ra");
    }
  };

  const handleAddComment = async (values: {
    comment: string;
    rating?: number;
  }) => {
    if (!productId) return;

    try {
      await addProductCommentApi(productId, values.comment, values.rating);
      message.success("Đã thêm bình luận");
      setIsCommentModalOpen(false);
      form.resetFields();

      // Reload comments
      const commentsRes: any = await getProductCommentsApi(productId, 1, 5);
      setComments(commentsRes?.comments || []);

      // Reload stats
      const statsRes: any = await getProductStatsApi(productId);
      setStats(statsRes?.data || null);
    } catch (error) {
      console.error("Error adding comment:", error);
      message.error("Lỗi khi thêm bình luận");
    }
  };

  const handlePurchase = async (values: { quantity: number }) => {
    if (!productId || !product) return;

    try {
      const totalPrice = product.price * values.quantity;
      await addToPurchaseHistoryApi(productId, values.quantity, totalPrice);
      message.success(`Đã mua ${values.quantity} sản phẩm!`);
      setIsPurchaseModalOpen(false);
      purchaseForm.resetFields();

      // Reload stats
      const statsRes = await getProductStatsApi(productId);
      setStats(statsRes.data || null);
    } catch (error) {
      console.error("Error making purchase:", error);
      message.error("Lỗi khi mua hàng");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Text>Không tìm thấy sản phẩm</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <Row gutter={[24, 24]}>
        {/* Product Info */}
        <Col span={16}>
          <Card>
            <Title level={2}>{product.name}</Title>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Text strong style={{ fontSize: "24px", color: "#1677ff" }}>
                  {product.price.toLocaleString()}₫
                </Text>
              </div>

              <div>
                <Tag color={product.inStock ? "green" : "red"}>
                  {product.inStock ? "Còn hàng" : "Hết hàng"}
                </Tag>
                <Tag color="blue">{product.category}</Tag>
              </div>

              <Text>{product.description}</Text>

              <Space>
                <Button
                  type={isFavorite ? "primary" : "default"}
                  icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                  onClick={handleToggleFavorite}
                >
                  {isFavorite ? "Đã yêu thích" : "Yêu thích"}
                </Button>

                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  disabled={!product.inStock}
                  onClick={() => setIsPurchaseModalOpen(true)}
                >
                  Mua ngay
                </Button>

                <Button
                  icon={<CommentOutlined />}
                  onClick={() => setIsCommentModalOpen(true)}
                >
                  Bình luận
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>

        {/* Stats */}
        <Col span={8}>
          <Card title="Thống kê sản phẩm">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Lượt xem"
                  value={stats?.viewCount || 0}
                  prefix={<EyeOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Đã mua"
                  value={stats?.purchaseCount || 0}
                  prefix={<ShoppingCartOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Bình luận"
                  value={stats?.commentCount || 0}
                  prefix={<CommentOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Yêu thích"
                  value={stats?.favoriteCount || 0}
                  prefix={<HeartOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Comments Section */}
      <Card title="Bình luận" style={{ marginTop: "24px" }}>
        <List
          dataSource={comments}
          renderItem={(comment) => (
            <List.Item>
              <div style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <Text strong>{comment.userId?.name || "Ẩn danh"}</Text>
                  <Text type="secondary">
                    {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
                  </Text>
                </div>
                {comment.rating && (
                  <div style={{ marginBottom: "8px" }}>
                    <Rate disabled value={comment.rating} />
                  </div>
                )}
                <Text>{comment.comment}</Text>
              </div>
            </List.Item>
          )}
        />
      </Card>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <Card title="Sản phẩm tương tự" style={{ marginTop: "24px" }}>
          <Row gutter={[16, 16]}>
            {similarProducts.map((item) => (
              <Col span={6} key={item._id}>
                <Card
                  size="small"
                  hoverable
                  onClick={() =>
                    (window.location.href = `/product/${item._id}`)
                  }
                >
                  <Title level={5} ellipsis>
                    {item.name}
                  </Title>
                  <Text strong style={{ color: "#1677ff" }}>
                    {item.price.toLocaleString()}₫
                  </Text>
                  <br />
                  <Tag color="blue">{item.category}</Tag>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Comment Modal */}
      <Modal
        title="Thêm bình luận"
        open={isCommentModalOpen}
        onCancel={() => setIsCommentModalOpen(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddComment}>
          <Form.Item name="rating" label="Đánh giá">
            <Rate />
          </Form.Item>

          <Form.Item
            name="comment"
            label="Nội dung"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung bình luận" },
            ]}
          >
            <TextArea rows={4} placeholder="Nhập bình luận của bạn..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Gửi bình luận
              </Button>
              <Button onClick={() => setIsCommentModalOpen(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Purchase Modal */}
      <Modal
        title="Mua sản phẩm"
        open={isPurchaseModalOpen}
        onCancel={() => setIsPurchaseModalOpen(false)}
        footer={null}
      >
        <Form
          form={purchaseForm}
          onFinish={handlePurchase}
          initialValues={{ quantity: 1 }}
        >
          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng" },
              { type: "number", min: 1, message: "Số lượng phải lớn hơn 0" },
            ]}
          >
            <Input type="number" min={1} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Xác nhận mua
              </Button>
              <Button onClick={() => setIsPurchaseModalOpen(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export { ProductDetailPage };
