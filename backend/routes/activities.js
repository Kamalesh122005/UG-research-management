const express = require("express");
const router = express.Router();
const db = require("../db");
const { isAuthenticated, hasRole } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// ===================================================
// Allowed domain values (single source of truth)
// ===================================================
const VALID_DOMAINS = ["Education", "Manufacturing", "Technology", "Medical", "Agriculture"];

// Helper for notifications
const createNotification = async (userId, message) => {
  try {
    await db.promise().query(
      "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
      [userId, message]
    );
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
};

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
const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, JPG, and PNG are allowed"), false);
  }
};
const upload = multer({ storage, fileFilter });

const uploadFileMiddleware = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
};

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
      `SELECT DISTINCT a.*, u.name AS student_name,
              COALESCE(m.name, a.mentor_name) AS mentor_display_name,
              COALESCE(m.email, a.mentor_email) AS mentor_display_email,
              (SELECT GROUP_CONCAT(name SEPARATOR ', ') FROM activity_members WHERE activity_id = a.id AND status = 'accepted') AS dynamic_team_members
       FROM activities a
       JOIN users u ON a.created_by = u.id
       LEFT JOIN users m ON a.mentor_id = m.id
       LEFT JOIN activity_members am ON a.id = am.activity_id AND am.user_id = ? AND am.status = 'accepted'
       WHERE a.created_by = ? OR am.id IS NOT NULL
       ORDER BY a.created_at DESC`,
      [req.session.user.id, req.session.user.id]
    );
    res.json(rows || []);
  } catch (err) {
    console.error("My activities error:", err);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});


