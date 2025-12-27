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
      } finally {
        setLoading(false);
      }
    };
    fetchProd();
  }, [id]);

  if (loading) {
    return (
      <div className="container mt-5 pt-5 text-center">
        <div className="spinner-border" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mt-5 pt-5">
        <h4>Product not found</h4>
        <Link to="/products" className="btn btn-dark btn-sm mt-2">
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
    if (!inStock) return toast.warn("Out of stock");
    addToCart(product, qty);
    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    if (!inStock) return toast.warn("Out of stock");
    addToCart(product, qty);
    navigate("/checkout");
  };

  return (
    <div className="container mt-5 pt-4">
      {/* Breadcrumb */}
      {/* <nav aria-label="breadcrumb" className="mb-3">
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
      </nav> */}


      <div className="row g-4">
        {/* Images */}
        <div className="col-md-5">
          <div className="bg-white rounded-4 shadow-sm p-2 position-relative">
            <button
              className="btn btn-light rounded-circle position-absolute"
              style={{ top: 10, right: 10 }}
              onClick={() => toggleWishlist(product)}
            >
              <FiHeart
                size={18}
                color={isInWishlist(product._id) ? "#e63946" : "#888"}
              />
            </button>

            <img
              src={images[activeImage] || "/placeholder.png"}
              alt={name}
              className="w-100"
              style={{ height: 340, objectFit: "contain" }}
            />

            {images.length > 1 && (
              <div className="d-flex gap-2 justify-content-center mt-2">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    onClick={() => setActiveImage(i)}
                    style={{
                      width: 56,
                      height: 56,
                      cursor: "pointer",
                      borderRadius: 6,
                      border:
                        i === activeImage
                          ? "2px solid #111"
                          : "1px solid #ddd",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="col-md-7">
          <div className="bg-white rounded-4 shadow-sm p-4">

            <h3 className="fw-bold mb-2">{name}</h3>

            {/* Price */}
            <div className="d-flex align-items-baseline gap-2 mb-1">
              <div className="fs-4 fw-bold">
                ₹{sellingPrice.toLocaleString("en-IN")}
              </div>
              {discount > 0 && (
                <>
                  <div className="text-muted text-decoration-line-through small">
                    ₹{price.toLocaleString("en-IN")}
                  </div>
                  <span className="badge bg-success-subtle text-success">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="mb-2">
              {!inStock ? (
                <span className="badge bg-danger-subtle text-danger">
                  Out of stock
                </span>
              ) : (
                <span className="badge bg-success-subtle text-success">
                  In stock
                </span>
              )}
            </div>

            {/* Action Bar */}
            <div className="pd-action-box">
              <div className="pd-qty">
                <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span>{qty}</span>
                <button
                  onClick={() => setQty(Math.min(maxQty, qty + 1))}
                  disabled={qty >= maxQty}
                >
                  +
                </button>
              </div>

              <button
                className="btn btn-dark pd-btn-primary"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>

              <button
                className="btn btn-outline-dark pd-btn-secondary"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>

            {/* Trust */}
            <div className="pd-trust">
              <span>🚚 Fast delivery</span>
              <span>🔒 Secure payments</span>
            </div>

            {/* Description */}
            <div className="border-top pt-3 mt-3">
              <h6 className="fw-semibold mb-2">Product Description</h6>
              <p className="small text-muted mb-0">
                {description || "No description available."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .pd-action-box {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-top: 10px;
        }
        .pd-qty {
          display: flex;
          align-items: center;
          border: 1px solid #d1d5db;
          border-radius: 999px;
          overflow: hidden;
        }
        .pd-qty button {
          width: 32px;
          height: 32px;
          border: none;
          background: #f3f4f6;
          font-size: 18px;
        }
        .pd-qty span {
          width: 36px;
          text-align: center;
          font-weight: 600;
        }
        .pd-btn-primary,
        .pd-btn-secondary {
          flex: 1;
          height: 36px;
          border-radius: 999px;
          font-weight: 600;
        }
        .pd-trust {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: #6b7280;
          margin-top: 12px;
        }
        .bg-success-subtle {
          background: #e6f4ea;
        }
        .bg-danger-subtle {
          background: #fde8e8;
        }
      `}</style>
    </div>
  );
}
