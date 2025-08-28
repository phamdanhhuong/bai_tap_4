require("dotenv").config();
const nodemailer = require("nodemailer");

// Tạo transporter test (mock) nếu không có cấu hình SMTP
const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    // Sử dụng SMTP thật
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Sử dụng test account (mock)
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "test@ethereal.email",
        pass: "test123",
      },
      // Mock mode - không gửi email thật
      preview: false,
      // Tạo fake success response
      streamTransport: true,
      newline: "unix",
      buffer: true,
    });
  }
};

const transporter = createTransporter();

// Gửi email reset password
const sendResetPasswordEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@test.com",
      to: email,
      subject: "Reset Password Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">This is an automated message, please do not reply.</p>
          <p style="font-size: 10px; color: #999;">Token: ${resetToken}</p>
        </div>
      `,
    };

    // Mock response cho development
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      console.log("📧 Mock Email sent to:", email);
      console.log("🔗 Reset URL:", resetUrl);
      console.log("🎫 Reset Token:", resetToken);
      return { success: true, messageId: "mock-" + Date.now() };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent: " + info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    // Trong development, vẫn trả về success để test được
    if (process.env.NODE_ENV === "development") {
      console.log("📧 Mock Email (error fallback) sent to:", email);
      console.log("🎫 Reset Token:", resetToken);
      return { success: true, messageId: "mock-error-fallback-" + Date.now() };
    }
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendResetPasswordEmail,
};
