import request from 'supertest';
import app from '../src/app.js';
import mongoose from 'mongoose';
import User from '../src/models/User.model.js';
import Area from '../src/models/Area.model.js';
import GapReport from '../src/models/GapReport.model.js';
import dotenv from 'dotenv';

dotenv.config();

describe('Gap Analysis Endpoints', () => {
    let adminToken;
    let plannerToken;
    let testAreaId;
    let reportId;

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }

        // Clean up
        await User.deleteMany({ email: /test-gap/ });
        await GapReport.deleteMany({});
        await Area.deleteMany({ name: 'Test Area Gap' });

        // Setup Area
        const area = await Area.create({
            name: 'Test Area Gap',
            city: 'Test City',
            population: 5000,
            areaSize: 20,
            coordinates: { lat: 30, lng: 40 }
        });
        testAreaId = area._id;

        // Setup Admin
        await request(app).post('/api/auth/register').send({
            name: 'Admin User',
            email: 'admin-test-gap@example.com',
            password: 'password123',
            phoneNumber: '7778889999'
        });
        await User.findOneAndUpdate({ email: 'admin-test-gap@example.com' }, { role: 'admin' });

        const adminRes = await request(app).post('/api/auth/login').send({
            email: 'admin-test-gap@example.com',
            password: 'password123'
        });
        adminToken = adminRes.headers['set-cookie'].find(c => c.startsWith('jwt')).split(';')[0];

        // Setup Planner
        await request(app).post('/api/auth/register').send({
            name: 'Planner User',
            email: 'planner-test-gap@example.com',
            password: 'password123',
            phoneNumber: '0001112222'
        });
        await User.findOneAndUpdate({ email: 'planner-test-gap@example.com' }, { role: 'planner', isApproved: true });

        const plannerRes = await request(app).post('/api/auth/login').send({
            email: 'planner-test-gap@example.com',
            password: 'password123'
        });
        plannerToken = plannerRes.headers['set-cookie'].find(c => c.startsWith('jwt')).split(';')[0];
    });

    afterAll(async () => {
        await User.deleteMany({ email: /test-gap/ });
        await GapReport.deleteMany({});
        await Area.deleteMany({ _id: testAreaId });
        await mongoose.connection.close();
    });

    it('should trigger gap analysis (planner)', async () => {
        const res = await request(app)
            .post('/api/gap/analyze')
            .set('Cookie', [plannerToken])
            .send({ areaId: testAreaId });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('_id');
        reportId = res.body.data._id;
    });

    it('should get all gap reports', async () => {
        const res = await request(app)
            .get('/api/gap/reports')
            .set('Cookie', [plannerToken]);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get gap report by ID', async () => {
        const res = await request(app)
            .get(`/api/gap/reports/${reportId}`)
            .set('Cookie', [plannerToken]);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data._id).toEqual(String(reportId));
    });

    it('should block non-admin from deleting gap report', async () => {
        const res = await request(app)
            .delete(`/api/gap/reports/${reportId}`)
            .set('Cookie', [plannerToken]);

        expect(res.statusCode).toEqual(403);
    });

    it('should allow admin to delete gap report', async () => {
        const res = await request(app)
            .delete(`/api/gap/reports/${reportId}`)
            .set('Cookie', [adminToken]);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toMatch(/deleted/i);
    });
});
