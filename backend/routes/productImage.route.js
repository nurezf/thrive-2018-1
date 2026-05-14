import express from "express";
import { Router } from "express";

import { userAuthMiddleware } from "../middlewares/userAuth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
const router = Router();
import {
  createProductImages,
  getProductImages,
  getProductImageById,
  updateProductImage,
  deleteProductImage,
} from "../controllers/productImage.controller.js";

// POST create multiple images (multipart/form-data)
router.post(
  "/:product_id/images",
  (req, res, next) => {
    next();
  },
  userAuthMiddleware,
  upload.array("images", 10), // Multiple files, max 10
  createProductImages,
); // Max 10 images

// GET all images for product
router.get(
  "/:product_id/images",
  (req, res, next) => {
    next();
  },
  getProductImages,
);

// GET single image
router.get(
  "/:product_id/images/:image_id",
  (req, res, next) => {
    next();
  },
  getProductImageById,
);

// PUT update image (for non-file updates; for file replace, use separate endpoint)
router.put(
  "/:product_id/images/:image_id",
  (req, res, next) => {
    next();
  },
  userAuthMiddleware,
  upload.single("images"),
  updateProductImage,
);

// DELETE image
router.delete(
  "/:product_id/images/:image_id",
  (req, res, next) => {
    next();
  },
  userAuthMiddleware,
  deleteProductImage,
);

export default router;
