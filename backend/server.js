
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

    return res.status(200).json({
      success: true,
      message: "PostgreSQL connected successfully!",
      database: result.rows[0].database,
    });
  } catch (error) {
    console.error("DATABASE ERROR:", error);

    return res.status(500).json({
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

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    const cleanMobile =
      typeof mobile === "string" ? mobile.trim() : "";

    if (!/^\d{10}$/.test(cleanMobile)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number.",
      });
    }

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

    const passwordHash = await bcrypt.hash(password, 12);

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
    console.error("REGISTRATION ERROR:", error);

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

    if (!user.password_hash) {
      return res.status(500).json({
        success: false,
        message: "Account configuration error.",
      });
    }

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
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});

// =====================================
// EXISTING USER PROFILE API
// REPORTER / OTHER EXISTING FLOWS
// LEFT AS-IS
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
    console.error("PROFILE FETCH ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load profile.",
    });
  }
});

// =====================================
// EDITOR PROFILE - GET API
// =====================================
app.get("/api/editor/profile/:id", async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid editor ID.",
      });
    }

    const result = await pool.query(
      `SELECT
         id,
         full_name,
         email,
         mobile,
         role,
         joining_date,
         gender,
         account_status
       FROM users
       WHERE id = $1 AND role = 'editor'`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Editor profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("EDITOR PROFILE FETCH ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load editor profile.",
    });
  }
});

// =====================================
// EDITOR PROFILE - UPDATE API
// =====================================
app.patch("/api/editor/profile/:id", async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid editor ID.",
      });
    }

    const {
      full_name,
      mobile,
      gender,
      account_status,
    } = req.body;

    if (
      typeof full_name !== "string" ||
      !full_name.trim() ||
      full_name.trim().length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid name.",
      });
    }

    if (
      typeof mobile !== "string" ||
      !/^\d{10}$/.test(mobile.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number.",
      });
    }

    const allowedGenders = ["Male", "Female", "Other"];

    if (
      gender != null &&
      gender !== "" &&
      !allowedGenders.includes(gender)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid gender.",
      });
    }

    const allowedStatuses = ["Active", "Inactive"];

    if (!allowedStatuses.includes(account_status)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid account status.",
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET
         full_name = $1,
         mobile = $2,
         gender = $3,
         account_status = $4
       WHERE id = $5 AND role = 'editor'
       RETURNING
         id,
         full_name,
         email,
         mobile,
         role,
         joining_date,
         gender,
         account_status`,
      [
        full_name.trim(),
        mobile.trim(),
        gender || null,
        account_status,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Editor profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Editor profile updated successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("EDITOR PROFILE UPDATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update editor profile.",
    });
  }
});

// =====================================
// START SERVER
// =====================================
app.listen(PORT, () => {
  console.log(`EM-AXIS server running on port ${PORT}`);
});
