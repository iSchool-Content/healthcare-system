const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: String, required: true },
  diagnosis: { type: String, required: true },
  treatment: { type: String, required: true },
  notes: { type: String },
  prescription: [{ medication: String, dosage: String, duration: String }],
  visitDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
