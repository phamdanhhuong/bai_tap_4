const {
  createUserService,
  loginService,
  forgotPasswordService,
  resetPasswordService,
  getUserService,
} = require("../services/userService");

const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  const data = await createUserService(name, email, password);
  return res.status(200).json(data);
};

const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  const data = await loginService(email, password);
  return res.status(200).json(data);
};

const handleForgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      EC: 1,
      EM: "Email là bắt buộc",
    });
  }

  const data = await forgotPasswordService(email);
  return res.status(200).json(data);
};

const handleResetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      EC: 1,
      EM: "Token và password mới là bắt buộc",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      EC: 2,
      EM: "Password phải có ít nhất 6 ký tự",
    });
  }

  const data = await resetPasswordService(token, newPassword);
  return res.status(200).json(data);
};

const getUser = async (req, res) => {
  const data = await getUserService();
  return res.status(200).json(data);
};

const getAccount = async (req, res) => {
  return res.status(200).json(req.user);
};

module.exports = {
  createUser,
  handleLogin,
  handleForgotPassword,
  handleResetPassword,
  getUser,
  getAccount,
};
