// src/pages/WishlistPage.js
import React from "react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "./WishlistPage.css";

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
      <div className="container wishlist-page wishlist-page__empty">
        <div className="text-center py-5">
          <p className="lux-eyebrow">Saved</p>
          <h1 className="wishlist-page__title">My wishlist</h1>
          <p className="store-lead mb-4">
            Your wishlist is empty. Save items you love and shop when you are ready.
          </p>
          <button
            type="button"
            className="store-btn-primary"
            onClick={() => navigate("/products")}
          >
            Browse products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container wishlist-page">
      <p className="lux-eyebrow mb-1">Saved</p>
      <h1 className="wishlist-page__title">My wishlist</h1>
      <p className="wishlist-page__meta">
        Saved items: <strong>{wishlist.length}</strong>
      </p>

      <div className="row g-3 g-md-4">
        {wishlist.map((product) => (
          <div
            key={product._id}
            className="col-12 col-sm-6 col-lg-4 col-xl-3"
          >
            <div
              role="link"
              tabIndex={0}
              className="store-product-card"
              onClick={() => navigate(`/product/${product._id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/product/${product._id}`);
                }
              }}
            >
              <button
                type="button"
                className="store-product-card__remove"
                aria-label="Remove from wishlist"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromWishlist(product._id);
                }}
              >
                ✕
              </button>

              <div className="store-product-card__media">
                <img
                  src={product.images?.[0] || product.image}
                  alt={product.name}
                  className="store-product-card__img"
                />
              </div>

              <div className="store-product-card__body">
                <div className="store-product-card__brand">
                  {product.brand || "Brand"}
                </div>

                <div className="store-product-card__name" title={product.name}>
                  {product.name}
                </div>

                <div className="store-product-card__prices">
                  <span className="store-product-card__price">
                    ₹
                    {Number(product.finalPrice ?? product.price).toLocaleString(
                      "en-IN"
                    )}
                  </span>

                  {product.discount > 0 && (
                    <>
                      <span className="store-product-card__mrp">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </span>
                      <span className="store-product-card__discount">
                        {product.discount}% OFF
                      </span>
                    </>
                  )}
                </div>

                {product.stock === 0 && (
                  <div className="store-product-card__stock">Out of stock</div>
                )}

                <button
                  type="button"
                  className="store-btn-primary store-product-card__cta w-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveToCart(product);
                  }}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? "Out of stock" : "Move to cart"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
