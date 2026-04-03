// ============================================
// BBMS — Portable Zero-Dependency Server
// Uses built-in 'http' and 'fs' modules
// RUN: node server.js
// ============================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const { db } = require('./db/connection');

const PORT = 3000;
const MIME_TYPES = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'application/javascript',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.svg':  'image/svg+xml'
};

// --- AUTH HELPERS ---
function generateToken(user) {
    // Simple base64 token for demo (no JWT library)
    return Buffer.from(JSON.stringify({ id: user.user_id, role: user.role, time: Date.now() })).toString('base64');
}

function verifyAuth(req) {
    const auth = req.headers['authorization'];
    if (!auth) return null;
    const token = auth.split(' ')[1];
    try {
        return JSON.parse(Buffer.from(token, 'base64').toString());
    } catch (e) { return null; }
}

// --- SERVER LOGIC ---
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const method = req.method;

    // Log request
    console.log(`[${new Date().toLocaleTimeString()}] ${method} ${pathname}`);

    // Helper to send JSON
    const sendJson = (data, status = 200) => {
        res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(data));
    };

    // CORS preflight
    if (method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end();
        return;
    }

    // --- API ROUTES ---
    if (pathname.startsWith('/api')) {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            let payload = {};
            try { if (body) payload = JSON.parse(body); } catch (e) { }
            const user = verifyAuth(req);

            try {
                // 1. LOGIN
                if (pathname === '/api/login' && method === 'POST') {
                    const u = db.find('users', { email: payload.email })[0];
                    if (u && u.password === payload.password) {
                        return sendJson({ token: generateToken(u), user: { ...u, password: undefined } });
                    }
                    return sendJson({ error: 'Invalid credentials' }, 401);
                }

                // 2. INVENTORY
                if (pathname === '/api/inventory') {
                    if (method === 'GET') {
                        const units = db.all('units').map(u => ({
                            ...u,
                            bank_name: (db.findOne('banks', { bank_id: u.bank_id }) || {}).name
                        }));
                        const summary = ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => ({
                            blood_group: g,
                            total_units: units.filter(u => u.blood_group === g && u.status === 'available').length
                        }));
                        return sendJson({ units, summary });
                    }
                    if (method === 'POST') {
                        const newUnit = db.insert('units', { ...payload, status: 'available' });
                        db.insert('notifications', { message: `New ${payload.blood_group} unit added`, type: 'general', is_read: false });
                        return sendJson(newUnit, 201);
                    }
                }
                if (pathname.startsWith('/api/inventory/') && method === 'PUT') {
                    const id = pathname.split('/').pop();
                    const updated = db.update('units', 'blood_unit_id', id, payload);
                    console.log(`Inventory unit ${id} updated to status: ${payload.status}`);
                    return sendJson(updated);
                }

                // 3. DONORS
                if (pathname === '/api/donors') {
                    if (method === 'GET') return sendJson({ donors: db.all('donors') });
                    if (method === 'POST') {
                        const donor = db.insert('donors', payload);
                        db.insert('notifications', { message: `New donor registered: ${payload.name}`, type: 'general', is_read: false });
                        return sendJson(donor, 201);
                    }
                }

                // 4. ALERTS
                if (pathname === '/api/alerts' && method === 'GET') {
                    const units = db.all('units').filter(u => u.status === 'available');
                    const expiring = units.map(u => ({ ...u, days_left: 5 })); // demo value
                    const lowStock = ['O-', 'AB-'].map(g => ({ blood_group: g, current_stock: 1, threshold: 2 }));
                    return sendJson({
                        expiring, lowStock,
                        notifications: db.all('notifications').sort((a,b) => b.notification_id - a.notification_id),
                        unreadCount: db.all('notifications').filter(n => !n.is_read).length
                    });
                }
                if (pathname === '/api/alerts/read' && method === 'PUT') {
                    db.all('notifications').forEach(n => n.is_read = true);
                    return sendJson({ message: 'Read' });
                }

                // 5. EMERGENCY
                if (pathname === '/api/emergency') {
                    if (method === 'GET') return sendJson({ requests: db.all('emergency') });
                    if (method === 'POST') {
                        const erreq = db.insert('emergency', payload);
                        db.insert('notifications', { message: `EMERGENCY: ${payload.hospital_name} needs ${payload.blood_group}`, type: 'emergency', is_read: false });
                        return sendJson(erreq, 201);
                    }
                }
                if (pathname.startsWith('/api/emergency/') && method === 'PUT') {
                    const id = pathname.split('/').pop();
                    return sendJson(db.update('emergency', 'request_id', id, payload));
                }

                // 6. TRANSFERS
                if (pathname === '/api/transfers') {
                    if (method === 'GET') {
                        const t = db.all('transfers').map(tr => ({
                            ...tr,
                            from_bank_name: (db.findOne('banks', { bank_id: tr.from_bank }) || {}).name,
                            to_bank_name: (db.findOne('banks', { bank_id: tr.to_bank }) || {}).name
                        }));
                        return sendJson({ transfers: t });
                    }
                    if (method === 'POST') {
                        const tr = db.insert('transfers', payload);
                        db.insert('notifications', { message: `Transfer initiated: ${payload.units} units ${payload.blood_group}`, type: 'transfer', is_read: false });
                        return sendJson(tr, 201);
                    }
                }
                if (pathname.startsWith('/api/transfers/') && method === 'PUT') {
                    const id = pathname.split('/').pop();
                    return sendJson(db.update('transfers', 'transfer_id', id, payload));
                }

                // 7. BANKS, REPORTS, USERS (Super Admin)
                if (pathname === '/api/banks') {
                    if (method === 'GET') return sendJson({ banks: db.all('banks') });
                    if (method === 'POST') return sendJson(db.insert('banks', payload), 201);
                }
                if (pathname === '/api/users' && method === 'GET') return sendJson({ users: db.all('users') });
                if (pathname === '/api/reports/summary' && method === 'GET') {
                    const u = db.all('units').filter(un => un.status === 'available');
                    const donors = db.all('donors');
                    const banks = db.all('banks');
                    
                    return sendJson({
                        total_units: u.reduce((acc, curr) => acc + (curr.quantity || 1), 0),
                        total_banks: banks.length,
                        active_transfers: db.all('transfers').filter(t => t.status !== 'completed').length,
                        inventory_by_bank: banks.map(b => ({
                           bank_name: b.name, 
                           total: u.filter(un => un.bank_id == b.bank_id).reduce((acc, curr) => acc + (curr.quantity || 1), 0)
                        })),
                        recent_donations: u.slice(-10).map(un => ({
                            ...un,
                            donor_name: (donors.find(d => d.donor_id == un.donor_id) || { name: 'Direct Donation' }).name
                        }))
                    });
                }

                // Catch-all API
                sendJson({ error: 'Endpoint not found' }, 404);

            } catch (err) {
                console.error('API Error:', err);
                sendJson({ error: 'Server error: ' + err.message }, 500);
            }
        });
        return;
    }

    // --- STATIC FILES ---
    let filePath = path.join(__dirname, '..', 'frontend', pathname === '/' ? 'index.html' : pathname);
    
    // Safety check (prevent directory traversal)
    if (!filePath.startsWith(path.join(__dirname, '..', 'frontend'))) {
        res.writeHead(403); res.end('Access Denied'); return;
    }

    const ext = path.extname(filePath).toLowerCase();
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Fallback to index.html for SPA-like navigation if needed
                fs.readFile(path.join(__dirname, '..', 'frontend', 'index.html'), (e, c) => {
                    res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(c);
                });
            } else {
                res.writeHead(500); res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n🩸 Blood Bank Management System (Portable Mode)`);
    console.log(`   Running on http://localhost:${PORT}`);
    console.log(`   NO DEPENDENCIES REQUIRED! JUST RUN NODE SERVER.JS\n`);
});
