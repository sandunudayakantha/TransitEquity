import request from 'supertest';
import app from '../src/app.js';
import mongoose from 'mongoose';
import User from '../src/models/User.model.js';
import dotenv from 'dotenv';

dotenv.config();

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
    await User.deleteMany();
    await mongoose.connection.close();
});

describe('Auth Endpoints', () => {
    let token;
    let adminToken;

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                phoneNumber: '1234567890'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body.user).toHaveProperty('_id');
        expect(res.body.token).toBeDefined(); // Token should be in body now
        expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should validate user input', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'invalid-email',
                password: '123',
                phoneNumber: ''
            });
        expect(res.statusCode).toEqual(400);
        // Expect validation errors
    });

    it('should login user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body.user).toHaveProperty('_id');
        expect(res.body.token).toBeDefined(); // Token should be in body now
        expect(res.headers['set-cookie']).toBeDefined(); // Token is in cookie

        // Extract cookie for subsequent requests
        const cookies = res.headers['set-cookie'];
        token = cookies.find(cookie => cookie.startsWith('jwt')).split(';')[0];
    });

    it('should get current user profile', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Cookie', [`${token}`]); // Send cookie
        expect(res.statusCode).toEqual(200);
        expect(res.body.email).toEqual('test@example.com');
    });

    it('should not access protected route without token', async () => {
        const res = await request(app)
            .get('/api/auth/me');
        expect(res.statusCode).toEqual(401);
    });
});

describe('RBAC', () => {
    let adminCookie;
    let userCookie;

    beforeAll(async () => {
        // Create Admin
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                phoneNumber: '9876543210'
            });

        // Manually update role to admin as register defaults to user
        await User.findOneAndUpdate({ email: 'admin@example.com' }, { role: 'admin' });

        // Login Admin
        const resAdmin = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@example.com',
                password: 'password123',
            });

        const adminCookies = resAdmin.headers['set-cookie'];
        adminCookie = adminCookies.find(cookie => cookie.startsWith('jwt')).split(';')[0];


        // Login Normal User (created in previous test)
        const resUser = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });
        const userCookies = resUser.headers['set-cookie'];
        userCookie = userCookies.find(cookie => cookie.startsWith('jwt')).split(';')[0];
    });

    it('should allow admin to access restricted route', async () => {
        const res = await request(app)
            .get('/api/users')
            .set('Cookie', [adminCookie]);
        expect(res.statusCode).toEqual(200);
    });

    it('should block user from accessing admin route', async () => {
        const res = await request(app)
            .get('/api/users')
            .set('Cookie', [userCookie]);
        expect(res.statusCode).toEqual(403);
    });
});

describe('User Approval Workflow', () => {
    let adminCookie;
    let officerId;

    beforeAll(async () => {
        // Reuse Admin from previous steps or create new. 
        // For simplicity, let's login as the Admin created in RBAC block
        const resAdmin = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@example.com',
                password: 'password123',
            });
        const adminCookies = resAdmin.headers['set-cookie'];
        adminCookie = adminCookies.find(cookie => cookie.startsWith('jwt')).split(';')[0];
    });

    it('should register a tOfficer as pending', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Transit Officer',
                email: 'officer@example.com',
                password: 'password123',
                role: 'tOfficer',
                phoneNumber: '5555555555'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.user.isApproved).toBe(false);
        expect(res.body.message).toBeDefined();
        // Should NOT set cookie
        // Note: supertest creates an array of strings for cookies. checking length or content
        // In our controller, we only set cookie if isApproved.
        // But headers['set-cookie'] might be undefined if not set.
        expect(res.headers['set-cookie']).toBeUndefined();

        officerId = res.body.user._id;
    });

    it('should block pending user from logging in', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'officer@example.com',
                password: 'password123',
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toMatch(/Account not approved yet/i);
    });

    it('should allow admin to see pending users', async () => {
        const res = await request(app)
            .get('/api/users/pending')
            .set('Cookie', [adminCookie]);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        const pendingOfficer = res.body.find(u => u.email === 'officer@example.com');
        expect(pendingOfficer).toBeDefined();
    });

    it('should allow admin to approve user', async () => {
        const res = await request(app)
            .put(`/api/users/${officerId}/approve`)
            .set('Cookie', [adminCookie]);

        expect(res.statusCode).toEqual(200);
        expect(res.body.isApproved).toBe(true);
    });

    it('should allow approved user to login', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'officer@example.com',
                password: 'password123',
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.user.isApproved).toBe(true);
        expect(res.headers['set-cookie']).toBeDefined();
    });
});
