#!/usr/bin/env node
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env");

const switchToMongoDB = () => {
  console.log("Switching to MongoDB...");
  updateEnvFile("DB_TYPE", "mongodb");
  console.log("✅ Switched to MongoDB successfully!");
  console.log("Please restart your server for changes to take effect.");
};

const switchToMySQL = () => {
  console.log("Switching to MySQL...");
  updateEnvFile("DB_TYPE", "mysql");
  console.log("✅ Switched to MySQL successfully!");
  console.log("Please restart your server for changes to take effect.");
};

const updateEnvFile = (key, value) => {
  let envContent = fs.readFileSync(envPath, "utf8");
  const lines = envContent.split("\n");

  let found = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith(`${key}=`)) {
      lines[i] = `${key}=${value}`;
      found = true;
      break;
    }
  }

  if (!found) {
    lines.push(`${key}=${value}`);
  }

  fs.writeFileSync(envPath, lines.join("\n"));
};

const showCurrentConfig = () => {
  const dbType = process.env.DB_TYPE || "mongodb";
  console.log(`\n📊 Current database configuration: ${dbType.toUpperCase()}`);

  if (dbType === "mongodb") {
    console.log(`   MongoDB URL: ${process.env.MONGO_DB_URL}`);
  } else {
    console.log(`   MySQL Host: ${process.env.MYSQL_HOST}`);
    console.log(`   MySQL User: ${process.env.MYSQL_USER}`);
    console.log(`   MySQL Database: ${process.env.MYSQL_DATABASE}`);
  }
  console.log("\n");
};

// Main logic
const args = process.argv.slice(2);
const command = args[0];

console.log("🔄 Database Switcher Tool\n");

if (command === "mongo" || command === "mongodb") {
  switchToMongoDB();
} else if (command === "mysql") {
  switchToMySQL();
} else if (command === "status" || command === "current") {
  showCurrentConfig();
} else {
  console.log("Usage:");
  console.log("  node db-switch.js mongo     - Switch to MongoDB");
  console.log("  node db-switch.js mysql     - Switch to MySQL");
  console.log("  node db-switch.js status    - Show current database");
  console.log("\nAvailable databases:");
  console.log("  📊 MongoDB (default)");
  console.log("  🐬 MySQL");
  showCurrentConfig();
}
