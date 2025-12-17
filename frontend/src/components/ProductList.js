import React from "react";

const ProductList = ({ products, onEdit, onDelete }) => (
  <div className="mt-6">
    <h2 className="text-xl font-semibold mb-3">All Products</h2>
    <table className="w-full border">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 border">Name</th>
          <th className="p-2 border">Price</th>
          <th className="p-2 border">Category</th>
          <th className="p-2 border">Stock</th>
          <th className="p-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p._id}>
            <td className="p-2 border">{p.name}</td>
            <td className="p-2 border">₹{p.price}</td>
            <td className="p-2 border">{p.category}</td>
            <td className="p-2 border">{p.stock}</td>
            <td className="p-2 border">
              <button onClick={() => onEdit(p)} className="bg-yellow-500 text-white px-2 py-1 rounded mr-2">
                Edit
              </button>
              <button onClick={() => onDelete(p._id)} className="bg-red-600 text-white px-2 py-1 rounded">
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ProductList;
