require("dotenv").config();
const mongoose = require("mongoose");
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

// MongoDB Model
const mongoUserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "User" },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

const MongoUser = mongoose.model("user", mongoUserSchema);

// MySQL Model using Sequelize
const MySQLUser = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "User",
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

// Factory function to get appropriate model based on DB_TYPE
const getUser = () => {
  const dbType = process.env.DB_TYPE || "mongodb";
  return dbType === "mysql" ? MySQLUser : MongoUser;
};

module.exports = {
  MongoUser,
  MySQLUser,
  getUser,
};
