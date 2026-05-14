import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = Router();

router.post("/create", createCategory);
router.get("/", getAllCategories);
router.put("/update/:category_id", updateCategory);
router.delete("/delete/:category_id", deleteCategory);

export default router;
