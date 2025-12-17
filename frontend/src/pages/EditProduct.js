import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

const EditProduct = () => {
  const { id } = useParams(); // Get product ID from URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    stock: "",
  });

  // 🔹 Fetch product details when page loads
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Later this will come from backend
        // const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        // setFormData(res.data);

        console.log("Editing product ID:", id);
      } catch (err) {
        console.error("Failed to fetch product:", err);
      }
    };

    fetchProduct();
  }, [id]);

  // 🔹 Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Handle update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Example backend update call
      // await axios.put(`http://localhost:5000/api/products/update/${id}`, formData);

      alert("✅ Product updated successfully!");
      navigate("/admin-products");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update product!");
    }
  };

  return (
    <div className="container py-5" style={{ marginTop: "80px" }}>
      <motion.div
        className="card shadow-lg border-0 p-4 mx-auto"
        style={{ maxWidth: "700px" }}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-center fw-bold mb-4 text-primary">
          ✏️ Edit Product
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Product Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Price (₹)</label>
            <input
              type="number"
              name="price"
              className="form-control"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              rows="3"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label">Image URL</label>
            <input
              type="text"
              name="image"
              className="form-control"
              value={formData.image}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Stock Quantity</label>
            <input
              type="number"
              name="stock"
              className="form-control"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </div>

          <div className="text-center mt-4">
            <button type="submit" className="btn btn-success px-4">
              Update Product
            </button>
            <button
              type="button"
              className="btn btn-secondary ms-3 px-4"
              onClick={() => navigate("/admin-products")}
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProduct;
