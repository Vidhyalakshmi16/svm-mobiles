import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import ReturnRequest from "../models/ReturnRequest.js";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

/* ================================
   STORAGE CONFIG
================================ */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = "uploads/returns";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

/* =========================================
   CUSTOMER – Create Return Request
========================================= */
router.post(
  "/",
  protect,
  upload.array("images", 6), // multiple images
  async (req, res) => {
    try {
      const { orderId, reason, video, name, phone } = req.body;

      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });

      if (order.user.toString() !== req.user.userId)
        return res.status(403).json({ message: "Not your order" });

      if (order.status !== "COMPLETED")
        return res.status(400).json({ message: "Return not allowed" });

      if (!req.files || req.files.length === 0)
        return res.status(400).json({ message: "Product images required" });

      // convert uploaded files → URLs
      const images = req.files.map((f) => `/uploads/returns/${f.filename}`);

      const ret = await ReturnRequest.create({
        orderId,
        userId: req.user.userId,
        name,
        phone,
        reason,
        images,
        video,
        status: "REQUESTED",
      });

      // DO NOT mark order as refunded yet
      order.status = "RETURNED";
      await order.save();

      res.json({ message: "Return request submitted", ret });
    } catch (err) {
      console.error("Return create error:", err);
      res.status(500).json({ message: "Return request failed" });
    }
  }
);

/* =========================================
   ADMIN – Get all return requests
========================================= */
router.get("/admin", protect, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin only" });

  const returns = await ReturnRequest.find()
    .populate("orderId")
    .populate("userId")
    .sort({ createdAt: -1 });

  res.json(returns);
});

/* =========================================
   ADMIN – Update return status
========================================= */
router.patch("/admin/:id/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Admin only" });

    const { status } = req.body;

    const ret = await ReturnRequest.findById(req.params.id)
      .populate("orderId")
      .populate("userId");

    if (!ret) return res.status(404).json({ message: "Return not found" });

    const order = ret.orderId;
    ret.status = status;
    await ret.save();

    // WHEN APPROVED - prepare for refund
    if (status === "APPROVED") {
      // Calculate refund amount (product total only, not delivery/platform fees)
      const refundAmount = order.items.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

      order.status = "REFUND_PROCESSING";
      order.refundAmount = refundAmount;
      order.refundReason = "Product returned by customer";
      await order.save();

      await sendEmail({
        to: ret.userId.email,
        subject: "Return Approved",
        html: `
          <h2>Your return has been approved</h2>
          <p>Order #${String(ret.orderId._id).slice(-8)}</p>
          <p><strong>Refund Amount:</strong> ₹${refundAmount.toLocaleString("en-IN")}</p>
          <p>Please courier the product to our warehouse.</p>
          <p>Once received, your refund will be processed.</p>
          <br/>
          <b>Sri Vaari Mobiles</b>
        `,
      });
    }

    // WHEN REJECTED - revert order to completed status
    if (status === "REJECTED") {
      order.status = "COMPLETED";
      await order.save();

      await sendEmail({
        to: ret.userId.email,
        subject: "Return Request Rejected",
        html: `
          <h2>Your return request has been rejected</h2>
          <p>Order #${String(ret.orderId._id).slice(-8)}</p>
          <p>Your return could not be processed at this time.</p>
          <br/>
          <b>Sri Vaari Mobiles</b>
        `,
      });
    }

    res.json(ret);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Status update failed" });
  }
});

export default router;
