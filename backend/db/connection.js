// ============================================
// BBMS — Portable JSON Database
// Zero dependencies (no SQLite required)
// ============================================
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'bbms_db.json');

// Initial Seed Data
const INITIAL_DATA = {
    users: [
        { user_id: 1, name: 'Dr. Rannesh Kumar', email: 'staff@bbms.com', password: 'password123', role: 'staff', bank_id: 1, created_at: new Date().toISOString() },
        { user_id: 2, name: 'Dr. Priya Admin', email: 'admin@bbms.com', password: 'password123', role: 'admin', bank_id: 1, created_at: new Date().toISOString() },
        { user_id: 3, name: 'Dr. Super Chief', email: 'super@bbms.com', password: 'password123', role: 'superadmin', bank_id: null, created_at: new Date().toISOString() }
    ],
    banks: [
        { bank_id: 1, name: 'City Central Blood Bank', location: 'New Delhi, India', phone: '+91-11-2345-6789' },
        { bank_id: 2, name: 'Metro Regional Blood Center', location: 'Mumbai, India', phone: '+91-22-9876-5432' }
    ],
    units: [
        { blood_unit_id: 1, blood_group: 'A+', quantity: 1, collection_date: '2026-03-01', expiry_date: '2026-04-30', status: 'available', bank_id: 1, donor_id: 1 },
        { blood_unit_id: 2, blood_group: 'B+', quantity: 1, collection_date: '2026-03-10', expiry_date: '2026-05-09', status: 'available', bank_id: 1, donor_id: 3 },
        { blood_unit_id: 3, blood_group: 'O+', quantity: 1, collection_date: '2026-02-25', expiry_date: '2026-04-25', status: 'available', bank_id: 1, donor_id: 2 },
        { blood_unit_id: 4, blood_group: 'AB-', quantity: 1, collection_date: '2026-03-10', expiry_date: '2026-03-24', status: 'available', bank_id: 1, donor_id: null },
        { blood_unit_id: 5, blood_group: 'O-', quantity: 1, collection_date: '2026-03-13', expiry_date: '2026-03-25', status: 'available', bank_id: 1, donor_id: 6 }
    ],
    donors: [
        { donor_id: 1, name: 'Amita Sharma', blood_group: 'A+', phone: '+91-98765-43210', email: 'amita@email.com', last_donation_date: '2026-03-19', eligible: true },
        { donor_id: 2, name: 'Raj Patel', blood_group: 'O+', phone: '+91-98765-43211', email: 'raj@email.com', last_donation_date: '2026-03-19', eligible: true },
        { donor_id: 3, name: 'Neha Gupta', blood_group: 'B+', phone: '+91-98765-43212', email: 'neha@email.com', last_donation_date: '2026-03-19', eligible: true }
    ],
    emergency: [
        { request_id: 1, hospital_name: 'AIIMS Delhi', blood_group: 'O-', units_required: 3, status: 'pending', created_at: new Date().toISOString() }
    ],
    transfers: [
        { transfer_id: 1, from_bank: 1, to_bank: 2, blood_group: 'O+', units: 2, status: 'completed', created_at: new Date().toISOString() }
    ],
    notifications: [
        { notification_id: 1, message: 'Low stock alert: O- has only 1 unit', type: 'low_stock', is_read: false, created_at: new Date().toISOString() }
    ]
};

// --- DB Operations ---
function getDb() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDb(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Helper to query/update
const db = {
    find: (table, query) => {
        const data = getDb();
        return data[table].filter(item => {
            return Object.keys(query).every(key => item[key] == query[key]);
        });
    },
    findOne: (table, query) => {
        const data = getDb();
        return data[table].find(item => {
            return Object.keys(query).every(key => item[key] == query[key]);
        });
    },
    insert: (table, row) => {
        const data = getDb();
        const ID_MAP = {
            'users': 'user_id',
            'banks': 'bank_id',
            'units': 'blood_unit_id',
            'donors': 'donor_id',
            'emergency': 'request_id',
            'transfers': 'transfer_id',
            'notifications': 'notification_id'
        };
        const idKey = ID_MAP[table] || (table.slice(0, -1) + '_id');
        const maxId = data[table].reduce((max, r) => Math.max(max, r[idKey] || 0), 0);
        const newRow = { [idKey]: maxId + 1, ...row, created_at: new Date().toISOString() };
        data[table].push(newRow);
        saveDb(data);
        return newRow;
    },
    update: (table, idKey, idValue, updates) => {
        const data = getDb();
        const index = data[table].findIndex(r => r[idKey] == idValue);
        if (index !== -1) {
            data[table][index] = { ...data[table][index], ...updates };
            saveDb(data);
            return data[table][index];
        }
        return null;
    },
    all: (table) => getDb()[table]
};

module.exports = { db };
