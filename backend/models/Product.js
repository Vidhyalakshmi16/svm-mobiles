import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema(
  {
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

    colors: [{ type: String }],        // Array of color options

    description: { type: String },

    specifications: { type: Map, of: String }, // Dynamic key-value specs (Display, Processor, RAM, etc.)

    reviews: [reviewSchema],

    images: [{ type: String }],

    createdAt: { type: Date, default: Date.now },
  },
  {
    // Ensure Map fields (specifications) are sent to frontend as plain objects
    toJSON: { flattenMaps: true },
    toObject: { flattenMaps: true },
  }
);

export default mongoose.model("Product", productSchema);



