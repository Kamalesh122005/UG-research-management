const express = require('express');
const router = express.Router();
const db = require('../db');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');


// ======================================================
// GET /api/users/profile — Own profile
// ======================================================
router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const [results] = await db.promise().query(
            'SELECT id, name, email, role, register_number, department, year, created_at FROM users WHERE id = ?',
            [req.session.user.id]
        );

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(results[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
});


// ======================================================
// GET /api/users/all-users — All users (admin only)
// ======================================================
router.get(
    '/all-users',
    isAuthenticated,
    hasRole(['admin']),
    async (req, res) => {
        try {
            const [results] = await db.promise().query(
                `SELECT id, name, email, role, register_number, department, year, created_at
         FROM users
         ORDER BY created_at DESC`
            );
            res.json(results);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error fetching users' });
        }
    }
);


// ======================================================
// GET /api/users/staff — All staff users (for mentor dropdown)
// ======================================================
router.get(
    '/staff',
    isAuthenticated,
    async (req, res) => {
        try {
            const [results] = await db.promise().query(
                `SELECT id, name, email, department FROM users WHERE role = 'staff' ORDER BY name ASC`
            );
            res.json(results);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error fetching staff' });
        }
    }
);


// ======================================================
// GET /api/users/students — All students (staff/admin)
// ======================================================
router.get(
    '/students',
    isAuthenticated,
    hasRole(['staff', 'admin']),
    async (req, res) => {
        try {
            let query = `
        SELECT id, name, email, register_number, department, year
        FROM users
        WHERE role = 'student'
      `;
            const params = [];

            const { year, department, search } = req.query;

            if (year) {
                query += ' AND year = ?';
                params.push(year);
            }

            if (department) {
                query += ' AND department = ?';
                params.push(department);
            }

            if (search) {
                query += ' AND (name LIKE ? OR register_number LIKE ? OR email LIKE ?)';
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }

            query += ' ORDER BY name ASC';

            const [results] = await db.promise().query(query, params);
            res.json(results);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error fetching students' });
        }
    }
);


// ======================================================
// GET /api/users/students/:id — Single student (staff/admin)
// ======================================================
router.get(
    '/students/:id',
    isAuthenticated,
    hasRole(['staff', 'admin']),
    async (req, res) => {
        try {
            const [results] = await db.promise().query(
                `SELECT id, name, email, register_number, department, year, created_at
         FROM users
         WHERE id = ? AND role = 'student'`,
                [req.params.id]
            );

            if (results.length === 0) {
                return res.status(404).json({ error: 'Student not found' });
            }

            res.json(results[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error fetching student' });
        }
    }
);


// ======================================================
// DELETE /api/users/:id — Delete user (admin only)
// ======================================================
router.delete(
    '/:id',
    isAuthenticated,
    hasRole(['admin']),
    async (req, res) => {
        try {
            const [result] = await db.promise().query(
                'DELETE FROM users WHERE id = ?',
                [req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ message: 'User deleted successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error deleting user' });
        }
    }
);

module.exports = router;