const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const SALT_ROUNDS = 10;

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'yourproject.noreply@gmail.com',
    pass: process.env.EMAIL_PASS || 'your_app_password'
  }
});

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

  const isTestAccount = email.toLowerCase().endsWith('@test.com');

  if (role === 'student' && !isTestAccount) {
    const parsedYear = parseInt(year);
    if (!parsedYear || parsedYear < 1 || parsedYear > 4) {
      return res.status(400).json({ error: "Year must be between 1 and 4" });
    }

    // Strict Registration Number check
    const regNoRegex = /^3122\d{9}$/;
    if (!register_number || !regNoRegex.test(register_number)) {
      return res.status(400).json({ error: "Register number must start with 3122 followed by exactly 9 numbers (e.g., 3122235002055)" });
    }
  }

  // Domain restrictions
  if (!isTestAccount) {
    if (role === 'student') {
      const studentRegex = /^[a-zA-Z.]+[0-9]{7}@ssn\.edu\.in$/;
      if (!studentRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email! For students, it must be your name followed by 7-digit numbers @ssn.edu.in (e.g., kamalesh2310956@ssn.edu.in)" });
      }
    } else if (role === 'staff') {
      const staffRegex = /^[a-zA-Z._-]+[0-9]{7}@ssn\.edu\.in$/;
      if (!staffRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email! Staff emails must be name@ssn.edu.in (e.g., staff@ssn.edu.in)" });
      }
    } else if (role === 'admin') {
      if (!email.endsWith('@ssn.edu.in')) {
        return res.status(400).json({ error: "Admin email must be @ssn.edu.in" });
      }
    }
  }

  try {
    // Check if email already registered in Main table
    const [existing] = await db.promise().query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER(?)",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already registered and active" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[DEV INFO] OTP for ${email} is: ${otp}`);

    const userData = JSON.stringify({ email, password, role, name, register_number, department, year });
    const expiresAt = new Date(Date.now() + 3 * 60000); // 3 minutes

    // Store in otp_verifications
    await db.promise().query(
      `INSERT INTO otp_verifications (email, otp, user_data, expires_at) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE otp = VALUES(otp), user_data = VALUES(user_data), expires_at = VALUES(expires_at)`,
      [email, otp, userData, expiresAt]
    );

    // Send email using Nodemailer
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail({
          from: `"Academic Portal" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Your Verification OTP',
          text: `Your OTP for registration is: ${otp}. It expires in 10 minutes.`,
          html: `<h3>Your Verification OTP</h3><p>Your OTP for registration is: <strong>${otp}</strong>.<br>It expires in 10 minutes.</p>`
        });
      }
    } catch (mailErr) {
      console.log("Failed to send real email (missing/invalid credentials). Proceeding since OTP is logged in console.");
    }

    res.status(200).json({ message: "OTP sent to your email", requireOtp: true, email });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// ================= RESEND OTP =================
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const [rows] = await db.promise().query("SELECT user_data FROM otp_verifications WHERE LOWER(email) = LOWER(?)", [email]);
    if (rows.length === 0) return res.status(400).json({ error: "Session expired. Please sign up again." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3 * 60000); // 3 minutes

    await db.promise().query(
      "UPDATE otp_verifications SET otp = ?, expires_at = ? WHERE LOWER(email) = LOWER(?)",
      [otp, expiresAt, email]
    );
    console.log(`[DEV INFO] Resent OTP for ${email} is: ${otp}`);

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail({
          from: `"Academic Portal" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Your New Verification OTP',
          text: `Your new OTP for registration is: ${otp}. It expires in 3 minutes.`,
          html: `<h3>Your New Verification OTP</h3><p>Your new OTP for registration is: <strong>${otp}</strong>.<br>It expires in 3 minutes.</p>`
        });
      }
    } catch (mailErr) {
      console.log("Failed to resend real email.");
    }

    res.status(200).json({ message: "OTP Resent successfully" });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ error: "Failed to resend OTP" });
  }
});

// ================= VERIFY OTP =================
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM otp_verifications WHERE LOWER(email) = LOWER(?)",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "No pending session. Please sign up again." });
    }

    const record = rows[0];

    // Check expiry
    if (new Date() > new Date(record.expires_at)) {
      await db.promise().query("DELETE FROM otp_verifications WHERE email = ?", [email]);
      return res.status(400).json({ error: "OTP has expired. Please sign up again." });
    }

    // Check OTP
    if (record.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // OTP matched! Create user based on JSON data
    const userData = typeof record.user_data === 'string' ? JSON.parse(record.user_data) : record.user_data;
    const password_hash = await bcrypt.hash(userData.password, SALT_ROUNDS);

    const [result] = await db.promise().query(
      `INSERT INTO users (name, email, password_hash, role, register_number, department, year)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userData.name,
        userData.email,
        password_hash,
        userData.role,
        userData.register_number || null,
        userData.department || null,
        userData.year ? parseInt(userData.year) : null,
      ]
    );

    // Clean up OTP
    await db.promise().query("DELETE FROM otp_verifications WHERE email = ?", [email]);

    res.status(201).json({
      message: "Account verified and registered successfully!",
      // user: req.session.user <- Removed to force manual login
    });

  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ error: "Server error during verification" });
  }
});

// ================= FORGOT PASSWORD =================
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    // Check if user exists
    const [users] = await db.promise().query("SELECT id FROM users WHERE LOWER(email) = LOWER(?)", [email]);
    if (users.length === 0) {
      return res.status(404).json({ error: "No account found with this email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3 * 60000); // 3 minutes

    const userData = JSON.stringify({ type: 'password_reset' });

    await db.promise().query(
      `INSERT INTO otp_verifications (email, otp, user_data, expires_at) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE otp = VALUES(otp), user_data = VALUES(user_data), expires_at = VALUES(expires_at)`,
      [email, otp, userData, expiresAt]
    );

    console.log(`[DEV INFO] Forgot Password OTP for ${email} is: ${otp}`);

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail({
          from: `"Academic Portal" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Password Reset OTP',
          text: `Your OTP for password reset is: ${otp}. It expires in 3 minutes.`,
          html: `<h3>Password Reset Requested</h3><p>Your OTP for resetting your password is: <strong>${otp}</strong>.<br>It expires in 3 minutes.</p>`
        });
      }
    } catch (mailErr) {
      console.log("Failed to send reset email.");
    }

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================= RESET PASSWORD =================
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const [rows] = await db.promise().query("SELECT * FROM otp_verifications WHERE LOWER(email) = LOWER(?)", [email]);

    if (rows.length === 0) return res.status(400).json({ error: "Session expired. Please start over." });

    const record = rows[0];
    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ error: "OTP expired" });
    }
    if (record.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update user
    await db.promise().query("UPDATE users SET password_hash = ? WHERE LOWER(email) = LOWER(?)", [password_hash, email]);

    // Cleanup
    await db.promise().query("DELETE FROM otp_verifications WHERE email = ?", [email]);

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error" });
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