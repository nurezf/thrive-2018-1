import express from "express";
import cors from "cors";
import "dotenv/config";
import userRoute from "./routes/user.routes.js";
import productRoute from "./routes/product.routes.js";

const app = express();
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(helmet());

//user
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
