// src/pages/Cart.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

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
  const deliveryFee =
    subtotal === 0 ? 0 : subtotal > 1000 ? 0 : 29;

  const grandTotal = subtotal + platformFee + deliveryFee;

  if (isEmpty) {
    return (
      <div className="container py-4">
        <div className="lux-empty-card text-center">
          <p className="lux-eyebrow text-center">Shopping bag</p>
          <h1 className="lux-heading-lg mb-2">Your cart is empty</h1>
          <p className="text-muted mb-4 small">
            Discover the latest smartphones and accessories curated for you.
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
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
        <div>
          <p className="lux-eyebrow mb-1">Checkout</p>
          <h1 className="store-page-title mb-0">Your cart</h1>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="lux-cart-card">
            {cartItems.map((item) => {
              const unitPrice = item.finalPrice ?? item.price ?? 0;
              const qty = item.quantity || 1;
              const lineTotal = unitPrice * qty;

              return (
                <div key={item._id} className="lux-cart-item">
                  <div className="lux-cart-item__img">
                    <img
                      src={item.image || item.images?.[0]}
                      alt={item.name}
                    />
                  </div>

                  <div className="flex-grow-1 ms-3">
                    <div className="d-flex justify-content-between align-items-start mb-1 gap-2">
                      <div>
                        {item.brand && (
                          <div className="lux-cart-item__brand">{item.brand}</div>
                        )}
                        <div className="lux-cart-item__name">{item.name}</div>
                      </div>

                      <div className="text-end flex-shrink-0">
                        <div className="fw-bold" style={{ color: "var(--lux-ink)" }}>
                          ₹{lineTotal.toLocaleString("en-IN")}
                        </div>
                        {item.stock !== undefined && (
                          <div className="small text-success fw-semibold">
                            In stock: {item.stock}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="lux-cart-item__unit mb-2">
                      ₹{unitPrice.toLocaleString("en-IN")} / unit
                    </div>

                    <div className="d-flex align-items-center gap-3 flex-wrap">
                      <div className="lux-qty">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item._id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item._id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="lux-remove-link"
                        onClick={() => removeFromCart(item._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="text-end pt-2">
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none p-0 fw-semibold"
                style={{ color: "#b45309" }}
                onClick={clearCart}
              >
                Clear cart
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="lux-summary-card">
            <h6 className="lux-summary-title">Price details</h6>

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

            <hr className="my-3" />

            <div className="d-flex justify-content-between fw-bold mb-3 fs-5" style={{ color: "var(--lux-ink)" }}>
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>

            <button
              type="button"
              className="store-btn-primary w-100"
              onClick={() => {
                if (!user) {
                  navigate("/auth", { state: { from: "/checkout" } });
                  return;
                }
                navigate("/checkout");
              }}
            >
              Proceed to checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
