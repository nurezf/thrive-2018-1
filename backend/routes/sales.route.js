import { Router } from "express";
import {
  createSale,
  getSale,
  getSaleProductQuantity,
  getSaleProductQuantityBySalesId,
} from "../controllers/sales.controller.js";
import { userAuthMiddleware } from "../middlewares/userAuth.middleware.js";

const router = Router();

router.post("/create", userAuthMiddleware, createSale);
router.get("/", userAuthMiddleware, getSale);
router.get("/product", userAuthMiddleware, getSaleProductQuantity);
router.get(
  "/product/:sales_id",
  userAuthMiddleware,
  getSaleProductQuantityBySalesId,
);

export default router;
