require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcaredb';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Patient.deleteMany({});
  await MedicalRecord.deleteMany({});
  console.log('Cleared existing data');

  const users = await User.create([
    { name: 'Dr. Sarah Johnson', email: 'doctor@hospital.com', password: 'password123', role: 'doctor' },
    { name: 'Nurse Emily Clark', email: 'nurse@hospital.com', password: 'password123', role: 'nurse' },
  ]);
  console.log(`Created ${users.length} users`);

  const patients = await Patient.create([
    { name: 'James Wilson', age: 45, gender: 'male', phone: '555-0101', email: 'james@example.com', status: 'stable', bloodType: 'A+', allergies: ['penicillin'] },
    { name: 'Maria Garcia', age: 32, gender: 'female', phone: '555-0102', email: 'maria@example.com', status: 'good', bloodType: 'O-' },
    { name: 'Robert Chen', age: 67, gender: 'male', phone: '555-0103', email: 'robert@example.com', status: 'critical', bloodType: 'B+', allergies: ['aspirin', 'ibuprofen'] },
    { name: 'Lisa Thompson', age: 28, gender: 'female', phone: '555-0104', email: 'lisa@example.com', status: 'good', bloodType: 'AB+' },
    { name: 'David Martinez', age: 55, gender: 'male', phone: '555-0105', email: 'david@example.com', status: 'stable', bloodType: 'A-' },
  ]);
  console.log(`Created ${patients.length} patients`);

  await MedicalRecord.create([
    {
      patient: patients[0]._id,
      doctor: 'Dr. Sarah Johnson',
      diagnosis: 'Hypertension Stage 1',
      treatment: 'Lifestyle modifications and medication',
      notes: 'Patient advised to reduce sodium intake',
      prescription: [{ medication: 'Lisinopril', dosage: '10mg', duration: '30 days' }],
      visitDate: new Date('2024-01-15'),
    },
    {
      patient: patients[2]._id,
      doctor: 'Dr. Sarah Johnson',
      diagnosis: 'Type 2 Diabetes with complications',
      treatment: 'Insulin therapy and dietary management',
      notes: 'Critical monitoring required — blood sugar highly elevated',
      prescription: [
        { medication: 'Insulin Glargine', dosage: '20 units', duration: '60 days' },
        { medication: 'Metformin', dosage: '500mg', duration: '60 days' },
      ],
      visitDate: new Date('2024-01-18'),
    },
    {
      patient: patients[1]._id,
      doctor: 'Dr. Sarah Johnson',
      diagnosis: 'Seasonal Allergic Rhinitis',
      treatment: 'Antihistamines and nasal corticosteroids',
      notes: 'Symptoms mild, follow up in 4 weeks',
      prescription: [{ medication: 'Cetirizine', dosage: '10mg', duration: '14 days' }],
      visitDate: new Date('2024-01-20'),
    },
  ]);
  console.log('Created 3 medical records');

  console.log('\nSeed complete!');
  console.log('Login credentials:');
  console.log('  Doctor: doctor@hospital.com / password123');
  console.log('  Nurse:  nurse@hospital.com / password123');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
