const express = require("express");
const router = express.Router();
const db = require("../db");
const { isAuthenticated } = require("../middleware/authMiddleware");

// ===================================================
// GET /api/dashboard/stats - Aggregate metrics for charts
// ===================================================
router.get("/stats", isAuthenticated, async (req, res) => {
    const { role, id: userId } = req.session.user;

    try {
        let whereClause = "WHERE 1=1";
        const params = [];

        if (role === "staff") {
            whereClause += " AND mentor_id = ?";
            params.push(userId);
        } else if (role === "student") {
            whereClause += " AND created_by = ?";
            params.push(userId);
        }

        // 1. Basic Counts
        let counts = {};
        if (role === "admin") {
            const [[projectCount]] = await db.promise().query("SELECT COUNT(*) AS total FROM activities");
            const [[studentCount]] = await db.promise().query("SELECT COUNT(*) AS total FROM users WHERE role = 'student'");
            const [[staffCount]] = await db.promise().query("SELECT COUNT(*) AS total FROM users WHERE role IN ('staff', 'admin')");
            counts = {
                total_projects: projectCount.total,
                total_students: studentCount.total,
                total_staff: staffCount.total
            };
        } else if (role === "staff") {
            const [[menteeCount]] = await db.promise().query("SELECT COUNT(*) AS total FROM activities WHERE mentor_id = ?", [userId]);
            counts = { total_mentee_projects: menteeCount.total };
        } else {
            const [[myCount]] = await db.promise().query("SELECT COUNT(*) AS total FROM activities WHERE created_by = ?", [userId]);
            const [[compCount]] = await db.promise().query("SELECT COUNT(*) AS total FROM activities WHERE created_by = ? AND status = 'Completed'", [userId]);
            counts = {
                total_projects: myCount.total,
                completed_projects: compCount.total
            };
        }

        // 2. Project Type Distribution (Bar Chart)
        const [typeRows] = await db.promise().query(
            `SELECT activity_type as name, COUNT(*) AS count 
       FROM activities ${whereClause} 
       GROUP BY activity_type`,
            params
        );

        // 3. Domain Distribution — restricted to the 5 approved domains
        const VALID_DOMAINS = ['Agriculture', 'Education', 'Medical', 'Technology', 'Manufacturing'];
        const domainPlaceholders = VALID_DOMAINS.map(() => '?').join(', ');
        const [domainRows] = await db.promise().query(
            `SELECT domain as name, COUNT(*) AS count
       FROM activities ${whereClause}
       AND domain IN (${domainPlaceholders})
       GROUP BY domain
       ORDER BY FIELD(domain, 'Agriculture', 'Education', 'Medical', 'Technology', 'Manufacturing')`,
            [...params, ...VALID_DOMAINS]
        );

        // 4. Monthly Submissions (Line Chart)
        const [monthlyRows] = await db.promise().query(
            `SELECT DATE_FORMAT(date, '%b') AS month, COUNT(*) AS count 
       FROM activities 
       ${whereClause} 
       AND date IS NOT NULL
       GROUP BY month
       ORDER BY FIELD(month, 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec')`,
            params
        );

        // 5. Status Distribution (activity progress: Submitted, In Progress, Completed)
        const [statusRows] = await db.promise().query(
            `SELECT status as name, COUNT(*) AS count 
       FROM activities ${whereClause} 
       GROUP BY status`,
            params
        );

        // 6. Approval Status Distribution (mentor approval: Pending, Approved, Rejected)
        const [approvalRows] = await db.promise().query(
            `SELECT COALESCE(approval_status, 'Pending') as name, COUNT(*) AS count 
       FROM activities ${whereClause} 
       GROUP BY COALESCE(approval_status, 'Pending')`,
            params
        );

        res.json({
            ...counts,
            type_distribution: typeRows,
            domain_distribution: domainRows,
            monthly_submissions: monthlyRows,
            status_distribution: statusRows,
            approval_distribution: approvalRows
        });

    } catch (err) {
        console.error("Dashboard stats error:", err);
        res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
});

module.exports = router;
