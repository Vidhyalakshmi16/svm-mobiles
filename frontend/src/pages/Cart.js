import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  FiShoppingBag,
  FiTrash2,
  FiArrowRight,
  FiTruck,
} from "react-icons/fi";
import "./Cart.css";

const FREE_DELIVERY_THRESHOLD = 1000;

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems = [],
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const isEmpty = !cartItems?.length;

  const itemCount = cartItems.reduce((n, i) => n + (i.quantity || 1), 0);

  const subtotal = cartItems.reduce((sum, item) => {
    const unitPrice = item.finalPrice ?? item.price ?? 0;
    return sum + unitPrice * (item.quantity || 1);
  }, 0);

  const platformFee = subtotal > FREE_DELIVERY_THRESHOLD ? 0 : 5;
  const deliveryFee =
    subtotal === 0 ? 0 : subtotal > FREE_DELIVERY_THRESHOLD ? 0 : 29;
  const grandTotal = subtotal + platformFee + deliveryFee;

  const deliveryProgress = Math.min(
    100,
    (subtotal / FREE_DELIVERY_THRESHOLD) * 100
  );
  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  const handleCheckout = () => {
    if (!user) {
      navigate("/auth", { state: { from: "/checkout" } });
      return;
    }
    navigate("/checkout");
  };

  if (isEmpty) {
    return (
      <div className="cart-page cart-empty">
        <motion.div
          className="cart-empty-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="cart-empty-icon">
            <FiShoppingBag size={32} />
          </div>
          <h1>Your cart is empty</h1>
          <p>Add phones and accessories from our store. Free delivery on orders above ₹1,000.</p>
          <button
            type="button"
            className="cart-btn cart-btn--primary"
            onClick={() => navigate("/products")}
          >
            Shop now <FiArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <header className="cart-hero">
          <span className="cart-eyebrow">Shopping cart</span>
          <h1 className="cart-title">Review your bag</h1>
          <p className="cart-meta">
            {itemCount} {itemCount === 1 ? "item" : "items"} · ₹
            {subtotal.toLocaleString("en-IN")} subtotal
          </p>
        </header>

        <div className="cart-layout">
          <div className="cart-items-panel">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => {
                const unitPrice = item.finalPrice ?? item.price ?? 0;
                const qty = item.quantity || 1;
                const maxQty =
                  item.stock !== undefined ? Math.max(1, item.stock) : 99;
                const lineTotal = unitPrice * qty;
                const lowStock =
                  item.stock !== undefined &&
                  item.stock > 0 &&
                  item.stock <= 5;

                return (
                  <motion.article
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    className="cart-item-card"
                  >
                    <Link
                      to={`/product/${item._id}`}
                      className="cart-item-media"
                    >
                      <img
                        src={item.image || item.images?.[0] || "/placeholder.png"}
                        alt={item.name}
                      />
                    </Link>

                    <div className="cart-item-body">
                      {item.brand && (
                        <p className="cart-item-brand">{item.brand}</p>
                      )}
                      <Link to={`/product/${item._id}`} className="cart-item-name">
                        {item.name}
                      </Link>
                      <p className="cart-item-unit">
                        ₹{unitPrice.toLocaleString("en-IN")} each
                      </p>
                      {item.stock !== undefined && (
                        <p
                          className={`cart-item-stock ${
                            lowStock ? "cart-item-stock--low" : ""
                          }`}
                        >
                          {item.stock === 0
                            ? "Out of stock"
                            : lowStock
                            ? `Only ${item.stock} left`
                            : `${item.stock} in stock`}
                        </p>
                      )}
                    </div>

                    <div className="cart-item-side">
                      <div className="cart-qty">
                        <button
                          type="button"
                          className="cart-qty-btn"
                          onClick={() => updateQuantity(item._id, qty - 1)}
                          disabled={qty <= 1}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="cart-qty-val">{qty}</span>
                        <button
                          type="button"
                          className="cart-qty-btn"
                          onClick={() => updateQuantity(item._id, qty + 1)}
                          disabled={qty >= maxQty}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <div className="cart-line-total">
                        ₹{lineTotal.toLocaleString("en-IN")}
                      </div>
                      <button
                        type="button"
                        className="cart-remove"
                        onClick={() => removeFromCart(item._id)}
                      >
                        <FiTrash2 size={14} /> Remove
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>

            <div className="cart-toolbar">
              <button type="button" className="cart-clear" onClick={clearCart}>
                Clear cart
              </button>
            </div>
          </div>

          <aside className="cart-summary-panel">
            <div className="cart-summary">
              <h2>Order summary</h2>

              {subtotal > 0 && subtotal < FREE_DELIVERY_THRESHOLD && (
                <div className="cart-delivery-progress">
                  <strong>
                    <FiTruck size={14} style={{ verticalAlign: "-2px" }} /> Add ₹
                    {amountToFreeDelivery.toLocaleString("en-IN")} more for free delivery
                  </strong>
                  <div className="cart-progress-bar">
                    <div
                      className="cart-progress-fill"
                      style={{ width: `${deliveryProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="cart-summary-rows">
                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
                </div>
                <div className="cart-summary-row">
                  <span>Delivery</span>
                  <strong className={deliveryFee === 0 ? "is-free" : ""}>
                    {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
                  </strong>
                </div>
                <div className="cart-summary-row">
                  <span>Platform fee</span>
                  <strong className={platformFee === 0 ? "is-free" : ""}>
                    {platformFee === 0 ? "Free" : `₹${platformFee}`}
                  </strong>
                </div>
              </div>

              <div className="cart-summary-total">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>

              <button
                type="button"
                className="cart-btn cart-btn--primary"
                onClick={handleCheckout}
              >
                Checkout <FiArrowRight size={18} />
              </button>
              <button
                type="button"
                className="cart-btn cart-btn--ghost"
                onClick={() => navigate("/products")}
              >
                Continue shopping
              </button>
            </div>
          </aside>
        </div>
      </div>

      <div className="cart-mobile-bar">
        <div className="cart-mobile-total">
          <span>Total</span>
          <strong>₹{grandTotal.toLocaleString("en-IN")}</strong>
        </div>
        <button
          type="button"
          className="cart-btn cart-btn--primary"
          onClick={handleCheckout}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