// ===================================================
// GET /api/activities/mentor — Projects supervised by mentor
// ===================================================
router.get("/mentor", isAuthenticated, hasRole(["staff", "admin"]), async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT a.*, u.name AS student_name, u.department, u.register_number, u.year AS user_year,
              (SELECT GROUP_CONCAT(name SEPARATOR ', ') FROM activity_members WHERE activity_id = a.id AND status = 'accepted') AS dynamic_team_members
       FROM activities a
       JOIN users u ON a.user_id = u.id
       WHERE a.mentor_id = ?
       ORDER BY a.created_at DESC`,
      [req.session.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Mentor activities error:", err);
    res.status(500).json({ error: "Failed to fetch mentee activities" });
  }
});


// ===================================================
// GET /api/activities/all  — All activities w/ Filters
// ===================================================
router.get("/all", isAuthenticated, async (req, res) => {
  const { type, year, department, domain, name, register_number, date_from, date_to, keyword, mentor_id } = req.query;

  let query = `
    SELECT a.*, u.name AS student_name, u.department, u.register_number, u.year AS user_year,
           COALESCE(m.name, a.mentor_name) AS mentor_display_name,
           COALESCE(m.email, a.mentor_email) AS mentor_display_email,
           (SELECT GROUP_CONCAT(name SEPARATOR ', ') FROM activity_members WHERE activity_id = a.id AND status = 'accepted') AS dynamic_team_members
    FROM activities a
    JOIN users u ON a.created_by = u.id
    LEFT JOIN users m ON a.mentor_id = m.id
    WHERE a.approval_status = 'Approved'
  `;
  const params = [];

  if (type && type !== "All") { query += ` AND a.activity_type = ?`; params.push(type); }
  if (year && year !== "All") { query += ` AND a.student_level = ?`; params.push(year); }
  if (department && department !== "All") { query += ` AND u.department = ?`; params.push(department); }
  if (domain && domain !== "All") { query += ` AND a.domain = ?`; params.push(domain); }
  if (name && name.trim()) { query += ` AND u.name LIKE ?`; params.push(`%${name.trim()}%`); }
  if (register_number && register_number.trim()) { query += ` AND u.register_number LIKE ?`; params.push(`%${register_number.trim()}%`); }
  if (date_from) { query += ` AND a.date >= ?`; params.push(date_from); }
  if (date_to) { query += ` AND a.date <= ?`; params.push(date_to); }
  if (keyword && keyword.trim()) {
    const k = `%${keyword.trim()}%`;
    query += ` AND (a.title LIKE ? OR a.keywords LIKE ? OR a.description LIKE ? OR a.date LIKE ?)`;
    params.push(k, k, k, k);
  }
  if (mentor_id && mentor_id !== "All") { query += ` AND a.mentor_id = ?`; params.push(mentor_id); }

  query += ` ORDER BY a.created_at DESC`;

  try {
    const [rows] = await db.promise().query(query, params);
    res.json(rows || []);
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
router.post("/add", isAuthenticated, uploadFileMiddleware, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Document upload is required" });
  }
  const {
    title, description, activity_type, status, date,
    student_level, domain, problem_statement, abstract, team_members,
    mentor_name, mentor_email, mentor_type, mentor_id, keywords,
    venue, budget, position, journal_name, publisher, doi, issued_by
  } = req.body;

  if (!title || !activity_type) {
    return res.status(400).json({ error: "Title and activity type are required" });
  }

  // Mentor enforcement: must have either internal (id) or external (name)
  if (!mentor_id && !mentor_name) {
    return res.status(400).json({ error: "Mentor assignment is required for all submissions." });
  }

  const validTypes = ["Internally Funded Projects", "Conferences", "Hackathons", "Journal Publication", "Achievement"];
  if (!validTypes.includes(activity_type)) {
    return res.status(400).json({ error: "Invalid activity type: " + activity_type });
  }

  if (!domain || !VALID_DOMAINS.includes(domain)) {
    return res.status(400).json({ error: "Invalid domain selected" });
  }

  // ===================================================
  // REDUNDANCY CHECK: Prevent duplicate submissions (Strict)
  // ===================================================
  try {
    const trimmedTitle = title.trim();
    const [existing] = await db.promise().query(
      "SELECT id FROM activities WHERE LOWER(TRIM(title)) = LOWER(?) AND activity_type = ? AND created_by = ?",
      [trimmedTitle, activity_type, req.session.user.id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: "Activity Redundancy Detected",
        message: `You have already submitted an activity titled '${trimmedTitle}' under ${activity_type}. Please edit the existing entry or use a unique title.`
      });
    }
  } catch (err) {
    console.error("Redundancy check error:", err);
    return res.status(500).json({ error: "Internal server error during validation" });
  }

  const actStatus = status || 'Submitted';

  // Validate mentor_id is a real staff user if provided
  let resolvedMentorId = null;
  if (mentor_id && mentor_id !== '' && mentor_id !== 'null') {
    const [mentorRows] = await db.promise().query(`SELECT id FROM users WHERE id = ? AND role = 'staff'`, [mentor_id]);
    if (mentorRows.length === 0) return res.status(400).json({ error: "Invalid mentor selected" });
    resolvedMentorId = mentor_id;
  }

  const certificate_path = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const [result] = await db.promise().query(
      `INSERT INTO activities(
    user_id, created_by, title, description, activity_type, status, date,
    student_level, domain, problem_statement, abstract, team_members, mentor_name,
    venue, budget, position, journal_name, publisher, doi, issued_by, certificate_path,
    mentor_id, mentor_email, mentor_type, keywords
  ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.session.user.id, req.session.user.id, title, description || null, activity_type, actStatus, date || null,
        student_level || null, domain, problem_statement || null, abstract || null,
        null, mentor_name || null, venue || null, budget || null, position || null,
        journal_name || null, publisher || null, doi || null, issued_by || null, certificate_path,
        resolvedMentorId, mentor_email || null, mentor_type || 'internal', keywords || null
      ]
    );

    const activityId = result.insertId;

    // Owner automatically accepted
    await db.promise().query(
      `INSERT INTO activity_members (activity_id, user_id, name, email, status, responded_at) VALUES (?, ?, ?, ?, 'accepted', NOW())`,
      [activityId, req.session.user.id, req.session.user.name, req.session.user.email]
    );

    // Team members
    if (team_members) {
      try {
        const parsed = JSON.parse(team_members);
        for (const tm of parsed) {
          if (tm.email === req.session.user.email) continue;
          const [[u]] = await db.promise().query(`SELECT id FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))`, [tm.email]);
          const uid = u ? u.id : null;
          await db.promise().query(
            `INSERT INTO activity_members (activity_id, user_id, name, email, status) VALUES (?, ?, ?, ?, 'pending')`,
            [activityId, uid, tm.name, tm.email]
          );
          if (uid) {
            await createNotification(uid, `You have been invited to join a project/activity: "${title}"`);
          }
        }
      } catch (e) { }
    }

    // Trigger notification to mentor
    if (resolvedMentorId) {
      await createNotification(
        resolvedMentorId,
        `New project submitted under your mentorship: "${title}"`
      );
    }

    res.status(201).json({ message: "Activity submitted successfully", status: actStatus, activity_id: activityId, certificate_path });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
      return res.status(409).json({
        error: "Activity Redundancy Detected",
        message: `You have already submitted an activity with the title '${title}' under '${activity_type || 'this category'}'. Please use a unique title.`
      });
    }
    console.error("Add activity error:", err);
    res.status(500).json({ error: "Failed to save activity. Please try again." });
  }

});


