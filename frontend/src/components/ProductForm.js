import React, { useState, useEffect } from "react";

const ProductForm = ({ onSubmit, editingProduct }) => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: "",
  });

  useEffect(() => {
    if (editingProduct) setProduct(editingProduct);
  }, [editingProduct]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(product);
    setProduct({ name: "", description: "", price: "", category: "", image: "", stock: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-100 rounded-xl">
      <h2 className="text-xl font-semibold mb-3">
        {editingProduct ? "Edit Product" : "Add Product"}
      </h2>
      {["name", "description", "price", "category", "image", "stock"].map((field) => (
        <input
          key={field}
          type="text"
          name={field}
          value={product[field]}
          onChange={handleChange}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          className="block w-full p-2 my-2 border rounded-lg"
          required
        />
      ))}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
        {editingProduct ? "Update" : "Add"}
      </button>
    </form>
  );
};

export default ProductForm;
