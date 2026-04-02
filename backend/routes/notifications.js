const express = require("express");
const router = express.Router();
const db = require("../db");

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (req.session.user) return next();
    res.status(401).json({ error: "Unauthorized" });
};

// GET /api/notifications - Get all notifications for current user
router.get("/", isAuthenticated, async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
            [req.session.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put("/:id/read", isAuthenticated, async (req, res) => {
    try {
        await db.promise().query(
            "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?",
            [req.params.id, req.session.user.id]
        );
        res.json({ message: "Notification marked as read" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update notification" });
    }
});

// POST /api/notifications/read-all - Mark all as read
router.post("/read-all", isAuthenticated, async (req, res) => {
    try {
        await db.promise().query(
            "UPDATE notifications SET is_read = TRUE WHERE user_id = ?",
            [req.session.user.id]
        );
        res.json({ message: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update notifications" });
    }
});

module.exports = router;
