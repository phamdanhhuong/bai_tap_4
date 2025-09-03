const { getProductsPaginated } = require("../services/productService");

/**
 * Controller lấy danh sách sản phẩm phân trang
 * @param {Request} req
 * @param {Response} res
 */
async function getProducts(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await getProductsPaginated(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getProducts,
};
