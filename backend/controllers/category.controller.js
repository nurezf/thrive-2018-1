import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const category = await prisma.categories.create({
      data: {
        name,
        description,
      },
    });

    res
      .status(201)
      .json({ message: "Category created successfully", status: 201 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error", status: 500 });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.categories.findMany();
    res.status(200).json(categories);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { category_id, name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const category = await prisma.categories.update({
      where: { category_id },
      data: {
        name,
        description,
      },
    });

    res
      .status(200)
      .json({ message: "Category updated successfully", status: 200 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error", status: 500 });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { category_id } = req.body;

    const category = await prisma.categories.delete({
      where: { category_id },
    });

    res
      .status(200)
      .json({ message: "Category deleted successfully", status: 200 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error", status: 500 });
  }
};
