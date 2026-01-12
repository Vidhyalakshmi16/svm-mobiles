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

    // 🔁 ORDER + REFUND STATUS
    status: {
      type: String,
      enum: [
        "PAYMENT_PENDING",
        "PAID",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "RETURNED",
        "REFUND_PROCESSING",
        "REFUNDED",
        "FAILED"
      ],
      default: "PAYMENT_PENDING"
    },

    // 💳 Razorpay IDs
    // This will be filled AFTER payment success
    razorpayPaymentId: {
      type: String,
      default: null
    },

    // This will be filled AFTER refund success
    razorpayRefundId: {
      type: String,
      default: null
    },

    refundReason: {
      type: String,
      default: null
    },

    refundedAt: {
      type: Date,
      default: null
    },

    // 🔐 Razorpay verification data (existing – DO NOT BREAK)
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
