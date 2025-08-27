const express = require("express");
const {
  createUser,
  handleLogin,
  getUser,
  getAccount,
} = require("../controllers/userController");
const auth = require("../middlewares/auth");
const { delay } = require("../middlewares/delay");

const routerAPI = express.Router();

// middleware auth cho tất cả API
routerAPI.all("*", auth);

// test API
routerAPI.get("/", (req, res) => {
  return res.status(200).json("Hello world api");
});

// API auth
routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);

// API user
routerAPI.get("/user", getUser);
routerAPI.get("/account", delay, getAccount);

module.exports = routerAPI; //export default
