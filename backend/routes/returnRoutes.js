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

// Warehouse address (can be configured in environment variable)
const WAREHOUSE_ADDRESS = {
  name: "Sri Vaari Mobiles Warehouse",
  phone: process.env.WAREHOUSE_PHONE || "+91-XXXX-XXXX-XX",
  address: process.env.WAREHOUSE_ADDRESS || "Warehouse, Plot No. XYZ",
  city: process.env.WAREHOUSE_CITY || "Hyderabad",
  pincode: process.env.WAREHOUSE_PINCODE || "500001",
};

/* =========================================
   CUSTOMER – Create Return Request
   Status: PROCESSING
========================================= */
router.post(
  "/",
  protect,
  upload.array("images", 6), // multiple images
  async (req, res) => {
    try {
      const { orderId, reason, video, name, phone } = req.body;

      console.log("📦 Return request received:", { orderId, name, phone, reason, hasVideo: !!video, fileCount: req.files?.length });

      const order = await Order.findById(orderId).populate("user", "email");
      if (!order) {
        console.error("❌ Order not found:", orderId);
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.user._id.toString() !== req.user.userId) {
        console.error("❌ Not user's order. Order user:", order.user._id, "Request user:", req.user.userId);
        return res.status(403).json({ message: "Not your order" });
      }

      if (order.status !== "COMPLETED") {
        console.error("❌ Return not allowed. Order status:", order.status);
        return res.status(400).json({ message: `Return not allowed. Order status is ${order.status}` });
      }

      if (!req.files || req.files.length === 0) {
        console.error("❌ No images uploaded");
        return res.status(400).json({ message: "Product images required" });
      }

      // convert uploaded files → URLs
      const images = req.files.map((f) => `/uploads/returns/${f.filename}`);

      const ret = await ReturnRequest.create({
        orderId,
        userId: req.user.userId,
        email: order.user.email,
        name,
        phone,
        reason,
        images,
        video,
        status: "PROCESSING", // ✅ NEW: Status is PROCESSING (admin reviewing)
      });

      console.log("✅ Return request created:", ret._id, "Status: PROCESSING");
      
      // Send email to customer
      await sendEmail({
        to: order.user.email,
        subject: "Return Request Received - Processing",
        html: `
          <h2>Your return request has been received</h2>
          <p>Order #${String(orderId).slice(-8)}</p>
          <p><strong>Status:</strong> Processing</p>
          <p>Our team is reviewing your request. You will be notified once it's approved.</p>
          <br/>
          <b>Sri Vaari Mobiles</b>
        `,
      });

      res.json({ message: "Return request submitted. Awaiting admin review.", ret });
    } catch (err) {
      console.error("❌ Return create error:", err.message);
      res.status(500).json({ message: `Return request failed: ${err.message}` });
    }
  }
);

/* =========================================
   ADMIN – Get all return requests
   Shows user details, images, and reason
========================================= */
router.get("/admin", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Admin only" });

    const returns = await ReturnRequest.find()
      .populate("orderId", "total items -_id")
      .populate("userId", "name email phone address -_id")
      .populate("refundProcessedBy", "name email -_id")
      .sort({ createdAt: -1 });

    console.log("📋 Fetched", returns.length, "return requests");
    res.json(returns);
  } catch (err) {
    console.error("❌ Fetch returns error:", err.message);
    res.status(500).json({ message: "Failed to fetch returns" });
  }
});

