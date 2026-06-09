const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: String },
  patientName: { type: String, required: true },
  doctor: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  type: { type: String, enum: ['consultation', 'follow-up', 'emergency', 'routine'], default: 'consultation' },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'pending'], default: 'scheduled' },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
