import express from "express";
import ReturnRequest from "../models/ReturnRequest.js";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

/* =========================================
   CUSTOMER – Create Return Request
========================================= */
router.post("/", protect, async (req, res) => {
  try {
    const { orderId, reason, images, video } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user.userId)
      return res.status(403).json({ message: "Not your order" });

    if (order.status !== "COMPLETED")
      return res.status(400).json({ message: "Return not allowed" });

    const ret = await ReturnRequest.create({
      orderId,
      userId: req.user.userId,
      reason,
      images,
      video,
      status: "REQUESTED",
    });

    order.status = "RETURNED";
    await order.save();

    res.json({ message: "Return request submitted", ret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Return request failed" });
  }
});

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

    ret.status = status;
    await ret.save();

    // EMAIL WHEN APPROVED
    if (status === "APPROVED") {
      await sendEmail({
        to: ret.userId.email,
        subject: "Return Approved",
        html: `
          <h2>Your return has been approved</h2>
          <p>Order #${String(ret.orderId._id).slice(-8)}</p>
          <p>Please courier the product to our warehouse.</p>
          <p>Once received, your refund will be processed.</p>
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
