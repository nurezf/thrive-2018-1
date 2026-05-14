import express from "express";
import cors from "cors";
import "dotenv/config";
import userRoute from "./routes/user.routes.js";
import categoryRoute from "./routes/category.route.js";
import salesRoute from "./routes/sales.route.js";
import { productRoute } from "./routes/product.route.js";

const app = express();
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(helmet());

//user
app.use("/api/users", userRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/sales", salesRoute);
app.use("/api/product", productRoute);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
