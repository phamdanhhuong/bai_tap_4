import { useEffect, useState } from "react";
import {
  Card,
  List,
  Button,
  message,
  Empty,
  Spin,
  Tag,
  Tabs,
  Typography,
} from "antd";
import {
  EyeOutlined,
  ShoppingCartOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getViewHistoryApi, getPurchaseHistoryApi } from "../../util/api";

const { Text } = Typography;

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  inStock: boolean;
}

interface ViewHistoryItem {
  product: Product;
  viewedAt: string;
}

interface PurchaseHistoryItem {
  product: Product;
  quantity: number;
  price: number;
  purchasedAt: string;
}

const UserHistory = () => {
  const navigate = useNavigate();
  const [viewHistory, setViewHistory] = useState<ViewHistoryItem[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryItem[]>(
    []
  );
  const [loadingView, setLoadingView] = useState(false);
  const [loadingPurchase, setLoadingPurchase] = useState(false);
  const [activeTab, setActiveTab] = useState("view");

  useEffect(() => {
    if (activeTab === "view") {
      loadViewHistory();
    } else {
      loadPurchaseHistory();
    }
  }, [activeTab]);

  const loadViewHistory = async () => {
    setLoadingView(true);
    try {
      const response: any = await getViewHistoryApi(1, 20);
      setViewHistory(response.viewHistory || []);
    } catch (error) {
      console.error("Error loading view history:", error);
      message.error("Lỗi khi tải lịch sử xem");
    } finally {
      setLoadingView(false);
    }
  };

  const loadPurchaseHistory = async () => {
    setLoadingPurchase(true);
    try {
      const response = await getPurchaseHistoryApi(1, 20);
      setPurchaseHistory(response.data?.purchases || []);
    } catch (error) {
      console.error("Error loading purchase history:", error);
      message.error("Lỗi khi tải lịch sử mua hàng");
    } finally {
      setLoadingPurchase(false);
    }
  };

  const handleViewProduct = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const ViewHistoryTab = () => {
    if (loadingView) {
      return (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      );
    }

    if (viewHistory.length === 0) {
      return (
        <Empty
          description="Chưa có lịch sử xem sản phẩm"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <List
        dataSource={viewHistory}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => handleViewProduct(item.product._id)}
              >
                Xem lại
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span>{item.product.name}</span>
                  <Tag color={item.product.inStock ? "green" : "red"}>
                    {item.product.inStock ? "Còn hàng" : "Hết hàng"}
                  </Tag>
                  <Tag color="blue">{item.product.category}</Tag>
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
                      {item.product.price.toLocaleString()}₫
                    </span>
                  </div>
                  <div style={{ marginBottom: "4px" }}>
                    {item.product.description}
                  </div>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Xem lúc: {formatDate(item.viewedAt)}
                  </Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  const PurchaseHistoryTab = () => {
    if (loadingPurchase) {
      return (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      );
    }

    if (purchaseHistory.length === 0) {
      return (
        <Empty
          description="Chưa có lịch sử mua hàng"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <List
        dataSource={purchaseHistory}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => handleViewProduct(item.product._id)}
              >
                Xem chi tiết
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span>{item.product.name}</span>
                  <Tag color="orange">Số lượng: {item.quantity}</Tag>
                  <Tag color="blue">{item.product.category}</Tag>
                </div>
              }
              description={
                <div>
                  <div style={{ marginBottom: "4px" }}>
                    <span>Đơn giá: </span>
                    <span style={{ color: "#1677ff", fontWeight: "bold" }}>
                      {item.product.price.toLocaleString()}₫
                    </span>
                    <span style={{ margin: "0 8px" }}>•</span>
                    <span>Tổng: </span>
                    <span
                      style={{
                        color: "#ff4d4f",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      {item.price.toLocaleString()}₫
                    </span>
                  </div>
                  <div style={{ marginBottom: "4px" }}>
                    {item.product.description}
                  </div>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Mua lúc: {formatDate(item.purchasedAt)}
                  </Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  const tabItems = [
    {
      key: "view",
      label: (
        <span>
          <EyeOutlined />
          Lịch sử xem ({viewHistory.length})
        </span>
      ),
      children: <ViewHistoryTab />,
    },
    {
      key: "purchase",
      label: (
        <span>
          <ShoppingCartOutlined />
          Lịch sử mua ({purchaseHistory.length})
        </span>
      ),
      children: <PurchaseHistoryTab />,
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <HistoryOutlined />
          <span>Lịch sử hoạt động</span>
        </div>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </Card>
  );
};

export { UserHistory };
