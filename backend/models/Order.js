// backend/models/Order.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // product reference
    name: String,
    brand: String,
    price: Number,
    finalPrice: Number,
    discount: Number,
    quantity: { type: Number, default: 1 },
    image: String,
  },
  { _id: false } // we don't need separate _id for each item
);

const orderSchema = new mongoose.Schema(
  {
    // 🔐 link order to logged-in user
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    customer: {
      name: String,
      phone: String,
      address: String,
      city: String,
      pincode: String,
    },

    // items in this order
    items: [orderItemSchema],

    paymentMethod: { type: String, default: "Cash on Delivery" },

    // price breakup (same as in Checkout)
    subtotal: Number,
    deliveryFee: Number,
    platformFee: Number,
    total: Number,

    status: {
      type: String,
      enum: ["Placed", "In Progress", "Completed", "Cancelled"],
      default: "Placed",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
