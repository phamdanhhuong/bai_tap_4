const Product = require("../models/product");
const { Client } = require("@elastic/elasticsearch");

const esClient = new Client({
  node: "http://localhost:9200",
});

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

/**
 * Tìm kiếm sản phẩm bằng Elasticsearch fuzzy search và lọc theo danh mục, giá
 * @param {Object} params
 * @param {string} params.keyword
 * @param {string} params.category
 * @param {number} params.minPrice
 * @param {number} params.maxPrice
 * @param {number} params.page
 * @param {number} params.limit
 */
async function searchPro({
  keyword = "",
  category,
  minPrice,
  maxPrice,
  page = 1,
  limit = 10,
}) {
  await syncProductsToES();
  const must = [];
  if (keyword) {
    must.push({
      multi_match: {
        query: keyword,
        fields: ["name^3", "description"],
        fuzziness: "AUTO",
      },
    });
  }
  if (category) {
    must.push({ term: { "category.keyword": category } });
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    const range = {};
    if (minPrice !== undefined) range.gte = minPrice;
    if (maxPrice !== undefined) range.lte = maxPrice;
    must.push({ range: { price: range } });
  }
  const body = {
    query: {
      bool: {
        must,
      },
    },
    from: (page - 1) * limit,
    size: limit,
  };
  const esRes = await esClient.search({
    index: "products",
    body,
  });

  const products = esRes.hits.hits.map((hit) => hit._source);

  return {
    products,
    total: esRes.hits.total.value,
    page,
    limit,
  };
}

async function syncProductsToES() {
  const products = await Product.find();
  for (const p of products) {
    await esClient.index({
      index: "products",
      id: p._id.toString(),
      document: {
        name: p.name,
        description: p.description,
        category: p.category,
        price: p.price,
        inStock: p.inStock,
      },
    });
  }
  await esClient.indices.refresh({ index: "products" });
  console.log("✅ Sync xong dữ liệu vào Elasticsearch");
}

module.exports = {
  getProductsPaginated,
  searchPro,
  syncProductsToES,
};
