const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  hospitalName: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  units: {
    type: Number,
    required: true
  },
  requiredDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    default: "pending" // pending, approved, rejected
  },
  hospitalEmail: {
  type: String,
  required: true
}
}, { timestamps: true });

module.exports = mongoose.model("Request", requestSchema);