// ============================================
// BBMS — Donor Routes
// GET  /api/donors
// POST /api/donors
// ============================================
const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { getDb } = require('../db/connection');

// GET /api/donors — list all donors with optional filters
router.get('/', verifyToken, (req, res) => {
    try {
        const db = getDb();
        const { blood_group, eligible } = req.query;

        let sql = 'SELECT * FROM Donor WHERE 1=1';
        const params = [];

        if (blood_group) { sql += ' AND blood_group = ?'; params.push(blood_group); }
        if (eligible !== undefined) { sql += ' AND eligible = ?'; params.push(parseInt(eligible)); }

        sql += ' ORDER BY created_at DESC';

        const donors = db.prepare(sql).all(...params);
        res.json({ donors });
    } catch (err) {
        console.error('Donor fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch donors.' });
    }
});

// POST /api/donors — register new donor
router.post('/', verifyToken, requireRole('staff', 'admin', 'superadmin'), (req, res) => {
    try {
        const db = getDb();
        const { name, blood_group, phone, email, age, gender, last_donation_date } = req.body;

        if (!name || !blood_group || !phone) {
            return res.status(400).json({ error: 'name, blood_group, and phone are required.' });
        }

        const result = db.prepare(`
            INSERT INTO Donor (name, blood_group, phone, email, age, gender, last_donation_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(name, blood_group, phone, email || null, age || null, gender || null, last_donation_date || null);

        db.prepare(`INSERT INTO Notification (message, type) VALUES (?, 'general')`)
          .run(`New donor ${name} (${blood_group}) registered successfully`);

        res.status(201).json({
            message: 'Donor registered successfully.',
            donor_id: result.lastInsertRowid
        });
    } catch (err) {
        console.error('Add donor error:', err);
        res.status(500).json({ error: 'Failed to register donor.' });
    }
});

module.exports = router;
