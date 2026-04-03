// ============================================
// BBMS — Auth Routes
// POST /api/login
// ============================================
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { getDb } = require('../db/connection');

// POST /api/login
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const db = getDb();
        const user = db.prepare('SELECT * FROM Users WHERE email = ?').get(email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                bank_id: user.bank_id
            },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRY }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                bank_id: user.bank_id
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

module.exports = router;
