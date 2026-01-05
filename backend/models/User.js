// backend/models/ServiceRequest.js
import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
    // 🔐 link to logged-in user (customer)
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // basic details
    name: String,
    phone: String,
    email: String,

    // device / issue details
    deviceType: String,
    mobileBrand: String,
    mobileModel: String,
    issueType: String,

    preferredDate: String,
    preferredTime: String,

    message: String,

    status: {
      type: String,
      enum: ["New", "In Progress", "Completed", "Cancelled"],
      default: "New",
    },
  },
  { timestamps: true }
);

const ServiceRequest = mongoose.model(
  "ServiceRequest",
  serviceRequestSchema
);

export default ServiceRequest;
