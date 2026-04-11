import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import User from '../models/User.model.js';
import Area from '../models/Area.model.js';
import { jest } from '@jest/globals';
import dotenv from 'dotenv';

dotenv.config();
jest.setTimeout(30000);

beforeAll(async () => {
    // Connect to the database
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
    }
});

afterAll(async () => {
    // Cleanup
    await Area.deleteMany({ name: { $regex: /TestArea/ } });
    await User.deleteMany({ email: { $regex: /area_test/ } });
    await mongoose.connection.close();
});

describe('Area Endpoints', () => {
    let adminCookie;
    let userCookie;
    let testAreaId;

    beforeAll(async () => {
        // Setup Admim
        const adminData = {
            name: 'Area Admin',
            email: 'area_test_admin@example.com',
            password: 'password123',
            phoneNumber: '1112223333'
        };
        await request(app).post('/api/auth/register').send(adminData);
        await User.findOneAndUpdate({ email: adminData.email }, { role: 'admin', isApproved: true });

        const adminLogin = await request(app).post('/api/auth/login').send({
            email: adminData.email,
            password: adminData.password
        });
        adminCookie = adminLogin.headers['set-cookie'].find(c => c.startsWith('jwt')).split(';')[0];

        // Setup Regular User
        const userData = {
            name: 'Area User',
            email: 'area_test_user@example.com',
            password: 'password123',
            phoneNumber: '4445556666'
        };
        await request(app).post('/api/auth/register').send(userData);
        await User.findOneAndUpdate({ email: userData.email }, { isApproved: true });

        const userLogin = await request(app).post('/api/auth/login').send({
            email: userData.email,
            password: userData.password
        });
        userCookie = userLogin.headers['set-cookie'].find(c => c.startsWith('jwt')).split(';')[0];
    });

    describe('POST /api/areas', () => {
        it('should allow admin to create an area', async () => {
            const res = await request(app)
                .post('/api/areas')
                .set('Cookie', [adminCookie])
                .send({
                    name: 'TestArea_Pettah',
                    city: 'Colombo',
                    population: 50000,
                    areaSize: 2.0,
                    coordinates: { lat: 6.9335, lng: 79.8500 }
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.name).toEqual('TestArea_Pettah');
            expect(res.body.density).toEqual(25000); // 50000 / 2.0
            testAreaId = res.body._id;
        });

        it('should block regular user from creating an area', async () => {
            const res = await request(app)
                .post('/api/areas')
                .set('Cookie', [userCookie])
                .send({
                    name: 'TestArea_Unauthorized',
                    city: 'Colombo',
                    population: 10000,
                    areaSize: 1.0,
                    coordinates: { lat: 0, lng: 0 }
                });

            expect(res.statusCode).toEqual(403);
        });
    });

    describe('GET /api/areas', () => {
        it('should allow all authenticated users to list areas', async () => {
            const res = await request(app)
                .get('/api/areas')
                .set('Cookie', [userCookie]);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('should block unauthenticated access', async () => {
            const res = await request(app).get('/api/areas');
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('GET /api/areas/:id', () => {
        it('should allow users to get area by id', async () => {
            const res = await request(app)
                .get(`/api/areas/${testAreaId}`)
                .set('Cookie', [userCookie]);

            expect(res.statusCode).toEqual(200);
            expect(res.body._id).toEqual(testAreaId);
        });
    });

    describe('PUT /api/areas/:id', () => {
        it('should allow admin to update area and recalculate density', async () => {
            const res = await request(app)
                .put(`/api/areas/${testAreaId}`)
                .set('Cookie', [adminCookie])
                .send({
                    population: 80000 // New population, areaSize remains 2.0
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.population).toEqual(80000);
            expect(res.body.density).toEqual(40000); // 80000 / 2.0
        });

        it('should block regular user from updating area', async () => {
            const res = await request(app)
                .put(`/api/areas/${testAreaId}`)
                .set('Cookie', [userCookie])
                .send({ population: 99999 });

            expect(res.statusCode).toEqual(403);
        });
    });

    describe('DELETE /api/areas/:id', () => {
        it('should block regular user from deleting area', async () => {
            const res = await request(app)
                .delete(`/api/areas/${testAreaId}`)
                .set('Cookie', [userCookie]);

            expect(res.statusCode).toEqual(403);
        });

        it('should allow admin to delete area', async () => {
            const res = await request(app)
                .delete(`/api/areas/${testAreaId}`)
                .set('Cookie', [adminCookie]);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toMatch(/deleted/i);
        });
    });
});
