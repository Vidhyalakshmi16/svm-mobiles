// src/pages/OrderSuccess.js
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;

  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate("/orders", { replace: true });
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error("Failed to load order", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

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
        colors: ["#c9a227", "#e8d48b", "#fff8e7", "#7d5f0c"],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#c9a227", "#e8d48b", "#fff8e7", "#7d5f0c"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, [order]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <p className="lux-eyebrow">Order</p>
        <p className="text-muted">Loading your confirmation…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5 text-center">
        <div className="lux-empty-card">
          <h1 className="lux-heading-lg mb-2">Thank you</h1>
          <p className="text-muted mb-4">
            Your order is recorded, but we couldn&apos;t load full details.
          </p>
          <div className="d-flex justify-content-center gap-2 flex-wrap">
            <button
              type="button"
              className="store-btn-primary px-4"
              onClick={() => navigate("/products")}
            >
              Continue shopping
            </button>
            <button
              type="button"
              className="store-btn-ghost px-4"
              onClick={() => navigate("/")}
            >
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { customer, paymentMethod, total, items } = order;
  const { name, address, city, pincode, phone } = customer || {};

  return (
    <div className="container py-4 text-center">
      <div className="my-4 d-flex justify-content-center">
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle"
          style={{
            width: 96,
            height: 96,
            background: "var(--lux-gradient-gold)",
            border: "2px solid rgba(122,94,28,0.35)",
            boxShadow: "0 12px 40px rgba(201,162,39,0.35)",
          }}
        >
          <i className="bi bi-check-lg text-dark fs-1 fw-bold" />
        </div>
      </div>

      <p className="lux-eyebrow">Confirmed</p>
      <h1 className="lux-heading-xl mb-2" style={{ color: "#166534" }}>
        Order placed successfully
      </h1>
      <p className="lux-lead mx-auto mb-4">
        Thank you, {name}. Your order will be processed right away.
      </p>

      <div className="store-panel mx-auto text-start p-4 p-md-5 mb-4" style={{ maxWidth: 640 }}>
        <h2 className="lux-heading-lg fs-4 mb-3">Order details</h2>

        <p className="mb-2">
          <strong>Name:</strong> {name}
        </p>
        <p className="mb-2">
          <strong>Address:</strong> {address}, {city} - {pincode}
        </p>
        <p className="mb-2">
          <strong>Phone:</strong> {phone}
        </p>
        <p className="mb-2">
          <strong>Payment:</strong> {paymentMethod}
        </p>
        <p className="fw-bold fs-5 mb-0" style={{ color: "var(--lux-ink)" }}>
          Total: ₹{total?.toLocaleString("en-IN")}
        </p>

        <div className="lux-divider" />

        <h3 className="lux-heading-lg fs-5 mb-3">Items</h3>
        {items && items.length > 0 ? (
          <ul className="list-unstyled mb-0">
            {items.map((item, index) => {
              const unit = item.finalPrice ?? item.price ?? 0;
              const qty = item.quantity ?? 0;
              const linePrice = unit * qty;

              return (
                <li
                  key={item._id || index}
                  className="d-flex justify-content-between align-items-center py-3 border-bottom"
                  style={{ borderColor: "var(--lux-border)" }}
                >
                  <div className="d-flex align-items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="rounded-3"
                        style={{
                          width: 52,
                          height: 52,
                          objectFit: "cover",
                          border: "1px solid var(--lux-border)",
                        }}
                      />
                    )}
                    <div>
                      <p className="mb-0 fw-semibold">{item.name}</p>
                      <small className="text-muted">
                        Qty {qty} × ₹{unit.toLocaleString("en-IN")}
                      </small>
                    </div>
                  </div>
                  <span className="fw-bold">
                    ₹{linePrice.toLocaleString("en-IN")}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted mb-0">No line items.</p>
        )}
      </div>

      <div className="d-flex justify-content-center gap-3 flex-wrap">
        <button
          type="button"
          className="store-btn-ghost px-4"
          onClick={() => navigate("/products")}
        >
          Continue shopping
        </button>
        <button
          type="button"
          className="store-btn-primary px-4"
          onClick={() => navigate("/")}
        >
          Back home
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
