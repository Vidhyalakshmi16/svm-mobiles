// src/pages/ProductDetail.js
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductById } from "../services/api";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { FiHeart } from "react-icons/fi";
import { useWishlist } from "../context/WishlistContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);


  useEffect(() => {
    const fetchProd = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
        setActiveImage(0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProd();
  }, [id]);

  if (loading) {
    return (
      <div className="container mt-5 pt-5 text-center">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mt-5 pt-5">
        <h4>Product not found</h4>
        <Link to="/products" className="btn btn-primary btn-sm mt-2">
          Back to Products
        </Link>
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
    if (!inStock) {
      toast.warn("This product is currently out of stock.");
      return;
    }
    addToCart(product, qty);
    toast.success("Product added to cart");
  };

  const handleBuyNow = () => {
    if (!inStock) {
      toast.warn("This product is currently out of stock.");
      return;
    }
    addToCart(product, qty);
    navigate("/checkout");
  };

  const handleQtyMinus = () => {
    setQty((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleQtyPlus = () => {
  setQty((prev) => (prev < maxQty ? prev + 1 : prev));
};


  return (
    <div className="container mt-5 pt-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/products">Products</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {name}
          </li>
        </ol>
      </nav>

      <div className="row g-4">
        {/* LEFT: Images */}
        <div className="col-md-5">
          <div className="position-relative rounded-4 shadow-sm bg-white p-3">
            {/* Wishlist icon */}
            <button
              type="button"
              className="btn btn-light rounded-circle position-absolute"
              style={{ top: 12, right: 12 }}
              onClick={() => toggleWishlist(product)}
            >
              <FiHeart
                size={20}
                color={isInWishlist(product._id) ? "red" : "#888"}
              />
            </button>

            <div className="text-center mb-3">
              <img
                src={images[activeImage] || ""}
                alt={name}
                style={{
                  width: "100%",
                  maxHeight: 320,
                  objectFit: "contain",
                  borderRadius: 12,
                }}
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    style={{
                      border: idx === activeImage ? "2px solid #111" : "1px solid #ddd",
                      borderRadius: 8,
                      padding: 0,
                      background: "#fff",
                    }}
                  >
                    <img
                      src={img}
                      alt={`thumb-${idx}`}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Info */}
        <div className="col-md-7">
          <div className="rounded-4 bg-white shadow-sm p-4">
            {/* Brand */}
            {brand && (
              <div className="text-uppercase small text-muted mb-1">
                {brand}
              </div>
            )}

            {/* Name */}
            <h3 className="fw-bold mb-2">{name}</h3>

            {/* Price Row */}
            <div className="d-flex align-items-baseline gap-3 mb-2">
              <div className="fs-4 fw-bold">
                ₹{sellingPrice?.toLocaleString("en-IN")}
              </div>
              {price && discount > 0 && (
                <>
                  <div className="text-muted text-decoration-line-through small">
                    ₹{price?.toLocaleString("en-IN")}
                  </div>
                  <span className="badge rounded-pill bg-success-subtle text-success fw-semibold">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock status */}
            <div className="mb-3">
              {!inStock ? (
                <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill">
                  Out of stock
                </span>
              ) : stock < 3 ? (
                <span className="badge bg-warning-subtle text-warning px-3 py-2 rounded-pill">
                  Only {stock} left
                </span>
              ) : (
                <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill">
                  In stock
                </span>
              )}
            </div>


            {/* Quantity + Buttons */}
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="d-flex align-items-center border rounded-pill px-2 py-1">
                <button
                  type="button"
                  className="btn btn-link p-2 text-dark"
                  onClick={handleQtyMinus}
                >
                  −
                </button>
                <span className="px-2">{qty}</span>
                <button
                  type="button"
                  className="btn btn-link p-2 text-dark"
                  onClick={handleQtyPlus}
                  disabled={qty >= maxQty}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="btn btn-dark px-4 rounded-pill"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary px-4 rounded-pill"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>

            {/* Trust row */}
            <div className="d-flex flex-wrap gap-3 small text-muted mb-4">
              <span>🚚 Fast delivery available</span>
              <span>🔒 Secure payments</span>
            </div>

            {/* Specs + Description */}
            <div className="row g-3">
              <div className="col-12">
                <div className="border rounded-4 p-3">
                  <h6 className="fw-semibold mb-3">Product Description</h6>
                  <p className="small text-muted mb-0">
                    {description || "No additional description provided."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* small CSS tweaks */}
      <style>{`
        .bg-success-subtle {
          background-color: #e6f4ea;
        }
        .bg-danger-subtle {
          background-color: #fde8e8;
        }
      `}</style>


      {/* Styles */}
      <style>{`
        .pd-breadcrumb {
          font-size: 13px;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .pd-bc-link {
          color: #6b7280;
          text-decoration: none;
        }
        .pd-bc-link:hover {
          text-decoration: underline;
        }
        .pd-bc-current {
          color: #111827;
          font-weight: 500;
        }

        .pd-main-wrapper {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          padding: 18px 18px 20px;
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.4fr);
          gap: 24px;
        }

        .pd-left,
        .pd-right {
          min-width: 0;
        }

        .pd-main-card {
          background: #f9fafb;
          border-radius: 12px;
          padding: 14px;
          position: relative;
        }

        .pd-wish-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 2;
          border: none;
          background: #ffffffdd;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pd-wish {
          color: #9ca3af;
        }
        .pd-wish-active {
          color: #e63946;
        }

        .pd-img-main-box {
          width: 100%;
          height: 380px;
          background: #f3f4f6;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .pd-img-main {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .pd-thumbs {
          display: flex;
          gap: 8px;
          margin-top: 10px;
          flex-wrap: wrap;
        }
        .pd-thumb {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid transparent;
          padding: 0;
          background: #f5f5f5;
        }
        .pd-thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .pd-thumb-active {
          border-color: #111827;
        }

        .pd-details-card {
          padding: 4px 4px 4px 4px;
        }
        .pd-brand {
          font-size: 14px;
          font-weight: 600;
          color: #4b5563;
          text-transform: capitalize;
        }
        .pd-title {
          font-size: 22px;
          font-weight: 700;
          margin-top: 2px;
          margin-bottom: 2px;
        }
        .pd-subtext {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 10px;
        }

        .pd-price-box {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 4px;
        }
        .pd-price {
          font-size: 22px;
          font-weight: 700;
          color: #111827;
        }
        .pd-mrp {
          font-size: 14px;
          color: #9ca3af;
          text-decoration: line-through;
        }
        .pd-off {
          font-size: 14px;
          color: #16a34a;
          font-weight: 600;
        }

        .pd-stock {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .pd-stock-in {
          color: #16a34a;
        }
        .pd-stock-oos {
          color: #e63946;
        }

        .pd-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          margin-top: 14px;
          margin-bottom: 8px;
        }
        .pd-qty-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pd-qty-label {
          font-size: 13px;
          color: #4b5563;
        }
        .pd-qty-box {
          display: inline-flex;
          border: 1px solid #d1d5db;
          border-radius: 999px;
          overflow: hidden;
          align-items: center;
        }
        .pd-qty-box button {
          border: none;
          background: #f3f4f6;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        .pd-qty-box span {
          width: 36px;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
        }

        .pd-cta-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .pd-highlights {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          font-size: 13px;
          color: #4b5563;
          margin-top: 6px;
        }
        .pd-highlight-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .pd-spec-card,
        .pd-desc-card {
          background: #f9fafb;
          border-radius: 10px;
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          height: 100%;
        }
        .pd-spec-card h6,
        .pd-desc-card h6 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 6px;
        }
        .pd-spec-table {
          width: 100%;
          font-size: 12px;
          color: #374151;
        }
        .pd-spec-table td {
          padding: 3px 0;
        }
        .pd-spec-table td:first-child {
          width: 40%;
          color: #6b7280;
        }
        .pd-desc-card p {
          font-size: 13px;
          color: #4b5563;
          margin: 0;
          white-space: pre-wrap;
        }

        @media (max-width: 991px) {
          .pd-main-wrapper {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 767px) {
          .pd-img-main-box {
            height: 320px;
          }
        }
      `}</style>
    </div>
  );
}
