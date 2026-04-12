import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/axiosInstance";
import "./AuthPage.css";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await axios.post("/auth/forgot-password", { email, newPassword });
      setMessage("Password updated successfully!");
      setTimeout(() => navigate("/auth"), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <div className="auth-page-bg">
      <div className="auth-wrapper">
        <div className="auth-card-single animate-pop" style={{ padding: "28px 32px" }}>
          <h2 className="auth-heading mb-1">Reset Password</h2>
          <p className="auth-subtext" style={{ marginBottom: "16px" }}>
            Enter your registered email and create a new password.
          </p>

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success">{message}</div>}

          <form onSubmit={handleSubmit} className="auth-form-single" style={{ gap: "14px" }}>
            {/* Email */}
            <div className="auth-field small-space">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* New Password */}
            <div className="auth-field small-space password-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <span
                className="password-toggle"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? "👁️" : "👁️‍🗨️"}
              </span>
            </div>

            {/* Confirm Password */}
            <div className="auth-field small-space password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </span>
            </div>

            <button type="submit" className="auth-btn-main">
              Reset Password
            </button>
          </form>

          <button
            className="auth-link-button mt-3"
            onClick={() => navigate("/auth")}
            style={{ marginTop: "16px" }}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
