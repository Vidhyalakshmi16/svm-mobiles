import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, UserCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function MobileTopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getInitial = () => {
    if (!user) return "";
    if (user.name) return user.name.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return "?";
  };

  const avatarColor =
    user?.role === "admin"
      ? "linear-gradient(135deg, #facc15, #eab308)"
      : "linear-gradient(135deg, #8a3cc1ff, #914ed0ff)";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        height: "56px",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 14px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        zIndex: 1000,
      }}
    >
      {/* BRAND */}
      <Link
        to="/"
        style={{
          fontWeight: "700",
          fontSize: "1.1rem",
          color: "#000",
          textDecoration: "none",
        }}
      >
        Sri Vaari
      </Link>

      {/* RIGHT ICONS */}
      <div className="d-flex align-items-center gap-3">
        <Link to="/wishlist">
          <Heart size={22} color="#e11d48" />
        </Link>

        {user ? (
          <div
            onClick={() => navigate("/orders")}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: avatarColor,
              color: "#fff",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {getInitial()}
          </div>
        ) : (
          <UserCircle
            size={28}
            onClick={() => navigate("/auth")}
            style={{ cursor: "pointer" }}
          />
        )}
      </div>
    </div>
  );
}

export default MobileTopBar;
