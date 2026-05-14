const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const debug = require("debug")("app:users:controller"); // Controller-specific namespace
const cloudinary = require("../cloudinaryConfig");

const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const saltRounds = 12;

// Helper to upload buffer to Cloudinary (if not already in utils)
const uploadToCloudinary = async (buffer, mimetype, folder = "avatars") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: folder,
        format: "jpg", // Auto-convert
        quality: "auto",
        transformation: [{ width: 300, height: 300, crop: "fill" }], // Profile pic resize
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error.message); // Log error for debugging
          reject(error);
        } else {
          console.log("Cloudinary upload success:", result.secure_url); // Log success
          resolve(result.secure_url);
        }
      },
    );
    uploadStream.end(buffer);
  });
};

// Generate short-lived access token
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      user_id: user.user_id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar_url: user.avatar_url,
    },
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET, // Fallback to old secret if not set
    { expiresIn: "1h" }, // Short-lived for security
  );
};

// Generate long-lived refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { user_id: user.user_id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, // Separate secret recommended
    { expiresIn: "7d" }, // Long-lived, but revocable via DB
  );
};

//get all users only admin
exports.getAllUsers = async (req, res) => {
  debug("Get all users: Entry from %s (user role: %s)", req.ip, req.user.role);
  if (req.user.role !== "admin") {
    debug("Get all users: Access denied for non-admin %s", req.user.user_id);
    return res.status(403).json({ error: "Admin access required" });
  }
  try {
    const users = await prisma.users.findMany({
      select: {
        user_id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        avatar_url: true,
        created_at: true,
        updated_at: true,
      }, // Exclude sensitive fields
    });
    debug("Get all users: Success, retrieved %d users", users.length);
    res.json({ users });
  } catch (error) {
    debug("Get all users: Error - %s", error.message);
    console.error("Get all users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

exports.registerUser = async (req, res) => {
  const {
    name,
    username,
    email,
    password,
    phone,
    role = "salesOfficer",
  } = req.body;

  try {
    // Check if user exists
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      debug("Register: User already exists for %s", email);
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.users.create({
      data: {
        name,
        username,
        email,
        password_hash: hashedPassword,
        phone,
        role,
      },
    });
    debug("Register: User created with ID %s", newUser.user_id);

    // Generate tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    debug("Register: Tokens generated for user %s", newUser.user_id);

    // Hash and store refresh token in DB
    const hashedRefresh = await bcrypt.hash(refreshToken, saltRounds);
    await prisma.users.update({
      where: { user_id: newUser.user_id },
      data: { refresh_token: hashedRefresh },
    });
    debug("Register: Refresh token stored for %s", newUser.user_id);

    const { password_hash, ...userWithoutPassword } = newUser;
    res.status(201).json({
      user: userWithoutPassword,
      tokens: { accessToken, refreshToken },
    });
    debug("Register: Success for %s", email);
  } catch (error) {
    debug("Register: Error - %s", error.message);
    res.status(500).json({ error: "Failed to register user" });
  }
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  debug("Signin: Attempt for %s", email);

  try {
    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        user_id: true,
        email: true,
        username: true,
        name: true,
        phone: true,
        role: true,
        avatar_url: true,
        password_hash: true,
        refresh_token: true,
      },
    });

    if (!user) {
      debug("Signin: User not found for %s", email);
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      debug("Signin: Invalid password for %s", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    debug("Signin: Password valid for %s", email);

    // Generate new tokens (rotate refresh for security)
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const hashedRefresh = await bcrypt.hash(refreshToken, saltRounds);

    await prisma.users.update({
      where: { user_id: user.user_id },
      data: { refresh_token: hashedRefresh },
    });
    debug("Signin: Tokens updated for %s", user.user_id);

    const { password_hash, refresh_token, ...userWithoutPassword } = user;
    res.status(200).json({
      user: userWithoutPassword,
      tokens: { accessToken, refreshToken },
    });
    debug("Signin: Success for %s", email);
  } catch (error) {
    debug("Signin: Error - %s", error.message);
    res.status(500).json({ error: "Failed to sign in" });
  }
};

// New: Refresh Token Endpoint
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  debug(
    "Refresh: Attempt with token for user_id %s",
    req.body.refreshToken ? "provided" : "missing",
  ); // Avoid logging token

  if (!refreshToken) {
    debug("Refresh: No token provided");
    return res.status(401).json({ error: "Refresh token required" });
  }

  try {
    // Verify refresh token signature
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    );
    const user = await prisma.users.findUnique({
      where: { user_id: decoded.user_id },
      select: {
        user_id: true,
        username: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar_url: true,
        refresh_token: true,
      },
    });

    if (!user) {
      debug("Refresh: User not found for %s", decoded.user_id);
      return res.status(401).json({ error: "User not found" });
    }

    // Verify hashed refresh matches stored one
    const isValidRefresh = await bcrypt.compare(
      refreshToken,
      user.refresh_token,
    );
    if (!isValidRefresh) {
      debug("Refresh: Invalid token for %s", user.user_id);
      return res.status(401).json({ error: "Invalid refresh token" });
    }
    debug("Refresh: Token valid for %s", user.user_id);

    // Generate new tokens (rotate refresh)
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const hashedNewRefresh = await bcrypt.hash(newRefreshToken, saltRounds);

    await prisma.users.update({
      where: { user_id: user.user_id },
      data: { refresh_token: hashedNewRefresh },
    });
    debug("Refresh: New tokens issued for %s", user.user_id);

    const { refresh_token, ...userWithoutRefresh } = user;
    res.status(200).json({
      user: userWithoutRefresh,
      tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
    debug("Refresh: Success for %s", user.email);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      debug("Refresh: Token expired for %s", decoded?.user_id || "unknown");
      return res.status(401).json({ error: "Refresh token expired" });
    }
    debug("Refresh: Error - %s", error.message);
    res.status(401).json({ error: "Invalid refresh token" });
  }
};

// New: Logout (revoke refresh token)
exports.logout = async (req, res) => {
  const userId = req.user.user_id; // From authMiddleware (update to use user_id)
  debug("Logout: Attempt for %s", userId);

  try {
    await prisma.users.update({
      where: { user_id: userId },
      data: { refresh_token: null }, // Revoke by nulling
    });
    debug("Logout: Success for %s", userId);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    debug("Logout: Error - %s", error.message);
    res.status(500).json({ error: "Failed to logout" });
  }
};

// Admin: Update User Role
exports.updateUserRole = async (req, res) => {
  const { user_id } = req.params;
  const { role } = req.body;
  debug(
    "Update user role: Starting for %s to %s by %s",
    user_id,
    role,
    req.user.user_id,
  ); // Log entry

  // Check if requester is admin
  if (req.user.role !== "admin") {
    debug(
      "Update user role %s: Access denied for requester %s (role: %s)",
      user_id,
      req.user.user_id,
      req.user.role,
    );
    return res
      .status(403)
      .json({ error: "Access denied: Admin role required" });
  }

  try {
    // Verify target user exists
    const targetUser = await prisma.users.findUnique({
      where: { user_id },
      select: { user_id: true, email: true, role: true },
    });

    if (!targetUser) {
      debug("Update user role %s: Target user not found", user_id);
      return res.status(404).json({ error: "User not found" });
    }
    debug(
      "Update user role %s: Target user validated (current role: %s)",
      user_id,
      targetUser.role,
    );

    // Update role
    const updatedUser = await prisma.users.update({
      where: { user_id },
      data: { role },
      select: { user_id: true, email: true, role: true }, // Exclude sensitive fields
    });
    debug("Update user role %s: Success - new role %s", user_id, role);

    res.status(200).json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    debug("Update user role %s: Error - %s", user_id, error.message);
    res.status(500).json({ error: "Failed to update user role" });
  }
};

exports.decodeToken = async (req, res) => {
  const accessToken = req.params.token; // From path param (e.g., /decode/eyJ...)
  const userId = req.user?.user_id; // If isAuth added later

  debug(
    "Decode token: Starting for token %s",
    accessToken ? "provided" : "missing",
  ); // Log entry

  // If isAuth enabled (optional), use req.user
  if (req.user) {
    const { user_id, username, name, phone, email, role, iat, exp } = req.user;
    debug("Decode token: Success from middleware for %s", user_id);
    return res.status(200).json({
      decoded: { user_id, username, name, phone, email, role, iat, exp },
      message: "Token decoded successfully",
    });
  }

  // Decode from path param
  if (!accessToken) {
    debug("Decode token: No token in path param");
    return res.status(400).json({ error: "Token required in path param" });
  }

  try {
    // Verify & decode
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
    );
    debug("Decode token: Success for %s", decoded.user_id);
    res.status(200).json({
      decoded: {
        user_id: decoded.user_id,
        name: decoded.name,
        email: decoded.email,
        username: decoded.username,
        phone: decoded.phone,
        role: decoded.role,
        avatarUrl: decoded.avatar_url,
        iat: decoded.iat,
        exp: decoded.exp,
      },
    });
  } catch (error) {
    debug("Decode token: Invalid/expired token - %s", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    res.status(401).json({ error: "Invalid token" });
  }
};

exports.updateProfile = async (req, res) => {
  let userId = null; // Declare for catch block
  try {
    userId = req.user.user_id;
    const { name, username, email, phone, password } = req.body; // avatar_url handled via file upload

    debug("Update profile for user %s: Entry from %s", userId, req.ip);

    // Fetch current user with all updatable fields
    const currentUser = await prisma.users.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        avatar_url: true,
        password_hash: true, // For verification
      },
    });

    if (!currentUser) {
      debug("Update profile %s: User not found", userId);
      return res.status(404).json({ error: "User not found" });
    }

    // Validate username is not taken by another user
    if (username && username !== currentUser.username) {
      const existingUsername = await prisma.users.findUnique({
        where: { username },
      });
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }
    }

    // If email changing, validate current password
    if (email && email !== currentUser.email) {
      if (!password) {
        return res
          .status(400)
          .json({ error: "password required to change email" });
      }
      const isValid = await bcrypt.compare(password, currentUser.password_hash);
      if (!isValid) {
        return res.status(400).json({ error: "Current password incorrect" });
      }
    }

    // Check if new email is taken
    if (email && email !== currentUser.email) {
      const existingEmail = await prisma.users.findUnique({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }

    // Handle optional avatar upload to Cloudinary
    let avatarUrl = currentUser.avatar_url; // Default to existing
    if (req.file) {
      try {
        avatarUrl = await uploadToCloudinary(
          req.file.buffer,
          req.file.mimetype,
        );
        debug(
          "Avatar uploaded to Cloudinary for user %s: %s",
          userId,
          avatarUrl,
        );
      } catch (uploadError) {
        debug(
          "Avatar upload failed for user %s: %s",
          userId,
          uploadError.message,
        );
        return res.status(500).json({ error: "Failed to upload avatar" });
      }
    }

    // Update user (include avatar_url if changed)
    const updatedUser = await prisma.users.update({
      where: { user_id: userId },
      data: {
        name: name || currentUser.name,
        username: username || currentUser.username,
        email: email || currentUser.email,
        phone: phone || currentUser.phone,
        avatar_url: avatarUrl, // Always set (existing or new)
        ...(password && email && email !== currentUser.email
          ? { password_hash: await bcrypt.hash(password, 12) }
          : {}), // Hash only if email change (for verification)
      },
      select: {
        user_id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        avatar_url: true,
        role: true,
        created_at: true,
        updated_at: true,
      }, // Exclude password
    });

    // Regenerate token with new email if changed
    const token = generateAccessToken(updatedUser); // Assume this function exists

    debug("Update profile %s: Success", userId);

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
      token,
    });
  } catch (error) {
    debug("Update profile %s: Error - %s", userId || "unknown", error.message);
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({ error: "All password fields required" });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({ error: "New passwords do not match" });
    }

    if (new_password.length < 8) {
      return res
        .status(400)
        .json({ error: "New password must be at least 8 characters" });
    }

    // Fetch current hash
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      select: { password_hash: true },
    });

    // Validate current password
    const isValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: "Current password incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(new_password, saltRounds);

    // Update
    await prisma.users.update({
      where: { user_id: userId },
      data: { password_hash: hashedNewPassword },
    });

    // Invalidate old tokens by regenerating (optional: force re-login)
    res.json({
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
};
