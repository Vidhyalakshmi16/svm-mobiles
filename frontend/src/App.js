import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Common Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MobileTopBar from "./components/MobileTopBar";
import MobileBottomNav from "./components/MobileBottomNav";

// Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import WishlistPage from "./pages/WishlistPage";
import AuthPage from "./pages/AuthPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

// Admin Pages
import BulkDiscountPage from "./pages/BulkDiscountPage";
import AdminSidebar from "./components/AdminSidebar";
import AdminNavbar from "./components/AdminNavbar";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminServiceRequestsPage from "./pages/AdminServiceRequestsPage";

// Auth & Context
import PrivateRoute from "./components/PrivateRoute";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";

// Toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Styles
import "./styles/AdminDashboard.css";

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // 🔑 ADMIN SIDEBAR STATE
  const [sidebarOpen, setSidebarOpen] = useState(false);
  

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <WishlistProvider>
      <CartProvider>
        <Router>
          <div className="d-flex flex-column min-vh-100">
            <Routes>

              {/* 🌐 NORMAL WEBSITE */}
              <Route
                path="/*"
                element={
                  <>
                    {!isMobile && <Navbar />}
                    {isMobile && <MobileTopBar />}

                    <main
                      className="flex-grow-1"
                      style={{
                        paddingTop: isMobile ? "56px" : "70px",
                        paddingBottom: isMobile ? "60px" : "0px",
                      }}
                    >
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/order-success" element={<OrderSuccess />} />
                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/auth" element={<AuthPage />} />

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

                    {isMobile && <MobileBottomNav />}
                    <Footer />
                  </>
                }
              />

              {/* 🔐 ADMIN ROUTES */}
              <Route
                path="/admin/*"
                element={
                  <PrivateRoute allowedRoles={["admin"]}>
                    <div className="admin-app">
                      {/* ✅ SIDEBAR */}
                      <AdminSidebar
                        mobileOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                      />

                      <div className="admin-main">
                        {/* ✅ TOP NAVBAR */}
                        <AdminNavbar
                          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                        />

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
