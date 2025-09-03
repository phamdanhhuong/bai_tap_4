const mongoose = require("mongoose");
const MongoProduct = require("../models/product"); // import từ file bạn đã viết schema

async function seedProducts() {
  try {
    await mongoose.connect("mongodb://admin:123456@localhost:27017");

    // Xoá hết dữ liệu cũ (tuỳ chọn)
    await MongoProduct.deleteMany({});

    // Tạo danh sách 30 sản phẩm giả
    const products = Array.from({ length: 30 }).map((_, i) => ({
      name: `Sản phẩm ${i + 1}`,
      price: Math.floor(Math.random() * 900 + 100), // giá từ 100 - 1000
      description: `Mô tả ngắn gọn cho sản phẩm ${i + 1}`,
      category: ["Điện thoại", "Laptop", "Phụ kiện", "Thời trang"][i % 4],
      inStock: Math.random() > 0.2, // khoảng 80% còn hàng
    }));

    // Chèn vào DB
    await MongoProduct.insertMany(products);

    console.log("✅ Đã thêm 30 sản phẩm giả thành công!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Lỗi:", err);
  }
}

seedProducts();
