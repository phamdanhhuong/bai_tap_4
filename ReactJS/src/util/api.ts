import axios from "./axios.customize";

// Tìm kiếm sản phẩm với bộ lọc
const searchProductApi = (
  keyword: string,
  category: string,
  minPrice: number,
  maxPrice: number,
  page: number,
  limit: number
) => {
  const URL_API = `/api/v1/products/search?keyword=${encodeURIComponent(
    keyword
  )}&category=${encodeURIComponent(
    category
  )}&minPrice=${minPrice}&maxPrice=${maxPrice}&page=${page}&limit=${limit}`;
  return axios.get(URL_API);
};

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

const getProductPage = (page: number, limit: number) => {
  const URL_API = `/api/v1/products?page=${page}&limit=${limit}`;
  return axios.get(URL_API);
};

// FAVORITE PRODUCTS API
const addToFavoritesApi = (productId: string) => {
  const URL_API = `/api/v1/products/${productId}/favorite`;
  return axios.post(URL_API);
};

const removeFromFavoritesApi = (productId: string) => {
  const URL_API = `/api/v1/products/${productId}/favorite`;
  return axios.delete(URL_API);
};

const getFavoriteProductsApi = (page: number = 1, limit: number = 10) => {
  const URL_API = `/api/v1/user/favorites?page=${page}&limit=${limit}`;
  return axios.get(URL_API);
};

// Check if product is in favorites
const checkFavoriteStatusApi = (productId: string) => {
  const URL_API = `/api/v1/products/${productId}/favorite/status`;
  return axios.get(URL_API);
};

// SIMILAR PRODUCTS API
const getSimilarProductsApi = (productId: string, limit: number = 5) => {
  const URL_API = `/api/v1/products/${productId}/similar?limit=${limit}`;
  return axios.get(URL_API);
};

// VIEW HISTORY API
const addToViewHistoryApi = (productId: string) => {
  const URL_API = `/api/v1/products/${productId}/view`;
  return axios.post(URL_API);
};

const getViewHistoryApi = (page: number = 1, limit: number = 10) => {
  const URL_API = `/api/v1/user/view-history?page=${page}&limit=${limit}`;
  return axios.get(URL_API);
};

// PURCHASE HISTORY API
const addToPurchaseHistoryApi = (
  productId: string,
  quantity: number,
  price: number
) => {
  const URL_API = `/api/v1/products/${productId}/purchase`;
  const data = { quantity, price };
  return axios.post(URL_API, data);
};

const getPurchaseHistoryApi = (page: number = 1, limit: number = 10) => {
  const URL_API = `/api/v1/user/purchase-history?page=${page}&limit=${limit}`;
  return axios.get(URL_API);
};

// COMMENTS API
const addProductCommentApi = (
  productId: string,
  comment: string,
  rating?: number
) => {
  const URL_API = `/api/v1/products/${productId}/comments`;
  const data = { comment, rating };
  return axios.post(URL_API, data);
};

const getProductCommentsApi = (
  productId: string,
  page: number = 1,
  limit: number = 10
) => {
  const URL_API = `/api/v1/products/${productId}/comments?page=${page}&limit=${limit}`;
  return axios.get(URL_API);
};

// PRODUCT STATISTICS API
const getProductStatsApi = (productId: string) => {
  const URL_API = `/api/v1/products/${productId}/stats`;
  return axios.get(URL_API);
};

// GET PRODUCT BY ID API
const getProductByIdApi = (productId: string) => {
  const URL_API = `/api/v1/products/${productId}`;
  return axios.get(URL_API);
};

export {
  createUserApi,
  loginApi,
  getUserApi,
  forgotPasswordApi,
  resetPasswordApi,
  getProductPage,
  searchProductApi,
  // Favorite products
  addToFavoritesApi,
  removeFromFavoritesApi,
  getFavoriteProductsApi,
  checkFavoriteStatusApi,
  // Similar products
  getSimilarProductsApi,
  // View history
  addToViewHistoryApi,
  getViewHistoryApi,
  // Purchase history
  addToPurchaseHistoryApi,
  getPurchaseHistoryApi,
  // Comments
  addProductCommentApi,
  getProductCommentsApi,
  // Statistics
  getProductStatsApi,
  // Get product by ID
  getProductByIdApi,
};
