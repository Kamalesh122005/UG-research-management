const express = require("express");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ⭐ Import routes
const path = require("path");
const authRoutes = require("./routes/auth");
const activityRoutes = require("./routes/activities");
const userRoutes = require("./routes/users");   // ✅ ADD THIS

// ===== Middleware =====
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== Session =====
app.use(session({
  secret: process.env.SESSION_SECRET || "super_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: false
  }
}));

// ⭐ Routes
app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/users", userRoutes);   // ✅ THIS FIXES PROFILE

// ===== Test Route =====
app.get("/", (req, res) => {
  res.send("Academic Portal API is running 🚀");
});

// ===== Start Server =====
const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});