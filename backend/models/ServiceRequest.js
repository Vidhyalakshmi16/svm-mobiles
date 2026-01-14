import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    name: String,
    phone: String,
    email: String,

    deviceType: String,
    mobileBrand: String,
    mobileModel: String,
    issueType: String,

    preferredDate: String,
    preferredTime: String,

    message: String,

    status: {
      type: String,
      enum: ["PLACED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "PLACED",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ServiceRequest", serviceRequestSchema);