// ===================================================
// PUT /api/activities/:id  — Edit activity (own only, or admin) w/ File
// ===================================================
router.put("/:id", isAuthenticated, uploadFileMiddleware, async (req, res) => {
  const {
    title, description, activity_type, status, date,
    student_level, domain, problem_statement, abstract, team_members,
    mentor_name, mentor_email, mentor_type, mentor_id, keywords,
    venue, budget, position, journal_name, publisher, doi, issued_by
  } = req.body;
  const activityId = req.params.id;
  const userId = req.session.user.id;
  const userRole = req.session.user.role;

  try {
    const [rows] = await db.promise().query("SELECT * FROM activities WHERE id = ?", [activityId]);
    if (rows.length === 0) return res.status(404).json({ error: "Activity not found" });
    if (userRole !== "admin" && rows[0].created_by !== userId && rows[0].mentor_id !== userId) return res.status(403).json({ error: "You can only edit your own activities" });

    const validStatuses = ['Submitted', 'Approved', 'Rejected', 'In Progress', 'Completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    if (domain !== undefined && !VALID_DOMAINS.includes(domain)) {
      return res.status(400).json({ error: "Invalid domain selected" });
    }

    const effectiveType = activity_type || rows[0].activity_type;
    // Mentor enforcement
    if (mentor_id === undefined && mentor_name === undefined) {
      // If none provided, check if already exists
      if (!rows[0].mentor_id && !rows[0].mentor_name) {
        return res.status(400).json({ error: "Mentor is required." });
      }
    }

    let resolvedMentorId = rows[0].mentor_id;
    if (mentor_id !== undefined) {
      if (!mentor_id || mentor_id === '') {
        resolvedMentorId = null;
      } else {
        const [mRows] = await db.promise().query(`SELECT id FROM users WHERE id = ? AND role = 'staff'`, [mentor_id]);
        if (mRows.length === 0) return res.status(400).json({ error: "Invalid mentor selected" });
        resolvedMentorId = mentor_id;
      }
    }

    // Locking for students: cannot modify certificate if status is 'Submitted'
    if (userRole === 'student' && rows[0].status === 'Submitted' && req.file) {
      return res.status(403).json({ error: "Documents cannot be modified after submission. Contact an administrator if changes are needed." });
    }

    const certificate_path = req.file ? `/uploads/${req.file.filename}` : rows[0].certificate_path;

    await db.promise().query(
      `UPDATE activities SET
    title=?, description=?, activity_type=?, status=?, date=?,
    student_level=?, domain=?, problem_statement=?, abstract=?, team_members=?, mentor_name=?,
    venue=?, budget=?, position=?, journal_name=?, publisher=?, doi=?, issued_by=?,
    certificate_path=?, mentor_id=?, mentor_email=?, mentor_type=?, keywords=?
    WHERE id=?`,
      [
        title || rows[0].title,
        description !== undefined ? description : rows[0].description,
        effectiveType,
        status || rows[0].status,
        date || rows[0].date,
        student_level !== undefined ? student_level : rows[0].student_level,
        domain !== undefined ? domain : rows[0].domain,
        problem_statement !== undefined ? problem_statement : rows[0].problem_statement,
        abstract !== undefined ? abstract : rows[0].abstract,
        null,
        mentor_name !== undefined ? mentor_name : rows[0].mentor_name,
        venue !== undefined ? venue : rows[0].venue,
        budget !== undefined ? budget : rows[0].budget,
        position !== undefined ? position : rows[0].position,
        journal_name !== undefined ? journal_name : rows[0].journal_name,
        publisher !== undefined ? publisher : rows[0].publisher,
        doi !== undefined ? doi : rows[0].doi,
        issued_by !== undefined ? issued_by : rows[0].issued_by,
        certificate_path,
        resolvedMentorId,
        mentor_email !== undefined ? mentor_email : rows[0].mentor_email,
        mentor_type !== undefined ? mentor_type : rows[0].mentor_type,
        keywords !== undefined ? keywords : rows[0].keywords,
        activityId
      ]
    );

    // If team_members is provided in PUT, update activity_members
    if (team_members) {
      try {
        const parsed = JSON.parse(team_members);

        // delete old members except owner
        await db.promise().query(
          "DELETE FROM activity_members WHERE activity_id = ? AND user_id != ?",
          [activityId, rows[0].created_by]
        );

        for (const tm of parsed) {
          if (tm.name.trim() === rows[0].student_name) continue;
          let email = tm.email;
          const [[u]] = email ? await db.promise().query(`SELECT id FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))`, [email]) : [[null]];
          const uid = u ? u.id : null;
          await db.promise().query(
            `INSERT INTO activity_members (activity_id, user_id, name, email, status) VALUES (?, ?, ?, ?, 'pending')`,
            [activityId, uid, tm.name, email || '']
          );
        }
      } catch (err) {
        console.error("Team member update error in PUT", err);
      }
    }
    res.json({ message: "Activity updated successfully", certificate_path });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
      return res.status(409).json({
        error: "Activity Redundancy Detected",
        message: `Another activity already exists with the title '${title}' in this category for you. Please use a unique title.`
      });
    }
    console.error("Update activity error:", err);
    res.status(500).json({ error: "Failed to update activity. Please try again." });
  }
});

