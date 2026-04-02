const express = require('express');
const router = express.Router();
const db = require('../db');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// ──────────────────────────────────────────
// File upload config
// ──────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

const VALID_DOMAINS = ['Education', 'Manufacturing', 'Technology', 'Medical', 'Agriculture'];
const VALID_STATUSES = ['Submitted', 'In Progress', 'Completed'];

// ──────────────────────────────────────────────────────────────────
// GET /api/projects/mentors  — list staff users for mentor dropdown
// ──────────────────────────────────────────────────────────────────
router.get('/mentors', isAuthenticated, async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            `SELECT id, name, email, department FROM users WHERE role = 'staff' ORDER BY name ASC`
        );
        res.json(rows);
    } catch (err) {
        console.error('Mentors fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch mentors' });
    }
});

// ──────────────────────────────────────────────────────────────────
// GET /api/projects/my  — student's own projects
// ──────────────────────────────────────────────────────────────────
router.get('/my', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [rows] = await db.promise().query(
            `SELECT p.*,
                    COALESCE(u.name, p.mentor_name) AS mentor_display_name,
                    COALESCE(u.email, p.mentor_email) AS mentor_display_email,
                    GROUP_CONCAT(DISTINCT s.name ORDER BY s.name SEPARATOR ', ') AS team_names
             FROM projects p
             LEFT JOIN users u ON p.mentor_id = u.id
             JOIN project_members pm ON pm.project_id = p.id
             LEFT JOIN project_members pm2 ON pm2.project_id = p.id
             LEFT JOIN users s ON s.id = pm2.user_id
             WHERE pm.user_id = ?
             GROUP BY p.id
             ORDER BY p.created_at DESC`,
            [userId]
        );
        res.json(rows);
    } catch (err) {
        console.error('My projects error:', err);
        res.status(500).json({ error: 'Failed to fetch your projects' });
    }
});

// ──────────────────────────────────────────────────────────────────
// GET /api/projects/mentee  — mentor sees their mentees' projects
// ──────────────────────────────────────────────────────────────────
router.get('/mentee', isAuthenticated, hasRole(['staff', 'admin']), async (req, res) => {
    try {
        const mentorId = req.session.user.id;
        const [rows] = await db.promise().query(
            `SELECT p.*,
                    COALESCE(u.name, p.mentor_name) AS mentor_display_name,
                    COALESCE(u.email, p.mentor_email) AS mentor_display_email,
                    GROUP_CONCAT(DISTINCT s.name ORDER BY s.name SEPARATOR ', ') AS team_names
             FROM projects p
             LEFT JOIN users u ON p.mentor_id = u.id
             LEFT JOIN project_members pm ON pm.project_id = p.id
             LEFT JOIN users s ON s.id = pm.user_id
             WHERE p.mentor_id = ? OR (p.mentor_id IS NULL AND p.mentor_type = 'external')
             GROUP BY p.id
             ORDER BY p.created_at DESC`,
            [mentorId]
        );
        res.json(rows);
    } catch (err) {
        console.error('Mentee projects error:', err);
        res.status(500).json({ error: 'Failed to fetch mentee projects' });
    }
});

