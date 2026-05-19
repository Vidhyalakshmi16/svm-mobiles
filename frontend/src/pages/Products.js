import React, { useEffect, useMemo, useState } from "react";

import { getProducts, getCategories } from "../services/api";

import { FiSearch, FiHeart, FiSliders, FiX, FiArrowRight } from "react-icons/fi";

import { useNavigate } from "react-router-dom";

import { useWishlist } from "../context/WishlistContext";

import "./Product.css"; // make sure this file holds the mv-* CSS you pasted
 
const PRICE_RANGES = [

  { label: "₹0 - ₹5k",       value: "0-5000" },

  { label: "₹5k - ₹10k",     value: "5000-10000" },

  { label: "₹10k - ₹50k",    value: "10000-50000" },

  { label: "₹50k - ₹100k",   value: "50000-100000" },

  { label: "Above ₹100k",    value: ">100000" },

];
 
export default function Products() {

  const navigate = useNavigate();

  const { toggleWishlist, isInWishlist } = useWishlist();
 
  const [products, setProducts]       = useState([]);

  const [categories, setCategories]   = useState([]);

  const [search, setSearch]           = useState("");

  const [selectedCategory, setSelectedCategory] = useState("");

  const [priceRange, setPriceRange]   = useState("");

  const [sortOption, setSortOption]   = useState("");

  const [loading, setLoading]         = useState(false);
 
  const [isMobile, setIsMobile]       = useState(

    typeof window !== "undefined" ? window.innerWidth < 768 : false

  );

  const [drawerOpen, setDrawerOpen]   = useState(false);
 
  /* ---------- Mobile detection ---------- */

  useEffect(() => {

    const handleResize = () => setIsMobile(window.innerWidth < 768);

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);

  }, []);
 
  /* ---------- Fetch data ---------- */

  useEffect(() => {

    (async () => {

      try {

        setLoading(true);

        const [p, c] = await Promise.all([getProducts(), getCategories()]);

        setProducts(p || []);

        setCategories(c || []);

      } finally {

        setLoading(false);

      }

    })();

  }, []);
 
  /* ---------- Filter + Sort ---------- */

  const filtered = useMemo(() => {

    let list = [...products];
 
    if (search.trim()) {

      const q = search.toLowerCase();

      list = list.filter((p) => {

        const name  = p.name?.toLowerCase() || "";

        const brand = p.brand?.toLowerCase() || "";

        return name.includes(q) || brand.includes(q);

      });

    }
 
    if (selectedCategory) {

      list = list.filter((p) => p.category?._id === selectedCategory);

    }
 
    if (priceRange) {

      list = list.filter((p) => {

        const price = p.finalPrice ?? p.price;

        if (priceRange === ">100000") return price > 100000;

        const [min, max] = priceRange.split("-").map(Number);

        return price >= min && price <= max;

      });

    }
 
    if (sortOption) {

      list.sort((a, b) => {

        const pa = a.finalPrice ?? a.price;

        const pb = b.finalPrice ?? b.price;

        if (sortOption === "low-high") return pa - pb;

        if (sortOption === "high-low") return pb - pa;

        if (sortOption === "newest")

          return new Date(b.createdAt) - new Date(a.createdAt);

        return 0;

      });

    }
 
    return list;

  }, [products, search, selectedCategory, priceRange, sortOption]);
 
  const activeFilterCount =

    (selectedCategory ? 1 : 0) + (priceRange ? 1 : 0);
 
  const clearAll = () => {

    setSearch("");

    setSelectedCategory("");

    setPriceRange("");

    setSortOption("");

  };
 
  /* ---------- Reusable Filter Panel ---------- */

  const FilterPanel = () => (
<div className="mv-filter-card">
<div className="mv-filter-head">
<h3>Filters</h3>

        {activeFilterCount > 0 && (
<button className="mv-filter-clear" onClick={clearAll}>

            Clear all
</button>

        )}
</div>
 
      {/* Category */}
<div className="mv-filter-section">
<div className="mv-filter-label">
<span>Category</span>

          {selectedCategory && (
<button

              className="mv-filter-clear"

              onClick={() => setSelectedCategory("")}
>

              Reset
</button>

          )}
</div>
<div className="mv-filter-pills">
<button

            type="button"

            className={`mv-pill${selectedCategory === "" ? " is-active" : ""}`}

            onClick={() => setSelectedCategory("")}
>

            All
</button>

          {categories.map((c) => (
<button

              type="button"

              key={c._id}

              className={`mv-pill${selectedCategory === c._id ? " is-active" : ""}`}

              onClick={() => setSelectedCategory(c._id)}
>

              {c.name}
</button>

          ))}
</div>
</div>
 
      {/* Price */}
<div className="mv-filter-section">
<div className="mv-filter-label">
<span>Price range</span>

          {priceRange && (
<button

              className="mv-filter-clear"

              onClick={() => setPriceRange("")}
>

              Reset
</button>

          )}
</div>
<div className="mv-filter-pills">

          {PRICE_RANGES.map((r) => (
<button

              type="button"

              key={r.value}

              className={`mv-pill${priceRange === r.value ? " is-active" : ""}`}

              onClick={() => setPriceRange(r.value)}
>

              {r.label}
</button>

          ))}
</div>
</div>
</div>

  );
 
  /* ---------- Product Card ---------- */

  const ProductCard = ({ p }) => {

    const imgSrc = p.images?.[0] || p.image || "/placeholder.png";

    const hasDiscount = p.discount > 0 && p.finalPrice && p.finalPrice !== p.price;
 
    return (
<div

        role="link"

        tabIndex={0}

        className="mv-card"

        onClick={() => navigate(`/product/${p._id}`)}

        onKeyDown={(e) => {

          if (e.key === "Enter" || e.key === " ") {

            e.preventDefault();

            navigate(`/product/${p._id}`);

          }

        }}
>

        {hasDiscount && (
<span className="mv-card-tag">{p.discount}% OFF</span>

        )}
 
        <button

          type="button"

          className="mv-card-wish"

          aria-label={

            isInWishlist(p._id) ? "Remove from wishlist" : "Add to wishlist"

          }

          onClick={(e) => {

            e.stopPropagation();

            toggleWishlist(p);

          }}
>
<FiHeart

            size={16}

            className={isInWishlist(p._id) ? "is-active" : ""}

          />
</button>
 
        <div className="mv-card-media">
<img src={imgSrc} alt={p.name} loading="lazy" />

          {p.stock === 0 && (
<div className="mv-card-stock-overlay">Out of stock</div>

          )}
</div>
 
        <div className="mv-card-body">

          {p.brand && <div className="mv-card-brand">{p.brand}</div>}
<h3 className="mv-card-name">{p.name}</h3>
 
          <div className="mv-card-footer">
<div className="mv-card-prices">
<span className="mv-card-price">

                ₹{Number(p.finalPrice ?? p.price).toLocaleString("en-IN")}
</span>

              {hasDiscount && (
<span className="mv-card-mrp">

                  ₹{Number(p.price).toLocaleString("en-IN")}
</span>

              )}
</div>
<FiArrowRight className="mv-card-arrow" />
</div>
</div>
</div>

    );

  };
 
  /* ---------- Skeleton ---------- */

  const Skeleton = () => (
<div className="mv-skeleton-grid">

      {Array.from({ length: 8 }).map((_, i) => (
<div key={i} className="mv-skeleton-card">
<div className="mv-skeleton-media" />
<div className="mv-skeleton-line short" />
<div className="mv-skeleton-line" />
<div className="mv-skeleton-line short" />
</div>

      ))}
</div>

  );
 
  return (
<div className="mv-products-wrapper">

      {/* ============ HEADER ============ */}
<header className="mv-page-header">
<p className="mv-eyebrow">— Collection</p>
<h1 className="mv-page-title">

          Browse <em>products</em>
</h1>
<p className="mv-page-sub">

          Curated flagship devices and accessories. Authentic, warrantied,

          and ready to ship.
</p>
</header>
 
      {/* ============ TOOLBAR ============ */}
<div className="mv-toolbar">
<div className="mv-search">
<FiSearch className="mv-search-icon" />
<input

            className="mv-search-input"

            placeholder="Search by name or brand…"

            value={search}

            onChange={(e) => setSearch(e.target.value)}

          />

          {search && (
<button

              className="mv-search-clear"

              onClick={() => setSearch("")}

              aria-label="Clear search"
>
<FiX size={16} />
</button>

          )}
</div>
 
        <div className="mv-toolbar-actions">

          {isMobile && (
<button

              className="mv-icon-btn"

              onClick={() => setDrawerOpen(true)}
>
<FiSliders size={16} />

              Filters

              {activeFilterCount > 0 && (
<span className="mv-filter-count">{activeFilterCount}</span>

              )}
</button>

          )}
 
          <div className="mv-select-wrap">
<select

              className="mv-select"

              value={sortOption}

              onChange={(e) => setSortOption(e.target.value)}
>
<option value="">Sort by</option>
<option value="low-high">Price: Low → High</option>
<option value="high-low">Price: High → Low</option>
<option value="newest">Newest first</option>
</select>
</div>
</div>
</div>
 
      {/* ============ RESULT BAR ============ */}
<div className="mv-result-bar">
<span>

          Showing <strong>{filtered.length}</strong> of{" "}
<strong>{products.length}</strong> products
</span>

        {activeFilterCount > 0 && (
<button className="mv-link-btn" onClick={clearAll}>

            Clear filters
</button>

        )}
</div>
 
      {/* ============ LAYOUT ============ */}
<div className="mv-layout">

        {!isMobile && (
<aside className="mv-sidebar">
<FilterPanel />
</aside>

        )}
 
        <main>

          {loading ? (
<Skeleton />

          ) : filtered.length === 0 ? (
<div className="mv-empty">
<div className="mv-empty-icon">🔍</div>
<h3>No products match your filters</h3>
<p>Try adjusting your search or clearing some filters.</p>
<button className="mv-btn-primary" onClick={clearAll}>

                Clear all filters
</button>
</div>

          ) : (
<div className="mv-product-grid">

              {filtered.map((p) => (
<ProductCard key={p._id} p={p} />

              ))}
</div>

          )}
</main>
</div>
 
      {/* ============ MOBILE DRAWER ============ */}

      {isMobile && drawerOpen && (
<>
<div

            className="mv-drawer-backdrop"

            onClick={() => setDrawerOpen(false)}

          />
<div className="mv-drawer" role="dialog" aria-label="Filters">
<div className="mv-drawer-handle" />
<div className="mv-drawer-head">
<h3>Filters</h3>
<button

                onClick={() => setDrawerOpen(false)}

                aria-label="Close filters"
>
<FiX size={22} />
</button>
</div>
<div className="mv-drawer-body">
<FilterPanel />
</div>
<div className="mv-drawer-foot">
<button className="mv-btn-ghost" onClick={clearAll}>

                Clear all
</button>
<button

                className="mv-btn-primary"

                onClick={() => setDrawerOpen(false)}
>

                Show {filtered.length} results
</button>
</div>
</div>
</>

      )}
</div>

  );

}
 