const Product = require("../models/product");
const {
  MongoUserFavorite,
  MongoUserViewHistory,
  MongoUserPurchase,
  MongoUserComment,
} = require("../models/userProductInteraction");
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
 * Lấy sản phẩm theo ID
 * @param {string} productId - ID của sản phẩm
 * @returns {Promise<Product>}
 */
async function getProductById(productId) {
  console.log(">>> getProductById called with:", {
    productId,
    type: typeof productId,
  });
  try {
    const product = await Product.findById(productId);
    console.log(">>> Product query result:", product ? "FOUND" : "NOT FOUND");
    if (!product) {
      throw new Error("Không tìm thấy sản phẩm");
    }
    return product;
  } catch (error) {
    console.log(">>> Error in getProductById:", error.message);
    throw error;
  }
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

  const products = esRes.hits.hits.map((hit) => ({
    _id: hit._id,
    ...hit._source,
  }));

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
        _id: p._id.toString(),
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

/**
 * Fallback search using MongoDB when Elasticsearch is not available
 */
async function searchProMongoDB({
  keyword = "",
  category,
  minPrice,
  maxPrice,
  page = 1,
  limit = 10,
}) {
  const skip = (page - 1) * limit;
  const query = {};

  // Text search
  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
    ];
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = minPrice;
    if (maxPrice !== undefined) query.price.$lte = maxPrice;
  }

  const [products, total] = await Promise.all([
    Product.find(query).skip(skip).limit(limit),
    Product.countDocuments(query),
  ]);

  return {
    products,
    total,
    page,
    limit,
  };
}

/**
 * Search products with fallback
 */
async function searchProductsWithFallback({
  keyword = "",
  category,
  minPrice,
  maxPrice,
  page = 1,
  limit = 10,
}) {
  try {
    // Thử dùng Elasticsearch trước
    return await searchPro({
      keyword,
      category,
      minPrice,
      maxPrice,
      page,
      limit,
    });
  } catch (error) {
    console.log("⚠️ Elasticsearch không khả dụng, sử dụng MongoDB fallback");
    // Fallback to MongoDB
    return await searchProMongoDB({
      keyword,
      category,
      minPrice,
      maxPrice,
      page,
      limit,
    });
  }
}

/**
 * FAVORITE PRODUCTS
 */

// Thêm sản phẩm vào danh sách yêu thích
async function addToFavorites(userId, productId) {
  try {
    const favorite = new MongoUserFavorite({ userId, productId });
    await favorite.save();
    return { success: true, message: "Đã thêm vào danh sách yêu thích" };
  } catch (error) {
    if (error.code === 11000) {
      return {
        success: false,
        message: "Sản phẩm đã có trong danh sách yêu thích",
      };
    }
    throw error;
  }
}

// Xóa sản phẩm khỏi danh sách yêu thích
async function removeFromFavorites(userId, productId) {
  const result = await MongoUserFavorite.deleteOne({ userId, productId });
  return {
    success: result.deletedCount > 0,
    message:
      result.deletedCount > 0
        ? "Đã xóa khỏi danh sách yêu thích"
        : "Sản phẩm không có trong danh sách yêu thích",
  };
}

