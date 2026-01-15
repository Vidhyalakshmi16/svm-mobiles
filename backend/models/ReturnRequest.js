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
        "REQUESTED",    // customer submitted
        "APPROVED",     // admin approved
        "REJECTED",     // admin rejected
        "IN_TRANSIT",   // customer shipped back
        "RECEIVED",     // shop received product
        "REFUNDED",     // money returned
      ],
      default: "REQUESTED",
    },

    adminNote: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ReturnRequest", returnRequestSchema);
