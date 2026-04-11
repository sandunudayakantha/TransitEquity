import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import ServiceStatus from '../models/ServiceStatus.model.js';
import Transport from '../models/Transport.model.js';
import User from '../models/User.model.js';
import dotenv from 'dotenv';

dotenv.config();
jest.setTimeout(30000);

describe('Service Status Endpoints', () => {
    let adminCookie;
    let testRouteId;
    let testServiceId;

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }

        // Cleanup
        await User.deleteMany({ email: /test-service-status/ });
        await ServiceStatus.deleteMany({});
        await Transport.deleteMany({ routeNumber: 'SERVICE-TEST' });

        // Setup Admin
        const adminData = {
            name: 'Service Admin',
            email: 'admin-test-service-status@example.com',
            password: 'password123',
            phoneNumber: '1112223337'
        };
        await request(app).post('/api/auth/register').send(adminData);
        await User.findOneAndUpdate({ email: adminData.email }, { role: 'admin', isApproved: true });
        const adminLogin = await request(app).post('/api/auth/login').send({
            email: adminData.email,
            password: adminData.password
        });
        adminCookie = adminLogin.headers['set-cookie'].find(c => c.startsWith('jwt')).split(';')[0];

        // Setup a Route (Transport)
        const transport = await Transport.create({
            routeNumber: 'SERVICE-TEST',
            serviceType: 'Bus',
            frequency: 15,
            capacity: 50,
            startPoint: 'Start',
            endPoint: 'End'
        });
        testRouteId = transport._id;
    });

    afterAll(async () => {
        await User.deleteMany({ email: /test-service-status/ });
        await ServiceStatus.deleteMany({});
        await Transport.deleteMany({ routeNumber: 'SERVICE-TEST' });
        await mongoose.connection.close();
    });

    describe('POST /api/services', () => {
        it('should allow admin to create service status', async () => {
            const res = await request(app)
                .post('/api/services')
                .set('Cookie', [adminCookie])
                .send({
                    routeId: testRouteId,
                    vehicleNumber: 'VN-1234',
                    currentLocation: { lat: 6.9, lng: 79.8 },
                    status: 'Active'
                });
            
            expect(res.statusCode).toEqual(201);
            expect(res.body.vehicleNumber).toEqual('VN-1234');
            testServiceId = res.body._id;
        });

        it('should return 400 for missing fields', async () => {
            const res = await request(app)
                .post('/api/services')
                .set('Cookie', [adminCookie])
                .send({
                    routeId: testRouteId
                });
            
            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toMatch(/Missing required fields/i);
        });

        it('should return 400 for invalid status', async () => {
            const res = await request(app)
                .post('/api/services')
                .set('Cookie', [adminCookie])
                .send({
                    routeId: testRouteId,
                    vehicleNumber: 'VN-1234',
                    currentLocation: { lat: 6.9, lng: 79.8 },
                    status: 'Unknown'
                });
            
            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toMatch(/Invalid status value/i);
        });
    });

    describe('GET /api/services', () => {
        it('should get all services', async () => {
            const res = await request(app)
                .get('/api/services')
                .set('Cookie', [adminCookie]);
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('should get active services', async () => {
            const res = await request(app)
                .get('/api/services/active')
                .set('Cookie', [adminCookie]);
            expect(res.statusCode).toEqual(200);
            expect(res.body.every(s => s.status === 'Active')).toBe(true);
        });

        it('should get delayed services', async () => {
            const res = await request(app)
                .get('/api/services/delayed')
                .set('Cookie', [adminCookie]);
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('PUT /api/services/:id', () => {
        it('should update service status', async () => {
            const res = await request(app)
                .put(`/api/services/${testServiceId}`)
                .set('Cookie', [adminCookie])
                .send({ status: 'Delayed', delayMinutes: 10 });
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('Delayed');
            expect(res.body.delayMinutes).toEqual(10);
        });

        it('should return 404 for non-existent service ID', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .put(`/api/services/${fakeId}`)
                .set('Cookie', [adminCookie])
                .send({ status: 'Active' });
            
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('DELETE /api/services/:id', () => {
        it('should delete service status', async () => {
            const res = await request(app)
                .delete(`/api/services/${testServiceId}`)
                .set('Cookie', [adminCookie]);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toMatch(/Service deleted/i);
        });
    });
});
