import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, addProductReview } from "../services/api";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { FiHeart, FiCheck } from "react-icons/fi";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import "./ProductDetail.css";
const normalizeProductData = (data) => {
  if (!data) return null;

  const normalized = { ...data };

  // Colors may come back as a JSON string or as a non-array object
  if (typeof normalized.colors === "string") {
    try {
      normalized.colors = JSON.parse(normalized.colors);
    } catch {
      normalized.colors = [];
    }
  }

  if (normalized.colors && !Array.isArray(normalized.colors)) {
    normalized.colors = Object.values(normalized.colors || {});
  }

  normalized.colors = Array.isArray(normalized.colors)
    ? normalized.colors
        .map((c) => String(c || "").trim())
        .filter(Boolean)
    : [];

  // Specifications may come back as a JSON string or as a Map
  if (typeof normalized.specifications === "string") {
    try {
      normalized.specifications = JSON.parse(normalized.specifications);
    } catch {
      normalized.specifications = {};
    }
  }

  if (normalized.specifications instanceof Map) {
    normalized.specifications = Object.fromEntries(normalized.specifications);
  }

  if (
    typeof normalized.specifications !== "object" ||
    normalized.specifications === null
  ) {
    normalized.specifications = {};
  }

  normalized.specifications = Object.fromEntries(
    Object.entries(normalized.specifications).filter(([key, value]) => {
      return String(key || "").trim() && String(value ?? "").trim();
    })
  );

  if (!Array.isArray(normalized.reviews)) {
    normalized.reviews = [];
  }

  return normalized;
};
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
  const [selectedColor, setSelectedColor] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProd = async () => {
      try {
        setLoading(true);
        const data = normalizeProductData(await getProductById(id));
        setProduct(data);
        setActiveImage(0);

        if (data?.colors?.length > 0) {
          setSelectedColor(data.colors[0]);
        }
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
    colors = [],
    specifications = {},
    reviews = [],
  } = product;
  const specificationEntries = Object.entries(specifications || {});

  // Calculate average rating
  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return 5; // Default 5 stars
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const averageRating = calculateAverageRating();

  const handleAddReview = async () => {
    if (!user) {
      toast.info("Please login to add a review");
      return;
    }

    if (!reviewText.trim()) {
      toast.warn("Please enter a review");
      return;
    }

    try {
      setSubmittingReview(true);
      const response = await addProductReview(id, {
        rating: reviewRating,
        text: reviewText,
      });

      toast.success("Review submitted successfully!");
      setReviewText("");
      setReviewRating(5);

      const updatedProduct = normalizeProductData(response.product || response);
      if (updatedProduct) {
        setProduct(updatedProduct);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = "";
    for (let i = 0; i < fullStars; i++) stars += "★";
    if (hasHalfStar) stars += "½";
    for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) stars += "☆";
    return stars;
  };

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

          {/* Rating (dynamic) */}
          <div className="mv-pd-rating">
            <span className="mv-stars">{renderStars(averageRating)}</span>
            <span className="mv-reviews">({reviews.length} reviews)</span>
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

          {/* Variant Pills (colors from DB) */}
          {colors.length > 0 && (
            <div className="mv-pd-variants">
              <p className="mv-pd-variant-label">Color</p>
              <div className="mv-pd-variant-pills">
                {colors.map((color, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`mv-pd-pill ${selectedColor === color ? "is-active" : ""}`}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

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
              <p>{description?.trim() || "No description available."}</p>
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
              {specificationEntries.length > 0 ? (
                <table className="mv-specs-table">
                  <tbody>
                    {specificationEntries.map(([key, value], idx) => (
                      <tr key={idx}>
                        <td><strong>{key}</strong></td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted">No specifications available.</p>
              )}
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

              {/* Add Review Form */}
              {user && (
                <div className="mv-add-review-form" style={{ marginBottom: "30px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                  <h5>Add Your Review</h5>
                  <div className="mb-3">
                    <label className="form-label">Rating *</label>
                    <div style={{ display: "flex", gap: "8px", fontSize: "24px" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: star <= reviewRating ? "#ffc107" : "#ccc",
                            fontSize: "28px",
                          }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Your Review *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Share your thoughts about this product..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      maxLength="500"
                    />
                    <small className="text-muted">{reviewText.length}/500</small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddReview}
                    disabled={submittingReview}
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              )}

              {!user && (
                <div style={{ marginBottom: "30px", padding: "20px", backgroundColor: "#e3f2fd", borderRadius: "8px", textAlign: "center" }}>
                  <p>Please <button type="button" className="btn btn-link" onClick={() => navigate("/auth")}>login</button> to add a review</p>
                </div>
              )}

              {/* Display Reviews */}
              {reviews.length > 0 ? (
                <div className="mv-reviews-list">
                  {reviews.map((review, idx) => (
                    <div
                      key={idx}
                      className="mv-review-item"
                      style={{
                        padding: "15px",
                        borderBottom: "1px solid #eee",
                        marginBottom: "15px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "10px" }}>
                        <div>
                          <p className="mv-review-author" style={{ fontWeight: "600", marginBottom: "5px" }}>
                            {review.userName}
                          </p>
                          <p className="mv-review-rating" style={{ color: "#ffc107", fontSize: "16px" }}>
                            {renderStars(review.rating)}
                          </p>
                        </div>
                        <small className="text-muted">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                        </small>
                      </div>
                      <p className="mv-review-text" style={{ color: "#555" }}>
                        {review.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mv-reviews-notice" style={{ textAlign: "center", color: "#999", padding: "20px" }}>
                  No reviews yet. Be the first to review this product!
                </p>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
