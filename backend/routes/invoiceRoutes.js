import express from "express";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/invoice/:filename
 * Admin download invoice
 */
router.get("/:filename", protect, (req, res) => {
  const filePath = path.join("invoices", req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Invoice not found" });
  }

  res.download(filePath);
});

export default router;
