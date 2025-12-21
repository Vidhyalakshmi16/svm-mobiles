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
    finalPrice: item.finalPrice,
    discount: item.discount,
    quantity: item.quantity,
    image: item.image || item.images?.[0] || "",
  }));

/**
 * Helper: build invoice HTML (used for email)
 */
const buildInvoiceHtml = (order) => {
  const { _id, customer, items, subtotal, deliveryFee, platformFee, total, paymentMethod, createdAt } =
    order;

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
      <h2>SVM Mobiles – Invoice</h2>
      <p><strong>Order ID:</strong> #${String(_id).slice(-8)}</p>
      <p><strong>Date:</strong> ${new Date(createdAt).toLocaleString("en-IN")}</p>

      <h3>Shipping Details</h3>
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
      <h3>Total: ₹${total}</h3>

      <p>Payment Method: ${paymentMethod}</p>
      <p>Thank you for shopping with us.</p>
    </div>
  `;
};

/**
 * ✅ POST /api/orders
 * STEP 3.A – Order placed
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
      paymentMethod: paymentMethod || "Cash on Delivery",
      subtotal,
      deliveryFee,
      platformFee,
      total,
      status: "Placed",
    });

    const savedOrder = await Order.findById(order._id).lean();

    const invoiceHtml = buildInvoiceHtml(savedOrder);

    // 📧 Email to CUSTOMER
    if (customer.email) {
      await sendEmail({
        to: customer.email,
        subject: "Your Order Confirmation – SVM Mobiles",
        html: invoiceHtml,
      });
    }

    // 📧 Email to ADMIN
    if (process.env.ADMIN_EMAIL) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `New Order Placed – #${String(order._id).slice(-8)}`,
        html: invoiceHtml,
      });
    }

    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("Order create error:", err);
    res.status(500).json({ message: "Server error while creating order" });
  }
});

/**
 * ✅ GET /api/orders/my
 */
router.get("/my", protect, async (req, res) => {
  const orders = await Order.find({ user: req.user.userId })
    .sort({ createdAt: -1 })
    .lean();
  res.json(orders);
});

/**
 * ✅ GET /api/orders (Admin)
 */
router.get("/", protect, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  res.json(orders);
});

/**
 * ✅ PATCH /api/orders/:id/status
 */
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Placed", "In Progress", "Completed", "Cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const previousStatus = order.status;

    // 🔒 CUSTOMER rules
    const isCustomer = req.user.role !== "admin";
    if (isCustomer) {
      if (status !== "Cancelled") {
        return res.status(403).json({ message: "Not allowed" });
      }
      if (order.status !== "Placed") {
        return res
          .status(400)
          .json({ message: "Order cannot be cancelled now" });
      }
      if (order.user.toString() !== req.user.userId) {
        return res.status(403).json({ message: "Not your order" });
      }
    }

    // ✅ Update status
    order.status = status;
    await order.save();

    const orderIdShort = String(order._id).slice(-8);

    // ===== CUSTOMER SMS NOTIFICATIONS =====

    // Placed → In Progress
    if (previousStatus === "Placed" && status === "In Progress") {
      await sendSms({
        to: order.customer.phone,
        message: `Your order #${orderIdShort} is now being processed. Our team is working on it.`,
      });
    }

    // In Progress → Completed
    if (previousStatus === "In Progress" && status === "Completed") {
      await sendSms({
        to: order.customer.phone,
        message: `Your order #${orderIdShort} has been completed. Thank you for shopping with us.`,
      });

      // Optional: email completion note (invoice already sent earlier)
      if (order.customer?.email) {
        await sendEmail({
          to: order.customer.email,
          subject: `Order Completed – #${orderIdShort}`,
          html: `
            <p>Your order <strong>#${orderIdShort}</strong> has been completed.</p>
            <p>Thank you for choosing us.</p>
          `,
        });
      }
    }

    // Any → Cancelled (customer OR admin)
    if (status === "Cancelled" && previousStatus !== "Cancelled") {
      await sendSms({
        to: order.customer.phone,
        message: `Your order #${orderIdShort} has been cancelled. If you have questions, please contact support.`,
      });

      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `❌ Order Cancelled – #${orderIdShort}`,
        html: `
          <p>An order has been cancelled.</p>
          <p><strong>Order ID:</strong> #${orderIdShort}</p>
          <p><strong>Customer:</strong> ${order.customer?.name}</p>
          <p><strong>Phone:</strong> ${order.customer?.phone}</p>
        `,
      });
    }

    res.json(order);
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ message: "Server error updating order status" });
  }
});


/**
 * ✅ GET /api/orders/:id/invoice
 */
router.get("/:id/invoice", protect, async (req, res) => {
  const order = await Order.findById(req.params.id).lean();
  if (!order) return res.status(404).json({ message: "Order not found" });

  generateInvoicePdf(order, res);
});

export default router;
