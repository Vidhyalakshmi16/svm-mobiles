import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  LogOut,
  UserCircle,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./MobileChrome.css";

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
    <header className="mobile-topbar">
      <Link className="mobile-topbar__brand" to="/">
        Sri Vaari Mobiles
      </Link>

      <div className="mobile-topbar__icons">
        <Link to="/wishlist" className="mobile-topbar__icon-link" aria-label="Wishlist">
          <Heart size={22} strokeWidth={2} />
        </Link>

        {user?.role === "admin" && (
          <Link
            to="/admin/dashboard"
            onClick={() => setOpen(false)}
            className="mobile-topbar__admin"
            aria-label="Admin"
          >
            <ShieldCheck size={18} />
          </Link>
        )}

        {user ? (
          <>
            <div
              role="button"
              tabIndex={0}
              onClick={() => setOpen(!open)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setOpen(!open);
              }}
              className="mobile-topbar__avatar"
              style={{ background: avatarColor }}
            >
              {getInitial()}
            </div>

            {open && (
              <div className="mobile-topbar__menu">
                <div style={{ padding: "8px 14px" }}>
                  <div style={{ fontSize: "12px", color: "var(--store-muted)" }}>
                    Signed in as
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--store-text)" }}>
                    {user.name || user.email}
                  </div>
                </div>

                <hr style={{ margin: "6px 0", borderColor: "var(--store-border)" }} />

                <button
                  type="button"
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
            style={{ cursor: "pointer", color: "var(--store-muted)" }}
          />
        )}
      </div>
    </header>
  );
}

export default MobileTopBar;
