import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: String,
    brand: String,
    price: Number,
    finalPrice: Number,
    discount: Number,
    quantity: { type: Number, default: 1 },
    image: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // 🔐 Logged-in user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customer: {
      name: String,
      phone: String,
      address: String,
      city: String,
      pincode: String,
      email: String,
    },

    items: [orderItemSchema],

    paymentMethod: {
      type: String,
      enum: ["UPI"],
      default: "UPI",
    },

    // 💰 Price breakup
    subtotal: Number,
    deliveryFee: Number,
    platformFee: Number,
    total: Number,

    // 🔁 PAYMENT + ORDER STATUS
    status: {
      type: String,
      enum: [
        "payment pending", // order created, payment not done
        "paid",            // payment success
        "in progress",     // admin processing
        "completed",       // delivered
        "cancelled",       // cancelled by user/admin
        "failed",          // payment failed
      ],
      default: "payment pending",
    },

    // 🔐 Razorpay info (after payment)
    paymentInfo: {
      razorpay_order_id: String,
      razorpay_payment_id: String,
      razorpay_signature: String,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