// Lấy danh sách sản phẩm yêu thích của user
async function getUserFavorites(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const favorites = await MongoUserFavorite.find({ userId })
    .populate("productId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await MongoUserFavorite.countDocuments({ userId });

  return {
    favorites: favorites.filter((f) => f.productId).map((f) => f.productId),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// Kiểm tra sản phẩm có trong danh sách yêu thích không
async function checkFavoriteStatus(userId, productId) {
  const favorite = await MongoUserFavorite.findOne({ userId, productId });
  return { isFavorite: !!favorite };
}

/**
 * SIMILAR PRODUCTS
 */

// Lấy sản phẩm tương tự dựa trên category
async function getSimilarProducts(productId, limit = 5) {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Không tìm thấy sản phẩm");
  }

  const similarProducts = await Product.find({
    _id: { $ne: productId },
    category: product.category,
    inStock: true,
  })
    .sort({ createdAt: -1 })
    .limit(limit);

  return similarProducts;
}

/**
 * VIEW HISTORY
 */

// Thêm sản phẩm vào lịch sử xem
async function addToViewHistory(userId, productId) {
  try {
    console.log(">>> addToViewHistory called with:", {
      userId,
      productId,
      userIdType: typeof userId,
      productIdType: typeof productId,
    });

    if (!userId || !productId) {
      throw new Error(
        `Missing required parameters: userId=${userId}, productId=${productId}`
      );
    }

    // Kiểm tra xem đã xem gần đây chưa (trong vòng 1 giờ)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    console.log(">>> Checking for recent views...");

    const recentView = await MongoUserViewHistory.findOne({
      userId,
      productId,
      viewedAt: { $gte: oneHourAgo },
    });

    if (!recentView) {
      console.log(">>> Creating new view history entry");
      const viewHistory = new MongoUserViewHistory({ userId, productId });
      const saved = await viewHistory.save();
      console.log(">>> View history saved:", saved);

      console.log(">>> Incrementing view count");
      await incrementViewCount(productId);
    } else {
      console.log(">>> Recent view found, not adding duplicate");
    }

    return { success: true };
  } catch (error) {
    console.error(
      ">>> Error in addToViewHistory service:",
      error.message,
      error.stack
    );
    throw error;
  }
}

// Lấy lịch sử xem sản phẩm của user
async function getUserViewHistory(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const viewHistory = await MongoUserViewHistory.find({ userId })
    .populate("productId")
    .sort({ viewedAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await MongoUserViewHistory.countDocuments({ userId });

  return {
    viewHistory: viewHistory
      .filter((v) => v.productId)
      .map((v) => ({
        product: v.productId,
        viewedAt: v.viewedAt,
      })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * PURCHASE HISTORY
 */

// Thêm vào lịch sử mua hàng
async function addToPurchaseHistory(userId, productId, quantity, price) {
  const purchase = new MongoUserPurchase({
    userId,
    productId,
    quantity,
    price,
  });
  await purchase.save();
  await incrementPurchaseCount(productId, quantity);

  return { success: true, purchase };
}

// Lấy lịch sử mua hàng của user
async function getUserPurchaseHistory(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const purchases = await MongoUserPurchase.find({ userId })
    .populate("productId")
    .sort({ purchasedAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await MongoUserPurchase.countDocuments({ userId });

  return {
    purchases: purchases
      .filter((p) => p.productId)
      .map((p) => ({
        product: p.productId,
        quantity: p.quantity,
        price: p.price,
        purchasedAt: p.purchasedAt,
      })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * COMMENTS
 */

// Thêm comment cho sản phẩm
async function addComment(userId, productId, comment, rating) {
  const userComment = new MongoUserComment({
    userId,
    productId,
    comment,
    rating,
  });
  await userComment.save();
  await incrementCommentCount(productId);

  return { success: true, comment: userComment };
}

// Lấy comments của sản phẩm
async function getProductComments(productId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const comments = await MongoUserComment.find({ productId })
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await MongoUserComment.countDocuments({ productId });

  return {
    comments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * STATISTICS
 */

// Lấy thống kê của sản phẩm
async function getProductStats(productId) {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Không tìm thấy sản phẩm");
  }

  return {
    productId,
    viewCount: product.viewCount || 0,
    purchaseCount: product.purchaseCount || 0,
    commentCount: product.commentCount || 0,
    favoriteCount: await MongoUserFavorite.countDocuments({ productId }),
  };
}

// Tăng số lượt xem
async function incrementViewCount(productId) {
  await Product.findByIdAndUpdate(productId, { $inc: { viewCount: 1 } });
}

// Tăng số lượt mua
async function incrementPurchaseCount(productId, quantity = 1) {
  await Product.findByIdAndUpdate(productId, {
    $inc: { purchaseCount: quantity },
  });
}

// Tăng số comment
async function incrementCommentCount(productId) {
  await Product.findByIdAndUpdate(productId, { $inc: { commentCount: 1 } });
}

module.exports = {
  getProductsPaginated,
  getProductById,
  searchPro,
  searchProductsWithFallback,
  syncProductsToES,
  // Favorite Products
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  checkFavoriteStatus,
  // Similar Products
  getSimilarProducts,
  // View History
  addToViewHistory,
  getUserViewHistory,
  // Purchase History
  addToPurchaseHistory,
  getUserPurchaseHistory,
  // Comments
  addComment,
  getProductComments,
  // Statistics
  getProductStats,
  incrementViewCount,
  incrementPurchaseCount,
  incrementCommentCount,
};
