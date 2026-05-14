import { Router } from "express";
import {
  getAllUsers,
  login,
  registerUser,
} from "../controllers/user.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", login);
router.get("/", getAllUsers);

export default router;
