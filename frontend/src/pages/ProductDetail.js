import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  getProductById,
  addProductReview,
  canReviewProductApi,
} from "../services/api";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import {
  FiHeart,
  FiCheck,
  FiChevronRight,
  FiShoppingCart,
  FiZap,
} from "react-icons/fi";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import "./ProductDetail.css";

const normalizeProductData = (data) => {
  if (!data) return null;
  const normalized = { ...data };

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
    ? normalized.colors.map((c) => String(c || "").trim()).filter(Boolean)
    : [];

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

const renderStars = (rating) => {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  const full = Math.floor(r);
  let out = "";
  for (let i = 0; i < full; i++) out += "★";
  for (let i = full; i < 5; i++) out += "☆";
  return out;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedColor, setSelectedColor] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [reviewBlockReason, setReviewBlockReason] = useState("");

  useEffect(() => {
    const fetchProd = async () => {
      try {
        setLoading(true);
        const data = normalizeProductData(await getProductById(id));
        setProduct(data);
        setActiveImage(0);
        setQty(1);
        if (data?.colors?.length > 0) {
          setSelectedColor(data.colors[0]);
        } else {
          setSelectedColor("");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProd();
  }, [id]);

  useEffect(() => {
    const checkReviewEligibility = async () => {
      if (!user) {
        setCanReview(false);
        setReviewBlockReason("");
        return;
      }
      try {
        const result = await canReviewProductApi(id);
        setCanReview(!!result.canReview);
        setReviewBlockReason(result.reason || "");
      } catch {
        setCanReview(false);
        setReviewBlockReason("SERVER_ERROR");
      }
    };
    checkReviewEligibility();
  }, [id, user]);

  if (loading) {
    return (
      <div className="pd-page">
        <div className="pd-loader">
          <div className="pd-skeleton pd-skeleton--gallery" />
          <div className="pd-skeleton pd-skeleton--info" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pd-page pd-not-found">
        <h2>Product not found</h2>
        <button
          type="button"
          className="pd-btn pd-btn--primary"
          onClick={() => navigate("/products")}
        >
          Browse products
        </button>
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
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const sellingPrice = finalPrice ?? price;
  const inStock = stock === undefined ? true : stock > 0;
  const maxQty = stock === undefined ? 99 : Math.max(1, stock);
  const wished = isInWishlist(product._id);

  const productForCart = {
    ...product,
    selectedColor: selectedColor || undefined,
  };

  const getReviewBlockMessage = () => {
    switch (reviewBlockReason) {
      case "NOT_PURCHASED":
        return "You can write a review only after purchasing this product.";
      case "ALREADY_REVIEWED":
        return "You have already reviewed this product.";
      default:
        return "You are not eligible to review this product right now.";
    }
  };

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
      toast.success("Review submitted!");
      setReviewText("");
      setReviewRating(5);
      const updated = normalizeProductData(response.product || response);
      if (updated) setProduct(updated);
      setCanReview(false);
      setReviewBlockReason("ALREADY_REVIEWED");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = () => {
    if (!inStock) return toast.warn("Out of stock");
    addToCart(productForCart, qty);
    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    if (!inStock) return toast.warn("Out of stock");
    if (!user) {
      toast.info("Please login to continue");
      navigate("/auth", { state: { from: `/product/${id}` } });
      return;
    }
    addToCart(productForCart, qty);
    navigate("/checkout");
  };

  const tabs = [
    { id: "description", label: "Description" },
    {
      id: "specifications",
      label: "Specs",
      count: specificationEntries.length,
    },
    { id: "reviews", label: "Reviews", count: reviews.length },
  ];

  return (
    <div className="pd-page">
      <div className="pd-container">
        <nav className="pd-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <FiChevronRight size={14} />
          <Link to="/products">Products</Link>
          <FiChevronRight size={14} />
          <span>{name}</span>
        </nav>

        <div className="pd-main">
          <motion.div
            className="pd-gallery"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="pd-gallery-frame">
              <img
                src={images[activeImage] || "/placeholder.png"}
                alt={name}
              />
              <button
                type="button"
                className={`pd-wishlist ${wished ? "is-active" : ""}`}
                onClick={() => toggleWishlist(product)}
                aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
              >
                <FiHeart size={20} fill={wished ? "currentColor" : "none"} />
              </button>
            </div>
            {images.length > 1 && (
              <div className="pd-thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`pd-thumb ${i === activeImage ? "is-active" : ""}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            className="pd-info"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            {brand && <p className="pd-brand">{brand}</p>}
            <h1 className="pd-title">{name}</h1>

            <div className="pd-rating-row">
              {averageRating ? (
                <>
                  <span className="pd-stars">{renderStars(averageRating)}</span>
                  <span className="pd-rating-text">
                    {averageRating} · {reviews.length} review
                    {reviews.length !== 1 ? "s" : ""}
                  </span>
                </>
              ) : (
                <span className="pd-rating-badge">No reviews yet</span>
              )}
            </div>

            <div className="pd-price-block">
              <span className="pd-price">
                ₹{sellingPrice.toLocaleString("en-IN")}
              </span>
              {discount > 0 && (
                <>
                  <span className="pd-mrp">₹{price.toLocaleString("en-IN")}</span>
                  <span className="pd-off">{discount}% off</span>
                </>
              )}
            </div>

            <div
              className={`pd-stock ${inStock ? "pd-stock--in" : "pd-stock--out"}`}
            >
              {inStock ? (
                <>
                  <FiCheck size={16} /> In stock
                  {stock !== undefined && stock <= 10 ? ` (${stock} left)` : ""}
                </>
              ) : (
                "Out of stock"
              )}
            </div>

            {colors.length > 0 && (
              <div className="pd-section">
                <p className="pd-section-label">Color</p>
                <div className="pd-colors">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`pd-color ${
                        selectedColor === color ? "is-active" : ""
                      }`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pd-section">
              <p className="pd-section-label">Quantity</p>
              <div className="pd-qty">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1}
                >
                  −
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(Math.min(maxQty, qty + 1))}
                  disabled={qty >= maxQty || !inStock}
                >
                  +
                </button>
              </div>
            </div>

            <div className="pd-actions">
              <button
                type="button"
                className="pd-btn pd-btn--primary"
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                <FiShoppingCart size={18} /> Add to cart
              </button>
              <button
                type="button"
                className="pd-btn pd-btn--outline"
                onClick={handleBuyNow}
                disabled={!inStock}
              >
                <FiZap size={18} /> Buy now
              </button>
            </div>

            <div className="pd-perks">
              <div className="pd-perk">
                <div className="pd-perk-icon">🚚</div>
                <div>
                  <strong>Fast delivery</strong>
                  <span>2–3 business days</span>
                </div>
              </div>
              <div className="pd-perk">
                <div className="pd-perk-icon">🔒</div>
                <div>
                  <strong>Secure pay</strong>
                  <span>UPI & cards</span>
                </div>
              </div>
              <div className="pd-perk">
                <div className="pd-perk-icon">↩️</div>
                <div>
                  <strong>Easy returns</strong>
                  <span>30-day policy</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <section className="pd-tabs-wrap">
          <div className="pd-tabs" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`pd-tab ${activeTab === tab.id ? "is-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="pd-tab-count">{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {activeTab === "description" && (
            <div className="pd-pane">
              <h3>About this product</h3>
              <p>{description?.trim() || "No description available."}</p>
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="pd-pane">
              <h3>Technical specifications</h3>
              {specificationEntries.length > 0 ? (
                <table className="pd-specs">
                  <tbody>
                    {specificationEntries.map(([key, value]) => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="pd-empty-reviews">No specifications listed.</p>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="pd-pane">
              <h3>Customer reviews</h3>

              {user && canReview && (
                <div className="pd-review-form">
                  <h4>Write a review</h4>
                  <div className="pd-star-picker">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={star <= reviewRating ? "is-on" : ""}
                        onClick={() => setReviewRating(star)}
                        aria-label={`${star} stars`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Share your experience with this product..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    maxLength={500}
                  />
                  <p className="pd-char-count">{reviewText.length}/500</p>
                  <button
                    type="button"
                    className="pd-btn pd-btn--primary"
                    onClick={handleAddReview}
                    disabled={submittingReview}
                  >
                    {submittingReview ? "Submitting…" : "Submit review"}
                  </button>
                </div>
              )}

              {user && !canReview && (
                <div className="pd-review-notice pd-review-notice--warn">
                  {getReviewBlockMessage()}
                </div>
              )}

              {!user && (
                <div className="pd-review-notice pd-review-notice--info">
                  <button
                    type="button"
                    className="pd-btn pd-btn--outline"
                    style={{ marginTop: "0.5rem" }}
                    onClick={() => navigate("/auth")}
                  >
                    Log in to review after purchase
                  </button>
                </div>
              )}

              {reviews.length > 0 ? (
                <div className="pd-reviews-list">
                  {reviews.map((review) => (
                    <article
                      key={review._id || `${review.userName}-${review.createdAt}`}
                      className="pd-review-card"
                    >
                      <div className="pd-review-head">
                        <div>
                          <p className="pd-review-author">{review.userName}</p>
                          <p className="pd-review-stars">
                            {renderStars(review.rating)}
                          </p>
                        </div>
                        <time className="pd-review-date">
                          {review.createdAt
                            ? new Date(review.createdAt).toLocaleDateString(
                                "en-IN",
                                { day: "numeric", month: "short", year: "numeric" }
                              )
                            : ""}
                        </time>
                      </div>
                      <p className="pd-review-body">{review.text}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="pd-empty-reviews">No reviews yet for this product.</p>
              )}
            </div>
          )}
        </section>
      </div>

      <div className="pd-mobile-bar">
        <div className="pd-mobile-price">
          <strong>₹{(sellingPrice * qty).toLocaleString("en-IN")}</strong>
          <span>
            {qty} item{qty > 1 ? "s" : ""}
            {selectedColor ? ` · ${selectedColor}` : ""}
          </span>
        </div>
        <button
          type="button"
          className="pd-btn pd-btn--outline"
          onClick={handleAddToCart}
          disabled={!inStock}
        >
          Cart
        </button>
        <button
          type="button"
          className="pd-btn pd-btn--primary"
          onClick={handleBuyNow}
          disabled={!inStock}
        >
          Buy
        </button>
      </div>
    </div>
  );
}
