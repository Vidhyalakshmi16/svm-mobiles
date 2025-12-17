// backend/controllers/orderController.js
import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
  try {
    const { customer, paymentMethod, total, items } = req.body;

    if (!customer || !paymentMethod || !total || !items?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Map frontend cart items → order items
    const orderItems = items.map((item) => ({
      productId: item._id,              // from Product
      name: item.name,
      brand: item.brand,
      price: item.price,
      finalPrice: item.finalPrice ?? item.price,
      discount: item.discount ?? 0,
      quantity: item.quantity,
      image: item.image || item.images?.[0] || "",
    }));

    const order = new Order({
      customer,
      paymentMethod,
      status: "Placed",
      total,
      items: orderItems,
    });

    const saved = await order.save();

    res.status(201).json(saved);
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

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

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.status = status;
  await order.save();

  res.json(order);
};

