import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Package,
  Wrench,
  ClipboardList,
  ShoppingCart,
} from "lucide-react";
import { useCart } from "../context/CartContext";

function MobileBottomNav() {
  const { cartCount = 0 } = useCart();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const iconStyle = (active) => ({
    color: active ? "#7c3aed" : "#555",
  });

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        height: "60px",
        background: "#fff",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        borderTop: "1px solid #eee",
        zIndex: 1000,
      }}
    >
      <Link to="/" style={iconStyle(isActive("/"))}>
        <Home size={22} />
      </Link>

      <Link to="/products" style={iconStyle(isActive("/products"))}>
        <Package size={22} />
      </Link>

      <Link to="/services" style={iconStyle(isActive("/services"))}>
        <Wrench size={22} />
      </Link>

      <Link to="/orders" style={iconStyle(isActive("/orders"))}>
        <ClipboardList size={22} />
      </Link>

      <Link
        to="/cart"
        style={{ position: "relative", ...iconStyle(isActive("/cart")) }}
      >
        <ShoppingCart size={22} />
        {cartCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-6px",
              right: "-10px",
              background: "orange",
              color: "#000",
              fontSize: "11px",
              fontWeight: "700",
              borderRadius: "50%",
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
    </div>
  );
}

export default MobileBottomNav;
