import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FiTrash2, FiShoppingBag } from "react-icons/fi";
import "./Cart.css";

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems = [],
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const isEmpty = !cartItems || cartItems.length === 0;

  const subtotal = cartItems.reduce((sum, item) => {
    const unitPrice = item.finalPrice ?? item.price ?? 0;
    const qty = item.quantity || 1;
    return sum + unitPrice * qty;
  }, 0);

  const platformFee = subtotal > 1000 ? 0 : 5;
  const deliveryFee = subtotal === 0 ? 0 : subtotal > 1000 ? 0 : 29;
  const grandTotal = subtotal + platformFee + deliveryFee;

  const handleCheckout = () => {
    if (!user) {
      navigate("/auth", { state: { from: "/checkout" } });
      return;
    }
    navigate("/checkout");
  };

  if (isEmpty) {
    return (
      <div className="mv-cart-wrapper mv-cart--empty">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="mv-cart-empty-state"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mv-cart-empty-icon"
          >
            <FiShoppingBag size={48} />
          </motion.div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mv-eyebrow"
          >
            Shopping Bag
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mv-cart-empty-title"
          >
            Your cart is <em>empty</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mv-cart-empty-text"
          >
            Discover the latest flagship smartphones and premium devices curated just for you.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/products")}
            className="mv-btn-primary"
          >
            Browse Collection →
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mv-cart-wrapper">
      {/* PAGE HEADER */}
      <motion.header
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className="mv-cart-header"
      >
        <span className="mv-eyebrow">— Checkout</span>
        <h1 className="mv-cart-title">
          Your <em>cart</em>
        </h1>
      </motion.header>

      <div className="mv-cart-container">
        {/* ITEMS LIST */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mv-cart-items"
        >
          <AnimatePresence mode="popLayout">
            {cartItems.map((item, index) => {
              const unitPrice = item.finalPrice ?? item.price ?? 0;
              const qty = item.quantity || 1;
              const lineTotal = unitPrice * qty;

              return (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.4,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  className="mv-cart-item"
                >
                  {/* Product Image */}
                  <div className="mv-cart-item-image">
                    <img
                      src={item.image || item.images?.[0]}
                      alt={item.name}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="mv-cart-item-info">
                    {item.brand && (
                      <p className="mv-cart-item-brand">{item.brand}</p>
                    )}
                    <h4 className="mv-cart-item-name">{item.name}</h4>
                    <p className="mv-cart-item-unit">
                      ₹{unitPrice.toLocaleString("en-IN")} per unit
                    </p>
                    {item.stock !== undefined && (
                      <p className="mv-cart-item-stock">
                        In stock: {item.stock}
                      </p>
                    )}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="mv-qty-stepper">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item._id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="mv-qty-btn"
                    >
                      −
                    </button>
                    <span className="mv-qty-value">{qty}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item._id, item.quantity + 1)
                      }
                      className="mv-qty-btn"
                    >
                      +
                    </button>
                  </div>

                  {/* Price & Remove */}
                  <div className="mv-cart-item-actions">
                    <div className="mv-cart-item-price">
                      ₹{lineTotal.toLocaleString("en-IN")}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      className="mv-cart-item-remove"
                      onClick={() => removeFromCart(item._id)}
                      title="Remove from cart"
                    >
                      <FiTrash2 size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Clear Cart Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={clearCart}
            className="mv-cart-clear-btn"
          >
            Clear Cart
          </motion.button>
        </motion.div>

        {/* ORDER SUMMARY SIDEBAR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mv-cart-summary"
        >
          <div className="mv-summary-card">
            <h3 className="mv-summary-title">Order Summary</h3>

            {/* Summary Rows */}
            <div className="mv-summary-rows">
              <div className="mv-summary-row">
                <span className="mv-summary-label">Subtotal</span>
                <span className="mv-summary-value">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="mv-summary-row">
                <span className="mv-summary-label">Delivery</span>
                <span className={`mv-summary-value ${deliveryFee === 0 ? "mv-free" : ""}`}>
                  {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="mv-summary-row">
                <span className="mv-summary-label">Platform Fee</span>
                <span className={`mv-summary-value ${platformFee === 0 ? "mv-free" : ""}`}>
                  {platformFee === 0 ? "Free" : `₹${platformFee}`}
                </span>
              </div>

              {/* Promo hint */}
              {subtotal > 0 && subtotal <= 1000 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mv-summary-hint"
                >
                  Add ₹{(1000 - subtotal).toLocaleString("en-IN")} more for{" "}
                  <span className="mv-hint-accent">free delivery</span>
                </motion.div>
              )}

              <div className="mv-summary-divider" />

              <div className="mv-summary-total">
                <span className="mv-total-label">Total</span>
                <span className="mv-total-value">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleCheckout}
              className="mv-btn-primary mv-btn-block"
            >
              Proceed to Checkout →
            </motion.button>

            {/* Continue Shopping Link */}
            <motion.button
              whileHover={{ color: "var(--ink)" }}
              onClick={() => navigate("/products")}
              className="mv-btn-ghost mv-btn-block"
            >
              Continue Shopping
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
