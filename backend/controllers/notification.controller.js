import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

export const createLowStockNotifications = async (product) => {
  try {
    if (!product || typeof product.stock !== "number" || product.stock >= 5) {
      return;
    }

    const users = await prisma.users.findMany({
      where: { role: { in: ["manager", "salesOfficer"] } },
    });
    const message = `Low stock alert: ${product.name} has only ${product.stock} item(s) left.`;

    for (const user of users) {
      const existing = await prisma.notifications.findFirst({
        where: {
          user_id: user.user_id,
          message,
          is_read: false,
        },
      });
      if (!existing) {
        await prisma.notifications.create({
          data: {
            user_id: user.user_id,
            message,
          },
        });
      }
    }
  } catch (error) {
    console.error("Failed to create low stock notifications:", error);
  }
};

export const getNotifications = async (req, res) => {
  const userId = req.user?.user_id || req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const notifications = await prisma.notifications.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

export const markNotificationRead = async (req, res) => {
  const userId = req.user?.user_id || req.user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const notification = await prisma.notifications.findUnique({
      where: { notification_id: id },
    });
    if (!notification || notification.user_id !== userId) {
      return res.status(404).json({ error: "Notification not found" });
    }

    await prisma.notifications.update({
      where: { notification_id: id },
      data: { is_read: true },
    });

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Failed to mark notification read:", error);
    res.status(500).json({ error: "Failed to mark notification read" });
  }
};

export const getLowStockProducts = async (req, res) => {
  try {
    const products = await prisma.products.findMany({
      where: { stock: { lt: 5 } },
      include: { images: true },
      orderBy: { stock: "asc" },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error("Failed to fetch low stock products:", error);
    res.status(500).json({ error: "Failed to fetch low stock products" });
  }
};
