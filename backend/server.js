/**
 * @file server.js
 * @description Entrypoint for the Academic Activity Management Portal API Server.
 * Initializes Express, sets up session handling, CORS configuration, and registers core routes.
 * @author Department Portal Developers
 */

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const path = require("path");

// Load Environment Variables
dotenv.config();

const app = express();

// ===== Routes Import =====
const authRoutes = require("./routes/auth");
const activityRoutes = require("./routes/activities");
const userRoutes = require("./routes/users");
const projectRoutes = require("./routes/projects");
const dashboardRoutes = require("./routes/dashboard");
const notificationRoutes = require("./routes/notifications");

// ===== Middleware Setup =====
/**
 * CORS Configuration: Allows secure credentials passing (sessions) and
 * permits requests from the React Frontend local server.
 */
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Serve static content uploaded by users (e.g. certificates, publications, files)
 */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== Session Configuration =====
/**
 * express-session middleware configuration for secure cookie-based user auth state.
 */
app.use(session({
  secret: process.env.SESSION_SECRET || "super_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 Day
    httpOnly: true,
    secure: false // Set to true if deploying on HTTPS
  }
}));

// ===== API Route Registration =====
app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);

// ===== Health / Test Route =====
app.get("/", (req, res) => {
  res.send("Academic Portal API is running 🚀");
});

// ===== Start Server =====
const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log("=========================================");
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("👉 Press Ctrl+C to stop backend server");
  console.log("=========================================");
});