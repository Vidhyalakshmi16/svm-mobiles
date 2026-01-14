import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";
import sendEmail from "../utils/sendEmail.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ================= CREATE RAZORPAY ORDER ================= */
export const createPaymentOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ message: "Amount and orderId required" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Only allow payment if order is PAYMENT_PENDING
    if (order.status !== "PAYMENT_PENDING") {
      return res.status(400).json({
        message: `Cannot pay for order with status ${order.status}`,
      });
    }

    const options = {
      amount: amount * 100,
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

/* ================= VERIFY PAYMENT ================= */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ❌ Missing payment data → FAILED
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      order.status = "FAILED";
      await order.save();
      return res.status(400).json({ message: "Payment failed or cancelled" });
    }

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    // ❌ Signature mismatch → FAILED
    if (expectedSignature !== razorpay_signature) {
      order.status = "FAILED";
      await order.save();
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // ✅ SUCCESS
    order.status = "PAID";
    order.paymentInfo = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    };

    await order.save();

    // 📧 Email after success
    if (order.customer?.email) {
      await sendEmail({
        to: order.customer.email,
        subject: "Order Confirmed – Sri Vaari Mobiles 🛒",
        html: `
          <h2>Hello ${order.customer.name || "Customer"}</h2>
          <p>Your payment was <strong>successful</strong>.</p>
          <p><b>Order ID:</b> #${String(order._id).slice(-8)}</p>
          <p><b>Amount Paid:</b> ₹${order.total}</p>
          <p>Thank you for shopping with Sri Vaari Mobiles.</p>
        `,
      });
    }

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (err) {
    console.error("Verify payment error:", err);

    if (req.body?.orderId) {
      await Order.findByIdAndUpdate(req.body.orderId, {
        status: "FAILED",
      });
    }

    res.status(500).json({ message: "Payment verification failed" });
  }
};

/* ================= RETRY PAYMENT ================= */
export const retryPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Only allow retry if FAILED or PAYMENT_PENDING
    if (!["PAYMENT_PENDING", "FAILED"].includes(order.status)) {
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

    // Reset order
    order.status = "PAYMENT_PENDING";
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
