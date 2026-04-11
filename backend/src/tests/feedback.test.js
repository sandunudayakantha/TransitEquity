import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import User from '../models/User.model.js';
import Area from '../models/Area.model.js';
import Feedback from '../models/Feedback.model.js';
import dotenv from 'dotenv';

dotenv.config();

jest.setTimeout(30000);

describe('Feedback Endpoints', () => {
    let adminToken;
    let officerToken;
    let testAreaId;
    let feedbackId;

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }

        // Clean up
        await User.deleteMany({ email: /test-feedback/ });
        await Feedback.deleteMany({});
        await Area.deleteMany({ name: 'Test Area Feedback' });

        // Setup Area
        const area = await Area.create({
            name: 'Test Area Feedback',
            city: 'Test City',
            population: 1000,
            areaSize: 10,
            coordinates: { lat: 10, lng: 20 }
        });
        testAreaId = area._id;

        // Setup Admin
        await request(app).post('/api/auth/register').send({
            name: 'Admin User',
            email: 'admin-test-feedback@example.com',
            password: 'password123',
            phoneNumber: '1112223333'
        });
        await User.findOneAndUpdate({ email: 'admin-test-feedback@example.com' }, { role: 'admin' });

        const adminRes = await request(app).post('/api/auth/login').send({
            email: 'admin-test-feedback@example.com',
            password: 'password123'
        });
        adminToken = adminRes.headers['set-cookie'].find(c => c.startsWith('jwt')).split(';')[0];

        // Setup Officer
        await request(app).post('/api/auth/register').send({
            name: 'Officer User',
            email: 'officer-test-feedback@example.com',
            password: 'password123',
            phoneNumber: '4445556666'
        });
        await User.findOneAndUpdate({ email: 'officer-test-feedback@example.com' }, { role: 'officer', isApproved: true });

        const officerRes = await request(app).post('/api/auth/login').send({
            email: 'officer-test-feedback@example.com',
            password: 'password123'
        });
        officerToken = officerRes.headers['set-cookie'].find(c => c.startsWith('jwt')).split(';')[0];
    });

    afterAll(async () => {
        await User.deleteMany({ email: /test-feedback/ });
        await Feedback.deleteMany({});
        await Area.deleteMany({ _id: testAreaId });
        await mongoose.connection.close();
    });

    it('should submit new feedback anonymously', async () => {
        const res = await request(app)
            .post('/api/feedback')
            .send({
                areaId: testAreaId,
                issueType: 'New Bus Stop',
                description: 'We need a bus stop near the park.',
                coordinates: { lat: 10.1, lng: 20.1 },
                urgency: 'Medium'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('_id');
        feedbackId = res.body.data._id;
    });

    it('should submit new feedback with user attribution', async () => {
        const res = await request(app)
            .post('/api/feedback')
            .set('Cookie', [officerToken])
            .send({
                areaId: testAreaId,
                issueType: 'New Route',
                description: 'This feedback should be attributed to the officer.',
                coordinates: { lat: 10.2, lng: 20.2 },
                urgency: 'High'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.data.submittedBy).toBeDefined();
    });

    it('should get all feedback', async () => {
        const res = await request(app).get('/api/feedback');
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter feedback by status', async () => {
        const res = await request(app).get('/api/feedback?status=Pending');
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.every(f => f.status === 'Pending')).toBe(true);
    });

    it('should get feedback by ID', async () => {
        const res = await request(app).get(`/api/feedback/${feedbackId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data._id).toEqual(String(feedbackId));
    });

    it('should upvote feedback', async () => {
        const res = await request(app)
            .put(`/api/feedback/${feedbackId}/vote`)
            .set('Cookie', [officerToken]);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.votes).toBe(1);
    });

    it('should allow officer to update feedback status', async () => {
        const res = await request(app)
            .put(`/api/feedback/${feedbackId}`)
            .set('Cookie', [officerToken])
            .send({ status: 'Reviewed' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.status).toEqual('Reviewed');
    });

    it('should block non-admin from deleting feedback', async () => {
        const res = await request(app)
            .delete(`/api/feedback/${feedbackId}`)
            .set('Cookie', [officerToken]);

        expect(res.statusCode).toEqual(403);
    });

    it('should allow admin to delete feedback', async () => {
        const res = await request(app)
            .delete(`/api/feedback/${feedbackId}`)
            .set('Cookie', [adminToken]);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toMatch(/deleted/i);
    });
});
