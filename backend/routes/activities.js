const express = require("express");
const router = express.Router();
const db = require("../db");
const { isAuthenticated, hasRole } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// ===================================================
// File Upload setup (Multer)
// ===================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ===================================================
// GET /api/activities/stats  — Real aggregate counts
// ===================================================
router.get("/stats", isAuthenticated, async (req, res) => {
  try {
    const [[studentCount]] = await db.promise().query("SELECT COUNT(*) AS total FROM users WHERE role = 'student'");
    const [[activityCount]] = await db.promise().query("SELECT COUNT(*) AS total FROM activities");
    const [typeCounts] = await db.promise().query(
      `SELECT activity_type, COUNT(*) AS total
       FROM activities
       GROUP BY activity_type`
    );

    const byType = {};
    typeCounts.forEach((row) => {
      byType[row.activity_type] = row.total;
    });

    res.json({
      total_students: studentCount.total,
      total_activities: activityCount.total,
      by_type: byType,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});


// ===================================================
// GET /api/activities/my  — Own activities (student)
// ===================================================
router.get("/my", isAuthenticated, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT a.*, u.name AS student_name
       FROM activities a
       JOIN users u ON a.user_id = u.id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC`,
      [req.session.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("My activities error:", err);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});


// ===================================================
// GET /api/activities/all  — All activities w/ Filters
// ===================================================
router.get("/all", isAuthenticated, async (req, res) => {
  const { type, year, department, domain, name, register_number, date_from, date_to } = req.query;

  let query = `
    SELECT a.*, u.name AS student_name, u.department, u.register_number, u.year AS user_year
    FROM activities a
    JOIN users u ON a.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (type && type !== "All") {
    query += ` AND a.activity_type = ?`;
    params.push(type);
  }
  if (year && year !== "All") {
    // Note: The prompt asks for student_level dropdown in filter, but user role has 'year'. 
    // We should filter against either the embedded student_level or the user's year. 
    // Let's filter against a.student_level if provided.
    query += ` AND a.student_level = ?`;
    params.push(year);
  }
  if (department && department !== "All") {
    query += ` AND u.department = ?`;
    params.push(department);
  }
  if (domain && domain.trim() !== "") {
    query += ` AND a.domain LIKE ?`;
    params.push(`%${domain}%`);
  }
  if (name && name.trim() !== "") {
    query += ` AND u.name LIKE ?`;
    params.push(`%${name}%`);
  }
  if (register_number && register_number.trim() !== "") {
    query += ` AND u.register_number LIKE ?`;
    params.push(`%${register_number}%`);
  }
  if (date_from) {
    query += ` AND a.date >= ?`;
    params.push(date_from);
  }
  if (date_to) {
    query += ` AND a.date <= ?`;
    params.push(date_to);
  }

  query += ` ORDER BY a.created_at DESC`;

  try {
    const [rows] = await db.promise().query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("All activities error:", err);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});


// ===================================================
// GET /api/activities/student/:id — Activities for a student (staff/admin)
// ===================================================
router.get(
  "/student/:id",
  isAuthenticated,
  hasRole(["staff", "admin"]),
  async (req, res) => {
    try {
      const [rows] = await db.promise().query(
        `SELECT a.*, u.name AS student_name
         FROM activities a
         JOIN users u ON a.user_id = u.id
         WHERE a.user_id = ?
         ORDER BY a.created_at DESC`,
        [req.params.id]
      );
      res.json(rows);
    } catch (err) {
      console.error("Student activities error:", err);
      res.status(500).json({ error: "Failed to fetch student's activities" });
    }
  }
);


// ===================================================
// POST /api/activities/add  — Add activity w/ File Upload
// ===================================================
router.post("/add", isAuthenticated, upload.single("file"), async (req, res) => {
  const {
    title, description, activity_type, status, date,
    student_level, domain, problem_statement, abstract, team_members, mentor,
    venue, budget, position, journal_name, publisher, doi, issued_by
  } = req.body;

  if (!title || !activity_type) {
    return res.status(400).json({ error: "Title and activity type are required" });
  }

  const validTypes = [
    "Internally Funded Projects", "Conferences", "Hackathons",
    "Journal Publication", "Achievement"
  ];
  if (!validTypes.includes(activity_type)) {
    return res.status(400).json({ error: "Invalid activity type" });
  }

  const certificate_path = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const [result] = await db.promise().query(
      `INSERT INTO activities(
    user_id, title, description, activity_type, status, date,
    student_level, domain, problem_statement, abstract, team_members, mentor,
    venue, budget, position, journal_name, publisher, doi, issued_by, certificate_path
  ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.session.user.id, title, description || null, activity_type, status || "ongoing", date || null,
        student_level || null, domain || null, problem_statement || null, abstract || null,
        team_members || null, mentor || null, venue || null, budget || null, position || null,
        journal_name || null, publisher || null, doi || null, issued_by || null, certificate_path
      ]
    );

    res.status(201).json({
      message: "Activity added successfully",
      activity_id: result.insertId,
      certificate_path
    });
  } catch (err) {
    console.error("Add activity error:", err);
    res.status(500).json({ error: "Failed to add activity" });
  }
});


// ===================================================
// PUT /api/activities/:id  — Edit activity (own only, or admin) w/ File
// ===================================================
router.put("/:id", isAuthenticated, upload.single("file"), async (req, res) => {
  const {
    title, description, activity_type, status, date,
    student_level, domain, problem_statement, abstract, team_members, mentor,
    venue, budget, position, journal_name, publisher, doi, issued_by
  } = req.body;
  const activityId = req.params.id;
  const userId = req.session.user.id;
  const userRole = req.session.user.role;

  try {
    const [rows] = await db.promise().query("SELECT * FROM activities WHERE id = ?", [activityId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Activity not found" });
    }
    if (userRole !== "admin" && rows[0].user_id !== userId) {
      return res.status(403).json({ error: "You can only edit your own activities" });
    }

    // Keep old file if no new file is uploaded
    const certificate_path = req.file ? `/uploads/${req.file.filename}` : rows[0].certificate_path;

    await db.promise().query(
      `UPDATE activities SET
  title = ?, description = ?, activity_type = ?, status = ?, date = ?,
    student_level = ?, domain = ?, problem_statement = ?, abstract = ?, team_members = ?, mentor = ?,
    venue = ?, budget = ?, position = ?, journal_name = ?, publisher = ?, doi = ?, issued_by = ?, certificate_path = ?
      WHERE id = ? `,
      [
        title || rows[0].title,
        description !== undefined ? description : rows[0].description,
        activity_type || rows[0].activity_type,
        status || rows[0].status,
        date || rows[0].date,
        student_level !== undefined ? student_level : rows[0].student_level,
        domain !== undefined ? domain : rows[0].domain,
        problem_statement !== undefined ? problem_statement : rows[0].problem_statement,
        abstract !== undefined ? abstract : rows[0].abstract,
        team_members !== undefined ? team_members : rows[0].team_members,
        mentor !== undefined ? mentor : rows[0].mentor,
        venue !== undefined ? venue : rows[0].venue,
        budget !== undefined ? budget : rows[0].budget,
        position !== undefined ? position : rows[0].position,
        journal_name !== undefined ? journal_name : rows[0].journal_name,
        publisher !== undefined ? publisher : rows[0].publisher,
        doi !== undefined ? doi : rows[0].doi,
        issued_by !== undefined ? issued_by : rows[0].issued_by,
        certificate_path,
        activityId
      ]
    );

    res.json({ message: "Activity updated successfully", certificate_path });
  } catch (err) {
    console.error("Edit activity error:", err);
    res.status(500).json({ error: "Failed to update activity" });
  }
});


// ===================================================
// DELETE /api/activities/:id  — Delete activity (own + admin)
// ===================================================
router.delete("/:id", isAuthenticated, async (req, res) => {
  const activityId = req.params.id;
  const userId = req.session.user.id;
  const userRole = req.session.user.role;

  try {
    const [rows] = await db.promise().query("SELECT * FROM activities WHERE id = ?", [activityId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Activity not found" });
    }
    if (userRole !== "admin" && rows[0].user_id !== userId) {
      return res.status(403).json({ error: "You can only delete your own activities" });
    }

    await db.promise().query("DELETE FROM activities WHERE id = ?", [activityId]);
    res.json({ message: "Activity deleted successfully" });
  } catch (err) {
    console.error("Delete activity error:", err);
    res.status(500).json({ error: "Failed to delete activity" });
  }
});

module.exports = router;