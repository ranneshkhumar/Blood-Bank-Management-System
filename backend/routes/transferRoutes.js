// ============================================
// BBMS — Blood Transfer Routes
// GET  /api/transfers
// POST /api/transfers
// PUT  /api/transfers/:id
// ============================================
const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { getDb } = require('../db/connection');

// GET /api/transfers — list transfers
router.get('/', verifyToken, (req, res) => {
    try {
        const db = getDb();
        const { status } = req.query;

        let sql = `
            SELECT bt.*, 
                   fb.name as from_bank_name, 
                   tb.name as to_bank_name
            FROM BloodTransfer bt
            LEFT JOIN BloodBank fb ON bt.from_bank = fb.bank_id
            LEFT JOIN BloodBank tb ON bt.to_bank = tb.bank_id
            WHERE 1=1
        `;
        const params = [];
        if (status) { sql += ' AND bt.status = ?'; params.push(status); }
        sql += ' ORDER BY bt.created_at DESC';

        const transfers = db.prepare(sql).all(...params);
        res.json({ transfers });
    } catch (err) {
        console.error('Transfer fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch transfers.' });
    }
});

// POST /api/transfers — create transfer
router.post('/', verifyToken, requireRole('admin', 'superadmin'), (req, res) => {
    try {
        const db = getDb();
        const { from_bank, to_bank, blood_group, units } = req.body;

        if (!from_bank || !to_bank || !blood_group || !units) {
            return res.status(400).json({ error: 'from_bank, to_bank, blood_group, and units are required.' });
        }

        if (from_bank === to_bank) {
            return res.status(400).json({ error: 'Cannot transfer to the same bank.' });
        }

        // Check stock
        const available = db.prepare(`
            SELECT SUM(quantity) as total FROM BloodUnit 
            WHERE blood_group = ? AND bank_id = ? AND status = 'available'
        `).get(blood_group, from_bank);

        if (!available || available.total < units) {
            return res.status(400).json({ error: `Insufficient stock. Only ${available ? available.total : 0} units available.` });
        }

        const result = db.prepare(`
            INSERT INTO BloodTransfer (from_bank, to_bank, blood_group, units, status)
            VALUES (?, ?, ?, ?, 'pending')
        `).run(from_bank, to_bank, blood_group, units);

        // Get bank names for notification
        const fromName = db.prepare('SELECT name FROM BloodBank WHERE bank_id = ?').get(from_bank);
        const toName = db.prepare('SELECT name FROM BloodBank WHERE bank_id = ?').get(to_bank);

        db.prepare(`INSERT INTO Notification (message, type) VALUES (?, 'transfer')`)
          .run(`Blood transfer: ${units} units ${blood_group} from ${fromName.name} to ${toName.name}`);

        res.status(201).json({
            message: 'Transfer request created.',
            transfer_id: result.lastInsertRowid
        });
    } catch (err) {
        console.error('Transfer create error:', err);
        res.status(500).json({ error: 'Failed to create transfer.' });
    }
});

// PUT /api/transfers/:id — update transfer status
router.put('/:id', verifyToken, requireRole('admin', 'superadmin'), (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;
        const { status } = req.body;

        if (!status) return res.status(400).json({ error: 'status is required.' });

        db.prepare('UPDATE BloodTransfer SET status = ? WHERE transfer_id = ?').run(status, id);
        res.json({ message: 'Transfer updated.' });
    } catch (err) {
        console.error('Transfer update error:', err);
        res.status(500).json({ error: 'Failed to update transfer.' });
    }
});

module.exports = router;
