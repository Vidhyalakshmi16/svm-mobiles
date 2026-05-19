import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import "./AuthPage.css";

const AuthPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const isLogin = mode === "login";

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(loginForm.email, loginForm.password);
      } else {
        await register(registerForm);
      }
      navigate("/");
    } catch (err) {
      console.error("Auth error:", err?.response || err);
      const backendMsg = err?.response?.data?.message;
      setError(
        backendMsg ||
          (isLogin
            ? "Invalid email or password. Please try again."
            : "Registration failed. Please check your details.")
      );
    } finally {
      setLoading(false);
    }
  };

  const switchToLogin = () => {
    setMode("login");
    setError("");
  };

  const switchToRegister = () => {
    setMode("register");
    setError("");
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (
    <div className="mv-auth-wrapper">
      {/* LEFT: BRAND PANEL (Desktop Only) */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="mv-auth-brand"
      >
        <div className="mv-auth-brand-content">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mv-auth-brand-logo"
          >
            <div className="mv-logo-box">M</div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mv-auth-brand-title"
          >
            Welcome to <span>MobiVerse</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mv-auth-brand-text"
          >
            Discover premium smartphones and experience the future of mobile technology.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mv-auth-brand-image"
          >
            📱
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mv-auth-brand-features"
          >
            <div className="mv-auth-feature">
              <span>✓</span> Exclusive Deals
            </div>
            <div className="mv-auth-feature">
              <span>✓</span> Fast Delivery
            </div>
            <div className="mv-auth-feature">
              <span>✓</span> Secure Checkout
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* RIGHT: FORM PANEL */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="mv-auth-form-panel"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mv-auth-form-container"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mv-auth-header">
            <h2 className="mv-auth-title">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="mv-auth-subtitle">
              {isLogin
                ? "Sign in to access your MobiVerse account"
                : "Join MobiVerse to shop premium devices"}
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              variants={itemVariants}
              className="mv-auth-error"
              role="alert"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <motion.form onSubmit={handleSubmit} variants={itemVariants} className="mv-auth-form">
            {/* Full Name (Register only) */}
            {!isLogin && (
              <div className="mv-auth-field">
                <label htmlFor="name">Full Name</label>
                <div className="mv-input-wrapper">
                  <FiUser className="mv-input-icon" size={18} />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    value={registerForm.name}
                    onChange={handleRegisterChange}
                    required
                    className="mv-auth-input"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="mv-auth-field">
              <label htmlFor="email">Email Address</label>
              <div className="mv-input-wrapper">
                <FiMail className="mv-input-icon" size={18} />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={isLogin ? loginForm.email : registerForm.email}
                  onChange={isLogin ? handleLoginChange : handleRegisterChange}
                  required
                  className="mv-auth-input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mv-auth-field">
              <label htmlFor="password">Password</label>
              <div className="mv-input-wrapper">
                <FiLock className="mv-input-icon" size={18} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={
                    isLogin ? "Your password" : "Minimum 8 characters"
                  }
                  value={isLogin ? loginForm.password : registerForm.password}
                  onChange={isLogin ? handleLoginChange : handleRegisterChange}
                  required
                  className="mv-auth-input"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="mv-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </motion.button>
              </div>

              {isLogin && (
                <motion.button
                  whileHover={{ x: 2 }}
                  type="button"
                  className="mv-forgot-link"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </motion.button>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              disabled={loading}
              className="mv-btn-primary mv-btn-auth"
            >
              {loading
                ? isLogin
                  ? "Signing in..."
                  : "Creating account..."
                : isLogin
                ? "Sign In"
                : "Create Account"}
            </motion.button>
          </motion.form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="mv-auth-divider">
            <span>or</span>
          </motion.div>

          {/* Social Login (Placeholder) */}
          <motion.div variants={itemVariants} className="mv-auth-social">
            <button type="button" className="mv-social-btn mv-social-google">
              <span>🔍</span> Google
            </button>
            <button type="button" className="mv-social-btn">
              <span>f</span> Facebook
            </button>
          </motion.div>

          {/* Toggle Auth Mode */}
          <motion.div variants={itemVariants} className="mv-auth-toggle">
            {isLogin ? (
              <>
                Don't have an account?{" "}
                <motion.button
                  whileHover={{ x: 2 }}
                  type="button"
                  className="mv-toggle-link"
                  onClick={switchToRegister}
                >
                  Sign up
                </motion.button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <motion.button
                  whileHover={{ x: 2 }}
                  type="button"
                  className="mv-toggle-link"
                  onClick={switchToLogin}
                >
                  Sign in
                </motion.button>
              </>
            )}
          </motion.div>

          {/* Terms */}
          <motion.p variants={itemVariants} className="mv-auth-terms">
            By continuing, you agree to our <a href="#">Terms of Service</a> and{" "}
            <a href="#">Privacy Policy</a>.
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
