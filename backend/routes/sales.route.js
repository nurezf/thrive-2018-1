import { Router } from "express";
import {
  createSale,
  approveSale,
  rejectSale,
  getSale,
  getSaleProductQuantity,
  getSaleProductQuantityBySalesId,
} from "../controllers/sales.controller.js";
import { userAuthMiddleware } from "../middlewares/userAuth.middleware.js";

const router = Router();

router.post("/create", userAuthMiddleware, createSale);
router.post("/:sales_id/approve", userAuthMiddleware, approveSale);
router.post("/:sales_id/reject", userAuthMiddleware, rejectSale);
router.get("/", userAuthMiddleware, getSale);
router.get("/product", userAuthMiddleware, getSaleProductQuantity);
router.get(
  "/product/:sales_id",
  userAuthMiddleware,
  getSaleProductQuantityBySalesId,
);

export default router;
