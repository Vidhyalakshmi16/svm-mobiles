import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";
import sendEmail from "../utils/sendEmail.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ---------------- CREATE RAZORPAY ORDER ----------------
export const createPaymentOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ message: "Amount and orderId required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Prevent re-payment
    if (order.status !== "payment pending") {
      return res.status(400).json({
        message: `Cannot pay for order with status ${order.status}`,
      });
    }

    const options = {
      amount: amount * 100, // ₹ → paise
      currency: "INR",
      receipt: `order_${orderId}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (err) {
    console.error("Create payment order error:", err);
    res.status(500).json({ message: "Failed to create payment order" });
  }
};

// ---------------- VERIFY PAYMENT ----------------
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ❌ If any payment detail missing → FAILED
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      order.status = "failed";
      await order.save();

      return res.status(400).json({
        message: "Payment failed or cancelled",
      });
    }

    // 🔐 Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    // ❌ Signature mismatch → FAILED
    if (expectedSignature !== razorpay_signature) {
      order.status = "failed";
      await order.save();

      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    // ✅ SUCCESS
    order.status = "paid";
    order.paymentInfo = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    };

    await order.save();

    // 📧 SEND EMAIL ONLY AFTER SUCCESS
    if (order.customer?.email) {
      await sendEmail({
        to: order.customer.email,
        subject: "Order Confirmed – Sri Vaari Mobiles 🛒",
        html: `
          <h2>Hello ${order.customer.name || "Customer"}</h2>
          <p>Your payment was <strong>successful</strong> and your order is confirmed.</p>

          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
          <p><strong>Total Paid:</strong> ₹${order.total}</p>

          <p>Thank you for shopping with <strong>Sri Vaari Mobiles</strong>.</p>
        `,
      });
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (err) {
    console.error("Verify payment error:", err);

    // Safety fallback
    if (req.body?.orderId) {
      await Order.findByIdAndUpdate(req.body.orderId, {
        status: "failed",
      });
    }

    res.status(500).json({
      message: "Payment verification failed",
    });
  }
};

export const retryPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!["payment pending", "failed"].includes(order.status)) {
      return res.status(400).json({
        message: `Payment cannot be retried for status ${order.status}`,
      });
    }

    const options = {
      amount: order.total * 100,
      currency: "INR",
      receipt: `order_${orderId}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Reset order state
    order.status = "payment pending";
    order.paymentInfo = undefined;
    await order.save();

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (err) {
    console.error("Retry payment error:", err);
    res.status(500).json({ message: "Failed to retry payment" });
  }
};

