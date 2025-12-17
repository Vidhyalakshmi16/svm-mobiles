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

  // ---------- Calculate totals ----------
  // Subtotal based on selling price (finalPrice if present, else price)
  const subtotal = cartItems.reduce((sum, item) => {
    const unitPrice = item.finalPrice ?? item.price ?? 0;
    const qty = item.quantity || 1;
    return sum + unitPrice * qty;
  }, 0);

  // Platform fee: ₹5 when there are items
  const platformFee = subtotal > 1000 ? 0 : 5;

  // Delivery fee: ₹29 if subtotal <= 1000, else free
  const deliveryFee =
    subtotal === 0 ? 0 : subtotal > 1000 ? 0 : 29;

  const grandTotal = subtotal + platformFee + deliveryFee;

  // ---------- Empty state ----------
  if (isEmpty) {
    return (
      <div
        className="container"
        style={{ paddingTop: "90px", paddingBottom: "40px" }}
      >
        <div className="empty-cart-card text-center">
          <h4 className="fw-bold mb-2">Your Cart</h4>
          <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
            Your cart is empty. Start adding your favourite mobiles!
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

  // ---------- Non-empty cart ----------
  return (
    <div
      className="container"
      style={{ paddingTop: "90px", paddingBottom: "40px" }}
    >
      <h3 className="fw-bold mb-4">Your Cart</h3>

      <div className="row g-3">
        {/* LEFT: items */}
        <div className="col-lg-8">
          <div className="cart-card">
            {cartItems.map((item) => {
              const unitPrice = item.finalPrice ?? item.price ?? 0;
              const qty = item.quantity || 1;
              const lineTotal = unitPrice * qty;

              return (
                <div key={item._id} className="cart-item-row">
                  {/* Image */}
                  <div className="cart-item-img-wrap">
                    <img
                      src={item.image || item.images?.[0]}
                      alt={item.name}
                      className="cart-item-img"
                    />
                  </div>

                  {/* Info + controls */}
                  <div className="flex-grow-1 ms-3">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div>
                        {item.brand && (
                          <div className="cart-item-brand">
                            {item.brand}
                          </div>
                        )}
                        <div className="cart-item-name">{item.name}</div>
                      </div>

                      <div className="text-end">
                        <div className="fw-semibold">
                          ₹{lineTotal.toLocaleString("en-IN")}
                        </div>
                        {item.stock !== undefined && (
                          <div className="cart-item-stock">
                            In stock: {item.stock}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="small text-muted mb-2">
                      ₹{unitPrice.toLocaleString("en-IN")} / item
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      {/* Qty pill */}
                      <div className="qty-control">
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

                      {/* Remove */}
                      <button
                        type="button"
                        className="cart-remove-link"
                        onClick={() => removeFromCart(item._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="text-end mt-2">
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: summary */}
        <div className="col-lg-4">
          <div className="summary-card">
          <h6 className="fw-semibold mb-3">Price Details</h6>

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

          {/* Free delivery message */}
          {subtotal > 0 && subtotal <= 1000 && (
            <div className="small text-muted mb-2">
              Add ₹{1000 - subtotal} more for <span className="text-success fw-semibold">
                FREE delivery & FREE platform fee
              </span>.
            </div>
          )}

          <hr className="my-2" />

          <div className="d-flex justify-content-between fw-semibold mb-3">
            <span>Total Amount</span>
            <span>₹{grandTotal.toLocaleString("en-IN")}</span>
          </div>
          <button
            className="btn btn-dark w-100"
            onClick={() => {
              if (!user) {
                navigate("/auth", { state: { from: "/checkout" } });
                return;
              }
              navigate("/checkout");
            }}
          >
            Proceed to Checkout
          </button>
          </div>
        </div>
      </div>

      {/* Styles for cart UI */}
      <style>{`
        .cart-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 16px;
          border: 1px solid #e5e7eb;
        }

        .cart-item-row {
          display: flex;
          align-items: flex-start;
          padding: 12px 4px;
          border-bottom: 1px solid #f3f4f6;
        }
        .cart-item-row:last-child {
          border-bottom: none;
        }

        .cart-item-img-wrap {
          width: 72px;
          height: 72px;
          border-radius: 12px;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }

        .cart-item-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          display: block;
        }

        .cart-item-brand {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #6b7280;
        }

        .cart-item-name {
          font-size: 0.95rem;
          font-weight: 500;
          color: #111827;
        }

        .cart-item-stock {
          font-size: 0.75rem;
          color: #16a34a;
        }

        .qty-control {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          border: 1px solid #d1d5db;
          overflow: hidden;
        }

        .qty-control button {
          background: #f9fafb;
          border: none;
          width: 32px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
        }

        .qty-control button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .qty-control span {
          padding: 0 14px;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .cart-remove-link {
          border: none;
          background: none;
          padding: 0;
          font-size: 0.85rem;
          color: #dc2626;
          text-decoration: underline;
          cursor: pointer;
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
