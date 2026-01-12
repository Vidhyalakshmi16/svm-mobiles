import mongoose from "mongoose";

const returnSchema = new mongoose.Schema(
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

    reason: {
      type: String,
      required: true,
    },

    images: [String],
    video: String,

    courierName: String,
    trackingNumber: String,

    status: {
      type: String,
      enum: ["REQUESTED", "APPROVED", "IN_TRANSIT", "RECEIVED", "REFUNDED", "REJECTED"],
      default: "REQUESTED",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ReturnRequest", returnSchema);
