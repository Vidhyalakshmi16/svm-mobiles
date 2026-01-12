import express from "express";
import ReturnRequest from "../models/ReturnRequest.js";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET all return requests (Admin)
 */
router.get("/", protect, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin only" });

  const returns = await ReturnRequest.find()
    .populate("orderId")
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  res.json(returns);
});

/**
 * Update return status
 */
router.patch("/:id/status", protect, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin only" });

  const { status } = req.body;

  const allowed = [
    "APPROVED",
    "REJECTED",
    "IN_TRANSIT",
    "RECEIVED",
    "REFUNDED",
  ];

  if (!allowed.includes(status))
    return res.status(400).json({ message: "Invalid status" });

  const ret = await ReturnRequest.findById(req.params.id);
  if (!ret) return res.status(404).json({ message: "Not found" });

  ret.status = status;
  await ret.save();

  // Sync order status when approved or received
  if (status === "APPROVED") {
    await Order.findByIdAndUpdate(ret.orderId, {
      status: "RETURNED",
    });
  }

  res.json(ret);
});

export default router;
