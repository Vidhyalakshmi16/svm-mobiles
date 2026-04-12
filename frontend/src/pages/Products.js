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

  // ✅ Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // ---------------- FILTER + SORT ----------------
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
      if (priceRange === ">100000") return price > 100000;
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
    <div className="container py-4">
      <p className="lux-eyebrow mb-1">Collection</p>
      <h1 className="store-page-title">Browse products</h1>

      {/* ================= MOBILE TOP CONTROLS ================= */}
      {isMobile && (
        <>
          {/* 🔹 SEARCH + SORT (TOP) */}
          <div className="d-flex gap-2 mb-2 align-items-stretch">
            <div className="flex-grow-1 store-search">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white px-3">
                  <FiSearch />
                </span>
                <input
                  className="form-control"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <select
              className="form-select form-select-sm"
              style={{ width: "140px" }}
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="">Sort</option>
              <option value="low-high">Low → High</option>
              <option value="high-low">High → Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* 🔹 CATEGORY + PRICE (BELOW) */}
          <div className="d-flex gap-2 mb-3">
            <select
              className="form-select form-select-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="form-select form-select-sm"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
            >
              <option value="">All Prices</option>
              <option value="0-5000">₹0 - ₹5k</option>
              <option value="5000-10000">₹5k - ₹10k</option>
              <option value="10000-50000">₹10k - ₹50k</option>
              <option value="50000-100000">₹50k - ₹100k</option>
              <option value=">100000">Above ₹100k</option>
            </select>
          </div>
        </>
      )}

      <div className="row">
        {/* ================= DESKTOP FILTER PANEL ================= */}
        {!isMobile && (
          <div className="col-md-3 col-lg-2 mb-4">
            <div className="store-filter-card">
              <div className="store-filter-title">Filters</div>

              <div className="store-filter-section">
                <div className="store-filter-label">Category</div>
                <div className="store-filter-pills">
                  <button
                    type="button"
                    className={`store-filter-pill${
                      selectedCategory === "" ? " is-active" : ""
                    }`}
                    onClick={() => setSelectedCategory("")}
                  >
                    All
                  </button>
                  {categories.map((c) => (
                    <button
                      type="button"
                      key={c._id}
                      className={`store-filter-pill${
                        selectedCategory === c._id ? " is-active" : ""
                      }`}
                      onClick={() => setSelectedCategory(c._id)}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="store-filter-section">
                <div className="store-filter-label">Price range</div>
                <div className="store-filter-pills">
                  {[
                    { label: "₹0 - ₹5k", value: "0-5000" },
                    { label: "₹5k - ₹10k", value: "5000-10000" },
                    { label: "₹10k - ₹50k", value: "10000-50000" },
                    { label: "₹50k - ₹100k", value: "50000-100000" },
                    { label: "Above ₹100k", value: ">100000" },
                  ].map((r) => (
                    <button
                      type="button"
                      key={r.value}
                      className={`store-filter-pill${
                        priceRange === r.value ? " is-active" : ""
                      }`}
                      onClick={() => setPriceRange(r.value)}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= PRODUCT GRID ================= */}
        <div className="col-md-9 col-lg-10">
          {!isMobile && (
            <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap store-toolbar">
              <div style={{ maxWidth: "420px", width: "100%" }} className="store-search">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white px-3">
                    <FiSearch />
                  </span>
                  <input
                    className="form-control"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <select
                className="form-select form-select-sm"
                style={{ width: "180px" }}
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="">Sort by</option>
                <option value="low-high">Price: Low → High</option>
                <option value="high-low">Price: High → Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          )}

          {loading ? (
            <p className="store-loading">Loading products…</p>
          ) : (
            <div className="row g-3 g-md-4">
              {filtered.map((p) => (
                <div key={p._id} className="col-6 col-md-4 col-lg-3">
                  <div
                    role="link"
                    tabIndex={0}
                    className="store-product-card"
                    onClick={() => navigate(`/product/${p._id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/product/${p._id}`);
                      }
                    }}
                  >
                    <button
                      type="button"
                      className="store-product-card__wish"
                      aria-label={
                        isInWishlist(p._id)
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(p);
                      }}
                    >
                      <FiHeart
                        size={18}
                        className={
                          isInWishlist(p._id)
                            ? "store-wish-ico is-active"
                            : "store-wish-ico"
                        }
                      />
                    </button>

                    <div className="store-product-card__media">
                      <img
                        src={p.images?.[0] || p.image || "/placeholder.png"}
                        alt={p.name}
                        className="store-product-card__img"
                      />
                    </div>

                    <div className="store-product-card__body">
                      <div className="store-product-card__brand">{p.brand}</div>
                      <div className="store-product-card__name">{p.name}</div>
                      <div className="store-product-card__prices">
                        <span className="store-product-card__price">
                          ₹{Number(p.finalPrice ?? p.price).toLocaleString("en-IN")}
                        </span>
                        {p.discount > 0 && (
                          <>
                            <span className="store-product-card__mrp">
                              ₹{Number(p.price).toLocaleString("en-IN")}
                            </span>
                            <span className="store-product-card__discount">
                              {p.discount}% OFF
                            </span>
                          </>
                        )}
                      </div>
                      {p.stock === 0 && (
                        <div className="store-product-card__stock">
                          Out of stock
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
