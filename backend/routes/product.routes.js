import express from "express";
import { createProduct } from "../controllers/product.controller.js";
const router = express.Router();

// Create a new product
router.post("/", createProduct);
// router.get('/', getAllProducts);
// router.get('/:id', getProductById);
// router.put('/:id', updateProduct);
// router.delete('/:id', deleteProduct);

export default router;
