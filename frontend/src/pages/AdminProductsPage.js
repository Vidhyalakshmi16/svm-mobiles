import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiEye, FiEdit, FiCopy, FiTrash2 } from "react-icons/fi";

import {
  getProducts,
  getCategories,
  createProduct,
  deleteProduct,
  updateProduct,
  createCategory,
  updateCategory,
  deleteCategoryApi,
} from "../services/api";

  function MobileProductCard({
  product,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  isSelected,
  onSelect,
}) {
  const effectivePrice = product.finalPrice ?? product.price ?? 0;
  const outOfStock = product.stock === 0;
  const lowStock = product.stock < 5 && product.stock > 0;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 12,
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        marginBottom: 12,
      }}
    >
      {/* Top */}
      <div className="d-flex align-items-center gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
        />

        <img
          src={product.images?.[0] || ""}
          alt={product.name}
          style={{
            width: 60,
            height: 60,
            objectFit: "cover",
            borderRadius: 8,
          }}
        />

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{product.name}</div>
          <div className="text-muted small">{product.brand}</div>
          <div className="small">
            ₹{effectivePrice}{" "}
            {product.discount ? (
              <span className="text-muted">
                <del>₹{product.price}</del>
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Stock */}
      <div className="mt-2 small">
        Stock: {product.stock}
        {outOfStock && (
          <span className="badge bg-danger ms-2">Out</span>
        )}
        {lowStock && !outOfStock && (
          <span className="badge bg-warning text-dark ms-2">Low</span>
        )}
      </div>

      {/* Actions */}
      <div className="d-flex justify-content-between mt-3">
        <button className="btn btn-sm btn-outline-primary" onClick={onView}>
          View
        </button>
        <button className="btn btn-sm btn-outline-secondary" onClick={onEdit}>
          Edit
        </button>
        <button className="btn btn-sm btn-outline-success" onClick={onDuplicate}>
          Copy
        </button>
        <button className="btn btn-sm btn-outline-danger" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}


export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [selectedPriceFilter, setSelectedPriceFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [sortOption, setSortOption] = useState(""); // sorting
  const [selectedProductIds, setSelectedProductIds] = useState([]); // bulk selection

  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const [isMobile, setIsMobile] = useState(
  typeof window !== "undefined" && window.innerWidth <= 768
);


useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);



  // ---------- FORM STATE ----------
  const [form, setForm] = useState({
    name: "",
    brand: "",
    price: "",
    discount: "",
    cost: "",
    stock: "",
    category: "",
    color: "",
    description: "",
    ram: "",
    storage: "",
  });

  // images from DB we are KEEPING
  const [existingImages, setExistingImages] = useState([]); // array of URLs

  // new uploads
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);

  const [extraImageFiles, setExtraImageFiles] = useState([]);
  const [extraImagePreviews, setExtraImagePreviews] = useState([]);

  // Load products & categories on mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategoryFilter, selectedPriceFilter, sortOption]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    }
  };

  const openDrawer = () => {
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    resetForm();
    setIsEditing(false);
    setEditingProductId(null);

    setExistingImages([]);
    setMainImageFile(null);
    setMainImagePreview(null);
    setExtraImageFiles([]);
    setExtraImagePreviews([]);
  };

  const resetForm = () => {
    setForm({
      name: "",
      brand: "",
      price: "",
      discount: "",
      cost: "",
      stock: "",
      category: "",
      color: "",
      description: "",
      ram: "",
      storage: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ---------- IMAGE HANDLERS ----------

  // replace main image (new upload)
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMainImageFile(file);
    setMainImagePreview(URL.createObjectURL(file));
  };

  // Extra images handler (max 4 NEW images)
  const handleExtraImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    let combined = [...extraImageFiles, ...files];
    if (combined.length > 4) {
      toast.warn("You can upload up to 4 additional images.");
      combined = combined.slice(0, 4);
    }

    setExtraImageFiles(combined);
    setExtraImagePreviews(combined.map((f) => URL.createObjectURL(f)));
  };

  // remove new image (not yet uploaded)
  const removeExtraImage = (index) => {
    const newFiles = [...extraImageFiles];
    const newPreviews = [...extraImagePreviews];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setExtraImageFiles(newFiles);
    setExtraImagePreviews(newPreviews);
  };

  // remove old image that already exists in DB
  const handleRemoveExistingImage = (index) => {
    // index is actual index in existingImages array
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------- DELETE & BULK DELETE ----------

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      fetchProducts();
      setSelectedProductIds((prev) => prev.filter((pid) => pid !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) {
      toast.warn("No products selected");
      return;
    }
    if (!window.confirm(`Delete ${selectedProductIds.length} selected products?`)) return;

    try {
      await Promise.all(selectedProductIds.map((id) => deleteProduct(id)));
      toast.success("Selected products deleted");
      setSelectedProductIds([]);
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete selected products");
    }
  };

  // ---------- CATEGORY MANAGEMENT ----------

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.warn("Category name is required");
      return;
    }

    try {
      await createCategory(newCategoryName.trim());
      toast.success("Category added");
      setNewCategoryName("");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Category already exists or failed");
    }
  };

  const handleCategoryNameChange = async (id, newName) => {
    try {
      await updateCategory(id, newName);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await deleteCategoryApi(id);
      toast.success("Category deleted");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category");
    }
  };

  // ---------- EDIT & DUPLICATE ----------

  const openEditDrawer = (product) => {
    setForm({
      name: product.name || "",
      brand: product.brand || "",
      price: product.price || "",
      discount: product.discount || "",
      cost: product.cost || "",
      stock: product.stock || "",
      category: product.category?._id || "",
      color: product.color || "",
      description: product.description || "",
      ram: product.ram || "",
      storage: product.storage || "",
    });

    const imgs = product.images || [];
    setExistingImages(imgs); // keep all DB images
    setMainImagePreview(imgs[0] || null);
    setMainImageFile(null);

    setExtraImageFiles([]);
    setExtraImagePreviews([]);

    setIsEditing(true);
    setEditingProductId(product._id);
    setDrawerOpen(true);
  };

