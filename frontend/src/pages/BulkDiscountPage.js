import React, { useEffect, useState } from "react";
import { getCategories, applyCategoryDiscount } from "../services/api";


const BulkDiscountPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [discount, setDiscount] = useState("");

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error loading categories", err);
      }
    };
    loadCategories();
  }, []);

  // Apply discount to all products in selected category
  const handleApplyDiscount = async () => {
    if (!selectedCategory || discount === "") {
      alert("Please select a category and enter discount percentage.");
      return;
    }

    try {
      const response = await applyCategoryDiscount({
        categoryId: selectedCategory,
        discount: Number(discount),
      });

      alert(response.message);

      // Reset fields
      setSelectedCategory("");
      setDiscount("");

    } catch (err) {
      console.error("Error applying discount:", err);
      alert("Failed to apply discount");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">Bulk Discount Manager</h2>

      <div className="card p-4 shadow-sm">

        {/* Category Dropdown */}
        <label className="fw-bold">Select Category</label>
        <select
          className="form-control mt-2"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">-- Select Category --</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Discount Input */}
        <label className="fw-bold mt-4">Discount %</label>
        <input
          type="number"
          min="0"
          max="90"
          className="form-control mt-2"
          placeholder="Enter discount (e.g., 10)"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
        />

        {/* Button */}
        <button
          className="btn btn-primary mt-4 w-25"
          onClick={handleApplyDiscount}
        >
          Apply Discount
        </button>

      </div>
    </div>
  );
};

export default BulkDiscountPage;
