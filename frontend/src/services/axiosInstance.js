import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // change if needed
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
