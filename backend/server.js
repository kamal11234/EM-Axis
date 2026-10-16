
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();

const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================
// MIDDLEWARE
// =====================================
app.use(cors());
app.use(express.json({ limit: "10kb" }));

// =====================================
// HOME ROUTE
// =====================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EM-AXIS Backend Server is running!",
  });
});

// =====================================
// DATABASE CONNECTION TEST
// =====================================
app.get("/api/health/db", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database"
    );

    res.json({
      success: true,
      message: "PostgreSQL connected successfully!",
      database: result.rows[0].database,
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed.",
    });
  }
});

// =====================================
// REGISTRATION API
// =====================================
app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      role,
      mobile,
      joining_date,
    } = req.body;

    // Required fields
    if (
      typeof full_name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof role !== "string" ||
      !full_name.trim() ||
      !email.trim() ||
      !password ||
      !role.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const cleanName = full_name.trim();
    const cleanEmail = email.trim().toLowerCase();

    const cleanRole = role
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");

    // Name validation
    if (cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must be 100 characters or fewer.",
      });
    }

    // Email validation
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
      cleanEmail.length > 150
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    // Mobile is required and must contain exactly 10 digits
    const cleanMobile =
      typeof mobile === "string" ? mobile.trim() : "";

    if (!/^\d{10}$/.test(cleanMobile)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number.",
      });
    }

    // Allowed roles
    const allowedRoles = [
      "reporter",
      "editor",
      "channel_head",
    ];

    if (!allowedRoles.includes(cleanRole)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid role.",
      });
    }

    // Joining date
    const cleanJoiningDate =
      joining_date || new Date().toISOString().slice(0, 10);

    if (
      typeof cleanJoiningDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(cleanJoiningDate) ||
      Number.isNaN(Date.parse(cleanJoiningDate))
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid joining date.",
      });
    }

    // Check duplicate email
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [cleanEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert user into PostgreSQL
    const result = await pool.query(
      `INSERT INTO users
        (
          full_name,
          email,
          mobile,
          password_hash,
          role,
          joining_date
        )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING
          id,
          full_name,
          email,
          mobile,
          role,
          joining_date`,
      [
        cleanName,
        cleanEmail,
        cleanMobile,
        passwordHash,
        cleanRole,
        cleanJoiningDate,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful!",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
});

// =====================================
// LOGIN API
// =====================================
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof role !== "string" ||
      !email.trim() ||
      !password ||
      !role.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter email, password and role.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const cleanRole = role
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");

    const result = await pool.query(
      `SELECT
         id,
         full_name,
         email,
         mobile,
         password_hash,
         role,
         joining_date
       FROM users
       WHERE email = $1`,
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.role !== cleanRole) {
      return res.status(403).json({
        success: false,
        message: "Selected role does not match your registered role.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        joining_date: user.joining_date,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});

// =====================================
// GET USER PROFILE API
// =====================================
app.get("/api/users/:id", async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const result = await pool.query(
      `SELECT
         id,
         full_name,
         email,
         mobile,
         role,
         joining_date
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Profile fetch error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load profile.",
    });
  }
});

// =====================================
// START SERVER
// =====================================
app.listen(PORT, () => {
  console.log(`EM-AXIS server running at http://localhost:${PORT}`);
});
