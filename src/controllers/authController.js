import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import sendResponse from "../utils/response.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validasi input
    if (!name || typeof name !== "string" || name.trim() === "") {
      return sendResponse(res, 400, false, "Name is required");
    }

    if (!email || typeof email !== "string") {
      return sendResponse(res, 400, false, "Email is required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return sendResponse(res, 400, false, "Invalid email format");
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return sendResponse(res, 400, false, "Password must be at least 6 characters");
    }

    const validRoles = ["creator", "editor", "admin"];
    const userRole = role && validRoles.includes(role) ? role : "creator";

    const normalizedEmail = email.trim().toLowerCase();

    // Cek apakah email sudah terdaftar (TC-01)
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return sendResponse(res, 400, false, "Email already taken");
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user baru
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name.trim(), normalizedEmail, passwordHash, userRole]
    );

    return sendResponse(res, 201, true, "User registered successfully", {
      id: result.insertId,
      name: name.trim(),
      email: normalizedEmail,
      role: userRole,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, false, "Email and password are required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Cari user berdasarkan email
    const [users] = await pool.execute(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (users.length === 0) {
      return sendResponse(res, 401, false, "Invalid email or password");
    }

    const user = users[0];

    // Verifikasi password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return sendResponse(res, 401, false, "Invalid email or password");
    }

    // Terbitkan JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    return sendResponse(res, 200, true, "Login successful", {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

