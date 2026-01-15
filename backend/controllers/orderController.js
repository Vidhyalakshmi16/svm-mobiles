import Order from "../models/Order.js";

/* ================= CREATE ORDER (Before Payment) ================= */
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
      status: "PAYMENT_PENDING",   // ✅ FIXED
      subtotal: total - deliveryFee - platformFee,
      deliveryFee,
      platformFee,
      total,
      items: orderItems,
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
};

/* ================= ADMIN – GET ALL ORDERS ================= */
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/* ================= GET SINGLE ORDER ================= */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("Get order by id error:", err);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

/* ================= CUSTOMER CANCEL ================= */
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // If not paid yet → just cancel
    if (order.status === "PAYMENT_PENDING") {
      order.status = "CANCELLED";
      await order.save();
      return res.json(order);
    }

    // If already paid and not shipped yet
    if (order.status === "PAID") {
      order.status = "REFUND_PROCESSING";
      order.refundAmount = order.subtotal + order.deliveryFee; // 🔥 policy
      order.refundReason = "Customer cancelled before shipment";
      await order.save();
      return res.json(order);
    }

    return res.status(400).json({
      message: `Order cannot be cancelled in ${order.status} state`,
    });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ message: "Failed to cancel order" });
  }
};



/* ================= MARK PAYMENT FAILED ================= */
export const markPaymentFailed = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: "Order ID required" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status === "PAYMENT_PENDING") {
      order.status = "FAILED";    // ✅ FIXED
      await order.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Mark payment failed error:", err);
    res.status(500).json({ message: "Failed to update payment status" });
  }
};

/* ================= ADMIN STATUS UPDATE ================= */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "PAID",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
      "FAILED",
      "RETURNED",
      "REFUND_PROCESSING",
      "REFUNDED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ message: "Failed to update order" });
  }
};

export const returnOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "COMPLETED") {
      return res.status(400).json({ message: "Only delivered orders can be returned" });
    }

    order.status = "REFUND_PROCESSING";
    order.refundAmount = order.subtotal;   // 🔥 ONLY product price
    order.refundReason = "Customer returned the product";

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Return failed" });
  }
};

export const markRefundCompleted = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "REFUND_PROCESSING") {
      return res.status(400).json({ message: "Refund not in processing state" });
    }

    order.status = "REFUNDED";
    order.refundedAt = new Date();
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to complete refund" });
  }
};

