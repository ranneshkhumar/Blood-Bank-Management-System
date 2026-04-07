const express = require('express');
const router = express.Router();
const BloodUnit = require('../models/BloodUnit');

// Get dashboard summary
router.get('/summary', async (req, res) => {
  try {
    const today = new Date();

    // Only non-expired blood units
    const units = await BloodUnit.find({
      expiryDate: { $gt: today },
      status: 'available'
    });

    // Total units
    const totalUnits = units.reduce((sum, unit) => sum + unit.quantity, 0);

    // Blood group wise distribution
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const distribution = {};

    bloodGroups.forEach(group => {
      const groupUnits = units.filter(u => u.bloodGroup === group);
      distribution[group] = groupUnits.reduce((sum, u) => sum + u.quantity, 0);
    });

    res.json({
      totalUnits,
      distribution
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
});

module.exports = router;