import Product from "../models/Product.js";

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
      color,
      stock,
    } = req.body;

    const imageUrls = (req.files || []).map((f) => f.path);

    const p = Number(price);
    const d = Number(discount);
    const c = Number(cost);

    const finalPrice = p - (p * d) / 100;
    const profit = finalPrice - c;

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
      description,
      color,
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
      color,
      description,
      existingImages,
    } = req.body;

    if (name !== undefined) product.name = name;
    if (brand !== undefined) product.brand = brand;
    if (category !== undefined) product.category = category;
    if (color !== undefined) product.color = color;
    if (description !== undefined) product.description = description;
    if (stock !== undefined) product.stock = Number(stock);

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
