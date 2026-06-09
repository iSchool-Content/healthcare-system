const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../server');

const TEST_MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare_test';

let authCookie;
let patientId;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_MONGO_URI);
  }
  const res = await request(app).post('/api/auth/register').send({
    name: 'Test Nurse',
    email: 'testnurse@hospital.com',
    password: 'testpass123',
    role: 'nurse',
  });
  authCookie = res.headers['set-cookie'];
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  server.close();
});

describe('Patients API', () => {
  it('POST /api/patients — creates patient', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Cookie', authCookie)
      .send({ name: 'John Doe', age: 40, gender: 'male', phone: '555-1234', status: 'stable' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name', 'John Doe');
    patientId = res.body._id;
  });

  it('GET /api/patients — returns list', async () => {
    const res = await request(app).get('/api/patients').set('Cookie', authCookie);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/patients/:id — returns single patient', async () => {
    const res = await request(app).get(`/api/patients/${patientId}`).set('Cookie', authCookie);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(patientId);
  });

  it('PUT /api/patients/:id — updates patient', async () => {
    const res = await request(app)
      .put(`/api/patients/${patientId}`)
      .set('Cookie', authCookie)
      .send({ status: 'critical' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('critical');
  });

  it('GET /api/patients/stats — returns stats', async () => {
    const res = await request(app).get('/api/patients/stats').set('Cookie', authCookie);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('critical');
  });

  it('DELETE /api/patients/:id — deletes patient', async () => {
    const res = await request(app).delete(`/api/patients/${patientId}`).set('Cookie', authCookie);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Patient deleted');
  });

  it('GET /api/patients — returns 401 without auth', async () => {
    const res = await request(app).get('/api/patients');
    expect(res.statusCode).toBe(401);
  });
});
