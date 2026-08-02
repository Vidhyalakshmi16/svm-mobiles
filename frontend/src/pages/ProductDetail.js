import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../services/api";
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

  return normalized;
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
  } = product;

  const specificationEntries = Object.entries(specifications || {});

  const sellingPrice = finalPrice ?? price;
  const inStock = stock === undefined ? true : stock > 0;
  const maxQty = stock === undefined ? 99 : Math.max(1, stock);
  const wished = isInWishlist(product._id);

  const productForCart = {
    ...product,
    selectedColor: selectedColor || undefined,
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
              <p>
                {(() => {
                  const desc = description?.trim();
                  const isRealText =
                    desc && desc.toLowerCase() !== "undefined" && desc.toLowerCase() !== "null";
                  return isRealText ? desc : "No description available.";
                })()}
              </p>
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
                <p className="pd-empty-state">No specifications listed.</p>
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