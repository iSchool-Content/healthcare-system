const Patient = require('../models/Patient');

exports.getAll = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    req.io.emit('patient:created', patient);
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    req.io.emit('patient:updated', patient);
    res.json(patient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    req.io.emit('patient:deleted', { id: req.params.id });
    res.json({ message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (_req, res) => {
  try {
    const total = await Patient.countDocuments();
    const critical = await Patient.countDocuments({ status: 'critical' });
    const stable = await Patient.countDocuments({ status: 'stable' });
    const good = await Patient.countDocuments({ status: 'good' });
    res.json({ total, critical, stable, good });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
