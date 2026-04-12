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
import "./MobileChrome.css";

function MobileBottomNav() {
  const { cartCount = 0 } = useCart();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="mobile-bottom-nav" aria-label="Primary">
      <Link to="/" className={isActive("/") ? "is-active" : undefined}>
        <Home size={22} strokeWidth={isActive("/") ? 2.25 : 2} />
      </Link>

      <Link to="/products" className={isActive("/products") ? "is-active" : undefined}>
        <Package size={22} strokeWidth={isActive("/products") ? 2.25 : 2} />
      </Link>

      <Link to="/services" className={isActive("/services") ? "is-active" : undefined}>
        <Wrench size={22} strokeWidth={isActive("/services") ? 2.25 : 2} />
      </Link>

      <Link to="/orders" className={isActive("/orders") ? "is-active" : undefined}>
        <ClipboardList size={22} strokeWidth={isActive("/orders") ? 2.25 : 2} />
      </Link>

      <Link
        to="/cart"
        className={`mobile-bottom-nav__cart-wrap${isActive("/cart") ? " is-active" : ""}`}
      >
        <ShoppingCart size={22} strokeWidth={isActive("/cart") ? 2.25 : 2} />
        {cartCount > 0 && (
          <span className="mobile-bottom-nav__badge">{cartCount}</span>
        )}
      </Link>
    </nav>
  );
}

export default MobileBottomNav;
