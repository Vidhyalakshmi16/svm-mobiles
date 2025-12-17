// src/pages/OrderSuccess.js
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // We expect Checkout to send: navigate("/order-success", { state: { order } })
  const order = location.state?.order;

  // 🎉 Confetti animation (only if we actually have an order)
  useEffect(() => {
    if (!order) return;

    const duration = 2 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, [order]);

  // If user refreshes or lands here without order data
  if (!order) {
    return (
      <div className="container mt-5 pt-5 text-center">
        <h2 className="fw-bold mb-3">Order Placed</h2>
        <p className="text-muted mb-4">
          Your order is recorded, but we couldn’t load full details.
        </p>
        <button
          className="btn btn-dark me-2"
          onClick={() => navigate("/products")}
        >
          Continue Shopping
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/")}
        >
          Go to Home
        </button>
      </div>
    );
  }

  // Safe to destructure now
  const { customer, paymentMethod, total, items } = order;
  const { name, address, city, pincode, phone } = customer || {};

  return (
    <div className="container mt-5 pt-5 text-center">
      {/* ✅ Success Icon */}
      <div className="my-4">
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success shadow"
          style={{ width: "90px", height: "90px" }}
        >
          <i className="bi bi-check-lg text-white fs-1"></i>
        </div>
      </div>

      <h2 className="fw-bold text-success mb-2">Order Placed Successfully!</h2>
      <p className="text-muted mb-4 fs-5">
        Thank you, {name}! Your order will be delivered soon 🚚
      </p>

      {/* 🧾 Order Summary */}
      <div
        className="card mx-auto shadow-sm border-0 text-start p-4 mb-4 rounded-4"
        style={{ maxWidth: "650px" }}
      >
        <h5 className="fw-semibold mb-3">Order Details</h5>

        <p>
          <strong>Name:</strong> {name}
        </p>
        <p>
          <strong>Address:</strong> {address}, {city} - {pincode}
        </p>
        <p>
          <strong>Phone:</strong> {phone}
        </p>
        <p>
          <strong>Payment Method:</strong> {paymentMethod}
        </p>
        <p className="fw-bold text-success fs-5">
          Total: ₹{total?.toLocaleString("en-IN")}
        </p>

        {/* 🛍️ Ordered Products Summary */}
        <div className="mt-4">
          <h6 className="fw-semibold mb-3">Ordered Items</h6>
          {items && items.length > 0 ? (
            <ul className="list-group border-0">
              {items.map((item, index) => {
                const unit = item.finalPrice ?? item.price ?? 0;
                const qty = item.quantity ?? 0;
                const linePrice = unit * qty;

                return (
                  <li
                    key={item._id || index}
                    className="list-group-item d-flex justify-content-between align-items-center border-0 ps-0 py-2"
                    style={{ background: "transparent" }}
                  >
                    <div className="d-flex align-items-center">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="me-3 rounded"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <div>
                        <p className="mb-0 fw-medium">{item.name}</p>
                        <small className="text-muted">
                          Qty: {qty} × ₹{unit.toLocaleString("en-IN")}
                        </small>
                      </div>
                    </div>
                    <span className="fw-semibold text-dark">
                      ₹{linePrice.toLocaleString("en-IN")}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No items found.</p>
          )}
        </div>
      </div>

      {/* 🔘 Buttons */}
      <div className="d-flex justify-content-center gap-3">
        <button
          className="btn btn-outline-dark px-4"
          onClick={() => navigate("/products")}
        >
          Continue Shopping
        </button>
        <button className="btn btn-dark px-4" onClick={() => navigate("/")}>
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
