import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductById } from "../services/api";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { FiHeart, FiCheck } from "react-icons/fi";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const { user } = useAuth();

  useEffect(() => {
    const fetchProd = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
        setActiveImage(0);
      } finally {
        setLoading(false);
      }
    };
    fetchProd();
  }, [id]);

  if (loading) {
    return (
      <div className="mv-pd-loader">
        <div className="mv-skeleton-main" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mv-pd-error">
        <h4>Product not found</h4>
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/products")}
          className="mv-btn-primary"
        >
          Back to Products
        </motion.button>
      </div>
    );
  }

  const {
    name,
    brand,
    price,
    finalPrice,
    discount,
    description,
    images = [],
    stock,
  } = product;

  const sellingPrice = finalPrice ?? price;
  const inStock = stock === undefined ? true : stock > 0;
  const maxQty = stock === undefined ? Infinity : stock;

  const handleAddToCart = () => {
    if (!inStock) return toast.warn("Out of stock");
    addToCart(product, qty);
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    if (!inStock) {
      toast.warn("Out of stock");
      return;
    }

    if (!user) {
      toast.info("Please login to continue");
      navigate("/auth", {
        state: { from: `/product/${id}` },
      });
      return;
    }

    addToCart(product, qty);
    navigate("/checkout");
  };

  return (
    <div className="mv-pd-wrapper">
      {/* PAGE WRAPPER */}
      <div className="mv-pd-container">
        {/* LEFT: IMAGE GALLERY (STICKY) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mv-pd-gallery"
        >
          <div className="mv-pd-gallery-main">
            <motion.img
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={images[activeImage] || "/placeholder.png"}
              alt={name}
              className="mv-pd-main-image"
            />

            {/* Wishlist Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="mv-pd-wishlist-btn"
              onClick={() => toggleWishlist(product)}
              title={isInWishlist(product._id) ? "Remove from favorites" : "Add to favorites"}
            >
              <FiHeart
                size={20}
                fill={isInWishlist(product._id) ? "currentColor" : "none"}
                color={isInWishlist(product._id) ? "#ec4899" : "currentColor"}
              />
            </motion.button>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="mv-pd-thumbnails">
              {images.map((img, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveImage(i)}
                  className={`mv-pd-thumb ${i === activeImage ? "is-active" : ""}`}
                >
                  <img src={img} alt={`${name} ${i + 1}`} />
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* RIGHT: PRODUCT INFO */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mv-pd-info"
        >
          {/* Brand & Name */}
          {brand && <p className="mv-pd-brand">{brand}</p>}
          <h1 className="mv-pd-name">{name}</h1>

          {/* Rating (placeholder) */}
          <div className="mv-pd-rating">
            <span className="mv-stars">★★★★★</span>
            <span className="mv-reviews">(128 reviews)</span>
          </div>

          {/* Price Block */}
          <div className="mv-pd-prices">
            <span className="mv-pd-price">
              ₹{sellingPrice.toLocaleString("en-IN")}
            </span>
            {discount > 0 && (
              <>
                <span className="mv-pd-mrp">
                  ₹{price.toLocaleString("en-IN")}
                </span>
                <span className="mv-pd-discount">{discount}% OFF</span>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div className="mv-pd-stock">
            {inStock ? (
              <><FiCheck size={16} /> In Stock</>
            ) : (
              <>Out of Stock</>
            )}
          </div>

          {/* Variant Pills (placeholder for colors/storage) */}
          <div className="mv-pd-variants">
            <p className="mv-pd-variant-label">Color</p>
            <div className="mv-pd-variant-pills">
              <button className="mv-pd-pill is-active">Space Black</button>
              <button className="mv-pd-pill">Silver</button>
              <button className="mv-pd-pill">Gold</button>
            </div>
          </div>

          {/* Quantity Stepper */}
          <div className="mv-pd-qty-section">
            <p className="mv-pd-qty-label">Quantity</p>
            <div className="mv-qty-stepper">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                disabled={qty <= 1}
                className="mv-qty-btn"
              >
                −
              </button>
              <span className="mv-qty-value">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(Math.min(maxQty, qty + 1))}
                disabled={qty >= maxQty}
                className="mv-qty-btn"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mv-pd-actions">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              className="mv-btn-primary mv-pd-btn-add"
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              Add to Cart →
            </motion.button>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              className="mv-btn-ghost mv-pd-btn-buy"
              onClick={handleBuyNow}
              disabled={!inStock}
            >
              Buy Now
            </motion.button>
          </div>

          {/* Trust Signals */}
          <div className="mv-pd-trust">
            <div className="mv-trust-item">
              <span className="mv-trust-icon">🚚</span>
              <div>
                <p className="mv-trust-title">Fast Delivery</p>
                <p className="mv-trust-desc">Within 2-3 days</p>
              </div>
            </div>
            <div className="mv-trust-item">
              <span className="mv-trust-icon">🔒</span>
              <div>
                <p className="mv-trust-title">Secure Payment</p>
                <p className="mv-trust-desc">SSL Encrypted</p>
              </div>
            </div>
            <div className="mv-trust-item">
              <span className="mv-trust-icon">↩️</span>
              <div>
                <p className="mv-trust-title">Easy Returns</p>
                <p className="mv-trust-desc">30-day guarantee</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* TABS SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mv-pd-tabs-section"
      >
        <div className="mv-pd-tabs">
          {["description", "specifications", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`mv-pd-tab ${activeTab === tab ? "is-active" : ""}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="mv-pd-tab-content">
          {activeTab === "description" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mv-pd-tab-pane"
            >
              <h3>Product Description</h3>
              <p>{description || "No description available."}</p>
              <ul className="mv-pd-highlights">
                <li>Premium build quality</li>
                <li>Latest processor</li>
                <li>Outstanding camera system</li>
                <li>All-day battery life</li>
              </ul>
            </motion.div>
          )}

          {activeTab === "specifications" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mv-pd-tab-pane"
            >
              <h3>Specifications</h3>
              <table className="mv-specs-table">
                <tbody>
                  <tr>
                    <td>Display</td>
                    <td>6.1" Retina XDR</td>
                  </tr>
                  <tr>
                    <td>Processor</td>
                    <td>Latest Gen Chip</td>
                  </tr>
                  <tr>
                    <td>RAM</td>
                    <td>8GB</td>
                  </tr>
                  <tr>
                    <td>Storage</td>
                    <td>256GB</td>
                  </tr>
                  <tr>
                    <td>Camera</td>
                    <td>Dual 48MP</td>
                  </tr>
                  <tr>
                    <td>Battery</td>
                    <td>4000 mAh</td>
                  </tr>
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mv-pd-tab-pane"
            >
              <h3>Customer Reviews</h3>
              <p className="mv-reviews-notice">Reviews will appear here after customer purchases.</p>
              <div className="mv-review-item">
                <p className="mv-review-author">John D.</p>
                <p className="mv-review-rating">★★★★★</p>
                <p className="mv-review-text">Excellent phone! Great quality and fast delivery.</p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
