import { PrismaClient } from "../generated/prisma/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const registerUser = async (req, res) => {
  try {
    const { name, username, email, password, phone, role } = req.body;
    console.log({ name, username, email, password, phone, role });

    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // const existingUser = await prisma.users.findUnique({
    //   where: { email: email },
    // });

    // if (existingUser) {
    //   return res.status(400).json({ error: "User already exists" });
    // }

    // const existUserUsername = await prisma.users.findUnique({
    //   where: { username: username },
    // });

    // if (existUserUsername) {
    //   return res.status(400).json({ error: "Username already exists" });
    // }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        name,
        username,
        email,
        password_hash: hashedPassword,
        phone,
        role,
      },
    });

    const accessToken = jwt.sign(
      { user_id: user.user_id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "1d" },
    );

    const refreshToken = jwt.sign(
      { user_id: user.user_id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    user.refresh_token = refreshToken;

    await prisma.users.update({
      where: { user_id: user.user_id },
      data: { refresh_token: refreshToken },
    });

    res.status(201).json({ user, accessToken, refreshToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.users.findUnique({
      where: { username: username },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const accessToken = jwt.sign(
      { user_id: user.user_id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { user_id: user.user_id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    user.refresh_token = refreshToken;

    await prisma.users.update({
      where: { user_id: user.user_id },
      data: { refresh_token: refreshToken },
    });

    res.status(200).json({ user, accessToken, refreshToken });
  } catch (error) {}
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
