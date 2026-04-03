// ============================================
// BBMS — Alert Routes
// GET /api/alerts
// ============================================
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getDb } = require('../db/connection');
const config = require('../config');

// GET /api/alerts — get all alerts (expiry, low stock, notifications)
router.get('/', verifyToken, (req, res) => {
    try {
        const db = getDb();
        const today = new Date().toISOString().split('T')[0];

        // 1. Expiring blood units (within EXPIRY_WARNING_DAYS)
        const expiringUnits = db.prepare(`
            SELECT blood_unit_id, blood_group, expiry_date, bank_id,
                   CAST(julianday(expiry_date) - julianday(?) AS INTEGER) as days_left
            FROM BloodUnit
            WHERE status = 'available'
              AND expiry_date >= ?
              AND CAST(julianday(expiry_date) - julianday(?) AS INTEGER) <= ?
            ORDER BY days_left ASC
        `).all(today, today, today, config.EXPIRY_WARNING_DAYS);

        // 2. Low stock (by blood group, below threshold)
        const lowStock = db.prepare(`
            SELECT blood_group, 
                   SUM(quantity) as current_stock,
                   ? as threshold
            FROM BloodUnit
            WHERE status = 'available'
            GROUP BY blood_group
            HAVING SUM(quantity) <= ?
            ORDER BY current_stock ASC
        `).all(config.LOW_STOCK_THRESHOLD, config.LOW_STOCK_THRESHOLD);

        // Also check for blood groups with zero stock
        const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        const existingGroups = lowStock.map(l => l.blood_group);
        const stockCheck = db.prepare(`
            SELECT blood_group, COALESCE(SUM(quantity), 0) as current_stock
            FROM BloodUnit
            WHERE status = 'available'
            GROUP BY blood_group
        `).all();
        const stockMap = {};
        stockCheck.forEach(s => { stockMap[s.blood_group] = s.current_stock; });

        allGroups.forEach(g => {
            if (!(g in stockMap) || stockMap[g] === 0) {
                if (!existingGroups.includes(g)) {
                    lowStock.push({
                        blood_group: g,
                        current_stock: 0,
                        threshold: config.LOW_STOCK_THRESHOLD
                    });
                }
            }
        });

        // 3. Recent notifications
        const notifications = db.prepare(`
            SELECT * FROM Notification 
            ORDER BY created_at DESC 
            LIMIT 20
        `).all();

        // 4. Unread count
        const unreadCount = db.prepare(`
            SELECT COUNT(*) as count FROM Notification WHERE is_read = 0
        `).get().count;

        res.json({
            expiring: expiringUnits,
            lowStock,
            notifications,
            unreadCount,
            summary: {
                expiring_count: expiringUnits.length,
                low_stock_count: lowStock.length,
                unread_notifications: unreadCount
            }
        });
    } catch (err) {
        console.error('Alerts fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch alerts.' });
    }
});

// PUT /api/alerts/read — mark notifications as read
router.put('/read', verifyToken, (req, res) => {
    try {
        const db = getDb();
        db.prepare('UPDATE Notification SET is_read = 1 WHERE is_read = 0').run();
        res.json({ message: 'All notifications marked as read.' });
    } catch (err) {
        console.error('Mark read error:', err);
        res.status(500).json({ error: 'Failed to mark notifications.' });
    }
});

module.exports = router;
