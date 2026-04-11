import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import User from '../models/User.model.js';
import dotenv from 'dotenv';

dotenv.config();
jest.setTimeout(30000);

describe('User Management Endpoints', () => {
    let adminCookie;
    let officerId;
    let regularUserId;

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }

        // Cleanup
        await User.deleteMany({ email: /test-user-mgt/ });

        // Setup Admin
        const adminData = {
            name: 'User Mgt Admin',
            email: 'admin-test-user-mgt@example.com',
            password: 'password123',
            phoneNumber: '1112223334'
        };
        await request(app).post('/api/auth/register').send(adminData);
        await User.findOneAndUpdate({ email: adminData.email }, { role: 'admin', isApproved: true });
        const adminLogin = await request(app).post('/api/auth/login').send({
            email: adminData.email,
            password: adminData.password
        });
        adminCookie = adminLogin.headers['set-cookie'].find(c => c.startsWith('jwt')).split(';')[0];

        // Setup Officer
        const officerData = {
            name: 'User Mgt Officer',
            email: 'officer-test-user-mgt@example.com',
            password: 'password123',
            phoneNumber: '1112223335',
            role: 'tOfficer'
        };
        const offRes = await request(app).post('/api/auth/register').send(officerData);
        officerId = offRes.body.user._id;

        // Setup Regular User
        const userData = {
            name: 'User Mgt Regular',
            email: 'user-test-user-mgt@example.com',
            password: 'password123',
            phoneNumber: '1112223336'
        };
        const userRes = await request(app).post('/api/auth/register').send(userData);
        regularUserId = userRes.body.user._id;
    });

    afterAll(async () => {
        await User.deleteMany({ email: /test-user-mgt/ });
        await mongoose.connection.close();
    });

    describe('GET /api/users', () => {
        it('should allow admin to get all users', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Cookie', [adminCookie]);
            
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(3);
        });
    });

    describe('GET /api/users/pending', () => {
        it('should allow admin to get pending users', async () => {
            const res = await request(app)
                .get('/api/users/pending')
                .set('Cookie', [adminCookie]);
            
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            const pendingOfficer = res.body.find(u => u._id === officerId);
            expect(pendingOfficer).toBeDefined();
        });
    });

    describe('PUT /api/users/:id/approve', () => {
        it('should toggle approval for an officer successfully', async () => {
            // First approval
            const res1 = await request(app)
                .put(`/api/users/${officerId}/approve`)
                .set('Cookie', [adminCookie]);
            
            expect(res1.statusCode).toEqual(200);
            expect(res1.body.isApproved).toBe(true);

            // Toggle back to false
            const res2 = await request(app)
                .put(`/api/users/${officerId}/approve`)
                .set('Cookie', [adminCookie]);
            
            expect(res2.statusCode).toEqual(200);
            expect(res2.body.isApproved).toBe(false);
        });

        it('should return 400 if trying to toggle approval for a non-officer role', async () => {
            const res = await request(app)
                .put(`/api/users/${regularUserId}/approve`)
                .set('Cookie', [adminCookie]);
            
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toMatch(/Only officer accounts/i);
        });

        it('should return 404 for non-existent user ID', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .put(`/api/users/${fakeId}/approve`)
                .set('Cookie', [adminCookie]);
            
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toMatch(/User not found/i);
        });
    });
});
