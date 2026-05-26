import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

const sanitizeColors = (raw) => {
  const values = Array.isArray(raw) ? raw : [];
  return values
    .map((c) => String(c || "").trim())
    .filter(Boolean);
};

const sanitizeSpecifications = (raw) => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out = {};

  for (const [key, value] of Object.entries(raw)) {
    const cleanKey = String(key || "").trim();
    const cleanValue = String(value ?? "").trim();
    if (cleanKey && cleanValue) {
      out[cleanKey] = cleanValue;
    }
  }

  return out;
};

const hasPurchasedProduct = async ({ userId, productId }) => {
  if (!userId || !productId) return false;

  const order = await Order.findOne({
    user: userId,
    status: { $in: ["PAID", "IN_PROGRESS", "COMPLETED"] },
    "items.productId": productId,
  })
    .select("_id")
    .lean();

  return !!order;
};

/* ================= CAN USER REVIEW (PURCHASE GATE) ================= */
export const canReviewProduct = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const productId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        canReview: false,
        reason: "NOT_AUTHENTICATED",
      });
    }

    const purchased = await hasPurchasedProduct({ userId, productId });
    if (!purchased) {
      return res.json({ canReview: false, reason: "NOT_PURCHASED" });
    }

    const product = await Product.findById(productId)
      .select("reviews.userId")
      .lean();

    if (!product) {
      return res.status(404).json({
        canReview: false,
        reason: "PRODUCT_NOT_FOUND",
      });
    }

    const alreadyReviewed = (product.reviews || []).some(
      (r) => String(r.userId) === String(userId)
    );

    if (alreadyReviewed) {
      return res.json({ canReview: false, reason: "ALREADY_REVIEWED" });
    }

    return res.json({ canReview: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ canReview: false, reason: "SERVER_ERROR" });
  }
};

/* ================= ADD PRODUCT ================= */
export const addProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      price,
      discount = 0,
      cost = 0,
      category,
      description,
      colors = "[]",
      specifications = "{}",
      stock,
    } = req.body;

    const imageUrls = (req.files || []).map((f) => f.path);

    const p = Number(price);
    const d = Number(discount);
    const c = Number(cost);

    const finalPrice = p - (p * d) / 100;
    const profit = finalPrice - c;

    // Parse colors and specifications from JSON strings
    let colorArray = [];
    let specObj = {};

    try {
      colorArray = typeof colors === "string" ? JSON.parse(colors) : colors;
    } catch {
      colorArray = [];
    }
    colorArray = sanitizeColors(colorArray);

    try {
      specObj = typeof specifications === "string" ? JSON.parse(specifications) : specifications;
    } catch {
      specObj = {};
    }
    specObj = sanitizeSpecifications(specObj);

    const product = new Product({
      name,
      brand,
      price: p,
      discount: d,
      finalPrice,
      cost: c,
      profit,
      stock: Number(stock),
      category,
      description: description ? String(description).trim() : "",
      colors: colorArray,
      specifications: specObj,
      images: imageUrls,
    });

    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET ALL PRODUCTS ================= */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET PRODUCT BY ID ================= */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE PRODUCT ================= */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const {
      name,
      brand,
      price,
      discount,
      cost,
      stock,
      category,
      colors,
      specifications,
      description,
      existingImages,
    } = req.body;

    if (name !== undefined) product.name = name;
    if (brand !== undefined) product.brand = brand;
    if (category !== undefined) product.category = category;
    if (description !== undefined) {
      product.description = String(description || "").trim();
    }
    if (stock !== undefined) product.stock = Number(stock);

    // Handle colors
    if (colors !== undefined) {
      try {
        const parsedColors =
          typeof colors === "string" ? JSON.parse(colors) : colors;
        product.colors = sanitizeColors(parsedColors);
      } catch {
        product.colors = [];
      }
    }

    // Handle specifications
    if (specifications !== undefined) {
      try {
        const parsedSpecifications =
          typeof specifications === "string"
            ? JSON.parse(specifications)
            : specifications;
        product.specifications = sanitizeSpecifications(parsedSpecifications);
      } catch {
        product.specifications = {};
      }
    }

    if (price !== undefined) product.price = Number(price);
    if (discount !== undefined) product.discount = Number(discount);
    if (cost !== undefined) product.cost = Number(cost);

    // ----- PRICE & PROFIT (always recalc) -----
    const p = product.price || 0;
    const d = product.discount || 0;
    const c = product.cost || 0;

    product.finalPrice = p - (p * d) / 100;
    product.profit = product.finalPrice - c;

    // ----- IMAGE HANDLING (safe) -----
    let keepImages = product.images || [];

    if (existingImages) {
      try {
        keepImages = JSON.parse(existingImages);
      } catch {
        // keep old if parsing fails
      }
    }

    const newImages = (req.files || []).map((f) => f.path);
    product.images = [...keepImages, ...newImages];

    await product.save();
    res.json({ message: "Product updated successfully", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE PRODUCT ================= */
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= BULK CATEGORY DISCOUNT ================= */
export const applyCategoryDiscount = async (req, res) => {
  try {
    const { categoryId, discount } = req.body;
    const d = Number(discount);

    const products = await Product.find({ category: categoryId });

    for (let product of products) {
      const p = product.price || 0;
      const c = product.cost || 0;

      const finalPrice = p - (p * d) / 100;
      const profit = finalPrice - c;

      product.discount = d;
      product.finalPrice = finalPrice;
      product.profit = profit;

      await product.save();
    }

    res.json({ message: "Discount applied successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= ADD REVIEW TO PRODUCT ================= */
export const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, text } = req.body;
    const userId = req.user?.userId;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Review text cannot be empty" });
    }

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // ✅ Purchase gate: only allow reviews after purchase
    const purchased = await hasPurchasedProduct({ userId, productId: id });
    if (!purchased) {
      return res.status(403).json({
        message: "You can review this product only after purchase",
      });
    }

    // Find product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Prevent multiple reviews by same user
    const alreadyReviewed = (product.reviews || []).some(
      (r) => String(r.userId) === String(userId)
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    // Fetch user details for userName
    const user = await User.findById(userId).select("name");
    const userName = user?.name || "Anonymous";

    // Create review object
    const review = {
      userId,
      userName,
      rating: Number(rating),
      text: text.trim(),
      createdAt: new Date(),
    };

    // Add review to product
    if (!product.reviews) {
      product.reviews = [];
    }
    product.reviews.push(review);

    await product.save();

    res.status(201).json({
      message: "Review added successfully",
      review,
      product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= ADMIN ADD REVIEW (no purchase required) ================= */
export const addReviewAsAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { id } = req.params;
    const { rating, text, userName } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Review text cannot be empty" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const adminUser = await User.findById(req.user.userId).select("name");
    const displayName =
      String(userName || "").trim() || adminUser?.name || "Admin";

    const review = {
      userId: req.user.userId,
      userName: displayName,
      rating: Number(rating),
      text: text.trim(),
      createdAt: new Date(),
    };

    if (!product.reviews) product.reviews = [];
    product.reviews.push(review);
    await product.save();

    res.status(201).json({
      message: "Review added successfully",
      review,
      product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { productId, reviewId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviewIndex = product.reviews.findIndex(
      (review) => review._id.toString() === reviewId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review not found" });
    }

    product.reviews.splice(reviewIndex, 1);
    await product.save();

    res.json({ message: "Review deleted successfully", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
