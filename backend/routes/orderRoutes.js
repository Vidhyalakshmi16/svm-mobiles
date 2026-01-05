// backend/routes/orderRoutes.js
import express from "express";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";
import sendEmail from "../utils/sendEmail.js";
import sendSms from "../utils/message.js";
import generateInvoicePdf from "../utils/generateInvoicePdf.js";

const router = express.Router();

/**
 * Helper: map cart items to order items
 */
const mapCartItemsToOrderItems = (items = []) =>
  items.map((item) => ({
    product: item._id,
    name: item.name,
    brand: item.brand,
    price: item.price,
    finalPrice: item.finalPrice ?? item.price,
    discount: item.discount ?? 0,
    quantity: item.quantity || 1,
    image: item.image || item.images?.[0] || "",
  }));

/**
 * Helper: build invoice HTML (used for email)
 */
const buildInvoiceHtml = (order) => {
  const {
    _id,
    customer,
    items,
    subtotal,
    deliveryFee,
    platformFee,
    total,
    paymentMethod,
    createdAt,
  } = order;

  const rows = items
    .map(
      (it, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${it.name}</td>
        <td>${it.quantity}</td>
        <td>₹${(it.finalPrice ?? it.price).toLocaleString("en-IN")}</td>
      </tr>`
    )
    .join("");

  return `
    <div style="font-family:Arial;">
      <h2>Sri Vaari Mobiles – Invoice</h2>
      <p><strong>Order ID:</strong> #${String(_id).slice(-8)}</p>
      <p><strong>Date:</strong> ${new Date(createdAt).toLocaleString("en-IN")}</p>

      <h3>Delivery Details</h3>
      <p>
        ${customer.name}<br/>
        ${customer.address}<br/>
        ${customer.city} - ${customer.pincode}<br/>
        Phone: ${customer.phone}
      </p>

      <table border="1" cellspacing="0" cellpadding="6" width="100%">
        <thead>
          <tr>
            <th>#</th><th>Item</th><th>Qty</th><th>Price</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <p>Subtotal: ₹${subtotal}</p>
      <p>Delivery: ${deliveryFee ? `₹${deliveryFee}` : "Free"}</p>
      <p>Platform Fee: ${platformFee ? `₹${platformFee}` : "Free"}</p>
      <h3>Total Paid: ₹${total}</h3>

      <p>Payment Method: ${paymentMethod}</p>
      <p>Thank you for shopping with Sri Vaari Mobiles.</p>
    </div>
  `;
};

/**
 * ✅ CREATE ORDER (Before Payment)
 * POST /api/orders
 */
router.post("/", protect, async (req, res) => {
  try {
    const {
      customer,
      items = [],
      paymentMethod,
      subtotal,
      deliveryFee,
      platformFee,
      total,
    } = req.body;

    if (!customer || items.length === 0) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    const mappedItems = mapCartItemsToOrderItems(items);

    const order = await Order.create({
      user: req.user.userId,
      customer,
      items: mappedItems,
      paymentMethod: paymentMethod || "UPI",
      subtotal,
      deliveryFee,
      platformFee,
      total,
      status: "Payment Pending", // 🔑 KEY CHANGE
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
});

/**
 * ✅ GET MY ORDERS (Customer)
 * GET /api/orders/my
 */
router.get("/my", protect, async (req, res) => {
  const orders = await Order.find({ user: req.user.userId })
    .sort({ createdAt: -1 })
    .lean();
  res.json(orders);
});

/**
 * ✅ GET ALL ORDERS (Admin)
 * GET /api/orders
 */
router.get("/", protect, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  res.json(orders);
});

/**
 * ✅ UPDATE ORDER STATUS
 * PATCH /api/orders/:id/status
 */
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = [
      "Payment Pending",
      "Paid",
      "In Progress",
      "Completed",
      "Cancelled",
      "Failed",
    ];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const previousStatus = order.status;
    const isCustomer = req.user.role !== "admin";

    // 🔒 CUSTOMER RULES
    if (isCustomer) {
      if (status !== "Cancelled") {
        return res.status(403).json({ message: "Not allowed" });
      }

      if (order.status !== "Paid") {
        return res
          .status(400)
          .json({ message: "Only paid orders can be cancelled" });
      }

      if (order.user.toString() !== req.user.userId) {
        return res.status(403).json({ message: "Not your order" });
      }
    }

    order.status = status;
    await order.save();

    const shortId = String(order._id).slice(-8);

    // 🔔 STATUS NOTIFICATIONS

    // Paid → In Progress
    if (previousStatus === "Paid" && status === "In Progress") {
      await sendSms({
        to: order.customer.phone,
        message: `Your order #${shortId} is now being processed.`,
      });
    }

    // In Progress → Completed
    if (previousStatus === "In Progress" && status === "Completed") {
      await sendSms({
        to: order.customer.phone,
        message: `Your order #${shortId} has been delivered. Thank you!`,
      });
    }

    // Any → Cancelled
    if (status === "Cancelled") {
      await sendSms({
        to: order.customer.phone,
        message: `Your order #${shortId} has been cancelled.`,
      });
    }

    res.json(order);
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

/**
 * ✅ DOWNLOAD INVOICE (Paid orders only)
 * GET /api/orders/:id/invoice
 */
router.get("/:id/invoice", protect, async (req, res) => {
  const order = await Order.findById(req.params.id).lean();
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.status !== "Paid" && order.status !== "Completed") {
    return res.status(400).json({ message: "Invoice not available yet" });
  }

  generateInvoicePdf(order, res);
});

export default router;
