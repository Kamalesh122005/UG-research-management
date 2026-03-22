const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  const { email, password, role, name, register_number, department, year } = req.body;

  if (!email || !password || !role || !name) {
    return res.status(400).json({ error: "Required fields missing (name, email, password, role)" });
  }

  const allowedRoles = ["student", "staff", "admin"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role. Must be student, staff, or admin." });
  }

  if (role === 'student') {
    const parsedYear = parseInt(year);
    if (!parsedYear || parsedYear < 1 || parsedYear > 4) {
      return res.status(400).json({ error: "Year must be between 1 and 4" });
    }
  }

  try {
    // Check if email already used
    const [existing] = await db.promise().query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await db.promise().query(
      `INSERT INTO users (name, email, password_hash, role, register_number, department, year)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        password_hash,
        role,
        register_number || null,
        department || null,
        year ? parseInt(year) : null,
      ]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: { id: result.insertId, email, role, name },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});


// ================= LOGIN =================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const [results] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = results[0];

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Save session
    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
      register_number: user.register_number,
      year: user.year,
    };

    res.json({
      message: "Logged in successfully",
      user: req.session.user,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});


// ================= LOGOUT =================
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});


// ================= CURRENT USER =================
router.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({ user: req.session.user });
});

module.exports = router;