// backend/controllers/orderController.js
import Order from "../models/Order.js";

/**
 * 🛒 CREATE ORDER (BEFORE PAYMENT)
 * Status: payment pending
 * ❌ No email here
 */
export const createOrder = async (req, res) => {
  try {
    const {
      customer,
      paymentMethod,
      total,
      items,
      deliveryFee = 0,
      platformFee = 0,
    } = req.body;

    if (!customer || !paymentMethod || !total || !items?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const orderItems = items.map((item) => ({
      productId: item._id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      finalPrice: item.finalPrice ?? item.price,
      discount: item.discount ?? 0,
      quantity: item.quantity,
      image: item.image || item.images?.[0] || "",
    }));

    const order = new Order({
      user: req.user._id,
      customer,
      paymentMethod,
      status: "payment pending", // 🔑 IMPORTANT (lowercase)
      subtotal: total - deliveryFee - platformFee,
      deliveryFee,
      platformFee,
      total,
      items: orderItems,
    });

    const savedOrder = await order.save();

    // ❌ NO EMAIL HERE (Razorpay flow)
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
};

/**
 * 📦 GET ALL ORDERS (ADMIN)
 */
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/**
 * 📄 GET SINGLE ORDER
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    console.error("Get order by id error:", err);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

/**
 * ❌ CANCEL ORDER (CUSTOMER)
 * Allowed ONLY if status === paid
 */
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "paid") {
      return res.status(400).json({
        message: "Only paid orders can be cancelled",
      });
    }

    order.status = "cancelled";
    await order.save();

    res.json(order);
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ message: "Failed to cancel order" });
  }
};

/**
 * ❌ MARK PAYMENT FAILED
 * Called when Razorpay fails / user closes popup
 */
export const markPaymentFailed = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only pending orders can fail
    if (order.status === "payment pending") {
      order.status = "failed";
      await order.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Mark payment failed error:", err);
    res.status(500).json({ message: "Failed to update payment status" });
  }
};

/**
 * 🛠 ADMIN STATUS UPDATE (optional)
 * Used by admin panel
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "paid",
      "in progress",
      "completed",
      "cancelled",
      "failed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ message: "Failed to update order" });
  }
};
