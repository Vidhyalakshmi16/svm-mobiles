import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";

// Admin Components & Pages
import BulkDiscountPage from "./pages/BulkDiscountPage";

import AuthPage from "./pages/AuthPage";
import PrivateRoute from "./components/PrivateRoute";
import { WishlistProvider } from "./context/WishlistContext";
import WishlistPage from "./pages/WishlistPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";





import AdminSidebar from "./components/AdminSidebar";
import AdminNavbar from "./components/AdminNavbar";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminServiceRequestsPage from "./pages/AdminServiceRequestsPage";

// Context & Toast
import { CartProvider } from "./context/CartContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Styles
import "./styles/AdminDashboard.css";

function App() {
  return (
    <WishlistProvider>
    <CartProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Routes>
            {/* Normal Website Layout */}
            <Route
              path="/*"
              element={
                <>
                  <Navbar />
                  <main className="flex-grow-1">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/order-success" element={<OrderSuccess />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />


                      {/* 🔐 Auth Routes */}
                      <Route path="/auth" element={<AuthPage />} />


                      {/* 🔐 Protected Customer/Admin Routes */}
                      <Route
                        path="/checkout"
                        element={
                          <PrivateRoute allowedRoles={["customer", "admin"]}>
                            <Checkout />
                          </PrivateRoute>
                        }
                      />
                      <Route path="/orders" element={<Orders />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              }
            />

            {/* 🔐 Admin Routes (Admin-only) */}
            <Route
              path="/admin/*"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <div className="admin-app">
                    <AdminSidebar />
                    <div className="admin-main">
                      <AdminNavbar />
                      <div className="admin-content">
                        <Routes>
                          <Route path="dashboard" element={<AdminDashboardPage />} />
                          <Route path="products" element={<AdminProductsPage />} />
                          <Route path="orders" element={<AdminOrdersPage />} />
                          <Route path="service-requests" element={<AdminServiceRequestsPage />} />
                          <Route path="bulk-discount" element={<BulkDiscountPage />} />
                          <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
                        </Routes>
                      </div>
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
          </Routes>
        </div>

        <ToastContainer position="top-right" autoClose={2000} />
      </Router>
    </CartProvider>
    </WishlistProvider>
  );
}

export default App;
