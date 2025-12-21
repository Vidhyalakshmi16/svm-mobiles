import React, { useEffect, useState } from "react";
import { getProducts, getCategories } from "../services/api";
import { FiSearch, FiHeart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";

export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Global wishlist (from context)
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  // ----------------------------
  // FILTERING + SORT
  // ----------------------------
  let filtered = [...products];

  if (search.trim()) {
    filtered = filtered.filter((p) => {
      const name = p.name?.toLowerCase() || "";
      const brand = p.brand?.toLowerCase() || "";

      return (
        name.includes(search.toLowerCase()) ||
        brand.includes(search.toLowerCase())
      );
});

  }

  if (selectedCategory) {
    filtered = filtered.filter((p) => p.category?._id === selectedCategory);
  }

  if (priceRange) {
  filtered = filtered.filter((p) => {
    const price = p.finalPrice ?? p.price;

    // ✅ For "Above ₹100k"
    if (priceRange === ">100000") {
      return price > 100000;
    }

    // ✅ For normal ranges like 0-5000, 5000-10000 etc
    const [min, max] = priceRange.split("-").map(Number);
    return price >= min && price <= max;
  });
}


  if (sortOption) {
    filtered.sort((a, b) => {
      const pa = a.finalPrice ?? a.price;
      const pb = b.finalPrice ?? b.price;

      if (sortOption === "low-high") return pa - pb;
      if (sortOption === "high-low") return pb - pa;
      if (sortOption === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);

      return 0;
    });
  }

  return (
    <div className="container mt-5 pt-4">
      {/* Header */}
      <h2 className="fw-bold mb-4" style={{ fontSize: "24px" }}>
        Browse Products
      </h2>

      <div className="row">
        {/* LEFT FILTER PANEL */}
        <div className="col-md-3 col-lg-2 mb-4">
          <div className="filter-card">
            <h6 className="filter-title">Filters</h6>

            {/* Category Section */}
            <div className="filter-section">
              <div className="filter-section-title">Category</div>
              <div className="filter-list">
                <button
                  type="button"
                  className={
                    selectedCategory === ""
                      ? "filter-pill active"
                      : "filter-pill"
                  }
                  onClick={() => setSelectedCategory("")}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    className={
                      selectedCategory === c._id
                        ? "filter-pill active"
                        : "filter-pill"
                    }
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === c._id ? "" : c._id
                      )
                    }
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Section */}
            <div className="filter-section">
              <div className="filter-section-title">Price Range</div>
              <div className="filter-list">
                {[
                  { label: "All", value: "" },
                  { label: "₹0 - ₹5k", value: "0-5000" },
                  { label: "₹5k - ₹10k", value: "5000-10000" },
                  { label: "₹10k - ₹50k", value: "10000-50000" },
                  { label: "₹50k - ₹100k", value: "50000-100000" },
                  { label: "Above ₹100k", value: ">100000" },
                ].map((range) => (
                  <button
                    key={range.label}
                    type="button"
                    className={
                      priceRange === range.value
                        ? "filter-pill active"
                        : "filter-pill"
                    }
                    onClick={() =>
                      setPriceRange(
                        priceRange === range.value ? "" : range.value
                      )
                    }
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: SEARCH + SORT + PRODUCTS */}
        <div className="col-md-9 col-lg-10">
          {/* Top bar: Search + Sort */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
            {/* Search */}
            <div style={{ flex: "1 1 260px", maxWidth: "420px" }}>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white rounded-start-3 px-3">
                  <FiSearch />
                </span>
                <input
                  type="text"
                  className="form-control rounded-end-3"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Sort dropdown */}
            <div style={{ width: "180px" }}>
              <select
                className="form-select form-select-sm rounded-3"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="">Sort by</option>
                <option value="low-high">Price: Low → High</option>
                <option value="high-low">Price: High → Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* PRODUCT GRID */}
          {loading ? (
            <p>Loading products...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5">
              <h5 className="fw-semibold">No products found</h5>
              <p className="text-muted mb-3">
                Try changing filters or add a product.
              </p>

              <button
                className="btn btn-outline-dark btn-sm"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("");
                  setPriceRange("");
                  setSortOption("");
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="row g-3 products-grid">
              {filtered.map((p) => {
                const finalPrice = p.finalPrice ?? p.price;
                const originalPrice = p.price;

                return (
                  <div
                    key={p._id}
                    className="col-6 col-md-4 col-lg-3"
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className="m-product-card"
                      onClick={() => navigate(`/product/${p._id}`)}
                    >
                      {/* Wishlist button */}
                      <button
                        className="m-wish-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(p);
                        }}
                      >
                        <FiHeart
                          size={18}
                          className={
                            isInWishlist(p._id) ? "m-wish-active" : "m-wish"
                          }
                        />
                      </button>

                      <img
                        src={p.images?.[0] || p.image || "/placeholder.png"}
                        alt={p.name}
                        className="m-img"
                      />

                      {/* Info */}
                      <div className="m-info">
                        <div className="m-brand">{p.brand}</div>
                        <div className="m-name" title={p.name}>
                          {p.name}
                        </div>

                        <div className="m-price-row">
                          <span className="m-price">₹{finalPrice}</span>
                          {p.discount > 0 && (
                            <>
                              <span className="m-mrp">₹{originalPrice}</span>
                              <span className="m-discount">
                                {p.discount}% OFF
                              </span>
                            </>
                          )}
                        </div>

                        {p.stock === 0 && (
                          <div className="m-outstock">Out of Stock</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Styles */}
      <style>{`
        /* FILTER CARD LEFT */
        .filter-card {
          background: #fff;
          border-radius: 12px;
          padding: 12px 12px 16px;
          border: 1px solid #e4e4e4;
        }
        .filter-title {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .filter-section {
          margin-bottom: 12px;
        }
        .filter-section-title {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 6px;
        }
        .filter-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .filter-pill {
          border-radius: 999px;
          border: 1px solid #ddd;
          background: #fafafa;
          padding: 3px 10px;
          font-size: 12px;
          cursor: pointer;
          transition: 0.2s;
        }
        .filter-pill:hover {
          background: #f0f0f0;
        }
        .filter-pill.active {
          background: #111827;
          border-color: #111827;
          color: #fff;
        }

        .m-product-card {
          background: #fff;
          border: 1px solid #e6e6e6;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          padding-bottom: 8px;
        }
        .m-product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }

        .m-wish-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 2;
          background: #ffffffcc;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          padding: 0;
        }
        .m-wish {
          color: #999;
        }
        .m-wish-active {
          color: #e63946;
        }

        .m-img-wrap {
          width: 100%;
          height: 260px;
          background: #f7f7f7;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .m-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          display: block;
        }

        .m-info {
          padding: 8px 10px 10px;
        }
        .m-brand {
          font-size: 13px;
          font-weight: 600;
          color: #222;
        }
        .m-name {
          font-size: 12px;
          color: #555;
          margin-top: 2px;
          margin-bottom: 6px;
          min-height: 32px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .m-price-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .m-price {
          font-size: 14px;
          font-weight: 700;
          color: #111;
        }
        .m-mrp {
          font-size: 12px;
          color: #777;
          text-decoration: line-through;
        }
        .m-discount {
          font-size: 12px;
          color: #1ba54a;
          font-weight: 600;
        }
        .m-outstock {
          margin-top: 4px;
          font-size: 11px;
          color: #d9534f;
          font-weight: 600;
        }

        .products-grid {
          margin-top: 20px;
        }

        @media (max-width: 767px) {
          .filter-card {
            margin-bottom: 16px;
          }
        }
      `}</style>
    </div>
  );
}
