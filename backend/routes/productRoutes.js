import express from "express";
import {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  applyCategoryDiscount,
  addReview,
  addReviewAsAdmin,
  canReviewProduct,
  deleteReview,
} from "../controllers/productController.js";

import upload from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", upload.array("images", 5), addProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", upload.array("images", 10), updateProduct);
router.delete("/:id", deleteProduct);

// Bulk discount route
router.post("/apply-discount", applyCategoryDiscount);

// Review routes
router.get("/:id/can-review", protect, canReviewProduct);
router.post("/:id/reviews", protect, addReview);
router.post("/:id/reviews/admin", protect, addReviewAsAdmin);
router.delete("/:productId/reviews/:reviewId", protect, deleteReview);

export default router;




