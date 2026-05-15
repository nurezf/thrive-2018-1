import express from "express";
import {
  getNotifications,
  markNotificationRead,
  getLowStockProducts,
} from "../controllers/notification.controller.js";
import { userAuthMiddleware } from "../middlewares/userAuth.middleware.js";

const router = express.Router();

router.get("/", userAuthMiddleware, getNotifications);
router.patch("/:id/read", userAuthMiddleware, markNotificationRead);
router.get("/low-stock", userAuthMiddleware, getLowStockProducts);

export { router as notificationRoute };
