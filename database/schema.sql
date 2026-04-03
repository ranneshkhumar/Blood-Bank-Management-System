-- ============================================
-- BLOOD BANK MANAGEMENT SYSTEM
-- Database Schema (Azure SQL Compatible)
-- ============================================

-- 1. Users
CREATE TABLE Users (
    user_id     INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100)   NOT NULL,
    email       NVARCHAR(150)   NOT NULL UNIQUE,
    password    NVARCHAR(255)   NOT NULL,
    role        NVARCHAR(20)    NOT NULL CHECK (role IN ('staff','admin','superadmin')),
    bank_id     INT             NULL,
    created_at  DATETIME2       DEFAULT GETDATE()
);

-- 2. BloodBank
CREATE TABLE BloodBank (
    bank_id     INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(150)   NOT NULL,
    location    NVARCHAR(255)   NOT NULL,
    phone       NVARCHAR(20)    NULL,
    created_at  DATETIME2       DEFAULT GETDATE()
);

-- FK: Users → BloodBank
ALTER TABLE Users ADD CONSTRAINT FK_Users_BloodBank
    FOREIGN KEY (bank_id) REFERENCES BloodBank(bank_id);

-- 3. BloodUnit
CREATE TABLE BloodUnit (
    blood_unit_id   INT IDENTITY(1,1) PRIMARY KEY,
    blood_group     NVARCHAR(5)     NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
    quantity        INT             NOT NULL DEFAULT 1,
    collection_date DATE            NOT NULL,
    expiry_date     DATE            NOT NULL,
    status          NVARCHAR(20)    NOT NULL DEFAULT 'available' CHECK (status IN ('available','used','expired','discarded','transferred')),
    bank_id         INT             NOT NULL,
    donor_id        INT             NULL,
    created_at      DATETIME2       DEFAULT GETDATE(),
    CONSTRAINT FK_BloodUnit_Bank FOREIGN KEY (bank_id) REFERENCES BloodBank(bank_id)
);

-- 4. Donor
CREATE TABLE Donor (
    donor_id            INT IDENTITY(1,1) PRIMARY KEY,
    name                NVARCHAR(100)   NOT NULL,
    blood_group         NVARCHAR(5)     NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
    phone               NVARCHAR(20)    NOT NULL,
    email               NVARCHAR(150)   NULL,
    age                 INT             NULL,
    gender              NVARCHAR(10)    NULL,
    last_donation_date  DATE            NULL,
    eligible            BIT             DEFAULT 1,
    created_at          DATETIME2       DEFAULT GETDATE()
);

-- FK: BloodUnit → Donor
ALTER TABLE BloodUnit ADD CONSTRAINT FK_BloodUnit_Donor
    FOREIGN KEY (donor_id) REFERENCES Donor(donor_id);

-- 5. EmergencyRequest
CREATE TABLE EmergencyRequest (
    request_id      INT IDENTITY(1,1) PRIMARY KEY,
    hospital_name   NVARCHAR(150)   NOT NULL,
    blood_group     NVARCHAR(5)     NOT NULL,
    units_required  INT             NOT NULL,
    contact_phone   NVARCHAR(20)    NULL,
    status          NVARCHAR(20)    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','fulfilled','rejected')),
    notes           NVARCHAR(500)   NULL,
    created_at      DATETIME2       DEFAULT GETDATE()
);

-- 6. BloodTransfer
CREATE TABLE BloodTransfer (
    transfer_id     INT IDENTITY(1,1) PRIMARY KEY,
    from_bank       INT             NOT NULL,
    to_bank         INT             NOT NULL,
    blood_group     NVARCHAR(5)     NOT NULL,
    units           INT             NOT NULL,
    status          NVARCHAR(20)    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_transit','completed','cancelled')),
    created_at      DATETIME2       DEFAULT GETDATE(),
    CONSTRAINT FK_Transfer_From FOREIGN KEY (from_bank) REFERENCES BloodBank(bank_id),
    CONSTRAINT FK_Transfer_To   FOREIGN KEY (to_bank)   REFERENCES BloodBank(bank_id)
);

-- 7. Notification
CREATE TABLE Notification (
    notification_id INT IDENTITY(1,1) PRIMARY KEY,
    message         NVARCHAR(500)   NOT NULL,
    type            NVARCHAR(30)    NOT NULL CHECK (type IN ('expiry','low_stock','emergency','transfer','general')),
    is_read         BIT             DEFAULT 0,
    created_at      DATETIME2       DEFAULT GETDATE()
);

-- Indexes for performance
CREATE INDEX IX_BloodUnit_BankGroup ON BloodUnit(bank_id, blood_group);
CREATE INDEX IX_BloodUnit_Expiry    ON BloodUnit(expiry_date) WHERE status = 'available';
CREATE INDEX IX_Donor_BloodGroup    ON Donor(blood_group);
CREATE INDEX IX_Notification_Type   ON Notification(type, is_read);
