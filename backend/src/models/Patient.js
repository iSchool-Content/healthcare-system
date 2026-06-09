const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true, min: 0, max: 150 },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  phone: { type: String, required: true },
  email: { type: String, lowercase: true },
  status: { type: String, enum: ['stable', 'good', 'critical'], default: 'stable' },
  address: { type: String },
  bloodType: { type: String },
  allergies: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
