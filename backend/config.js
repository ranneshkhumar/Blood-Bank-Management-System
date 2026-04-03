// ============================================
// BBMS — Configuration
// ============================================
module.exports = {
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET || 'bbms_secret_key_2026_change_in_production',
    JWT_EXPIRY: '8h',
    LOW_STOCK_THRESHOLD: 5,
    EXPIRY_WARNING_DAYS: 7,
};
