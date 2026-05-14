import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

export const createSale = async (req, res) => {
  var saleProductQuantitiesID = [];
  var taxableAmount = 0;
  var vat = 0.15;
  var finalAmount = 0;
  try {
    //product and quantity with amout is array of objects
    const { products, amount, payment_method } = req.body;
    const { user_id } = req.user;

    if (!products || !amount || !payment_method) {
      return res.status(400).json({ error: "All fields are required" });
    }

    //calculate the price
    var totalAmount = 0;
    for (const item of products) {
      const product = await prisma.products.findUnique({
        where: { product_id: item.product_id },
      });
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      //calculate the discount
      var dicountAmount = product.price * item.discount_percentage;
      taxableAmount += (product.price - dicountAmount) * item.quantity;
      var calculatedVat = taxableAmount * vat;
      finalAmount = taxableAmount + calculatedVat;
    }

    //create sale
    const sale = await prisma.sales.create({
      data: {
        user_id,
        payment: {
          create: {
            amount: finalAmount,
            method: payment_method,
            status: "pending",
            order_id: "1234567890",
          },
        },
      },
    });

    //iterate and find product
    for (const item of products) {
      const product = await prisma.products.findUnique({
        where: { product_id: item.product_id },
      });
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const saleProductQuantity = await prisma.sales_product_quantities.create({
        data: {
          product_id: item.product_id,
          quantity: item.quantity,
          sales_id: sale.sales_id,
        },
      });
    }

    res.status(201).json({ message: "Sale created successfully", status: 201 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error", status: 500 });
  }
};
