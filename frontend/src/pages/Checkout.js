// src/pages/Checkout.js
import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createOrderApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { createPaymentOrderApi, verifyPaymentApi } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiPhone, FiMapPin, FiZap, FiShoppingBag } from "react-icons/fi";
import "./Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const { cartItems = [], clearCart } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [placing, setPlacing] = useState(false);

  if (!user) {
    return (
      <Navigate to="/auth" state={{ from: location.pathname }} replace />
    );
  }

  const isEmpty = cartItems.length === 0;

  const subtotal = cartItems.reduce((sum, item) => {
    const unitPrice = item.finalPrice ?? item.price ?? 0;
    const qty = item.quantity || 1;
    return sum + unitPrice * qty;
  }, 0);

  const platformFee = subtotal > 1000 ? 0 : 5;
  const deliveryFee =
    subtotal === 0 ? 0 : subtotal > 1000 ? 0 : 29;

  const grandTotal = subtotal + platformFee + deliveryFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const normalizePhone = (raw) => {
    if (!raw) return null;
    let s = String(raw).trim();
    // remove spaces, dashes, parentheses
    s = s.replace(/[\s\-()]/g, "");
    // strip leading + for processing
    if (s.startsWith("+")) s = s.slice(1);
    // remove any leading zeros
    while (s.startsWith("0")) s = s.slice(1);
    // now s could be 10 digits (local), or 12 digits starting with country code (91...)
    if (/^\d{10}$/.test(s)) return "+91" + s;
    if (/^91\d{10}$/.test(s)) return "+" + s;
    // if it's digits and longer, try to prefix +
    if (/^\d+$/.test(s) && s.length > 10) return "+" + s;
    return null;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (isEmpty || placing) return;

    const { name, phone, address, city, pincode } = form;

    if (!name || !phone || !address || !city || !pincode) {
      alert("Please fill all required fields");
      return;
    }

    // Normalize phone into E.164-like format (+91XXXXXXXXXX) for messaging
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      alert("Please enter a valid mobile number (e.g. 9876543210 or +91 98765 43210)");
      setPlacing(false);
      return;
    }

    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded");
      return;
    }

    setPlacing(true);

    try {
      const customer = {
        name,
        phone: normalizedPhone,
        address,
        city,
        pincode,
        email: user.email,
      };

      const order = await createOrderApi({
        customer,
        paymentMethod: "UPI",
        subtotal,
        deliveryFee,
        platformFee,
        total: grandTotal,
        items: cartItems,
      });

      const razorpayOrder = await createPaymentOrderApi({
        amount: grandTotal,
        orderId: order._id,
      });

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "Sri Vaari Mobiles",
        description: "Order Payment",
        order_id: razorpayOrder.razorpayOrderId,

        handler: async (response) => {
          try {
            const res = await verifyPaymentApi({
              ...response,
              orderId: order._id,
            });

            if (res) {
              navigate("/order-success", {
                state: { orderId: order._id },
                replace: true,
              });

              setTimeout(() => {
                clearCart();
              }, 200);
            } else {
              alert("Payment verification failed");
            }
          } catch {
            alert("Payment verification error");
          }
        },

        modal: {
          ondismiss: async () => {
            await fetch(
              `${process.env.REACT_APP_API_URL}/orders/${order._id}/payment-failed`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
          },
        },

        theme: { color: "#7d5f0c" },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", async () => {
        await fetch(
          `${process.env.REACT_APP_API_URL}/orders/${order._id}/payment-failed`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        alert("Payment failed. Please try again.");
      });

      rzp.open();
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (isEmpty) {
    return (
      <motion.div className="mv-checkout-wrapper mv-checkout-empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="mv-checkout-container">
          <div className="mv-empty-state">
            <motion.div className="mv-empty-icon" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
              <FiShoppingBag />
            </motion.div>
            <h1 className="mv-empty-title">
              Your bag is <em>empty</em>
            </h1>
            <p className="mv-empty-text">Add products before completing checkout.</p>
            <Link to="/products" className="mv-btn-primary mv-empty-cta">
              Browse Collection
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="mv-checkout-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="mv-checkout-container">
        <div className="mv-checkout-header">
          <motion.h1 className="mv-checkout-title" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            Delivery &amp; <em>Payment</em>
          </motion.h1>
          <motion.p className="mv-checkout-subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
            Complete your order securely
          </motion.p>
        </div>

        <div className="mv-checkout-grid">
          {/* Left: Checkout Form */}
          <motion.div className="mv-checkout-form-section" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="mv-checkout-form-card">
              <h2 className="mv-form-section-title">Delivery Details</h2>

              <form className="mv-checkout-form" onSubmit={handlePlaceOrder}>
                {/* Name Field */}
                <motion.div className="mv-form-group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
                  <label htmlFor="name" className="mv-form-label">
                    Full Name <span className="mv-required">*</span>
                  </label>
                  <div className="mv-form-input-wrapper">
                    <FiUser className="mv-form-icon" />
                    <input
                      id="name"
                      type="text"
                      className="mv-form-input"
                      name="name"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </motion.div>

                {/* Phone Field */}
                <motion.div className="mv-form-group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}>
                  <label htmlFor="phone" className="mv-form-label">
                    Mobile Number <span className="mv-required">*</span>
                  </label>
                  <div className="mv-form-input-wrapper">
                    <FiPhone className="mv-form-icon" />
                      <input
                        id="phone"
                        type="tel"
                        className="mv-form-input"
                        name="phone"
                        placeholder="9876543210"
                        value={form.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                </motion.div>

                {/* Address Field */}
                <motion.div className="mv-form-group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
                  <label htmlFor="address" className="mv-form-label">
                    Address <span className="mv-required">*</span>
                  </label>
                  <textarea
                    id="address"
                    className="mv-form-textarea"
                    name="address"
                    placeholder="Street address, building, floor, etc."
                    rows="3"
                    value={form.address}
                    onChange={handleChange}
                    required
                  />
                </motion.div>

                {/* City & Pincode */}
                <motion.div className="mv-form-row" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.45 }}>
                  <div className="mv-form-group mv-form-col">
                    <label htmlFor="city" className="mv-form-label">
                      City <span className="mv-required">*</span>
                    </label>
                    <div className="mv-form-input-wrapper">
                      <FiMapPin className="mv-form-icon" />
                      <input
                        id="city"
                        type="text"
                        className="mv-form-input"
                        name="city"
                        placeholder="Salem"
                        value={form.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mv-form-group mv-form-col">
                    <label htmlFor="pincode" className="mv-form-label">
                      Pincode <span className="mv-required">*</span>
                    </label>
                    <input
                      id="pincode"
                      type="text"
                      className="mv-form-input"
                      name="pincode"
                      placeholder="636003"
                      value={form.pincode}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </motion.div>

                {/* Payment Method */}
                <motion.div className="mv-payment-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
                  <h3 className="mv-payment-title">Payment Method</h3>
                  <div className="mv-payment-option">
                    <div className="mv-payment-badge">
                      <FiZap className="mv-payment-icon" />
                      <span>UPI</span>
                    </div>
                    <p className="mv-payment-text">Google Pay, PhonePe, Paytm</p>
                  </div>
                  <p className="mv-payment-note">Secure payment powered by Razorpay</p>
                </motion.div>

                {/* Submit Button */}
                <motion.button type="submit" className="mv-btn-primary mv-btn-checkout" disabled={placing} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.55 }}>
                  {placing ? (
                    <>
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ display: "inline-block" }}>
                        ⚡
                      </motion.span>
                      Processing…
                    </>
                  ) : (
                    <>
                      Place Order
                      <FiZap size={16} style={{ marginLeft: "0.5rem" }} />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Right: Order Summary */}
          <motion.div className="mv-checkout-summary-section" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="mv-checkout-summary-card">
              <h2 className="mv-summary-title">Order Summary</h2>

              {/* Items List */}
              <div className="mv-summary-items">
                <AnimatePresence mode="popLayout">
                  {cartItems.map((item, index) => {
                    const unitPrice = item.finalPrice ?? item.price ?? 0;
                    const qty = item.quantity || 1;
                    const lineTotal = unitPrice * qty;

                    return (
                      <motion.div
                        key={item._id}
                        className="mv-summary-item"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                      >
                        {(item.image || item.images?.[0]) && (
                          <img
                            src={item.image || item.images?.[0]}
                            alt={item.name}
                            className="mv-summary-item-image"
                          />
                        )}
                        <div className="mv-summary-item-info">
                          <p className="mv-summary-item-name">{item.name}</p>
                          <p className="mv-summary-item-qty">Qty: {qty}</p>
                        </div>
                        <p className="mv-summary-item-price">₹{lineTotal.toLocaleString("en-IN")}</p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Pricing Breakdown */}
              <div className="mv-summary-pricing">
                <div className="mv-pricing-row">
                  <span className="mv-pricing-label">Subtotal</span>
                  <span className="mv-pricing-value">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="mv-pricing-row">
                  <span className="mv-pricing-label">Delivery</span>
                  <span className={`mv-pricing-value ${deliveryFee === 0 ? "mv-pricing-free" : ""}`}>
                    {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
                  </span>
                </div>

                <div className="mv-pricing-row">
                  <span className="mv-pricing-label">Platform Fee</span>
                  <span className={`mv-pricing-value ${platformFee === 0 ? "mv-pricing-free" : ""}`}>
                    {platformFee === 0 ? "Free" : `₹${platformFee}`}
                  </span>
                </div>

                {subtotal > 0 && subtotal <= 1000 && (
                  <motion.p className="mv-pricing-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.5 }}>
                    Add ₹{1000 - subtotal} more for <span className="mv-hint-highlight">free delivery &amp; fee</span>
                  </motion.p>
                )}

                <div className="mv-pricing-divider" />

                <div className="mv-pricing-total">
                  <span className="mv-total-label">Total</span>
                  <span className="mv-total-value">₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Trust Signals */}
              <div className="mv-trust-signals">
                <div className="mv-trust-signal">
                  <span className="mv-trust-icon">🔒</span>
                  <span className="mv-trust-text">Secure checkout</span>
                </div>
                <div className="mv-trust-signal">
                  <span className="mv-trust-icon">🚚</span>
                  <span className="mv-trust-text">Fast delivery</span>
                </div>
                <div className="mv-trust-signal">
                  <span className="mv-trust-icon">↩️</span>
                  <span className="mv-trust-text">Easy returns</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
