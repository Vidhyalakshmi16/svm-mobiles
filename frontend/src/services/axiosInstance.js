import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL || "https://svm-mobiles.onrender.com/api",
});

// Add token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("svm_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
