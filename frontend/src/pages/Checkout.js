// src/pages/Checkout.js
import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createOrderApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  createPaymentOrderApi,
  verifyPaymentApi,
} from "../services/api";

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

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (isEmpty || placing) return;

    const { name, phone, address, city, pincode } = form;

    if (!name || !phone || !address || !city || !pincode) {
      alert("Please fill all required fields");
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
        phone,
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
      <div className="container py-4">
        <div className="lux-empty-card text-center">
          <p className="lux-eyebrow">Checkout</p>
          <h1 className="lux-heading-lg mb-2">Your bag is empty</h1>
          <p className="text-muted mb-4 small">
            Add products before completing checkout.
          </p>
          <Link to="/products" className="store-btn-primary px-5">
            Browse collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <p className="lux-eyebrow mb-1">Secure checkout</p>
      <h1 className="store-page-title mb-4">Delivery &amp; payment</h1>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="lux-cart-card lux-form">
            <h2 className="lux-heading-lg fs-4 mb-3">Delivery details</h2>

            <form onSubmit={handlePlaceOrder}>
              <div className="mb-3">
                <label className="form-label">Full name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Mobile number *</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Address *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Pincode *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Payment</label>
                <div className="alert lux-alert-pay small mb-0">
                  UPI — Google Pay, PhonePe, Paytm
                </div>
                <div className="small text-muted mt-2">
                  Secure payment powered by Razorpay.
                </div>
              </div>

              <button
                type="submit"
                className="store-btn-primary w-100 mt-1"
                disabled={placing}
              >
                {placing ? "Processing…" : "Place order"}
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="lux-summary-card">
            <h6 className="lux-summary-title">Order summary</h6>

            <div
              className="mb-3 rounded-3 p-2"
              style={{
                maxHeight: 220,
                overflowY: "auto",
                background: "rgba(201,162,39,0.06)",
                border: "1px solid var(--lux-border)",
              }}
            >
              {cartItems.map((item) => {
                const unitPrice = item.finalPrice ?? item.price ?? 0;
                const qty = item.quantity || 1;
                const lineTotal = unitPrice * qty;

                return (
                  <div
                    key={item._id}
                    className="d-flex justify-content-between align-items-center py-2 border-bottom border-opacity-10"
                    style={{ borderColor: "var(--lux-border)" }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      {(item.image || item.images?.[0]) && (
                        <img
                          src={item.image || item.images?.[0]}
                          alt={item.name}
                          style={{
                            width: 44,
                            height: 44,
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "1px solid var(--lux-border)",
                          }}
                        />
                      )}
                      <div>
                        <div className="small fw-semibold">{item.name}</div>
                        <div className="small text-muted">Qty: {qty}</div>
                      </div>
                    </div>
                    <div className="small fw-bold">
                      ₹{lineTotal.toLocaleString("en-IN")}
                    </div>
                  </div>
                );
              })}
            </div>

            <h6 className="fw-semibold mb-2 small text-uppercase text-muted">
              Pricing
            </h6>

            <div className="d-flex justify-content-between mb-2 small text-muted">
              <span>Items total</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>

            <div className="d-flex justify-content-between mb-2 small text-muted">
              <span>Delivery</span>
              <span className={deliveryFee === 0 ? "text-success fw-semibold" : ""}>
                {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
              </span>
            </div>

            <div className="d-flex justify-content-between mb-2 small text-muted">
              <span>Platform fee</span>
              <span className={platformFee === 0 ? "text-success fw-semibold" : ""}>
                {platformFee === 0 ? "Free" : `₹${platformFee}`}
              </span>
            </div>

            {subtotal > 0 && subtotal <= 1000 && (
              <div className="small text-muted mb-2">
                Add ₹{1000 - subtotal} more for{" "}
                <span className="text-success fw-semibold">
                  free delivery &amp; platform fee
                </span>
                .
              </div>
            )}

            <hr className="my-2" />

            <div className="d-flex justify-content-between fw-bold fs-5 mb-0" style={{ color: "var(--lux-ink)" }}>
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
