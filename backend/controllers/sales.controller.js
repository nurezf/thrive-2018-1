import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

export const createSale = async (req, res) => {
  try {
    const { products, payment_method } = req.body;
    const { user_id, role } = req.user;

    if (!products || !payment_method) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (!Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ error: "Products must be a non-empty array" });
    }

    let taxableAmount = 0;
    const vat = 0.15;

    for (const item of products) {
      if (
        !item.product_id ||
        typeof item.quantity !== "number" ||
        item.quantity <= 0
      ) {
        return res
          .status(400)
          .json({
            error:
              "Each product must include a valid product_id and a positive quantity",
          });
      }

      const discountPercentage = item.discount_percentage ?? 0;
      if (
        typeof discountPercentage !== "number" ||
        discountPercentage < 0 ||
        discountPercentage > 100
      ) {
        return res
          .status(400)
          .json({
            error: "discount_percentage must be a number between 0 and 100",
          });
      }

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

      const discountAmount = product.price * (discountPercentage / 100);
      taxableAmount += (product.price - discountAmount) * item.quantity;
    }

    const calculatedVat = taxableAmount * vat;
    const finalAmount = taxableAmount + calculatedVat;
    const requiresApproval = finalAmount > 50000;

    await prisma.$transaction(async (tx) => {
      for (const item of products) {
        const updateResult = await tx.products.updateMany({
          where: {
            product_id: item.product_id,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
        if (updateResult.count === 0) {
          throw new Error(`Insufficient stock for product ${item.product_id}`);
        }
      }

      const payment = await tx.payments.create({
        data: {
          amount: finalAmount,
          method: payment_method,
          status: requiresApproval ? "pending" : "completed",
        },
      });

      const sale = await tx.sales.create({
        data: {
          user_id,
          payment_id: payment.payment_id,
        },
      });

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

    if (requiresApproval) {
      return res
        .status(201)
        .json({
          message: "Sale created and pending manager approval",
          status: 201,
        });
    }

    res.status(201).json({ message: "Sale created successfully", status: 201 });
  } catch (error) {
    console.log(error);
    if (error.message?.startsWith("Insufficient stock")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error", status: 500 });
  }
};

export const approveSale = async (req, res) => {
  const { sales_id } = req.params;
  const { role } = req.user;

  if (role !== "manager") {
    return res.status(403).json({ error: "Manager approval required" });
  }

  try {
    const sale = await prisma.sales.findUnique({
      where: { sales_id },
      include: { payment: true },
    });
    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    if (!sale.payment) {
      return res.status(400).json({ error: "Sale has no payment record" });
    }
    if (sale.payment.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Only pending sales can be approved" });
    }

    await prisma.payments.update({
      where: { payment_id: sale.payment.payment_id },
      data: { status: "completed" },
    });

    res.status(200).json({ message: "Sale approved", status: 200 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error", status: 500 });
  }
};

export const rejectSale = async (req, res) => {
  const { sales_id } = req.params;
  const { role } = req.user;

  if (role !== "manager") {
    return res.status(403).json({ error: "Manager approval required" });
  }

  try {
    const sale = await prisma.sales.findUnique({
      where: { sales_id },
      include: {
        payment: true,
        sales_product_quantities: true,
      },
    });
    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    if (!sale.payment) {
      return res.status(400).json({ error: "Sale has no payment record" });
    }
    if (sale.payment.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Only pending sales can be rejected" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.payments.update({
        where: { payment_id: sale.payment.payment_id },
        data: { status: "failed" },
      });

      for (const item of sale.sales_product_quantities) {
        await tx.products.update({
          where: { product_id: item.product_id },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }
    });

    res
      .status(200)
      .json({ message: "Sale rejected and stock restored", status: 200 });
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
