// productImageController.js
import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();
import cloudinary from "../cloudinaryConfig.js";

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "products",
        transformation: [
          { width: 800, height: 600, crop: "limit" }, // Resize for consistency
          { quality: "auto" }, // Optimize quality
          { format: "webp" }, // Convert to modern format
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
};

// Helper function to delete from Cloudinary
const deleteFromCloudinary = async (url) => {
  try {
    // Extract public_id from Cloudinary URL
    const publicId = url.split("/").pop().split(".")[0];
    const fullPublicId = `products/${publicId}`;

    const result = await cloudinary.uploader.destroy(fullPublicId);
    return result;
  } catch (error) {
    throw error;
  }
};

export const createProductImages = async (req, res) => {
  const product_id = req.params.product_id;
  const { alt_text, is_primary } = req.body;
  const files = req.files;

  //validate user logged in
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  // Validate files uploaded
  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No images uploaded" });
  }

  const uploadedImages = []; // To track uploaded images for cleanup

  try {
    // Validate product exists
    const product = await prisma.products.findUnique({
      where: { product_id },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Upload files to Cloudinary and prepare image data
    const imageData = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(file.buffer);
        uploadedImages.push(uploadResult); // Store for potential cleanup

        const currentIsPrimary = Array.isArray(is_primary)
          ? is_primary[i] === "true"
          : i === 0 && is_primary === "true";

        imageData.push({
          product_id,
          url: uploadResult.secure_url, // Use secure_url for HTTPS
          alt_text: Array.isArray(alt_text)
            ? alt_text[i]
            : alt_text || `Product image ${i + 1}`,
          is_primary: currentIsPrimary || false,
          cloudinary_public_id: uploadResult.public_id, // Store for easy deletion
        });
      } catch (uploadError) {
        throw new Error(
          `Failed to upload image ${i + 1}: ${uploadError.message}`,
        );
      }
    }

    // Use transaction for atomicity
    const newImages = await prisma.$transaction(async (tx) => {
      // Unset previous primaries if any new primary
      const hasPrimary = imageData.some((img) => img.is_primary);
      if (hasPrimary) {
        await tx.productImages.updateMany({
          where: { product_id, is_primary: true },
          data: { is_primary: false },
        });
      }

      // Create each image and collect results
      const createdImages = [];
      for (const data of imageData) {
        const created = await tx.productImages.create({
          data,
          include: { product: true },
        });
        createdImages.push(created);
      }

      return createdImages;
    });

    res.status(201).json(newImages);
  } catch (error) {
    // Cleanup: Delete any images that were uploaded to Cloudinary
    if (uploadedImages && uploadedImages.length > 0) {
      for (const image of uploadedImages) {
        try {
          await cloudinary.uploader.destroy(image.public_id);
        } catch (cleanupError) {}
      }
    }

    res.status(500).json({
      error: "Failed to create product images",
      details: error.message,
    });
  }
};

export const getProductImages = async (req, res) => {
  const { product_id } = req.params;

  try {
    const images = await prisma.productImages.findMany({
      where: { product_id },
      include: { product: true },
      orderBy: { created_at: "asc" },
    });

    if (!images || images.length === 0) {
      return res
        .status(404)
        .json({ error: "No images found for this product" });
    }

    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product images" });
  }
};

export const getProductImageById = async (req, res) => {
  const { product_id, image_id } = req.params;

  try {
    let whereClause = { image_id };

    if (product_id) {
      whereClause = { image_id, product_id };
    }

    const image = await prisma.productImages.findUnique({
      where: whereClause,
      include: { product: true },
    });

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.status(200).json(image);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product image" });
  }
};

export const updateProductImage = async (req, res) => {
  const { product_id, image_id } = req.params;
  const { alt_text, is_primary } = req.body || {};
  const newFile = req.file;

  // Validate request has at least one field to update
  if (!alt_text && is_primary === undefined && !newFile) {
    return res.status(400).json({
      error: "No fields to update. Provide image, alt_text and/or is_primary",
    });
  }

  try {
    // Validate image exists and belongs to the specified product
    const existingImage = await prisma.productImages.findFirst({
      where: {
        image_id,
        product_id,
      },
      include: { product: true },
    });

    if (!existingImage) {
      return res
        .status(404)
        .json({ error: "Product image not found for this product" });
    }

    let newCloudinaryResult = null;
    let oldPublicId = null;

    // Use transaction for atomic operations
    const updatedImage = await prisma.$transaction(async (tx) => {
      // If setting this image as primary, unset previous primary
      if (is_primary === "true" || is_primary === true) {
        await tx.productImages.updateMany({
          where: {
            product_id,
            is_primary: true,
            image_id: { not: image_id },
          },
          data: { is_primary: false },
        });
      }

      // Prepare update data
      const updateData = {};
      if (alt_text !== undefined) updateData.alt_text = alt_text;
      if (is_primary !== undefined) {
        updateData.is_primary = is_primary === "true" || is_primary === true;
      }

      // If new file uploaded, update URL and prepare to delete old file
      if (newFile) {
        // Upload new file to Cloudinary
        newCloudinaryResult = await uploadToCloudinary(newFile.buffer);

        // Store old public_id for cleanup
        oldPublicId = existingImage.cloudinary_public_id;

        updateData.url = newCloudinaryResult.secure_url;
        updateData.cloudinary_public_id = newCloudinaryResult.public_id;
      }

      // Update the image
      const result = await tx.productImages.update({
        where: { image_id },
        data: updateData,
        include: { product: true },
      });

      // Delete old image from Cloudinary after successful update
      if (oldPublicId) {
        await cloudinary.uploader.destroy(oldPublicId);
      }

      return result;
    });

    res.status(200).json(updatedImage);
  } catch (error) {
    // Cleanup: Delete new file from Cloudinary if it was uploaded but transaction failed
    if (newCloudinaryResult) {
      try {
        await cloudinary.uploader.destroy(newCloudinaryResult.public_id);
      } catch (cleanupError) {}
    }

    // Handle Prisma known errors
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Product image not found" });
    }

    res.status(500).json({
      error: "Failed to update product image",
      details: error.message,
    });
  }
};

export const deleteProductImage = async (req, res) => {
  const { product_id, image_id } = req.params;

  // Check if user is admin
  if (req.user && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Access denied: Admin role required" });
  }

  try {
    // Fetch existing image with product validation
    const existingImage = await prisma.productImages.findUnique({
      where: { image_id, product_id },
    });

    if (!existingImage) {
      return res
        .status(404)
        .json({ error: "Image not found for this product" });
    }

    // Delete from Cloudinary first
    if (existingImage.cloudinary_public_id) {
      await cloudinary.uploader.destroy(existingImage.cloudinary_public_id);
    }

    // Delete from DB
    await prisma.productImages.delete({
      where: { image_id },
    });

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product image" });
  }
};
