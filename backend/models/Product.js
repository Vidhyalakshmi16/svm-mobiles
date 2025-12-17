import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  finalPrice: { type: Number },       // optional stored final price
  cost: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },

  stock: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },

  color: { type: String },        
 // e.g. "1 Year", "6 Months"

  description: { type: String },

  images: [{ type: String }],

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Product", productSchema);



