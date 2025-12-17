// src/pages/WishlistPage.js
import React from "react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const WishlistPage = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product._id);
  };

  if (wishlist.length === 0) {
    return (
      <div
        className="container"
        style={{ paddingTop: "90px", paddingBottom: "40px" }}
      >
        <div className="text-center">
          <h3 className="fw-bold mb-2">My Wishlist</h3>
          <p className="text-muted mb-3">
            Your wishlist is empty. Start adding your favourite mobiles!
          </p>
          <button
            className="btn btn-dark"
            onClick={() => navigate("/products")}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ paddingTop: "90px", paddingBottom: "40px" }}
    >
      <h3 className="fw-bold mb-3">My Wishlist</h3>
      <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
        Saved items: <strong>{wishlist.length}</strong>
      </p>

      <div className="row g-3">
        {wishlist.map((product) => {
          const finalPrice = product.finalPrice ?? product.price;
          const originalPrice = product.price;
          const hasDiscount =
            product.discount > 0 && originalPrice > finalPrice;

          return (
   <div
  key={product._id}
  className="col-12 col-sm-6 col-lg-4 col-xl-3"
>
  <div
    className="w-card shadow-sm"
    onClick={() => navigate(`/product/${product._id}`)}
  >
    {/* Remove button */}
    <button
      className="w-remove-btn"
      onClick={(e) => {
        e.stopPropagation(); // prevent card click
        removeFromWishlist(product._id);
      }}
    >
      ✕
    </button>

    {/* Image */}
    <div className="w-img-wrap">
      <img
        src={product.images?.[0] || product.image}
        alt={product.name}
        className="w-img"
      />
    </div>

    {/* Info */}
    <div className="w-info">
      <div className="w-brand">{product.brand || "Brand"}</div>

      <div className="w-name" title={product.name}>
        {product.name}
      </div>

      <div className="w-price-row">
        <span className="w-price">₹{product.finalPrice ?? product.price}</span>

        {product.discount > 0 && (
          <>
            <span className="w-mrp">₹{product.price}</span>
            <span className="w-discount">{product.discount}% OFF</span>
          </>
        )}
      </div>

      {product.stock === 0 && (
        <div className="w-outstock">Out of Stock</div>
      )}

      <button
        className="btn btn-primary w-100 btn-sm mt-2"
        onClick={(e) => {
          e.stopPropagation(); // prevent navigation when clicking button
          handleMoveToCart(product);
        }}
        disabled={product.stock === 0}
      >
        {product.stock === 0 ? "Out of Stock" : "Move to Cart"}
      </button>
    </div>
  </div>
</div>


          );
        })}
      </div>

      {/* Page styles */}
      <style>{`
        .w-card {
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        position: relative;
        border: 1px solid #e5e7eb;
        display: flex;
        flex-direction: column;
        cursor: pointer;
        transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .w-info {
        padding: 10px 12px;
        flex-grow: 1; /* remove empty space */
        display: flex;
        flex-direction: column;
        }

        .btn-sm {
        margin-top: auto; /* pushes button to bottom cleanly */
        }

        .w-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.10);
        }

        .w-remove-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 2;
          border: none;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 999px;
          width: 24px;
          height: 24px;
          font-size: 14px;
          line-height: 1;
          display: flex;
          align-items: center;
          justifyContent: center;
          cursor: pointer;
          color: #6b7280;
        }
        .w-remove-btn:hover {
          background: #fee2e2;
          color: #b91c1c;
        }

        .w-img-wrap {
          width: 100%;
          height: 190px;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .w-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          display: block;
        }

        .w-brand {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6b7280;
          margin-bottom: 2px;
        }
        .w-name {
          font-size: 13px;
          font-weight: 500;
          color: #111827;
          margin-bottom: 6px;
          min-height: 32px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .w-price-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 3px;
        }
        .w-price {
          font-size: 14px;
          font-weight: 700;
          color: #111827;
        }
        .w-mrp {
          font-size: 12px;
          color: #9ca3af;
          text-decoration: line-through;
        }
        .w-discount {
          font-size: 11px;
          color: #16a34a;
          font-weight: 600;
        }

        .w-outstock {
          font-size: 11px;
          font-weight: 600;
          color: #b91c1c;
          margin-top: 2px;
        }

        @media (max-width: 575px) {
          .w-img-wrap {
            height: 170px;
          }
        }
      `}</style>
    </div>
  );
};

export default WishlistPage;
