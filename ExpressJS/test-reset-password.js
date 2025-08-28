require("dotenv").config();
const axios = require("axios");
const { getUser } = require("./src/models/user");

const BASE_URL = "http://localhost:8080/api/v1";

// Test Reset Password workflow
const testResetPassword = async () => {
  console.log("🔐 Testing Reset Password Workflow\n");

  try {
    // 1. Đăng ký user mới
    const email = `test${Date.now()}@example.com`;
    console.log("1. Creating test user...");
    await axios.post(`${BASE_URL}/register`, {
      name: "Test Reset User",
      email: email,
      password: "oldpassword123",
    });
    console.log("✅ User created:", email);
    console.log();

    // 2. Gửi forgot password
    console.log("2. Sending forgot password request...");
    await axios.post(`${BASE_URL}/forgot-password`, {
      email: email,
    });
    console.log("✅ Forgot password request sent");
    console.log();

    // 3. Lấy token từ database (thực tế sẽ từ email)
    console.log("3. Retrieving reset token from database...");
    const User = getUser();
    const dbType = process.env.DB_TYPE || "mongodb";

    let user;
    if (dbType === "mysql") {
      user = await User.findOne({ where: { email } });
    } else {
      user = await User.findOne({ email });
    }

    if (!user || !user.resetPasswordToken) {
      throw new Error("Reset token not found in database");
    }

    const resetToken = user.resetPasswordToken;
    console.log(
      "✅ Reset token retrieved:",
      resetToken.substring(0, 10) + "..."
    );
    console.log();

    // 4. Reset password
    console.log("4. Resetting password with token...");
    const resetResponse = await axios.post(`${BASE_URL}/reset-password`, {
      token: resetToken,
      newPassword: "newpassword456",
    });
    console.log("✅ Password reset successful:", resetResponse.data);
    console.log();

    // 5. Test login với password cũ (should fail)
    console.log("5. Testing login with old password (should fail)...");
    try {
      await axios.post(`${BASE_URL}/login`, {
        email: email,
        password: "oldpassword123",
      });
      console.log("❌ Login with old password should have failed!");
    } catch (error) {
      console.log("✅ Login with old password correctly failed");
    }
    console.log();

    // 6. Test login với password mới (should succeed)
    console.log("6. Testing login with new password (should succeed)...");
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      email: email,
      password: "newpassword456",
    });
    console.log("✅ Login with new password successful!");
    console.log("   User:", loginResponse.data.user.name);
    console.log();

    console.log("🎉 Reset Password Workflow Test PASSED!");
  } catch (error) {
    if (error.response) {
      console.log("❌ API Error:", error.response.data);
    } else {
      console.log("❌ Error:", error.message);
    }
  }
};

// Run test
testResetPassword();
