const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['staff', 'admin', 'superadmin'],
    default: 'staff'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);