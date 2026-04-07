const mongoose = require('mongoose');

const bloodUnitSchema = new mongoose.Schema({
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  quantity: {
    type: Number,
    required: true
  },
  collectionDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  bloodId: {
  type: String,
  unique: true
},
donorName: {
  type: String,
  required: true
},
age:Number,
phone:String,
  status: {
    type: String,
    default: 'available'
  }
}, { timestamps: true });

module.exports = mongoose.model('BloodUnit', bloodUnitSchema);