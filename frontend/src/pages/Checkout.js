// src/pages/Checkout.js
import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createOrderApi } from "../services/api";
import { useAuth } from "../context/AuthContext";


export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const {
    cartItems = [],
    clearCart,
  } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [placing, setPlacing] = useState(false);

    /* 🔒 BLOCK CHECKOUT FOR NON-LOGGED USER */
  if (!user) {
    return (
      <Navigate
        to="/auth"
        state={{ from: location.pathname }}
        replace
      />
    );
  }
  const isEmpty = cartItems.length === 0;

  // ---------- SAME PRICING LOGIC AS CART ----------
  const subtotal = cartItems.reduce((sum, item) => {
    const unitPrice = item.finalPrice ?? item.price ?? 0;
    const qty = item.quantity || 1;
    return sum + unitPrice * qty;
  }, 0);

  const platformFee = subtotal > 1000 ? 0 : 5;
  const deliveryFee =
    subtotal === 0 ? 0 : subtotal > 1000 ? 0 : 29;

  const grandTotal = subtotal + platformFee + deliveryFee;

  // ---------- HANDLERS ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

const handlePlaceOrder = async (e) => {
  e.preventDefault();
  if (isEmpty) return;

  const { name, phone, address, city, pincode } = form;

  if (!name || !phone || !address || !city || !pincode) {
    alert("Please fill all required fields");
    return;
  }

  setPlacing(true);

  // 🔐 Razorpay key safety check
  if (!import.meta.env.VITE_RAZORPAY_KEY) {
    alert("Payment configuration error. Please try again later.");
    setPlacing(false);
    return;
  }

  try {
    const customer = {
      name,
      phone,
      address,
      city,
      pincode,
      email: user.email,
    };

    // 1️⃣ Create order (Pending Payment)
    const orderPayload = {
      customer,
      paymentMethod: "UPI",
      subtotal,
      deliveryFee,
      platformFee,
      total: grandTotal,
      items: cartItems,
    };

    const order = await createOrderApi(orderPayload);

    // 2️⃣ Create Razorpay order (backend)
    const razorpayOrder = await fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: grandTotal,
        orderId: order._id,
      }),
    }).then((res) => res.json());

    // 3️⃣ Open Razorpay Checkout
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: razorpayOrder.amount,
      currency: "INR",
      name: "Sri Vaari Mobiles",
      description: "Order Payment",
      order_id: razorpayOrder.razorpayOrderId,
      handler: async (response) => {
        // 4️⃣ Verify payment
        await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...response,
            orderId: order._id,
          }),
        });

        clearCart();
        navigate("/order-success", { state: { order } });
      },
      theme: { color: "#111827" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error(err);
    alert("Payment failed. Please try again.");
  } finally {
    setPlacing(false);
  }
};



  // ---------- EMPTY STATE ----------
  if (isEmpty) {
    return (
      <div
        className="container"
        style={{ paddingTop: "90px", paddingBottom: "40px" }}
      >
        <div className="empty-cart-card text-center">
          <h4 className="fw-bold mb-2">Checkout</h4>
          <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
            Your cart is empty. Add items before proceeding to checkout.
          </p>
          <Link to="/products" className="btn btn-dark btn-sm px-4">
            Browse Products
          </Link>
        </div>

        <style>{`
          .empty-cart-card {
            background: #ffffff;
            border-radius: 16px;
            padding: 28px 24px;
            border: 1px solid #e5e7eb;
          }
        `}</style>
      </div>
    );
  }

  // ---------- MAIN UI ----------
  return (
    <div
      className="container"
      style={{ paddingTop: "90px", paddingBottom: "40px" }}
    >
      <h3 className="fw-bold mb-4">Checkout</h3>

      <div className="row g-3">
        {/* LEFT: Delivery form */}
        <div className="col-lg-8">
          <div className="cart-card">
            <h6 className="fw-semibold mb-3">Delivery Details</h6>

            <form onSubmit={handlePlaceOrder}>
              <div className="mb-3">
                <label className="form-label">Full Name *</label>
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
                <label className="form-label">Mobile Number *</label>
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
                  <label className="form-label">Payment Method</label>
                  <div className="alert alert-success small">
                    UPI Payment (Google Pay / PhonePe / Paytm)
                  </div>
                  <div className="small text-muted mt-1">
                    Secure UPI payment. Supports Google Pay, PhonePe & Paytm.
                  </div>
                </div>

              <button
                type="submit"
                className="btn btn-dark w-100 mt-2"
                disabled={placing}
              >
                {placing ? "Placing Order..." : "Place Order"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Order summary – SAME STYLE AS CART SUMMARY */}
        <div className="col-lg-4">
          <div className="summary-card">
            <h6 className="fw-semibold mb-3">Order Summary</h6>

            {/* Items list (optional small view) */}
<div className="mb-3" style={{ maxHeight: 200, overflowY: "auto" }}>
  {cartItems.map((item) => {
    const unitPrice = item.finalPrice ?? item.price ?? 0;
    const qty = item.quantity || 1;
    const lineTotal = unitPrice * qty;

    return (
      <div
        key={item._id}
        className="d-flex justify-content-between align-items-center mb-3"
      >
        {/* LEFT SIDE */}
        <div className="d-flex align-items-center gap-2">
          {(item.image || item.images?.[0]) && (
            <img
              src={item.image || item.images?.[0]}
              alt={item.name}
              style={{
                width: 40,
                height: 40,
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
          )}
          <div>
            <div className="small fw-semibold">{item.name}</div>
            <div className="small text-muted">Qty: {qty}</div>
          </div>
        </div>

        {/* RIGHT SIDE PRICE (THIS IS WHAT YOU WANT) */}
        <div className="small fw-semibold">
          ₹{lineTotal.toLocaleString("en-IN")}
        </div>
      </div>
    );
  })}
</div>

            <h6 className="fw-semibold mb-2">Price Details</h6>

            <div className="d-flex justify-content-between mb-2 small text-muted">
              <span>Items total</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>

            <div className="d-flex justify-content-between mb-2 small text-muted">
              <span>Delivery charges</span>
              <span className={deliveryFee === 0 ? "text-success" : ""}>
                {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
              </span>
            </div>

            <div className="d-flex justify-content-between mb-2 small text-muted">
              <span>Platform fee</span>
              <span className={platformFee === 0 ? "text-success" : ""}>
                {platformFee === 0 ? "Free" : `₹${platformFee}`}
              </span>
            </div>

            {subtotal > 0 && subtotal <= 1000 && (
              <div className="small text-muted mb-2">
                Add ₹{1000 - subtotal} more for{" "}
                <span className="text-success fw-semibold">
                  FREE delivery & FREE platform fee
                </span>
                .
              </div>
            )}

            <hr className="my-2" />

            <div className="d-flex justify-content-between fw-semibold mb-1">
              <span>Total Amount</span>
              <span>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reuse same styles from Cart for card + summary */}
      <style>{`
        .cart-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 16px;
          border: 1px solid #e5e7eb;
        }

        .summary-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 16px 18px;
          border: 1px solid #e5e7eb;
          position: sticky;
          top: 90px;
        }

        @media (max-width: 767px) {
          .summary-card {
            position: static;
            margin-top: 8px;
          }
          .cart-card {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
}
