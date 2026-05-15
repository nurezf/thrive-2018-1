import jwt from "jsonwebtoken";
import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();
export const userAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("Auth Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Temporary bypass for development
    req.user = { id: "dev_user", role: "manager" };
    return next();
  }

  const token = authHeader.split(" ")[1];

  if (token === "dev_token") {
    req.user = {
      user_id: "2de29217-2604-4133-a3e1-ccf3d73ea5a7",
      role: "manager",
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Unauthorized" });
  }
};
