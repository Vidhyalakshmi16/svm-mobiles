import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Heart, LogOut, UserCircle} from "lucide-react";


function Navbar() {
  const { cartCount = 0 } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    closeNavbar();
    logout();
    navigate("/");
  };

  const getInitial = () => {
    if (!user) return "";
    if (user.name) return user.name.trim().charAt(0).toUpperCase();
    if (user.email) return user.email.trim().charAt(0).toUpperCase();
    return "?";
  };

  // Avatar color logic
  const avatarColor = isAdmin
    ? "linear-gradient(135deg, #facc15, #eab308)" // gold for admin
    : "linear-gradient(135deg, #8a3cc1ff, #914ed0ff)"; // purple for user

  const closeNavbar = () => {
  const navbar = document.getElementById("navbarNav");
  if (navbar && navbar.classList.contains("show")) {
    navbar.classList.remove("show");
  }
};


  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3 shadow-sm fixed-top">
      <Link className="navbar-brand fw-bold fs-4" to="/">
        Sri Vaari Mobiles
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ms-auto align-items-center gap-2">
          <li className="nav-item">
            <Link className="nav-link" to="/" onClick={closeNavbar}>
              Home
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/products" onClick={closeNavbar}>
              Products
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/services" onClick={closeNavbar}>
              Services
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/orders" onClick={closeNavbar}>
              Orders
            </Link>
          </li>

          {/* CART */}
          <li className="nav-item position-relative">
            <Link className="nav-link d-flex align-items-center" to="/cart" onClick={closeNavbar}>
              <ShoppingCart size={22} />
              <span className="ms-1">Cart</span>

              {cartCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-circle"
                  style={{
                    backgroundColor: "orange",
                    color: "black",
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </li>

          {/* ADMIN MENU */}
          {isAdmin && (
            <li className="nav-item dropdown">
              <button
                className="nav-link dropdown-toggle btn btn-link text-decoration-none"
                id="adminDropdown"
                data-bs-toggle="dropdown"
                type="button"
              >
                Admin
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" to="/admin/dashboard" onClick={closeNavbar}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/admin/products" onClick={closeNavbar}>
                    Manage Products
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/admin/orders" onClick={closeNavbar}>
                    Manage Orders
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/admin/service-requests" onClick={closeNavbar}>
                    Service Requests
                  </Link>
                </li>
              </ul>
            </li>
          )}

          {/* USER AVATAR / LOGIN */}
          <li className="nav-item ms-2">
            {!user ? (
              <button
                className="btn btn-outline-light btn-sm"
                onClick={() => {
                  closeNavbar();
                  navigate("/auth");
                }}
              >
                Login
              </button>
            ) : (
              <div className="dropdown">
                <button
                  type="button"
                  id="userMenu"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  className="border-0 bg-transparent p-0"
                  style={{ outline: "none", boxShadow: "none" }}
                >
                  <div
                    style={{
                      width: 35,
                      height: 35,
                      borderRadius: "50%",
                      background: avatarColor,
                      color: "white",
                      fontWeight: 700,
                      fontSize: "1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {getInitial()}
                  </div>
                </button>

                <ul
  className="dropdown-menu dropdown-menu-end shadow-sm"
  style={{ width: "200px", padding: "6px 0" }}
>

  {/* USER HEADER */}
  <li className="px-3 py-2 d-flex align-items-center gap-2">
    <UserCircle size={18} className="text-secondary" />
    <div className="d-flex flex-column" style={{ lineHeight: "1.1" }}>
      <span className="small text-muted">Signed in as</span>
      <span className="fw-semibold text-dark" style={{ fontSize: "0.9rem" }}>
        {user.name || user.email}
      </span>
    </div>
  </li>

  <li><hr className="dropdown-divider my-1" /></li>

  {/* WISHLIST */}
  <li>
    <Link
      className="dropdown-item d-flex align-items-center gap-2 py-2"
      to="/wishlist" onClick={closeNavbar}
      style={{ fontSize: "0.9rem" }}
    >
      <Heart size={16} className="text-danger" />
      Wishlist
    </Link>
  </li>

  <li><hr className="dropdown-divider my-1" /></li>

  {/* SIGN OUT */}
  <li>
    <button
      className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger fw-semibold"
      onClick={handleLogout}
      style={{ fontSize: "0.9rem" }}
    >
      <LogOut size={16} />
      Sign out
    </button>
  </li>

</ul>

              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
