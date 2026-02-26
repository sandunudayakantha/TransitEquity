import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import Transport from '../src/models/Transport.model.js';
import ServiceStatus from '../src/models/ServiceStatus.model.js';
import dotenv from 'dotenv';

dotenv.config();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Transport Route & Service Management Validation', () => {
  // Missing required field
  it('Should fail to create transport without routeNumber', async () => {
    const res = await request(app)
      .post('/api/transports')
      .send({
        serviceType: 'Bus',
        frequency: 18,
        capacity: 50,
        startPoint: 'A',
        endPoint: 'B'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Missing required fields');
  });

  // Invalid enum value
  it('Should fail to create transport with invalid serviceType', async () => {
    const res = await request(app)
      .post('/api/transports')
      .send({
        routeNumber: '101',
        serviceType: 'Metro', // invalid
        frequency: 10,
        capacity: 40,
        startPoint: 'A',
        endPoint: 'B'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Invalid ObjectId for GET
  it('Should fail to get transport with invalid ID', async () => {
    const res = await request(app).get('/api/transports/1234');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Negative numbers
  it('Should fail to create transport with negative frequency', async () => {
    const res = await request(app)
      .post('/api/transports')
      .send({
        routeNumber: '102',
        serviceType: 'Bus',
        frequency: -5,
        capacity: 40,
        startPoint: 'A',
        endPoint: 'B'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Invalid ServiceStatus enum
  it('Should fail to create service with invalid status', async () => {
    const res = await request(app)
      .post('/api/services')
      .send({
        routeId: new mongoose.Types.ObjectId(),
        vehicleNumber: 'NA-1234',
        currentLocation: { lat: 6.9, lng: 79.85 },
        status: 'Flying', // invalid
        delayMinutes: 0
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Invalid routeId
  it('Should fail to create service with invalid routeId', async () => {
    const res = await request(app)
      .post('/api/services')
      .send({
        routeId: '1234',
        vehicleNumber: 'NA-5678',
        currentLocation: { lat: 6.9, lng: 79.85 },
        status: 'Active',
        delayMinutes: 0
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
