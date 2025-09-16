const {
  getProductsPaginated,
  getProductById,
  searchPro,
  searchProductsWithFallback,
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  checkFavoriteStatus,
  getSimilarProducts,
  addToViewHistory,
  getUserViewHistory,
  addToPurchaseHistory,
  getUserPurchaseHistory,
  addComment,
  getProductComments,
  getProductStats,
} = require("../services/productService");

// Helper function to get user ID (with fallback for old tokens)
async function getUserId(reqUser) {
  if (reqUser.id) {
    return reqUser.id;
  }
  // Fallback for old tokens without id
  if (reqUser.email) {
    const { MongoUser } = require("../models/user");
    const user = await MongoUser.findOne({ email: reqUser.email });
    return user?._id;
  }
  throw new Error("Unable to determine user ID");
}

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
 * Controller lấy sản phẩm theo ID
 * @param {Request} req
 * @param {Response} res
 */
async function getProduct(req, res) {
  try {
    const { productId } = req.params;
    console.log(">>> Getting product with ID:", productId);
    const result = await getProductById(productId);
    console.log(">>> Product found:", result ? "YES" : "NO");
    res.json(result);
  } catch (error) {
    console.log(">>> Error in getProduct:", error.message);
    if (error.message === "Không tìm thấy sản phẩm") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
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
    const result = await searchProductsWithFallback({
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

/**
 * FAVORITE PRODUCTS CONTROLLERS
 */

// Thêm sản phẩm vào danh sách yêu thích
async function addProductToFavorites(req, res) {
  try {
    const { productId } = req.params;
    const userId = await getUserId(req.user);

    const result = await addToFavorites(userId, productId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error(">>> Error in addProductToFavorites:", error.message);
    res.status(500).json({ error: error.message });
  }
}

// Xóa sản phẩm khỏi danh sách yêu thích
async function removeProductFromFavorites(req, res) {
  try {
    const { productId } = req.params;
    const userId = await getUserId(req.user);

    const result = await removeFromFavorites(userId, productId);
    res.json(result);
  } catch (error) {
    console.error(">>> Error in removeProductFromFavorites:", error.message);
    res.status(500).json({ error: error.message });
  }
}

// Lấy danh sách sản phẩm yêu thích
async function getFavoriteProducts(req, res) {
  try {
    const userId = await getUserId(req.user);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await getUserFavorites(userId, page, limit);
    res.json(result);
  } catch (error) {
    console.error(">>> Error in getFavoriteProducts:", error.message);
    res.status(500).json({ error: error.message });
  }
}

// Kiểm tra trạng thái yêu thích sản phẩm
async function checkProductFavoriteStatus(req, res) {
  try {
    const { productId } = req.params;
    const userId = await getUserId(req.user);

    const result = await checkFavoriteStatus(userId, productId);
    res.json(result);
  } catch (error) {
    console.error(">>> Error in checkProductFavoriteStatus:", error.message);
    res.status(500).json({ error: error.message });
  }
}

/**
 * SIMILAR PRODUCTS CONTROLLER
 */

// Lấy sản phẩm tương tự
async function getProductSimilar(req, res) {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 5;

    const result = await getSimilarProducts(productId, limit);
    res.json({ similarProducts: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * VIEW HISTORY CONTROLLERS
 */

// Thêm sản phẩm vào lịch sử xem
async function addProductToViewHistory(req, res) {
  try {
    const { productId } = req.params;
    const userId = await getUserId(req.user);

    console.log(">>> Adding to view history:", { userId, productId });

    const result = await addToViewHistory(userId, productId);
    res.json(result);
  } catch (error) {
    console.error(">>> Error in addProductToViewHistory:", error.message);
    res.status(500).json({ error: error.message });
  }
}

// Lấy lịch sử xem sản phẩm
async function getViewHistory(req, res) {
  try {
    const userId = await getUserId(req.user);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await getUserViewHistory(userId, page, limit);
    res.json(result);
  } catch (error) {
    console.error(">>> Error in getViewHistory:", error.message);
    res.status(500).json({ error: error.message });
  }
}

/**
 * PURCHASE HISTORY CONTROLLERS
 */

// Thêm vào lịch sử mua hàng
async function addProductToPurchaseHistory(req, res) {
  try {
    const { productId } = req.params;
    const { quantity, price } = req.body;
    const userId = await getUserId(req.user);

    if (!quantity || !price) {
      return res
        .status(400)
        .json({ error: "Thiếu thông tin quantity hoặc price" });
    }

    const result = await addToPurchaseHistory(
      userId,
      productId,
      quantity,
      price
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Lấy lịch sử mua hàng
async function getPurchaseHistory(req, res) {
  try {
    const userId = await getUserId(req.user);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await getUserPurchaseHistory(userId, page, limit);
    res.json(result);
  } catch (error) {
    console.error(">>> Error in getPurchaseHistory:", error.message);
    res.status(500).json({ error: error.message });
  }
}

/**
 * COMMENTS CONTROLLERS
 */

// Thêm comment cho sản phẩm
async function addProductComment(req, res) {
  try {
    const { productId } = req.params;
    const { comment, rating } = req.body;
    const userId = await getUserId(req.user);

    if (!comment) {
      return res.status(400).json({ error: "Comment không được để trống" });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: "Rating phải từ 1-5" });
    }

    const result = await addComment(userId, productId, comment, rating);
    res.json(result);
  } catch (error) {
    console.error(">>> Error in addProductComment:", error.message);
    res.status(500).json({ error: error.message });
  }
}

// Lấy comments của sản phẩm
async function getProductCommentsController(req, res) {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await getProductComments(productId, page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * STATISTICS CONTROLLER
 */

// Lấy thống kê sản phẩm
async function getProductStatistics(req, res) {
  try {
    const { productId } = req.params;

    const result = await getProductStats(productId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getProducts,
  getProduct,
  searchProducts,
  // Favorite products
  addProductToFavorites,
  removeProductFromFavorites,
  getFavoriteProducts,
  checkProductFavoriteStatus,
  // Similar products
  getProductSimilar,
  // View history
  addProductToViewHistory,
  getViewHistory,
  // Purchase history
  addProductToPurchaseHistory,
  getPurchaseHistory,
  // Comments
  addProductComment,
  getProductCommentsController,
  // Statistics
  getProductStatistics,
};
