import React from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiShield, FiHeart, FiShoppingCart, FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <motion.section
      className="mv-profile-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mv-profile-hero">
        <div>
          <p className="mv-eyebrow">Account</p>
          <h1 className="mv-profile-title">Welcome back, {user.name || user.email}</h1>
          <p className="mv-profile-lead">
            Manage your account details, view your order history, and keep your profile secure.
          </p>
        </div>

        <div className="mv-profile-badge">
          <FiShield size={18} />
          <span>{user.role === "admin" ? "Administrator" : "Customer"}</span>
        </div>
      </div>

      <div className="mv-profile-grid">
        <div className="mv-profile-card">
          <div className="mv-profile-card-header">
            <div className="mv-profile-card-icon">
              <FiUser />
            </div>
            <div>
              <h2>Profile details</h2>
              <p>Basic account information and access management.</p>
            </div>
          </div>

          <div className="mv-profile-details">
            <div>
              <span>Name</span>
              <strong>{user.name || "-"}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{user.email || "-"}</strong>
            </div>
            <div>
              <span>Role</span>
              <strong>{user.role || "Customer"}</strong>
            </div>
          </div>

          <div className="mv-profile-actions">
            <button className="mv-btn-secondary" onClick={handleLogout}>
              <FiLogOut size={16} />
              Sign out
            </button>
          </div>
        </div>

        <div className="mv-profile-summary">
          <div className="mv-summary-card">
            <div className="mv-summary-icon mv-summary-icon--primary">
              <FiShoppingCart />
            </div>
            <div>
              <span>Your cart</span>
              <Link to="/cart" className="mv-summary-link">
                View items
              </Link>
            </div>
          </div>

          <div className="mv-summary-card">
            <div className="mv-summary-icon mv-summary-icon--accent">
              <FiHeart />
            </div>
            <div>
              <span>Saved wishlist</span>
              <Link to="/wishlist" className="mv-summary-link">
                View wishlist
              </Link>
            </div>
          </div>

          <div className="mv-summary-card">
            <div className="mv-summary-icon mv-summary-icon--muted">
              <FiShield />
            </div>
            <div>
              <span>Secure access</span>
              <p className="mv-summary-copy">Your profile is protected by token-based login.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