/* =========================================
   ADMIN – Update return status
   Handles: RETURN_REQUEST_APPROVED, RECEIVED, REFUNDED, REJECTED
========================================= */
router.patch("/admin/:id/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Admin only" });

    const { status, note } = req.body;

    console.log("🔄 Updating return status:", req.params.id, "→", status);

    const ret = await ReturnRequest.findById(req.params.id)
      .populate("orderId")
      .populate("userId");

    if (!ret) {
      console.error("❌ Return not found:", req.params.id);
      return res.status(404).json({ message: "Return not found" });
    }

    const order = ret.orderId;
    ret.status = status;
    if (note) ret.adminNote = note;

    // ✅ ADMIN APPROVES - Send warehouse address
    if (status === "RETURN_REQUEST_APPROVED") {
      console.log("✅ Return approved. Sending warehouse address...");

      // Calculate refund amount (product total only, not delivery/platform fees)
      const refundAmount = order.items.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
      
      ret.refundAmount = refundAmount;
      ret.refundApprovedBy = req.user.userId;
      ret.refundApprovedAt = new Date();
      ret.warehouseAddress = WAREHOUSE_ADDRESS;

      await ret.save();

      // Send approval email with warehouse address
      await sendEmail({
        to: ret.email,
        subject: "Return Request Approved - Send Package Here",
        html: `
          <h2>✅ Your return request has been APPROVED</h2>
          <p>Order #${String(order._id).slice(-8)}</p>
          
          <h3>Refund Amount: ₹${refundAmount.toLocaleString("en-IN")}</h3>
          <p>This includes product cost only.</p>
          
          <h3>📮 Send Your Package To:</h3>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <p><strong>${WAREHOUSE_ADDRESS.name}</strong></p>
            <p>${WAREHOUSE_ADDRESS.address}</p>
            <p>${WAREHOUSE_ADDRESS.city} - ${WAREHOUSE_ADDRESS.pincode}</p>
            <p>Phone: ${WAREHOUSE_ADDRESS.phone}</p>
          </div>
          
          <h3>📋 Please Include:</h3>
          <ul>
            <li>Order ID: #${String(order._id).slice(-8)}</li>
            <li>Your Name: ${ret.name}</li>
            <li>Your Phone: ${ret.phone}</li>
          </ul>
          
          <p>Once we receive and verify your product, the refund will be processed.</p>
          <br/>
          <b>Sri Vaari Mobiles</b>
        `,
      });

      console.log("✅ Approval email sent to", ret.email);
    }

    // ❌ ADMIN REJECTS
    if (status === "REJECTED") {
      console.log("❌ Return rejected");
      
      await ret.save();

      await sendEmail({
        to: ret.email,
        subject: "Return Request Rejected",
        html: `
          <h2>❌ Your return request has been REJECTED</h2>
          <p>Order #${String(order._id).slice(-8)}</p>
          
          ${ret.adminNote ? `<p><strong>Reason:</strong> ${ret.adminNote}</p>` : ""}
          
          <p>If you have questions, please contact our support team.</p>
          <br/>
          <b>Sri Vaari Mobiles</b>
        `,
      });

      console.log("❌ Rejection email sent to", ret.email);
    }

    // 📦 PRODUCT RECEIVED
    if (status === "RECEIVED") {
      console.log("📦 Product received at warehouse");
      await ret.save();

      await sendEmail({
        to: ret.email,
        subject: "Your Return Package Received",
        html: `
          <h2>📦 Your return package has been received</h2>
          <p>Order #${String(order._id).slice(-8)}</p>
          <p>We are now verifying the product condition.</p>
          <p>Refund will be processed soon.</p>
          <br/>
          <b>Sri Vaari Mobiles</b>
        `,
      });

      console.log("📦 Receipt email sent to", ret.email);
    }

    // ✅ REFUND PROCESSED - MANUAL refund
    if (status === "REFUNDED") {
      console.log("✅ Manual refund processed");

      ret.refundProcessedBy = req.user.userId;
      ret.refundProcessedAt = new Date();
      await ret.save();

      // Update order status to REFUNDED
      order.status = "REFUNDED";
      order.refundedAt = new Date();
      await order.save();

      await sendEmail({
        to: ret.email,
        subject: "Refund Processed Successfully",
        html: `
          <h2>✅ Your refund has been processed</h2>
          <p>Order #${String(order._id).slice(-8)}</p>
          
          <h3 style="color: green;">Refund Amount: ₹${ret.refundAmount.toLocaleString("en-IN")}</h3>
          
          <p>The amount has been sent to your original payment method.</p>
          <p>Please allow 3-5 business days for the amount to appear in your account.</p>
          <br/>
          <b>Sri Vaari Mobiles</b>
        `,
      });

      console.log("✅ Refund email sent to", ret.email);
    }

    res.json({ message: "Status updated successfully", ret });
  } catch (err) {
    console.error("❌ Status update error:", err.message);
    res.status(500).json({ message: `Status update failed: ${err.message}` });
  }
});

export default router;
