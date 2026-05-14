const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(helmet());

//user
const userRoute = require("./routes/userRoute");
app.use("/api/users", userRoute);

//auth
const authRoute = require("./routes/authRoute");
app.use("/api/auth", authRoute);

//categories
const categorieRoute = require("./routes/categorieRoute");
app.use("/api/categories", categorieRoute);

//products
const productRoute = require("./routes/productRoute");
app.use("/api/products", productRoute);

//product images
const productImageRoute = require("./routes/productImageRoute");
app.use("/api/products", productImageRoute);

//reviews and ratings
const reviewRoute = require("./routes/reviewRoutes");
app.use("/api/reviews", reviewRoute);

//loved products
const lovedRoute = require("./routes/lovedRoutes");
app.use("/api/loved", lovedRoute);

//Address
const addressRoute = require("./routes/addressRoutes");
app.use("/api/addresses", addressRoute);

//Shipping Method
const shippingMethodRoute = require("./routes/shippingMethodRoutes");
app.use("/api/shipping-methods", shippingMethodRoute);

//Orders
const orderRoute = require("./routes/orderRoutes");
app.use("/api/orders", orderRoute);

//Delivery
const deliveryRoute = require("./routes/deliveryRoutes");
app.use("/api/deliveries", deliveryRoute);

//payment
const paymentRoute = require("./routes/paymentRoutes");
app.use("/api/payments", paymentRoute);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`); // Keep for quick visibility
});
