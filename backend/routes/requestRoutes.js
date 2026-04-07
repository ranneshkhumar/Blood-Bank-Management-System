const express = require("express");
const router = express.Router();
const Request = require("../models/Request");

// 🏥 CREATE REQUEST
router.post("/", async (req, res) => {
  try {
    const { hospitalName, hospitalEmail,bloodGroup, units, requiredDate } = req.body;

    // Basic validation
    if (!hospitalName || !bloodGroup || !units || !requiredDate) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newRequest = new Request({
      hospitalName,
      hospitalEmail,
      bloodGroup,
      units: Number(units),
      requiredDate: new Date(requiredDate)
    });

    await newRequest.save();

    res.json({ message: "Request created successfully" });

  } catch (err) {
    console.log("❌ ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });

    res.json(requests);

  } catch (err) {
    console.log("❌ ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const BloodUnit = require("../models/BloodUnit");

// ✅ APPROVE REQUEST
router.post("/approve/:id", async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Already processed" });
    }

    // 🔥 GET AVAILABLE BLOOD
    const units = await BloodUnit.find({ bloodGroup: request.bloodGroup });

    let available = units.reduce((sum, u) => sum + u.quantity, 0);

    // ❌ NOT ENOUGH BLOOD
    if (available < request.units) {
      return res.status(400).json({
        error: `Only ${available} units available`
      });
    }

    // 🔥 REMOVE BLOOD (FIFO)
    let remaining = request.units;

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

    // ✅ UPDATE REQUEST
    request.status = "approved";
    await request.save();

    res.json({ message: "Request approved & inventory updated" });

  } catch (err) {
    console.log("❌ ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ❌ REJECT REQUEST
router.post("/reject/:id", async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Already processed" });
    }

    request.status = "rejected";
    await request.save();

    res.json({ message: "Request rejected" });

  } catch (err) {
    console.log("❌ ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get("/my/:email", async (req, res) => {
  try {
    const requests = await Request.find({
      hospitalEmail: req.params.email
    }).sort({ createdAt: -1 });

    res.json(requests);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;