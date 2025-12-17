import React, { useEffect, useState } from "react";
import { getCategories, addCategory, updateCategory, deleteCategory } from "../services/api";
import { motion } from "framer-motion";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "" });
  const [editCategory, setEditCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return alert("Category name cannot be empty!");
    try {
      await addCategory(newCategory);
      setNewCategory({ name: "" });
      fetchCategories();
    } catch (err) {
      console.error("Error adding category:", err);
      alert("Failed to add category. Check backend or network.");
    }
  };

  const handleEditCategory = async () => {
    try {
      await updateCategory(editCategory._id, { name: editCategory.name });
      setEditCategory(null);
      fetchCategories();
    } catch (err) {
      console.error("Error updating category:", err);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  return (
    <motion.div className="p-6 bg-gray-50 min-h-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="text-3xl font-bold mb-6 text-gray-700">Category Management</h2>

      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          placeholder="Enter category name"
          className="border p-2 rounded w-1/3"
          value={newCategory.name}
          onChange={(e) => setNewCategory({ name: e.target.value })}
        />
        <button onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Add Category
        </button>
      </div>

      <table className="w-full bg-white shadow-md rounded overflow-hidden">
        <thead className="bg-blue-100 text-gray-700">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat._id} className="border-b">
              <td className="p-3">{cat.name}</td>
              <td className="p-3 flex gap-3">
                <button
                  onClick={() => setEditCategory(cat)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editCategory && (
        <div className="mt-6 bg-gray-100 p-4 rounded shadow-md w-1/2">
          <h3 className="font-semibold mb-2">Edit Category</h3>
          <input
            type="text"
            value={editCategory.name}
            onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
            className="border p-2 rounded w-full mb-3"
          />
          <button onClick={handleEditCategory} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
            Save Changes
          </button>
        </div>
      )}
    </motion.div>
  );
}
