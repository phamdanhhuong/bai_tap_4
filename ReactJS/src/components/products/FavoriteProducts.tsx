import { useEffect, useState } from "react";
import { Card, List, Button, message, Empty, Spin, Tag } from "antd";
import { HeartFilled, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getFavoriteProductsApi, removeFromFavoritesApi } from "../../util/api";

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  inStock: boolean;
}

const FavoriteProducts = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async (nextPage = 1) => {
    setLoading(true);
    try {
      const response: any = await getFavoriteProductsApi(nextPage, 10);
      const data = response;

      if (nextPage === 1) {
        setFavorites(data.favorites || []);
      } else {
        setFavorites((prev) => [...prev, ...(data.favorites || [])]);
      }

      setTotal(data.total || 0);
      setHasMore((data.favorites || []).length === 10);
      setPage(nextPage);
    } catch (error) {
      console.error("Error loading favorites:", error);
      message.error("Lỗi khi tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    try {
      await removeFromFavoritesApi(productId);
      message.success("Đã xóa khỏi danh sách yêu thích");

      // Remove from local state
      setFavorites((prev) => prev.filter((item) => item._id !== productId));
      setTotal((prev) => prev - 1);
    } catch (error) {
      console.error("Error removing favorite:", error);
      message.error("Lỗi khi xóa sản phẩm yêu thích");
    }
  };

  const handleViewProduct = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadFavorites(page + 1);
    }
  };

  if (loading && page === 1) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <Card title="Sản phẩm yêu thích">
        <Empty
          description="Chưa có sản phẩm yêu thích nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <HeartFilled style={{ color: "#ff4d4f" }} />
          <span>Sản phẩm yêu thích ({total})</span>
        </div>
      }
    >
      <List
        dataSource={favorites}
        renderItem={(product) => (
          <List.Item
            actions={[
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => handleViewProduct(product._id)}
              >
                Xem chi tiết
              </Button>,
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveFavorite(product._id)}
              >
                Xóa
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span>{product.name}</span>
                  <Tag color={product.inStock ? "green" : "red"}>
                    {product.inStock ? "Còn hàng" : "Hết hàng"}
                  </Tag>
                  <Tag color="blue">{product.category}</Tag>
                </div>
              }
              description={
                <div>
                  <div style={{ marginBottom: "4px" }}>
                    <span
                      style={{
                        color: "#1677ff",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      {product.price.toLocaleString()}₫
                    </span>
                  </div>
                  <div>{product.description}</div>
                </div>
              }
            />
          </List.Item>
        )}
      />

      {hasMore && (
        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Button loading={loading} onClick={handleLoadMore}>
            Tải thêm
          </Button>
        </div>
      )}
    </Card>
  );
};

export { FavoriteProducts };
