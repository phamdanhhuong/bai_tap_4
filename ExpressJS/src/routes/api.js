const express = require("express");
const {
  createUser,
  handleLogin,
  handleForgotPassword,
  handleResetPassword,
  getUser,
  getAccount,
} = require("../controllers/userController");
const { getProducts } = require("../controllers/productController");
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

module.exports = routerAPI; //export default
