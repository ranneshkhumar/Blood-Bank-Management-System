// ============================================
// BBMS — Emergency Request Routes
// GET  /api/emergency
// POST /api/emergency
// PUT  /api/emergency/:id
// ============================================
const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { getDb } = require('../db/connection');

// GET /api/emergency — list emergency requests
router.get('/', verifyToken, (req, res) => {
    try {
        const db = getDb();
        const { status } = req.query;

        let sql = 'SELECT * FROM EmergencyRequest WHERE 1=1';
        const params = [];

        if (status) { sql += ' AND status = ?'; params.push(status); }
        sql += ' ORDER BY created_at DESC';

        const requests = db.prepare(sql).all(...params);
        res.json({ requests });
    } catch (err) {
        console.error('Emergency fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch emergency requests.' });
    }
});

// POST /api/emergency — create emergency request
router.post('/', verifyToken, requireRole('admin', 'superadmin'), (req, res) => {
    try {
        const db = getDb();
        const { hospital_name, blood_group, units_required, contact_phone, notes } = req.body;

        if (!hospital_name || !blood_group || !units_required) {
            return res.status(400).json({ error: 'hospital_name, blood_group, and units_required are required.' });
        }

        const result = db.prepare(`
            INSERT INTO EmergencyRequest (hospital_name, blood_group, units_required, contact_phone, notes)
            VALUES (?, ?, ?, ?, ?)
        `).run(hospital_name, blood_group, units_required, contact_phone || null, notes || null);

        // Check availability
        const available = db.prepare(`
            SELECT SUM(quantity) as total FROM BloodUnit 
            WHERE blood_group = ? AND status = 'available'
        `).get(blood_group);

        let alertMsg = `Emergency request from ${hospital_name} for ${units_required} units ${blood_group}`;
        if (!available || available.total < units_required) {
            alertMsg += ' — INSUFFICIENT STOCK, notifying donors';
        }

        db.prepare(`INSERT INTO Notification (message, type) VALUES (?, 'emergency')`)
          .run(alertMsg);

        res.status(201).json({
            message: 'Emergency request created.',
            request_id: result.lastInsertRowid,
            stock_available: available ? available.total : 0
        });
    } catch (err) {
        console.error('Emergency create error:', err);
        res.status(500).json({ error: 'Failed to create emergency request.' });
    }
});

// PUT /api/emergency/:id — update status
router.put('/:id', verifyToken, requireRole('admin', 'superadmin'), (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;
        const { status } = req.body;

        if (!status) return res.status(400).json({ error: 'status is required.' });

        db.prepare('UPDATE EmergencyRequest SET status = ? WHERE request_id = ?').run(status, id);
        res.json({ message: 'Emergency request updated.' });
    } catch (err) {
        console.error('Emergency update error:', err);
        res.status(500).json({ error: 'Failed to update emergency request.' });
    }
});

module.exports = router;
