require("dotenv").config();
const axios = require("axios");

const BASE_URL = "http://localhost:8080/api/v1";

// Test cases
const testAPI = async () => {
  console.log("🧪 Testing API Endpoints\n");

  try {
    // 1. Test Register
    console.log("1. Testing Register...");
    const registerResponse = await axios.post(`${BASE_URL}/register`, {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });
    console.log("✅ Register successful:", registerResponse.data);
    console.log();

    // 2. Test Login
    console.log("2. Testing Login...");
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      email: "test@example.com",
      password: "password123",
    });
    console.log("✅ Login successful:", loginResponse.data);
    console.log();

    // 3. Test Forgot Password
    console.log("3. Testing Forgot Password...");
    const forgotResponse = await axios.post(`${BASE_URL}/forgot-password`, {
      email: "test@example.com",
    });
    console.log("📧 Forgot Password response:", forgotResponse.data);
    console.log();

    // 4. Test Get Users (with auth)
    console.log("4. Testing Get Users (with auth)...");
    const token = loginResponse.data.access_token;
    const usersResponse = await axios.get(`${BASE_URL}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(
      "✅ Get Users successful:",
      usersResponse.data.length,
      "users found"
    );
    console.log();
  } catch (error) {
    if (error.response) {
      console.log("❌ API Error:", error.response.data);
    } else {
      console.log("❌ Network Error:", error.message);
    }
  }
};

// Run tests
testAPI();
