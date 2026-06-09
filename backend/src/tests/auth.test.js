const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../server');

const TEST_MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare_test';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_MONGO_URI);
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  server.close();
});

describe('Auth API', () => {
  const testUser = {
    name: 'Test Doctor',
    email: 'testdoc@hospital.com',
    password: 'testpass123',
    role: 'doctor',
  };

  it('POST /api/auth/register — creates a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty('email', testUser.email);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('POST /api/auth/register — rejects duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.statusCode).toBe(409);
  });

  it('POST /api/auth/login — logs in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Logged in');
  });

  it('POST /api/auth/login — rejects invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
  });

  it('GET /health — returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
