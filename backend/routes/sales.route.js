import { Router } from "express";
import {
  createSale,
  approveSale,
  rejectSale,
  getSale,
  getSaleProductQuantity,
  getSaleProductQuantityBySalesId,
  getSaleById,
  getSalesByDate,
} from "../controllers/sales.controller.js";
import { userAuthMiddleware } from "../middlewares/userAuth.middleware.js";

const router = Router();

router.post("/create", userAuthMiddleware, createSale);
router.post("/:sales_id/approve", approveSale);
router.post("/:sales_id/reject", rejectSale);
router.get("/", userAuthMiddleware, getSale);
router.get("/product", userAuthMiddleware, getSaleProductQuantity);
router.get(
  "/product/:sales_id",
  userAuthMiddleware,
  getSaleProductQuantityBySalesId,
);
router.get("/date/:date", getSalesByDate);

router.get("/:sales_id", userAuthMiddleware, getSaleById);

export default router;
