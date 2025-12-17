import express from "express";
import {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  applyCategoryDiscount
} from "../controllers/productController.js";

import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/", upload.array("images", 5), addProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", upload.array("images", 10), updateProduct);
router.delete("/:id", deleteProduct);

// Bulk discount route
router.post("/apply-discount", applyCategoryDiscount);

export default router;




