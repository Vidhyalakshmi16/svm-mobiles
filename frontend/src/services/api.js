import axios from "axios";
import api from "./axiosInstance";

const BASE_URL =
  process.env.REACT_APP_API_URL || "https://svm-mobiles.onrender.com/api";


// Orders
   // admin
// export const getMyOrdersApi = async () => {
//   const res = await api.get("/orders/my");
//   return res.data; // ✅ array of orders
// };
  // customer
// for admin dashboard


// ---- OTHER APIs using normal axios + BASE_URL ----

export const getProducts = async () => {
  const res = await axios.get(`${BASE_URL}/products`);
  return res.data;
};

export const createProduct = async (formData) => {
  const res = await axios.post(`${BASE_URL}/products`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await axios.delete(`${BASE_URL}/products/${id}`);
  return res.data;
};

// Apply discount to a category
export const applyCategoryDiscount = async (data) => {
  const res = await axios.post(`${BASE_URL}/products/apply-discount`, data);
  return res.data;
};

export const updateProduct = async (id, formData) => {
  const res = await axios.put(`${BASE_URL}/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getCategories = async () => {
  const res = await axios.get(`${BASE_URL}/categories`);
  return res.data;
};

export const createCategory = async (name) => {
  const res = await axios.post(`${BASE_URL}/categories`, { name });
  return res.data;
};

export const updateCategory = async (id, name) => {
  const res = await axios.put(`${BASE_URL}/categories/${id}`, { name });
  return res.data;
};

export const deleteCategoryApi = async (id) => {
  const res = await axios.delete(`${BASE_URL}/categories/${id}`);
  return res.data;
};

export const getProductById = async (id) => {
  const res = await axios.get(`${BASE_URL}/products/${id}`);
  return res.data;
};

export const canReviewProductApi = async (id) => {
  const res = await api.get(`/products/${id}/can-review`);
  return res.data;
};

export const addProductReview = async (id, reviewData) => {
  const res = await api.post(`/products/${id}/reviews`, reviewData);
  return res.data;
};

export const addProductReviewAsAdmin = async (id, reviewData) => {
  const res = await api.post(`/products/${id}/reviews/admin`, reviewData);
  return res.data;
};

export const deleteProductReview = async (productId, reviewId) => {
  const res = await api.delete(`/products/${productId}/reviews/${reviewId}`);
  return res.data;
};



// ========= NEW FUNCTIONS FOR CUSTOMER ORDERS PAGE ========= //

// For now this is same as getServiceRequests() without filter.
// Later when you add auth, backend can return only current user's requests.

// Cancel product order – reuse the existing status API




export const forgotPasswordApi = (data) =>
  api.post("/auth/forgot-password", data);

// ---------- AUTH ----------
export const loginApi = (data) => api.post("/auth/login", data);
export const registerApi = (data) => api.post("/auth/register", data);
export const getMeApi = () => api.get("/auth/me");

// ---------- ORDERS ----------

// CUSTOMER: my orders
// ADMIN: Get all orders (token required)
// ---------- ORDERS ----------

// CUSTOMER: my orders
export const getMyOrdersApi = async () => {
  const res = await api.get("/orders/my");
  return res.data;
};

// ADMIN: all orders
export const getOrdersApi = async () => {
  const res = await api.get("/orders");
  return res.data;
};

// Create order
export const createOrderApi = async (payload) => {
  const res = await api.post("/orders", payload);
  return res.data;
};

// Update order status (admin + cancel + return)
export const updateOrderStatusApi = async (orderId, status) => {
  const res = await api.patch(`/orders/${orderId}/status`, { status });
  return res.data;
};

// Cancel order
export const cancelOrder = async (id) => {
  const res = await api.patch(`/orders/${id}/status`, {
    status: "CANCELLED",
  });
  return res.data;
};


// ---------- SERVICE REQUESTS ----------

// ADMIN list (with optional status filter)
export const getServiceRequests = async (status) => {
  const res = await api.get("/contact", {
    params: status ? { status } : {},
  });

  // Backend returns either: ARRAY  OR  {success, request: []}
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.request)) return res.data.request;

  return []; // fallback
};

export const getMyServiceRequests = () => api.get("/contact/my");


// CUSTOMER: create service request (must be logged in now)
export const submitContactForm = async (payload) => {
  const res = await api.post("/contact", payload); // 👈 use api
  return res.data;
};

// Update service status (admin / cancel)
export const updateServiceRequestStatus = async (id, status) => {
  const res = await api.patch(`/contact/${id}/status`, { status });
  return res.data;
};

export const cancelServiceRequest = async (id) => {
  return updateServiceRequestStatus(id, "Cancelled");
};

// ---------- PAYMENTS (RAZORPAY) ----------

// Create Razorpay order
export const createPaymentOrderApi = async (data) => {
  const res = await api.post("/payment/create", data);   // must use api
  return res.data;
};

// Verify Razorpay payment
export const verifyPaymentApi = async (data) => {
  const res = await api.post("/payment/verify", data);   // must use api
  return res.data;
};

// Retry failed payment
export const retryPaymentApi = async (data) => {
  const res = await api.post("/payment/retry", data);    // fixed route
  return res.data;
};




