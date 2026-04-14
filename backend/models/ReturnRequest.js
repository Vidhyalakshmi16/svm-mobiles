import mongoose from "mongoose";

const returnRequestSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Customer filled info
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
    },

    reason: {
      type: String,
      required: true,
    },

    images: [
      {
        type: String, // uploaded image URLs
        required: true,
      },
    ],

    video: {
      type: String, // unboxing video link (optional)
      default: "",
    },

    // Return processing lifecycle
    status: {
      type: String,
      enum: [
        "PROCESSING",              // customer submitted - admin reviewing
        "RETURN_REQUEST_APPROVED", // approved - send package to warehouse
        "RECEIVED",                // warehouse received product
        "REJECTED",                // admin rejected
        "REFUNDED",                // manual refund processed
      ],
      default: "PROCESSING",
    },

    // Warehouse/Return address
    warehouseAddress: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },

    // Refund details
    refundAmount: {
      type: Number,
      default: 0,
    },

    refundReason: {
      type: String,
      default: "",
    },

    refundProcessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    refundProcessedAt: {
      type: Date,
      default: null,
    },

    refundApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    refundApprovedAt: {
      type: Date,
      default: null,
    },

    // Admin notes/comments
    adminNote: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ReturnRequest", returnRequestSchema);
