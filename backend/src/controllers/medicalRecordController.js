const MedicalRecord = require('../models/MedicalRecord');

exports.getAll = async (req, res) => {
  try {
    const filter = req.query.patient ? { patient: req.query.patient } : {};
    const records = await MedicalRecord.find(filter).populate('patient', 'name').sort({ visitDate: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id).populate('patient', 'name');
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const record = await MedicalRecord.create(req.body);
    req.io.emit('record:created', record);
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    req.io.emit('record:updated', record);
    res.json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    req.io.emit('record:deleted', { id: req.params.id });
    res.json({ message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
