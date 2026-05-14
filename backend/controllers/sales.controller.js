import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

export const createSale = async (req, res) => {
  try {
    //product and quantity with amount is array of objects
    const { products, payment_method } = req.body;
    console.log(products);
    const { user_id } = req.user;

    if (!products || !payment_method) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate products and check stock availability
    let taxableAmount = 0;
    const vat = 0.15;
    for (const item of products) {
      const product = await prisma.products.findUnique({
        where: { product_id: item.product_id },
      });
      if (!product) {
        return res
          .status(404)
          .json({ error: `Product with ID ${item.product_id} not found` });
      }
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({
            error: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          });
      }
      // Calculate the discount (assuming discount_percentage is a decimal like 0.1 for 10%)
      const discountAmount = product.price * (item.discount_percentage || 0);
      taxableAmount += (product.price - discountAmount) * item.quantity;
    }
    const calculatedVat = taxableAmount * vat;
    const finalAmount = taxableAmount + calculatedVat;

    // Use transaction to ensure atomicity: deduct stock, create payment, create sale, create sales_product_quantities
    await prisma.$transaction(async (tx) => {
      // Deduct stock from products
      for (const item of products) {
        await tx.products.update({
          where: { product_id: item.product_id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Create payment
      const payment = await tx.payments.create({
        data: {
          amount: finalAmount,
          method: payment_method,
          status: "completed",
        },
      });

      // Create sale
      const sale = await tx.sales.create({
        data: {
          user_id,
          payment_id: payment.payment_id,
        },
      });

      // Create sales_product_quantities
      for (const item of products) {
        await tx.sales_product_quantities.create({
          data: {
            product_id: item.product_id,
            quantity: item.quantity,
            sales_id: sale.sales_id,
          },
        });
      }
    });

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
