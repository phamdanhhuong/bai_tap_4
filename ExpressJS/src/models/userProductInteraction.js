const mongoose = require("mongoose");

// Model để lưu trữ các sản phẩm yêu thích của user
const mongoUserFavoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "product",
    },
  },
  {
    timestamps: true,
  }
);

// Index để tránh duplicate và tối ưu query
mongoUserFavoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Model để lưu trữ lịch sử xem sản phẩm của user
const mongoUserViewHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "product",
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

mongoUserViewHistorySchema.index({ userId: 1, viewedAt: -1 });
mongoUserViewHistorySchema.index({ productId: 1 });

// Model để lưu trữ lịch sử mua hàng của user
const mongoUserPurchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "product",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

mongoUserPurchaseSchema.index({ userId: 1, purchasedAt: -1 });
mongoUserPurchaseSchema.index({ productId: 1 });

// Model để lưu trữ comments của user về sản phẩm
const mongoUserCommentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "product",
    },
    comment: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

mongoUserCommentSchema.index({ productId: 1, createdAt: -1 });
mongoUserCommentSchema.index({ userId: 1 });

const MongoUserFavorite = mongoose.model(
  "userFavorite",
  mongoUserFavoriteSchema
);
const MongoUserViewHistory = mongoose.model(
  "userViewHistory",
  mongoUserViewHistorySchema
);
const MongoUserPurchase = mongoose.model(
  "userPurchase",
  mongoUserPurchaseSchema
);
const MongoUserComment = mongoose.model("userComment", mongoUserCommentSchema);

module.exports = {
  MongoUserFavorite,
  MongoUserViewHistory,
  MongoUserPurchase,
  MongoUserComment,
};
