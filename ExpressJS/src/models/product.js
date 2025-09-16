const mongoose = require("mongoose");

const mongoProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    category: String,
    inStock: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0 },
    purchaseCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const MongoProduct = mongoose.model("product", mongoProductSchema);

module.exports = MongoProduct;
