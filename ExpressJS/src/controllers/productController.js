const {
  getProductsPaginated,
  searchPro,
} = require("../services/productService");

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

/**
 * Controller tìm kiếm sản phẩm bằng Elasticsearch fuzzy search và lọc
 * @param {Request} req
 * @param {Response} res
 */
async function searchProducts(req, res) {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = req.query;
    const result = await searchPro({
      keyword,
      category,
      minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
      page: Number(page),
      limit: Number(limit),
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getProducts,
  searchProducts,
};
