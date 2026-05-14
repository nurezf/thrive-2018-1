import { Router } from "express";
import { createSale } from "../controllers/sales.controller.js";
import { userAuthMiddleware } from "../middlewares/userAuth.middleware.js";

const router = Router();

router.post("/create", userAuthMiddleware, createSale);

export default router;
