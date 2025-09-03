import { CrownOutlined } from "@ant-design/icons";
import { Result, List, Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import { getProductPage } from "../util/api";

const PAGE_SIZE = 5;

const HomePage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadProducts = async (nextPage = 1) => {
    setLoading(true);
    try {
      const res: any = await getProductPage(nextPage, PAGE_SIZE);
      console.log(res);

      const data = res.products || [];
      if (nextPage === 1) {
        setProducts(data);
      } else {
        setProducts((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      setHasMore(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts(1);
  }, []);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new window.IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadProducts(nextPage);
      }
    });
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, loading, page]);

  return (
    <div style={{ padding: 20 }}>
      <Result icon={<CrownOutlined />} title="JWT by Pham Danh Huong" />
      <div>
        <h2>Danh sách sản phẩm</h2>
        <List
          bordered
          dataSource={products}
          renderItem={(item: any) => (
            <List.Item>
              <div style={{ width: "100%" }}>
                <div style={{ fontWeight: "bold", fontSize: 16 }}>
                  {item.name}
                </div>
                <div>
                  Giá:{" "}
                  <span style={{ color: "#1677ff" }}>
                    {item.price?.toLocaleString()}₫
                  </span>
                </div>
                <div>Mô tả: {item.description}</div>
                <div>Danh mục: {item.category}</div>
                <div>
                  Tình trạng:{" "}
                  <span style={{ color: item.inStock ? "green" : "red" }}>
                    {item.inStock ? "Còn hàng" : "Hết hàng"}
                  </span>
                </div>
              </div>
            </List.Item>
          )}
        />
        {loading && <Spin style={{ marginTop: 16 }} />}
        {hasMore && !loading && (
          <div
            ref={loaderRef}
            style={{ height: 32, marginTop: 16, textAlign: "center" }}
          >
            Cuộn xuống để tải thêm...
          </div>
        )}
      </div>
    </div>
  );
};

export { HomePage };