const handleDuplicateProduct = (product) => {
  setForm({
    name: (product.name || "") + " (Copy)",
    brand: product.brand || "",
    price: product.price || "",
    discount: product.discount || "",
    cost: product.cost || "",
    stock: product.stock || "",
    category: product.category?._id || "",
    color: product.color || "",
    description: product.description || "",
    ram: product.ram || "",
    storage: product.storage || "",
  });

  // ✅ keep the images of original product
  const imgs = product.images || [];
  setExistingImages(imgs);
  setMainImagePreview(imgs[0] || null);
  setMainImageFile(null);          // no new upload yet
  setExtraImageFiles([]);
  setExtraImagePreviews([]);

  setIsEditing(false);             // treat as new
  setEditingProductId(null);
  setDrawerOpen(true);
};



  // ---------- SUBMIT ----------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.brand || !form.price || !form.cost || !form.category) {
      toast.warn("Please fill all required fields");
      return;
    }

    try {
      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fd.append(key, value);
        }
      });

      fd.append("existingImages", JSON.stringify(existingImages));

      if (mainImageFile) {
        fd.append("images", mainImageFile);
      }

      extraImageFiles.forEach((file) => fd.append("images", file));

      if (isEditing) {
        await updateProduct(editingProductId, fd);
        toast.success("Product updated");
      } else {
        await createProduct(fd);
        toast.success("Product created");
      }

      closeDrawer();
      fetchProducts();
    } catch (err) {
      console.error("Save product error:", err?.response?.data || err);
      toast.error(
        err?.response?.data?.message || "Failed to save product"
      );
    }
  };


  // ---------- QUICK VIEW ----------

  const openQuickView = (product) => {
    setQuickViewProduct(product);
    setShowQuickView(true);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
    setShowQuickView(false);
  };

  // Final price (live display)
  const priceNum = parseFloat(form.price) || 0;
  const discountNum = parseFloat(form.discount) || 0;
  const finalPrice = priceNum - (priceNum * discountNum) / 100;

  // ===============================
  // FILTER + SORT + PAGINATION
  // ===============================
  let processedProducts = [...products];

  processedProducts = processedProducts.filter((p) => {
    const name = p.name?.toLowerCase() || "";
    const brand = p.brand?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    const matchesSearch = name.includes(search) || brand.includes(search);

    const matchesCategory =
      selectedCategoryFilter === "" ||
      p.category?._id === selectedCategoryFilter;

    let matchesPrice = true;
    if (selectedPriceFilter) {
      const [min, max] = selectedPriceFilter.split("-").map(Number);
      const effectivePrice = p.finalPrice ?? p.price ?? 0;
      matchesPrice = effectivePrice >= min && effectivePrice <= max;
    }

    return matchesSearch && matchesCategory && matchesPrice;
  });

  processedProducts.sort((a, b) => {
    const priceA = a.finalPrice ?? a.price ?? 0;
    const priceB = b.finalPrice ?? b.price ?? 0;
    const stockA = a.stock ?? 0;
    const stockB = b.stock ?? 0;
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();

    switch (sortOption) {
      case "price-asc":
        return priceA - priceB;
      case "price-desc":
        return priceB - priceA;
      case "stock-asc":
        return stockA - stockB;
      case "stock-desc":
        return stockB - stockA;
      case "newest":
        return dateB - dateA;
      case "oldest":
        return dateA - dateB;
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(processedProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = processedProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const toggleSelectProduct = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isProductSelected = (id) => selectedProductIds.includes(id);

  const toggleSelectAllOnPage = () => {
    const idsOnPage = paginatedProducts.map((p) => p._id);
    const allSelected = idsOnPage.every((id) =>
      selectedProductIds.includes(id)
    );
    if (allSelected) {
      setSelectedProductIds((prev) =>
        prev.filter((id) => !idsOnPage.includes(id))
      );
    } else {
      setSelectedProductIds((prev) => [...new Set([...prev, ...idsOnPage])]);
    }
  };

  // ---------- RENDER ----------

  return (
    <div className="adm-page">
      <div className="adm-inner">
        {/* Header + Actions */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="adm-title">Products</h1>

          <div className={`d-flex gap-2 ${isMobile ? "flex-column w-100" : ""}`}>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </button>

            <button className="btn btn-primary" onClick={openDrawer}>
              + Add Product
            </button>

            <button
              className="btn btn-success"
              onClick={() => setShowCategoryPopup(true)}
            >
              + Manage Categories
            </button>
          </div>
        </div>

        {/* Search + Filters + Sort */}
        <div className="d-flex flex-wrap gap-3 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or brand..."
            style={{ maxWidth: "250px" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="form-select"
            style={{ maxWidth: "200px" }}
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ maxWidth: "200px" }}
            value={selectedPriceFilter}
            onChange={(e) => setSelectedPriceFilter(e.target.value)}
          >
            <option value="">Price Range</option>
            <option value="0-1000">₹0 - ₹1000</option>
            <option value="1000-5000">₹1000 - ₹5000</option>
            <option value="5000-20000">₹5000 - ₹20,000</option>
            <option value="20000-50000">₹20,000 - ₹50,000</option>
            <option value="50000-100000">₹50,000 - ₹100,000</option>
            <option value="100000-1000000">Above ₹100,000 </option>
          </select>

          <select
            className="form-select"
            style={{ maxWidth: "200px" }}
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="stock-asc">Stock: Low → High</option>
            <option value="stock-desc">Stock: High → Low</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Table */}
        <div className="chart-card" style={{ padding: 20 }}>
          {loading ? (
            <p>Loading products...</p>
          ) : processedProducts.length === 0 ? (
            <p>No products found. Try changing filters or add a product.</p>
          ) : isMobile ? (
    /* 📱 MOBILE CARD VIEW */
    paginatedProducts.map((p) => (
      <MobileProductCard
        key={p._id}
        product={p}
        isSelected={isProductSelected(p._id)}
        onSelect={() => toggleSelectProduct(p._id)}
        onView={() => openQuickView(p)}
        onEdit={() => openEditDrawer(p)}
        onDuplicate={() => handleDuplicateProduct(p)}
        onDelete={() => handleDeleteProduct(p._id)}
      />
    ))
  ) : (
            <>
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          onChange={toggleSelectAllOnPage}
                          checked={
                            paginatedProducts.length > 0 &&
                            paginatedProducts.every((p) =>
                              selectedProductIds.includes(p._id)
                            )
                          }
                        />
                      </th>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Brand</th>
                      <th>Price</th>
                      <th>Discount</th>
                      <th>Final Price</th>
                      <th>Stock</th>
                      <th>Category</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map((p) => {
                      const effectivePrice = p.finalPrice ?? p.price ?? 0;
                      const lowStock =
                        p.stock !== undefined && p.stock < 5 && p.stock > 0;
                      const outOfStock = p.stock === 0;

                      return (
                        <tr
                          key={p._id}
                          style={{
                            backgroundColor: outOfStock
                              ? "rgba(255,0,0,0.05)"
                              : lowStock
                              ? "rgba(255,165,0,0.05)"
                              : "transparent",
                          }}
                        >
                          <td>
                            <input
                              type="checkbox"
                              checked={isProductSelected(p._id)}
                              onChange={() => toggleSelectProduct(p._id)}
                            />
                          </td>
                          <td>
                            {p.images && p.images.length > 0 ? (
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                style={{
                                  width: 50,
                                  height: 50,
                                  objectFit: "cover",
                                  borderRadius: 6,
                                }}
                              />
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                          <td>{p.name}</td>
                          <td>{p.brand}</td>
                          <td>₹{p.price}</td>
                          <td>{p.discount || 0}%</td>
                          <td>₹{effectivePrice}</td>
                          <td>
                            {p.stock}
                            {outOfStock && (
                              <span className="badge bg-danger ms-2">
                                Out of Stock
                              </span>
                            )}
                            {lowStock && !outOfStock && (
                              <span className="badge bg-warning text-dark ms-2">
                                Low
                              </span>
                            )}
                          </td>
                          <td>{p.category?.name || "-"}</td>

                          <td className={`d-flex gap-2 ${isMobile ? "flex-column w-100" : ""}`}>
                            <button
                              className="action-btn view"
                              onClick={() => openQuickView(p)}
                              title="View"
                            >
                              <FiEye size={16} />
                            </button>

                            <button
                              className="action-btn edit"
                              onClick={() => openEditDrawer(p)}
                              title="Edit"
                            >
                              <FiEdit size={16} />
                            </button>

                            <button
                              className="action-btn duplicate"
                              onClick={() => handleDuplicateProduct(p)}
                              title="Duplicate"
                            >
                              <FiCopy size={16} />
                            </button>

                            <button
                              className="action-btn delete"
                              onClick={() => handleDeleteProduct(p._id)}
                              title="Delete"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {!isMobile && (
              <div className="d-flex justify-content-center mt-3 gap-2">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  Prev
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    className={`btn btn-sm ${
                      currentPage === index + 1
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Next
                </button>
              </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Slide-in Drawer */}
      {drawerOpen && (
        <>
          <div
            className="product-drawer-overlay"
            onClick={closeDrawer}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              zIndex: 998,
            }}
          />

          <div
            className="product-drawer"
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              height: "100vh",
              width: isMobile ? "100%" : "420px",
              maxWidth: "100%",
              background: "#fff",
              boxShadow: "-2px 0 10px rgba(0,0,0,0.15)",
              zIndex: 999,
              padding: "20px",
              overflowY: "auto",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">
                {isEditing ? "Edit Product" : "Add Product"}
              </h4>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={closeDrawer}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="mb-3">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Brand */}
              <div className="mb-3">
                <label className="form-label">Brand *</label>
                <input
                  type="text"
                  name="brand"
                  className="form-control"
                  value={form.brand}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Category */}
              <div className="mb-3">
                <label className="form-label">Category *</label>
                <select
                  name="category"
                  className="form-select"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price & Discount */}
              <div className="row">
                <div className="col-6 mb-3">
                  <label className="form-label">Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    name="price"
                    className="form-control"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-6 mb-3">
                  <label className="form-label">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    name="discount"
                    className="form-control"
                    value={form.discount}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Cost & Stock */}
              <div className="row">
                <div className="col-6 mb-3">
                  <label className="form-label">Cost (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    name="cost"
                    className="form-control"
                    value={form.cost}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-6 mb-3">
                  <label className="form-label">Stock</label>
                  <input
                    type="number"
                    min="0"
                    name="stock"
                    className="form-control"
                    value={form.stock}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Final price display */}
              <div className="mb-2 small text-muted">
                Final selling price (after discount):{" "}
                <strong>₹{finalPrice.toFixed(2)}</strong>
              </div>

              {/* Color */}
              <div className="mb-3">
                <label className="form-label">Color</label>
                <input
                  type="text"
                  name="color"
                  className="form-control"
                  value={form.color}
                  onChange={handleChange}
                />
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              {/* Main Image */}
              <div className="mb-3">
                <label className="form-label">Main Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleMainImageChange}
                />
                {mainImagePreview && (
                  <div className="mt-2">
                    <img
                      src={mainImagePreview}
                      alt="Main preview"
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Extra Images */}
              <div className="mb-3">
                <label className="form-label">Additional Images (up to 4)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  multiple
                  onChange={handleExtraImagesChange}
                />

                {/* Existing (old) images beyond the main */}
                {existingImages.length > 1 && (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {existingImages.slice(1).map((src, idx) => (
                      <div key={`old-${idx}`} style={{ position: "relative" }}>
                        <img
                          src={src}
                          alt={`Existing ${idx}`}
                          style={{
                            width: 70,
                            height: 70,
                            objectFit: "cover",
                            borderRadius: 6,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(idx + 1)}
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            border: "none",
                            borderRadius: "50%",
                            width: 20,
                            height: 20,
                            fontSize: 12,
                            background: "#dc3545",
                            color: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New extra images */}
                {extraImagePreviews.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {extraImagePreviews.map((src, idx) => (
                      <div key={`new-${idx}`} style={{ position: "relative" }}>
                        <img
                          src={src}
                          alt={`Extra ${idx}`}
                          style={{
                            width: 70,
                            height: 70,
                            objectFit: "cover",
                            borderRadius: 6,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeExtraImage(idx)}
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            border: "none",
                            borderRadius: "50%",
                            width: 20,
                            height: 20,
                            fontSize: 12,
                            background: "#dc3545",
                            color: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary w-100 mt-3">
                Save Product
              </button>
            </form>
          </div>
        </>
      )}

      {/* Category Popup & Quick View remain same as your code */}
      {/* ... your existing category popup and quick view JSX stays unchanged ... */}
      {showCategoryPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              width: "400px",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            }}
          >
            <h5 className="mb-3">Manage Categories</h5>

            <div className="d-flex gap-2 mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="New category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <button className="btn btn-success" onClick={handleAddCategory}>
                Add
              </button>
            </div>

            <hr />

            <ul className="list-group">
              {categories.map((cat) => (
                <li
                  key={cat._id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <input
                    type="text"
                    className="form-control me-2"
                    defaultValue={cat.name}
                    onBlur={(e) =>
                      handleCategoryNameChange(cat._id, e.target.value)
                    }
                  />
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteCategory(cat._id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>

            <div className="text-end mt-3">
              <button
                className="btn btn-secondary"
                onClick={() => setShowCategoryPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuickView && quickViewProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2100,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              width: "500px",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Product Details</h5>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={closeQuickView}
              >
                Close
              </button>
            </div>

            {quickViewProduct.images &&
              quickViewProduct.images.length > 0 && (
                <div className="mb-3 text-center">
                  <img
                    src={quickViewProduct.images[0]}
                    alt={quickViewProduct.name}
                    style={{
                      width: "100%",
                      maxHeight: 250,
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                </div>
              )}

            <h5>{quickViewProduct.name}</h5>
            <p className="text-muted">{quickViewProduct.brand}</p>

            <p>
              <strong>Price:</strong> ₹
              {quickViewProduct.finalPrice ?? quickViewProduct.price}
              {quickViewProduct.discount ? (
                <span className="text-muted ms-2">
                  <del>₹{quickViewProduct.price}</del> (
                  {quickViewProduct.discount}% off)
                </span>
              ) : null}
            </p>

            <p>
              <strong>Stock:</strong> {quickViewProduct.stock}{" "}
              {quickViewProduct.stock === 0 && (
                <span className="badge bg-danger ms-2">Out of Stock</span>
              )}
            </p>

            <p>
              <strong>Category:</strong>{" "}
              {quickViewProduct.category?.name || "-"}
            </p>

            {quickViewProduct.color && (
              <p>
                <strong>Color:</strong> {quickViewProduct.color}
              </p>
            )}

            {quickViewProduct.description && (
              <p>
                <strong>Description:</strong> {quickViewProduct.description}
              </p>
            )}

            {quickViewProduct.images &&
              quickViewProduct.images.length > 1 && (
                <>
                  <hr />
                  <p className="mb-2">
                    <strong>More Images:</strong>
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    {quickViewProduct.images.slice(1).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Extra ${idx}`}
                        style={{
                          width: 70,
                          height: 70,
                          objectFit: "cover",
                          borderRadius: 6,
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
