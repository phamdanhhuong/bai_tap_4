const express = require("express"); // cú pháp CommonJS

let configViewEngine = (app) => {
  app.use(express.static("./src/public")); // Thiết lập thư mục tĩnh (images, css,..)
  app.set("view engine", "ejs"); // Thiết lập viewEngine
  app.set("views", "./src/views"); // Thư mục chứa views
};

module.exports = configViewEngine; // xuất hàm ra