// Helper for approval logic
const processApproval = async (req, res, targetStatus) => {
  const { reason } = req.body;
  const activityId = req.params.id;

  try {
    const [rows] = await db.promise().query("SELECT * FROM activities WHERE id = ?", [activityId]);
    if (rows.length === 0) return res.status(404).json({ error: "Project not found" });

    // Auth check
    if (req.session.user.role !== 'admin' && rows[0].mentor_id !== req.session.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await db.promise().query("UPDATE activities SET approval_status = ?, feedback = ? WHERE id = ?", [targetStatus, reason || null, activityId]);

    const message = targetStatus === 'Approved'
      ? `Your project "${rows[0].title}" has been approved!`
      : `Your project "${rows[0].title}" has been rejected. ${reason ? 'Reason: ' + reason : ''}`;

    await createNotification(rows[0].created_by, message);
    res.json({ message: `Project ${targetStatus.toLowerCase()} successfully` });
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ error: "Failed to update" });
  }
};

// Requirement 5: Specific endpoints
router.put("/:id/approve", isAuthenticated, hasRole(["staff", "admin"]), (req, res) => processApproval(req, res, 'Approved'));
router.put("/:id/reject", isAuthenticated, hasRole(["staff", "admin"]), (req, res) => processApproval(req, res, 'Rejected'));

// Original endpoint for compatibility
router.put("/:id/status", isAuthenticated, hasRole(["staff", "admin"]), async (req, res) => {
  const { status } = req.body;
  if (!['Approved', 'Rejected'].includes(status)) return res.status(400).json({ error: "Invalid status" });
  return processApproval(req, res, status);
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
    if (userRole !== "admin" && rows[0].user_id !== userId && rows[0].mentor_id !== userId) {
      return res.status(403).json({ error: "You can only delete your own activities or your mentees' activities" });
    }

    await db.promise().query("DELETE FROM activities WHERE id = ?", [activityId]);
    res.json({ message: "Activity deleted successfully" });
  } catch (err) {
    console.error("Delete activity error:", err);
    res.status(500).json({ error: "Failed to delete activity" });
  }
});


// ============================================
// GET /api/activities/invitations
// ============================================
router.get('/invitations', isAuthenticated, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT am.id as invite_id, a.id as activity_id, a.title as project_title, u.name as owner_name, am.invited_at
       FROM activity_members am
       JOIN activities a ON am.activity_id = a.id
       JOIN users u ON a.created_by = u.id
       WHERE am.user_id = ? AND am.status = 'pending'
       ORDER BY am.invited_at DESC`,
      [req.session.user.id]
    );
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// ============================================
// PUT /api/activities/invite/respond
// ============================================
router.put('/invite/respond', isAuthenticated, async (req, res) => {
  const { invite_id, response } = req.body; // response: 'accepted' or 'rejected'
  try {
    const [rows] = await db.promise().query("SELECT * FROM activity_members WHERE id = ? AND user_id = ?", [invite_id, req.session.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Invite not found' });

    await db.promise().query(
      "UPDATE activity_members SET status = ?, responded_at = NOW() WHERE id = ?",
      [response, invite_id]
    );

    // Notify owner
    const [[activity]] = await db.promise().query("SELECT created_by, title FROM activities WHERE id = ?", [rows[0].activity_id]);
    if (activity) {
      await createNotification(activity.created_by, `${req.session.user.name} has ${response} your invitation to join "${activity.title}"`);
    }

    res.json({ message: `Invitation ${response} successfully` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to respond to invitation' });
  }
});

module.exports = router;