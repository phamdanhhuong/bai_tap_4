import axios from "./axios.customize";

const createUserApi = (name: string, email: string, password: string) => {
  const URL_API = "/api/v1/register";
  const data = {
    name,
    email,
    password,
  };
  return axios.post(URL_API, data);
};

const loginApi = (email: string, password: string) => {
  const URL_API = "/api/v1/login";
  const data = {
    email,
    password,
  };
  return axios.post(URL_API, data);
};

const getUserApi = () => {
  const URL_API = "/api/v1/user";
  return axios.get(URL_API);
};

const forgotPasswordApi = (email: string) => {
  const URL_API = "/api/v1/forgot-password";
  const data = {
    email,
  };
  return axios.post(URL_API, data);
};

const resetPasswordApi = (token: string, newPassword: string) => {
  const URL_API = "/api/v1/reset-password";
  const data = {
    token,
    newPassword,
  };
  return axios.post(URL_API, data);
};

export {
  createUserApi,
  loginApi,
  getUserApi,
  forgotPasswordApi,
  resetPasswordApi,
};