// ──────────────────────────────────────────────────────────────────
// GET /api/projects/all  — all projects with filters (staff/admin)
// Supports: ?domain= ?keyword= ?mentor_id= ?status= ?year=
// ──────────────────────────────────────────────────────────────────
router.get('/all', isAuthenticated, hasRole(['staff', 'admin']), async (req, res) => {
    const { domain, keyword, mentor_id, status, year } = req.query;

    let query = `
        SELECT p.*,
               COALESCE(u.name, p.mentor_name) AS mentor_display_name,
               COALESCE(u.email, p.mentor_email) AS mentor_display_email,
               GROUP_CONCAT(DISTINCT s.name ORDER BY s.name SEPARATOR ', ') AS team_names
        FROM projects p
        LEFT JOIN users u ON p.mentor_id = u.id
        LEFT JOIN project_members pm ON pm.project_id = p.id
        LEFT JOIN users s ON s.id = pm.user_id
        WHERE 1=1
    `;
    const params = [];

    if (domain && domain !== 'All') { query += ' AND p.domain = ?'; params.push(domain); }
    if (keyword && keyword.trim()) { query += ' AND (p.title LIKE ? OR p.keywords LIKE ? OR p.description LIKE ?)'; const k = `%${keyword.trim()}%`; params.push(k, k, k); }
    if (mentor_id && mentor_id !== 'All') { query += ' AND p.mentor_id = ?'; params.push(mentor_id); }
    if (status && status !== 'All') { query += ' AND p.status = ?'; params.push(status); }
    if (year && year !== 'All') { query += ' AND YEAR(p.created_at) = ?'; params.push(year); }

    query += ' GROUP BY p.id ORDER BY p.created_at DESC';

    try {
        const [rows] = await db.promise().query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('All projects error:', err);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// ──────────────────────────────────────────────────────────────────
// GET /api/projects/:id  — single project detail
// ──────────────────────────────────────────────────────────────────
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            `SELECT p.*,
                    COALESCE(u.name, p.mentor_name) AS mentor_display_name,
                    COALESCE(u.email, p.mentor_email) AS mentor_display_email,
                    GROUP_CONCAT(DISTINCT s.name ORDER BY s.name SEPARATOR ', ') AS team_names,
                    GROUP_CONCAT(DISTINCT pm.user_id ORDER BY s.name SEPARATOR ',') AS member_ids
             FROM projects p
             LEFT JOIN users u ON p.mentor_id = u.id
             LEFT JOIN project_members pm ON pm.project_id = p.id
             LEFT JOIN users s ON s.id = pm.user_id
             WHERE p.id = ?
             GROUP BY p.id`,
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Project not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error('Single project error:', err);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// ──────────────────────────────────────────────────────────────────
// POST /api/projects/add  — student creates a project (status=pending)
// ──────────────────────────────────────────────────────────────────
router.post('/add', isAuthenticated, hasRole(['student']), async (req, res) => {
    const { title, description, domain, keywords, mentor_id, mentor_name, mentor_email, mentor_type, member_ids } = req.body;
    const userId = req.session.user.id;

    if (!title || !domain) {
        return res.status(400).json({ error: 'Title and domain are required' });
    }
    if (!mentor_id && !mentor_name) {
        return res.status(400).json({ error: 'Mentor assignment is required' });
    }
    if (!VALID_DOMAINS.includes(domain)) {
        return res.status(400).json({ error: 'Invalid domain selected' });
    }

    try {
        // Duplicate title check (case-insensitive)
        const [existing] = await db.promise().query(
            'SELECT id FROM projects WHERE LOWER(title) = LOWER(?)', [title.trim()]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: 'A project with this title already exists' });
        }

        // Insert project with default 'Submitted' status
        const [result] = await db.promise().query(
            `INSERT INTO projects (title, description, domain, keywords, mentor_id, mentor_name, mentor_email, mentor_type, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Submitted')`,
            [title.trim(), description || null, domain, keywords || null, mentor_id || null, mentor_name || null, mentor_email || null, mentor_type || 'internal']
        );
        const projectId = result.insertId;

        // Always add submitting student as member
        const memberSet = new Set([String(userId)]);
        if (Array.isArray(member_ids)) member_ids.forEach(id => memberSet.add(String(id)));
        else if (member_ids) member_ids.split(',').forEach(id => memberSet.add(id.trim()));

        for (const uid of memberSet) {
            if (uid) {
                await db.promise().query(
                    'INSERT IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)',
                    [projectId, uid]
                );
            }
        }

        res.status(201).json({ message: 'Project submitted successfully', project_id: projectId });
    } catch (err) {
        console.error('Add project error:', err);
        res.status(500).json({ error: 'Failed to submit project' });
    }
});

// ──────────────────────────────────────────────────────────────────
// PUT /api/projects/:id  — student edits (only before approval)
// ──────────────────────────────────────────────────────────────────
router.put('/:id', isAuthenticated, async (req, res) => {
    const { title, description, domain, keywords, mentor_id, mentor_name, mentor_email, mentor_type } = req.body;
    const projectId = req.params.id;
    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    try {
        const [rows] = await db.promise().query('SELECT * FROM projects WHERE id = ?', [projectId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Project not found' });
        const project = rows[0];

        // Students can edit unless it is 'Completed'
        if (userRole === 'student') {
            const [mem] = await db.promise().query(
                'SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?', [projectId, userId]
            );
            if (mem.length === 0) return res.status(403).json({ error: 'Access denied' });
            if (project.status === 'Completed') return res.status(403).json({ error: 'Cannot edit after completion' });
        }

        if (domain && !VALID_DOMAINS.includes(domain)) {
            return res.status(400).json({ error: 'Invalid domain selected' });
        }

        await db.promise().query(
            `UPDATE projects SET title=?, description=?, domain=?, keywords=?, mentor_id=?, mentor_name=?, mentor_email=?, mentor_type=? WHERE id=?`,
            [
                title || project.title,
                description !== undefined ? description : project.description,
                domain || project.domain,
                keywords !== undefined ? keywords : project.keywords,
                mentor_id === undefined ? project.mentor_id : (mentor_id || null),
                mentor_name === undefined ? project.mentor_name : mentor_name,
                mentor_email === undefined ? project.mentor_email : mentor_email,
                mentor_type === undefined ? project.mentor_type : mentor_type,
                projectId
            ]
        );
        res.json({ message: 'Project updated successfully' });
    } catch (err) {
        console.error('Edit project error:', err);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// ──────────────────────────────────────────────────────────────────
// PATCH /api/projects/:id/status  — mentor/admin approve or reject
// ──────────────────────────────────────────────────────────────────
router.patch('/:id/status', isAuthenticated, hasRole(['staff', 'admin']), async (req, res) => {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }
    try {
        const [rows] = await db.promise().query('SELECT id FROM projects WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Project not found' });

        await db.promise().query('UPDATE projects SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: `Project ${status}` });
    } catch (err) {
        console.error('Status update error:', err);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// ──────────────────────────────────────────────────────────────────
// DELETE /api/projects/:id  — student (pending only) or admin
// ──────────────────────────────────────────────────────────────────
router.delete('/:id', isAuthenticated, async (req, res) => {
    const projectId = req.params.id;
    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    try {
        const [rows] = await db.promise().query('SELECT * FROM projects WHERE id = ?', [projectId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Project not found' });
        const project = rows[0];

        if (userRole === 'student') {
            const [mem] = await db.promise().query(
                'SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?', [projectId, userId]
            );
            if (mem.length === 0) return res.status(403).json({ error: 'Access denied' });
        } else if (userRole === 'staff') {
            if (project.mentor_id !== userId) return res.status(403).json({ error: 'Mentors cannot delete projects' });
        }

        await db.promise().query('DELETE FROM projects WHERE id = ?', [projectId]);
        res.json({ message: 'Project deleted' });
    } catch (err) {
        console.error('Delete project error:', err);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// ──────────────────────────────────────────────────────────────────
// GET /api/projects/:id/documents  — list documents for a project
// ──────────────────────────────────────────────────────────────────
router.get('/:id/documents', isAuthenticated, async (req, res) => {
    try {
        const [docs] = await db.promise().query(
            `SELECT pd.*, u.name AS uploader_name
             FROM project_documents pd
             JOIN users u ON pd.uploaded_by = u.id
             WHERE pd.project_id = ? AND pd.is_deleted = 0
             ORDER BY pd.uploaded_at DESC`,
            [req.params.id]
        );
        res.json(docs);
    } catch (err) {
        console.error('Documents fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});

// ──────────────────────────────────────────────────────────────────
// POST /api/projects/:id/documents  — upload doc
// Students: before approval only. Mentors: after approval. Admin: always.
// ──────────────────────────────────────────────────────────────────
router.post('/:id/documents', isAuthenticated, upload.single('file'), async (req, res) => {
    const projectId = req.params.id;
    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const [rows] = await db.promise().query('SELECT * FROM projects WHERE id = ?', [projectId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Project not found' });
        const project = rows[0];

        if (userRole === 'student') {
            const [mem] = await db.promise().query(
                'SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?', [projectId, userId]
            );
            if (mem.length === 0) return res.status(403).json({ error: 'Access denied' });
            if (project.status === 'Submitted') return res.status(403).json({ error: 'Cannot upload documents after submission' });
        } else if (userRole === 'staff') {
            if (project.mentor_id !== userId) return res.status(403).json({ error: 'Only assigned mentor can upload' });
        }

        const filePath = `/uploads/${req.file.filename}`;
        await db.promise().query(
            'INSERT INTO project_documents (project_id, file_path, uploaded_by) VALUES (?, ?, ?)',
            [projectId, filePath, userId]
        );
        res.status(201).json({ message: 'Document uploaded', file_path: filePath });
    } catch (err) {
        console.error('Upload document error:', err);
        res.status(500).json({ error: 'Failed to upload document' });
    }
});

// ──────────────────────────────────────────────────────────────────
// DELETE /api/projects/:id/documents/:did  — delete a document
// Students: before approval only (own uploads). Mentor: after approval. Admin: always.
// ──────────────────────────────────────────────────────────────────
router.delete('/:id/documents/:did', isAuthenticated, async (req, res) => {
    const { id: projectId, did } = req.params;
    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    try {
        const [docs] = await db.promise().query('SELECT * FROM project_documents WHERE id = ? AND project_id = ?', [did, projectId]);
        if (docs.length === 0) return res.status(404).json({ error: 'Document not found' });
        const doc = docs[0];

        const [projRows] = await db.promise().query('SELECT * FROM projects WHERE id = ?', [projectId]);
        if (projRows.length === 0) return res.status(404).json({ error: 'Project not found' });
        const project = projRows[0];

        if (userRole === 'student') {
            if (doc.uploaded_by !== userId) return res.status(403).json({ error: 'Can only delete your own uploads' });
            if (project.status === 'Submitted') return res.status(403).json({ error: 'Cannot delete documents after submission' });
        } else if (userRole === 'staff') {
            if (project.mentor_id !== userId) return res.status(403).json({ error: 'Access denied' });
        }

        // Soft delete
        await db.promise().query('UPDATE project_documents SET is_deleted = 1 WHERE id = ?', [did]);
        res.json({ message: 'Document deleted successfully' });
    } catch (err) {
        console.error('Delete document error:', err);
        res.status(500).json({ error: 'Failed to delete document' });
    }
});

module.exports = router;
