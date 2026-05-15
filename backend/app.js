import express from "express";
import cors from "cors";
import "dotenv/config";
import userRoute from "./routes/user.routes.js";
import categoryRoute from "./routes/category.route.js";
import salesRoute from "./routes/sales.route.js";
import { productRoute } from "./routes/product.route.js";
import productImageRoute from "./routes/productImage.route.js";
import { notificationRoute } from "./routes/notification.route.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "./uploads")));
// app.use(helmet());

//user
app.use("/api/users", userRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/sales", salesRoute);
app.use("/api/product", productRoute);
app.use("/api/product", productImageRoute);
app.use("/api/notifications", notificationRoute);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
