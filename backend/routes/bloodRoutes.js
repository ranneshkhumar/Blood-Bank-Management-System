const express = require("express");
const router = express.Router();
const BloodUnit = require("../models/BloodUnit");

// ADD BLOOD
router.post("/add", async (req, res) => {
  try {
    console.log("BODY:", req.body); // debug

    const { bloodGroup, quantity, collectionDate } = req.body;
    const bloodId = `BLD-${bloodGroup}-${Date.now()}`;
    // validation
    if (!bloodGroup || !quantity || !collectionDate) {
      return res.status(400).json({ error: "All fields required" });
    }

    // 🔥 AUTO EXPIRY (42 days)
    const collection = new Date(collectionDate);
    const expiry = new Date(collection);
    expiry.setDate(collection.getDate() + 42);

    const newBlood = new BloodUnit({
      bloodGroup,
      quantity,
      collectionDate: collection,
      bloodId,
      expiryDate: expiry
    });

    await newBlood.save();

    res.status(201).json({
      message: "Blood added successfully",
      expiryDate: expiry
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const blood = await BloodUnit.find();
    res.json(blood);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ALERTS
router.get("/alerts", async (req, res) => {
  try {
    const bloodUnits = await BloodUnit.find();
    const today = new Date();

    const alerts = bloodUnits.map(unit => {
      const expiry = new Date(unit.expiryDate);
      const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);

      let status = "Normal";

      if (unit.quantity < 10) status = "Low";
      if (diffDays <= 5) status = "Expiring";

      return {
        bloodGroup: unit.bloodGroup,
        quantity: unit.quantity,
        expiryDate: unit.expiryDate,
        status
      };
    });

    res.json(alerts);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// REMOVE BLOOD
router.post("/remove", async (req, res) => {
  try {
    const { bloodGroup, quantity } = req.body;

    const units = await BloodUnit.find({ bloodGroup });

    let remaining = quantity;

    for (let unit of units) {
      if (remaining <= 0) break;

      if (unit.quantity <= remaining) {
        remaining -= unit.quantity;
        await unit.deleteOne();
      } else {
        unit.quantity -= remaining;
        await unit.save();
        remaining = 0;
      }
    }

    res.json({ message: "Blood removed successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, age, phone, bloodGroup, quantity, collectionDate } = req.body;

    const bloodId = `BLD-${bloodGroup}-${Date.now()}`;

    const collection = new Date(collectionDate);
    const expiry = new Date(collection);
    expiry.setDate(collection.getDate() + 42);

    const newBlood = new BloodUnit({
      bloodGroup,
      quantity: Number(quantity), // 🔥 FIX
      collectionDate: collection,
      expiryDate: expiry,
      bloodId,
      donorName: name
    });

    await newBlood.save();

    res.json({ message: "Success" });

  } catch (err) {
    console.log("❌ ERROR:", err.message); // 🔥 ADD THIS
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;