import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

const AuthPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        await register(registerForm); // role=customer handled in backend/AuthContext
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
    // Navigate to dedicated forgot password page
    navigate("/forgot-password");
  };

  return (
    <div className="auth-page-bg">
      <div className="auth-wrapper">
        <div className="auth-card-single animate-pop">
          <h2 className="auth-heading">
            {isLogin ? "Login" : "Create Account"}
          </h2>
          <p className="auth-subtext">
            {isLogin
              ? "Please enter your login and your password."
              : "Fill in the details below to create your account."}
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form-single">
            {!isLogin && (
              <div className="auth-field">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={registerForm.name}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
            )}

            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={isLogin ? loginForm.email : registerForm.email}
                onChange={isLogin ? handleLoginChange : handleRegisterChange}
                required
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder={
                  isLogin ? "Your password" : "Choose a strong password"
                }
                value={isLogin ? loginForm.password : registerForm.password}
                onChange={isLogin ? handleLoginChange : handleRegisterChange}
                required
              />
              {isLogin && (
                <button
                  type="button"
                  className="auth-forgot-link"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              )}
            </div>

            <button
              className="auth-btn-main"
              disabled={loading}
              type="submit"
            >
              {loading
                ? isLogin
                  ? "Logging in..."
                  : "Registering..."
                : isLogin
                ? "Login"
                : "Register"}
            </button>
          </form>

          <div className="auth-bottom-text">
            {isLogin ? (
              <>
                Not a member yet?{" "}
                <button
                  type="button"
                  className="auth-link-button"
                  onClick={switchToRegister}
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="auth-link-button"
                  onClick={switchToLogin}
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
