-- ============================================
-- BLOOD BANK MS — Seed Data
-- ============================================

-- Blood Banks
INSERT INTO BloodBank (name, location, phone) VALUES
('City Central Blood Bank', 'New Delhi, India', '+91-11-2345-6789'),
('Metro Regional Blood Center', 'Mumbai, India', '+91-22-9876-5432');

-- Users (passwords are bcrypt hashes of 'password123')
INSERT INTO Users (name, email, password, role, bank_id) VALUES
('Dr. Rannesh Kumar', 'staff@bbms.com',  '$2b$10$xJHdqK8VqT1VjZX2y3Q5oOG6E0qJ5xY5wP2fJcN0rHsZ1uKvL3mGq', 'staff', 1),
('Dr. Priya Admin',   'admin@bbms.com',  '$2b$10$xJHdqK8VqT1VjZX2y3Q5oOG6E0qJ5xY5wP2fJcN0rHsZ1uKvL3mGq', 'admin', 1),
('Dr. Super Chief',   'super@bbms.com',  '$2b$10$xJHdqK8VqT1VjZX2y3Q5oOG6E0qJ5xY5wP2fJcN0rHsZ1uKvL3mGq', 'superadmin', NULL);

-- Donors
INSERT INTO Donor (name, blood_group, phone, email, age, gender, last_donation_date) VALUES
('Amita Sharma',     'A+',  '+91-98765-43210', 'amita@email.com',    28, 'female', '2026-03-19'),
('Raj Patel',        'O+',  '+91-98765-43211', 'raj@email.com',      32, 'male',   '2026-03-19'),
('Neha Gupta',       'B+',  '+91-98765-43212', 'neha@email.com',     25, 'female', '2026-03-19'),
('Vikram Singh',     'AB+', '+91-98765-43213', 'vikram@email.com',   35, 'male',   '2026-03-19'),
('Priya Reddy',      'A-',  '+91-98765-43214', 'priya.r@email.com',  29, 'female', '2026-03-20'),
('Arjun Mehta',      'O-',  '+91-98765-43215', 'arjun@email.com',    40, 'male',   '2026-03-20'),
('Kavita Joshi',     'B-',  '+91-98765-43216', 'kavita@email.com',   27, 'female', '2026-03-20'),
('Suresh Kumar',     'O+',  '+91-98765-43217', 'suresh@email.com',   45, 'male',   '2026-03-20'),
('Deepa Nair',       'A+',  '+91-98765-43218', 'deepa@email.com',    31, 'female', '2026-03-20'),
('Rohan Das',        'B+',  '+91-98765-43219', 'rohan@email.com',    33, 'male',   '2026-03-20');

-- Blood Units (Bank 1 — City Central)
INSERT INTO BloodUnit (blood_group, quantity, collection_date, expiry_date, status, bank_id, donor_id) VALUES
('A+',  1, '2026-02-20', '2026-04-20', 'available', 1, 1),
('A+',  1, '2026-03-01', '2026-04-30', 'available', 1, 9),
('A+',  1, '2026-03-15', '2026-05-14', 'available', 1, NULL),
('A-',  1, '2026-02-18', '2026-04-18', 'available', 1, 5),
('A-',  1, '2026-03-16', '2026-03-22', 'available', 1, NULL),
('B+',  1, '2026-03-01', '2026-04-30', 'available', 1, 3),
('B+',  1, '2026-03-10', '2026-05-09', 'available', 1, 10),
('B+',  1, '2026-03-15', '2026-05-14', 'available', 1, NULL),
('B-',  1, '2026-03-14', '2026-03-23', 'available', 1, 7),
('AB+', 1, '2026-03-05', '2026-05-04', 'available', 1, 4),
('AB+', 1, '2026-03-12', '2026-05-11', 'available', 1, NULL),
('AB-', 1, '2026-03-10', '2026-03-24', 'available', 1, NULL),
('O+',  1, '2026-02-25', '2026-04-25', 'available', 1, 2),
('O+',  1, '2026-03-05', '2026-05-04', 'available', 1, 8),
('O+',  1, '2026-03-15', '2026-05-14', 'available', 1, NULL),
('O+',  1, '2026-03-18', '2026-05-17', 'available', 1, NULL),
('O-',  1, '2026-03-13', '2026-03-25', 'available', 1, 6),
('O-',  1, '2026-03-16', '2026-03-21', 'available', 1, NULL);

-- Blood Units (Bank 2 — Metro Regional)
INSERT INTO BloodUnit (blood_group, quantity, collection_date, expiry_date, status, bank_id) VALUES
('A+',  1, '2026-03-10', '2026-05-09', 'available', 2),
('B+',  1, '2026-03-12', '2026-05-11', 'available', 2),
('O+',  1, '2026-03-08', '2026-05-07', 'available', 2),
('O-',  1, '2026-03-15', '2026-05-14', 'available', 2),
('AB-', 1, '2026-03-11', '2026-03-22', 'available', 2);

-- Emergency Requests
INSERT INTO EmergencyRequest (hospital_name, blood_group, units_required, contact_phone, status, notes) VALUES
('AIIMS Delhi',       'O-', 3, '+91-11-2658-8500', 'pending',   'Urgent surgery requirement'),
('Fortis Hospital',   'B-', 2, '+91-11-4277-6222', 'approved',  'Accident victim — critical'),
('Apollo Hospital',   'AB-',1, '+91-44-2829-0200', 'fulfilled', 'Fulfilled from Bank 1 stock');

-- Blood Transfers
INSERT INTO BloodTransfer (from_bank, to_bank, blood_group, units, status) VALUES
(1, 2, 'O+', 2, 'completed'),
(2, 1, 'AB-', 1, 'in_transit'),
(1, 2, 'A+', 3, 'pending');

-- Notifications
INSERT INTO Notification (message, type, is_read) VALUES
('Blood unit O- (BU-018) expires in 1 day!',           'expiry',    0),
('Blood unit A- (BU-005) expires in 2 days!',           'expiry',    0),
('Low stock alert: B- has only 1 unit available',       'low_stock', 0),
('Low stock alert: AB- has only 1 unit available',      'low_stock', 0),
('Emergency request from AIIMS Delhi for 3 units O-',   'emergency', 0),
('Blood transfer of 1 unit AB- from Metro Regional is in transit', 'transfer', 0),
('New donor Deepa Nair registered successfully',        'general',   1),
('Blood transfer of 2 units O+ to Metro Regional completed', 'transfer', 1);
