const express = require("express");
const {
  createUser,
  handleLogin,
  handleForgotPassword,
  handleResetPassword,
  getUser,
  getAccount,
} = require("../controllers/userController");
const {
  getProducts,
  getProduct,
  searchProducts,
  addProductToFavorites,
  removeProductFromFavorites,
  getFavoriteProducts,
  checkProductFavoriteStatus,
  getProductSimilar,
  addProductToViewHistory,
  getViewHistory,
  addProductToPurchaseHistory,
  getPurchaseHistory,
  addProductComment,
  getProductCommentsController,
  getProductStatistics,
} = require("../controllers/productController");
const auth = require("../middlewares/auth");
const { delay } = require("../middlewares/delay");

const routerAPI = express.Router();

// middleware auth cho tất cả API trừ auth endpoints
routerAPI.all("*", (req, res, next) => {
  // Skip auth for login, register, forgot-password, reset-password
  const publicRoutes = [
    "/register",
    "/login",
    "/forgot-password",
    "/reset-password",
  ];
  if (publicRoutes.includes(req.path)) {
    return next();
  }
  return auth(req, res, next);
});

// test API
routerAPI.get("/", (req, res) => {
  return res.status(200).json("Hello world api");
});

// API auth
routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);
routerAPI.post("/forgot-password", handleForgotPassword);
routerAPI.post("/reset-password", handleResetPassword);

// API user
routerAPI.get("/user", getUser);
routerAPI.get("/account", delay, getAccount);

// Lấy danh sách sản phẩm phân trang
routerAPI.get("/products", getProducts);

// Tìm kiếm sản phẩm bằng Elasticsearch fuzzy search và lọc nhiều điều kiện
routerAPI.get("/products/search", searchProducts);

// Lấy sản phẩm theo ID
routerAPI.get("/products/:productId", getProduct);

// FAVORITE PRODUCTS ROUTES
routerAPI.post("/products/:productId/favorite", addProductToFavorites);
routerAPI.delete("/products/:productId/favorite", removeProductFromFavorites);
routerAPI.get(
  "/products/:productId/favorite/status",
  checkProductFavoriteStatus
);
routerAPI.get("/user/favorites", getFavoriteProducts);

// SIMILAR PRODUCTS ROUTES
routerAPI.get("/products/:productId/similar", getProductSimilar);

// VIEW HISTORY ROUTES
routerAPI.post("/products/:productId/view", addProductToViewHistory);
routerAPI.get("/user/view-history", getViewHistory);

// PURCHASE HISTORY ROUTES
routerAPI.post("/products/:productId/purchase", addProductToPurchaseHistory);
routerAPI.get("/user/purchase-history", getPurchaseHistory);

// COMMENTS ROUTES
routerAPI.post("/products/:productId/comments", addProductComment);
routerAPI.get("/products/:productId/comments", getProductCommentsController);

// STATISTICS ROUTES
routerAPI.get("/products/:productId/stats", getProductStatistics);

module.exports = routerAPI; //export default
