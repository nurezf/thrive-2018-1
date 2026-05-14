import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

export const createSale = async (req, res) => {
  var saleProductQuantitiesID = [];
  var taxableAmount = 0;
  var vat = 0.15;
  var finalAmount = 0;
  try {
    //product and quantity with amout is array of objects
    const { products, payment_method } = req.body;
    console.log(products);
    const { user_id } = req.user;

    if (!products || !payment_method) {
      return res.status(400).json({ error: "All fields are required" });
    }

    //calculate the price
    var totalAmount = 0;
    for (const item of products) {
      const product = await prisma.products.findMany({
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

    //create payment
    const payment = await prisma.payments.create({
      data: {
        amount: 123,
        method: payment_method,
        status: "pending",
      },
    });

    console.log(payment);

    //create sale
    const sale = await prisma.sales.create({
      data: {
        user_id,
        payment_id: payment.payment_id,
      },
    });

    //iterate and find product
    for (const item of products) {
      const product = await prisma.products.findMany({
        where: { product_id: item.product_id },
      });
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      console.log(product);

      const saleProductQuantity = await prisma.sales_product_quantities.create({
        data: {
          product_id: product[0].product_id,
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

export const getSale = async (req, res) => {
  try {
    const sales = await prisma.sales.findMany({
      include: {
        payment: true,
        users: true,
      },
    });

    res.status(200).json(sales);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error", status: 500 });
  }
};

export const getSaleProductQuantity = async (req, res) => {
  try {
    const salesProductQuantities =
      await prisma.sales_product_quantities.findMany({
        include: {
          product: true,
          sales: true,
        },
      });
    res.status(200).json(salesProductQuantities);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error", status: 500 });
  }
};

export const getSaleProductQuantityBySalesId = async (req, res) => {
  const { sales_id } = req.params;
  try {
    const salesProductQuantities =
      await prisma.sales_product_quantities.findMany({
        where: {
          sales_id: sales_id,
        },
        include: {
          product: true,
          sales: true,
        },
      });
    res.status(200).json(salesProductQuantities);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error", status: 500 });
  }
};
