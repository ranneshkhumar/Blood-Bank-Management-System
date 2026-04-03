// ============================================
// BBMS — Inventory Routes
// GET  /api/inventory
// POST /api/inventory
// PUT  /api/inventory/:id
// ============================================
const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { getDb } = require('../db/connection');

// GET /api/inventory — list blood units with optional filters
router.get('/', verifyToken, (req, res) => {
    try {
        const db = getDb();
        const { blood_group, status, bank_id } = req.query;

        let sql = `SELECT bu.*, bb.name as bank_name 
                    FROM BloodUnit bu 
                    LEFT JOIN BloodBank bb ON bu.bank_id = bb.bank_id
                    WHERE 1=1`;
        const params = [];

        if (blood_group) { sql += ' AND bu.blood_group = ?'; params.push(blood_group); }
        if (status)      { sql += ' AND bu.status = ?';      params.push(status); }
        if (bank_id)     { sql += ' AND bu.bank_id = ?';     params.push(bank_id); }

        sql += ' ORDER BY bu.expiry_date ASC';

        const units = db.prepare(sql).all(...params);

        // Also return summary by blood group
        const summary = db.prepare(`
            SELECT blood_group, 
                   SUM(quantity) as total_units,
                   COUNT(*) as unit_count
            FROM BloodUnit 
            WHERE status = 'available'
            ${bank_id ? 'AND bank_id = ?' : ''}
            GROUP BY blood_group
            ORDER BY blood_group
        `).all(...(bank_id ? [bank_id] : []));

        res.json({ units, summary });
    } catch (err) {
        console.error('Inventory fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch inventory.' });
    }
});

// POST /api/inventory — add a new blood unit
router.post('/', verifyToken, requireRole('staff', 'admin', 'superadmin'), (req, res) => {
    try {
        const db = getDb();
        const { blood_group, quantity, collection_date, expiry_date, bank_id, donor_id } = req.body;

        if (!blood_group || !collection_date || !expiry_date) {
            return res.status(400).json({ error: 'blood_group, collection_date, and expiry_date are required.' });
        }

        const targetBank = bank_id || req.user.bank_id || 1;

        const result = db.prepare(`
            INSERT INTO BloodUnit (blood_group, quantity, collection_date, expiry_date, status, bank_id, donor_id)
            VALUES (?, ?, ?, ?, 'available', ?, ?)
        `).run(blood_group, quantity || 1, collection_date, expiry_date, targetBank, donor_id || null);

        // Auto-generate notification
        db.prepare(`INSERT INTO Notification (message, type) VALUES (?, 'general')`)
          .run(`New blood unit ${blood_group} added to inventory`);

        res.status(201).json({
            message: 'Blood unit added successfully.',
            blood_unit_id: result.lastInsertRowid
        });
    } catch (err) {
        console.error('Add blood unit error:', err);
        res.status(500).json({ error: 'Failed to add blood unit.' });
    }
});

// PUT /api/inventory/:id — update blood unit status
router.put('/:id', verifyToken, requireRole('staff', 'admin', 'superadmin'), (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;
        const { status, quantity } = req.body;

        const unit = db.prepare('SELECT * FROM BloodUnit WHERE blood_unit_id = ?').get(id);
        if (!unit) {
            return res.status(404).json({ error: 'Blood unit not found.' });
        }

        const updates = [];
        const params = [];

        if (status)   { updates.push('status = ?');   params.push(status); }
        if (quantity !== undefined) { updates.push('quantity = ?'); params.push(quantity); }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update.' });
        }

        params.push(id);
        db.prepare(`UPDATE BloodUnit SET ${updates.join(', ')} WHERE blood_unit_id = ?`).run(...params);

        res.json({ message: 'Blood unit updated successfully.' });
    } catch (err) {
        console.error('Update blood unit error:', err);
        res.status(500).json({ error: 'Failed to update blood unit.' });
    }
});

module.exports = router;
