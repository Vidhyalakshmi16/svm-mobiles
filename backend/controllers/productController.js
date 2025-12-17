import Product from "../models/Product.js";

// Add product with images
export const addProduct = async (req, res) => {
  try {
    const {
      name, brand, price, discount, cost,
      category, description, color, stock, ram, storage
    } = req.body;

    const imageUrls = req.files?.map(file => file.path) || [];

    const finalPrice = price - (price * discount / 100);
    const profit = finalPrice - cost;

    const product = new Product({
      name,
      brand,
      price,
      discount,
      finalPrice,
      cost,
      profit,
      stock,
      category,
      description,
      color,
      images: imageUrls,
    });

    await product.save();
    res.status(201).json({ message: "Product added successfully", product });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

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
    } = req.body;

    if (name !== undefined) product.name = name;
    if (brand !== undefined) product.brand = brand;
    if (category !== undefined) product.category = category;
    if (color !== undefined) product.color = color;
    if (description !== undefined) product.description = description;
    if (stock !== undefined) product.stock = Number(stock);

    // pricing / profit
    if (price !== undefined) {
      const p = Number(price);
      const d =
        discount !== undefined ? Number(discount) : product.discount || 0;

      product.price = p;
      product.discount = d;
      product.finalPrice = p - (p * d) / 100;
    } else if (discount !== undefined) {
      const d = Number(discount);
      product.discount = d;
      const p = product.price || 0;
      product.finalPrice = p - (p * d) / 100;
    }

    if (cost !== undefined) {
      product.cost = Number(cost);
    }

    const sell = product.finalPrice || product.price || 0;
    const c = product.cost || 0;
    product.profit = sell - c;

    // ---- IMAGE HANDLING ----
    // existingImages is JSON string array of URLs from frontend
    let keepImages = product.images || [];
    if (req.body.existingImages) {
      try {
        keepImages = JSON.parse(req.body.existingImages);
      } catch (e) {
        console.error("Failed to parse existingImages", e);
      }
    }

    const newImages = (req.files || []).map((f) => f.path);
    // keep old ones + append new ones
    product.images = [...keepImages, ...newImages];

    await product.save();
    res.json({ message: "Product updated successfully", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk discount for a category
export const applyCategoryDiscount = async (req, res) => {
  try {
    const { categoryId, discount } = req.body;

    const products = await Product.find({ category: categoryId });

    for (let product of products) {
      const finalPrice = product.price - (product.price * discount / 100);
      const profit = finalPrice - product.cost;

      product.discount = discount;
      product.finalPrice = finalPrice;
      product.profit = profit;

      await product.save();
    }

    res.status(200).json({ message: "Discount applied to all products in category" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
