const Product = require("../models/product");

/**
 * Lấy danh sách sản phẩm theo kiểu phân trang
 * @param {number} page - Trang hiện tại (bắt đầu từ 1)
 * @param {number} limit - Số sản phẩm mỗi trang
 * @returns {Promise<{products: Array, total: number, page: number, totalPages: number}>}
 */
async function getProductsPaginated(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find().skip(skip).limit(limit),
    Product.countDocuments(),
  ]);
  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

module.exports = {
  getProductsPaginated,
};
