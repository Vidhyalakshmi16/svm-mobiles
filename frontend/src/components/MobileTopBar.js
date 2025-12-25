import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  LogOut,
  UserCircle,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function MobileTopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

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

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/");
  };

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
          fontWeight: 700,
          fontSize: "1.1rem",
          color: "#000",
          textDecoration: "none",
        }}
      >
        Sri Vaari Mobiles
      </Link>

      {/* RIGHT ICONS */}
      <div
        style={{
          position: "relative",
          display: "flex",
          gap: "14px",
          alignItems: "center",
        }}
      >
        {/* WISHLIST */}
        <Link to="/wishlist">
          <Heart size={22} color="#e11d48" />
        </Link>

        {/* ADMIN ICON (ONLY FOR ADMIN) */}
        {user?.role === "admin" && (
          <Link
            to="/admin/dashboard"
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "#facc15",
              color: "#111",
            }}
          >
            <ShieldCheck size={18} />
          </Link>
        )}

        {/* AVATAR */}
        {user ? (
          <>
            <div
              onClick={() => setOpen(!open)}
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

            {/* DROPDOWN */}
            {open && (
              <div
                style={{
                  position: "absolute",
                  top: "44px",
                  right: 0,
                  width: "200px",
                  background: "#fff",
                  borderRadius: "10px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                  padding: "8px 0",
                  zIndex: 2000,
                }}
              >
                {/* USER INFO */}
                <div style={{ padding: "8px 14px" }}>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    Signed in as
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>
                    {user.name || user.email}
                  </div>
                </div>

                <hr style={{ margin: "6px 0" }} />

                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: "10px 14px",
                    color: "#dc2626",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </>
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
