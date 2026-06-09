require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/appointments', appointmentRoutes);
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'appointment-service' }));

const PORT = process.env.PORT || 3001;

const connectAndStart = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Appointment Service: MongoDB connected');
    app.listen(PORT, () => console.log(`Appointment Service running on port ${PORT}`));
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

connectAndStart();

module.exports = app;
