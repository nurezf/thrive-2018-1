const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

exports.createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    original_price,
    discount_percentage,
    stock,
    category_id,
    specifications,
  } = req.body;

  try {
    // Validate category_id exists if provided
    if (category_id) {
      const category = await prisma.categories.findUnique({
        where: { category_id },
      });
      if (!category) {
        return res.status(400).json({ error: "Invalid category_id" });
      }
    }

    const newProduct = await prisma.products.create({
      data: {
        name,
        description,
        price,
        original_price,
        discount_percentage,
        stock,
        category_id,
        specification,
      },
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.products.findMany();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve products" });
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.products.findUnique({
      where: { product_id: parseInt(id) },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve product" });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    price,
    original_price,
    discount_percentage,
    stock,
    category_id,
    specifications,
  } = req.body;
  try {
    const updatedProduct = await prisma.products.update({
      where: { product_id: parseInt(id) },
      data: {
        name,
        description,
        price,
        original_price,
        discount_percentage,
        stock,
        category_id,
        specifications,
      },
    });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.products.delete({
      where: { product_id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};
