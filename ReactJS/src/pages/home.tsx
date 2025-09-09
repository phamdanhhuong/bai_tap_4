import { CrownOutlined } from "@ant-design/icons";
import { Result, List, Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import { searchProductApi } from "../util/api";

const PAGE_SIZE = 10;
const CATEGORY_OPTIONS = ["Laptop", "Điện thoại", "Phụ kiện", "Thời trang"];

const HomePage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  // Filter states
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);

  // Load products with filter
  const loadProducts = async (nextPage = 1, isFilter = false) => {
    setLoading(true);
    try {
      const res: any = await searchProductApi(
        keyword,
        category,
        minPrice,
        maxPrice,
        nextPage,
        PAGE_SIZE
      );
      const data = res.products || [];
      if (nextPage === 1 || isFilter) {
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

  // Khi filter thay đổi, reset page về 1 và tải lại sản phẩm
  useEffect(() => {
    setPage(1);
    loadProducts(1, true);
  }, [keyword, category, minPrice, maxPrice]);

  // Lazy load khi cuộn xuống cuối
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
  }, [hasMore, loading, page, products]);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  return (
    <div style={{ padding: 20 }}>
      <Result icon={<CrownOutlined />} title="JWT by Pham Danh Huong" />
      <div>
        <h2>Danh sách sản phẩm</h2>
        {/* Bộ lọc sản phẩm */}
        <div
          style={{
            marginBottom: 20,
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Từ khóa"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 120 }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: 120 }}
          >
            <option value="">Tất cả</option>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Giá thấp nhất"
            value={minPrice}
            min={0}
            onChange={(e) => setMinPrice(Number(e.target.value))}
            style={{ width: 120 }}
          />
          <input
            type="number"
            placeholder="Giá cao nhất"
            value={maxPrice}
            min={0}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            style={{ width: 120 }}
          />
          <button
            onClick={() => {
              setPage(1);
              loadProducts(1, true);
            }}
            style={{ padding: "0 16px" }}
          >
            Lọc
          </button>
        </div>
        <List
          bordered
          dataSource={products}
          renderItem={(item: any) => {
            return (
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
            );
          }}
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
