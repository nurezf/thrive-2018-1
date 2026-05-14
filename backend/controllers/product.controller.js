import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

export const createProduct = async (req, res) => {
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
  console.log(req.files);

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
        image_url,
        specifications,
      },
    });
    res.status(201).json(newProduct);
    console.log("Product created successfully:", newProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
    console.error("Error creating product:", error);
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.products.findMany();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve products" });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.products.findUnique({
      where: { product_id: id },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve product" });
  }
};

export const updateProduct = async (req, res) => {
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
    image_url,
  } = req.body;
  try {
    const updatedProduct = await prisma.products.update({
      where: { product_id: id },
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

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.products.delete({
      where: { product_id: id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};
