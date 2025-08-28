require("dotenv").config();
const { getUser } = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendResetPasswordEmail } = require("./emailService");
const saltRounds = 10;

// Helper function to handle database operations uniformly
const findUserByEmail = async (email) => {
  const User = getUser();
  const dbType = process.env.DB_TYPE || "mongodb";

  if (dbType === "mysql") {
    return await User.findOne({ where: { email } });
  } else {
    return await User.findOne({ email });
  }
};

const findUserById = async (id) => {
  const User = getUser();
  const dbType = process.env.DB_TYPE || "mongodb";

  if (dbType === "mysql") {
    return await User.findByPk(id);
  } else {
    return await User.findById(id);
  }
};

const createUserRecord = async (userData) => {
  const User = getUser();
  const dbType = process.env.DB_TYPE || "mongodb";

  if (dbType === "mysql") {
    return await User.create(userData);
  } else {
    return await User.create(userData);
  }
};

const getAllUsers = async () => {
  const User = getUser();
  const dbType = process.env.DB_TYPE || "mongodb";

  if (dbType === "mysql") {
    return await User.findAll({
      attributes: { exclude: ["password"] },
    });
  } else {
    return await User.find({}).select("-password");
  }
};

const updateUserPassword = async (user, newPassword) => {
  const dbType = process.env.DB_TYPE || "mongodb";
  const hashPassword = await bcrypt.hash(newPassword, saltRounds);

  if (dbType === "mysql") {
    user.password = hashPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
  } else {
    user.password = hashPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  }
};

// Tạo user mới
const createUserService = async (name, email, password) => {
  try {
    // check user exist
    const user = await findUserByEmail(email);
    if (user) {
      console.log(`>>> user exist, chọn 1 email khác: ${email}`);
      return null;
    }

    // hash user password
    const hashPassword = await bcrypt.hash(password, saltRounds);

    // save user to database
    let result = await createUserRecord({
      name: name,
      email: email,
      password: hashPassword,
      role: "User",
    });

    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Đăng nhập
const loginService = async (email, password) => {
  try {
    // fetch user by email
    const user = await findUserByEmail(email);
    if (user) {
      // compare password
      const isMatchPassword = await bcrypt.compare(password, user.password);
      if (!isMatchPassword) {
        return {
          EC: 2,
          EM: "Email/Password không hợp lệ",
        };
      } else {
        // create an access token
        const payload = {
          email: user.email,
          name: user.name,
        };

        const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE,
        });

        return {
          EC: 0,
          access_token,
          user: {
            email: user.email,
            name: user.name,
          },
        };
      }
    } else {
      return {
        EC: 1,
        EM: "Email/Password không hợp lệ",
      };
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Forgot Password
const forgotPasswordService = async (email) => {
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return {
        EC: 1,
        EM: "Email không tồn tại trong hệ thống",
      };
    }

    // Tạo reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

    // Lưu token vào database
    const dbType = process.env.DB_TYPE || "mongodb";
    if (dbType === "mysql") {
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(resetTokenExpiry);
      await user.save();
    } else {
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpiry;
      await user.save();
    }

    // Gửi email
    const emailResult = await sendResetPasswordEmail(email, resetToken);

    if (emailResult.success) {
      return {
        EC: 0,
        EM: "Email reset password đã được gửi",
      };
    } else {
      return {
        EC: 2,
        EM: "Có lỗi xảy ra khi gửi email",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      EC: 3,
      EM: "Lỗi server",
    };
  }
};

// Reset Password
const resetPasswordService = async (token, newPassword) => {
  try {
    const User = getUser();
    const dbType = process.env.DB_TYPE || "mongodb";

    let user;
    if (dbType === "mysql") {
      user = await User.findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: {
            [require("sequelize").Op.gt]: new Date(),
          },
        },
      });
    } else {
      user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });
    }

    if (!user) {
      return {
        EC: 1,
        EM: "Token không hợp lệ hoặc đã hết hạn",
      };
    }

    // Update password
    await updateUserPassword(user, newPassword);

    return {
      EC: 0,
      EM: "Password đã được reset thành công",
    };
  } catch (error) {
    console.log(error);
    return {
      EC: 2,
      EM: "Lỗi server",
    };
  }
};

// Lấy danh sách user (ẩn password)
const getUserService = async () => {
  try {
    let result = await getAllUsers();
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = {
  createUserService,
  loginService,
  forgotPasswordService,
  resetPasswordService,
  getUserService,
};
