const express = require("express");
const router = express.Router();
const BloodUnit = require("../models/BloodUnit");

router.post("/register", async (req, res) => {
  try {
    const { name, age, phone, bloodGroup, quantity, collectionDate } = req.body;

    const bloodId = `BLD-${bloodGroup}-${Date.now()}`;
    const collection = new Date(collectionDate);
    const expiry = new Date(collection);
    expiry.setDate(collection.getDate() + 42);

    const newBlood = new BloodUnit({
      bloodGroup,
      quantity,
      collectionDate: collection,
      expiryDate: expiry,
      bloodId,
      donorName: name,
      age: Number(age),
      phone
    });

    await newBlood.save();

    res.json({ message: "Donor registered & blood stored" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;