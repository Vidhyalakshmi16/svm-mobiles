import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import "./WishlistPage.css";

const WishlistPage = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product._id);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    }),
  };

  if (wishlist.length === 0) {
    return (
      <div className="mv-wishlist-wrapper mv-wishlist--empty">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="mv-wishlist-empty-state"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mv-wishlist-empty-icon"
          >
            <FiHeart size={48} />
          </motion.div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mv-eyebrow"
          >
            Saved Items
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mv-wishlist-empty-title"
          >
            No favorites <em>yet</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mv-wishlist-empty-text"
          >
            Save items you love and shop when you're ready. Your wishlist awaits!
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/products")}
            className="mv-btn-primary"
          >
            Browse Devices →
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mv-wishlist-wrapper">
      {/* PAGE HEADER */}
      <motion.header
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className="mv-wishlist-header"
      >
        <span className="mv-eyebrow">— Saved Items</span>
        <div className="mv-wishlist-header-top">
          <h1 className="mv-wishlist-title">
            My <em>favorites</em>
          </h1>
          <p className="mv-wishlist-count">
            {wishlist.length} item{wishlist.length !== 1 ? "s" : ""} saved
          </p>
        </div>
      </motion.header>

      {/* WISHLIST GRID */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mv-wishlist-grid"
      >
        <AnimatePresence mode="popLayout">
          {wishlist.map((product, index) => (
            <motion.div
              key={product._id}
              layout
              custom={index}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
              variants={fadeUp}
              className="mv-wishlist-card"
            >
              <div className="mv-card-media">
                <motion.img
                  src={product.images?.[0] || product.image}
                  alt={product.name}
                  className="mv-card-img"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Wishlist Remove Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="mv-wishlist-btn-remove"
                  aria-label="Remove from wishlist"
                  onClick={() => removeFromWishlist(product._id)}
                  title="Remove from favorites"
                >
                  <FiHeart size={18} fill="currentColor" />
                </motion.button>

                {/* Discount Badge */}
                {product.discount > 0 && (
                  <div className="mv-card-badge mv-badge-discount">
                    {product.discount}% OFF
                  </div>
                )}

                {/* Stock Status */}
                {product.stock === 0 && (
                  <div className="mv-card-badge mv-badge-stock">
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="mv-card-body">
                <p className="mv-card-brand">{product.brand || "Brand"}</p>

                <h3 className="mv-card-name">{product.name}</h3>

                {/* Price Block */}
                <div className="mv-card-prices">
                  <span className="mv-card-price">
                    ₹{Number(product.finalPrice ?? product.price).toLocaleString("en-IN")}
                  </span>
                  {product.discount > 0 && (
                    <span className="mv-card-mrp">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  className="mv-btn-primary mv-btn-block"
                  onClick={() => handleMoveToCart(product)}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? "Out of Stock" : "Move to Cart →"}
                </motion.button>

                {/* View Details Link */}
                <motion.button
                  whileHover={{ color: "var(--ink)" }}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="mv-card-link"
                >
                  View Details
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default WishlistPage;
