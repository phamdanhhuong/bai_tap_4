require("dotenv").config();

const mongoose = require("mongoose");
const { Sequelize } = require("sequelize");

const dbState = [
  {
    value: 0,
    label: "Disconnected",
  },
  {
    value: 1,
    label: "Connected",
  },
  {
    value: 2,
    label: "Connecting",
  },
  {
    value: 3,
    label: "Disconnecting",
  },
];

// MongoDB Connection
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL);
    const state = Number(mongoose.connection.readyState);
    console.log(dbState.find((f) => f.value === state).label, "to MongoDB!");
    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return false;
  }
};

// MySQL Connection using Sequelize
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
    logging: false, // Tắt SQL logging
  }
);

const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to MySQL!");

    // Tạo database nếu chưa tồn tại
    await sequelize.sync();
    console.log("MySQL database synced!");
    return true;
  } catch (error) {
    console.error("MySQL connection error:", error);
    return false;
  }
};

// Main connection function
const connection = async () => {
  const dbType = process.env.DB_TYPE || "mongodb";

  if (dbType === "mysql") {
    return await connectMySQL();
  } else {
    return await connectMongoDB();
  }
};

module.exports = {
  connection,
  sequelize,
  mongoose,
};
