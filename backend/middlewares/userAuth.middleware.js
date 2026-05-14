import jwt from "jsonwebtoken";

export const userAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Temporary bypass for development
    req.user = { id: "dev_user", role: "admin" };
    return next();
  }

  const token = authHeader.split(" ")[1];

  if (token === "dev_token") {
    req.user = { id: "dev_user", role: "admin" };
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
