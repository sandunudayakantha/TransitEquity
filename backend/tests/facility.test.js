import request from 'supertest';
import app from '../src/app.js';
import mongoose from 'mongoose';
import User from '../src/models/User.model.js';
import Area from '../src/models/Area.model.js';
import Facility from '../src/models/Facility.model.js';
import dotenv from 'dotenv';

dotenv.config();

beforeAll(async () => {
    // Connect to the database
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
    }
});

afterAll(async () => {
    // Cleanup
    await Facility.deleteMany({ name: { $regex: /TestFacility/ } });
    await Area.deleteMany({ name: { $regex: /TestAreaForFacility/ } });
    await User.deleteMany({ email: { $regex: /facility_test/ } });
    await mongoose.connection.close();
});

describe('Facility Endpoints', () => {
    let adminCookie;
    let iOfficerCookie;
    let userCookie;
    let testAreaId;
    let testFacilityId;

    beforeAll(async () => {
        // Cleanup to prevent duplicate key errors
        await Area.deleteMany({ name: 'TestAreaForFacility' });

        // Setup Area
        const area = await Area.create({
            name: 'TestAreaForFacility',
            city: 'Colombo',
            population: 10000,
            areaSize: 1.0,
            coordinates: { lat: 6.9271, lng: 79.8612 }
        });
        testAreaId = area._id;

        // Setup Admin
        const adminData = {
            name: 'Facility Admin',
            email: 'facility_test_admin@example.com',
            password: 'password123',
            phoneNumber: '1112223330'
        };
        await request(app).post('/api/auth/register').send(adminData);
        await User.findOneAndUpdate({ email: adminData.email }, { role: 'admin', isApproved: true });
        const adminLogin = await request(app).post('/api/auth/login').send({
            email: adminData.email,
            password: adminData.password
        });
        adminCookie = adminLogin.headers['set-cookie'].find(c => c.startsWith('jwt')).split(';')[0];

        // Setup iOfficer
        const iOfficerData = {
            name: 'Facility iOfficer',
            email: 'facility_test_iofficer@example.com',
            password: 'password123',
            phoneNumber: '1112223331'
        };
        await request(app).post('/api/auth/register').send(iOfficerData);
        await User.findOneAndUpdate({ email: iOfficerData.email }, { role: 'iOfficer', isApproved: true });
        const iOfficerLogin = await request(app).post('/api/auth/login').send({
            email: iOfficerData.email,
            password: iOfficerData.password
        });
        iOfficerCookie = iOfficerLogin.headers['set-cookie'].find(c => c.startsWith('jwt')).split(';')[0];

        // Setup Regular User
        const userData = {
            name: 'Facility User',
            email: 'facility_test_user@example.com',
            password: 'password123',
            phoneNumber: '1112223332'
        };
        await request(app).post('/api/auth/register').send(userData);
        await User.findOneAndUpdate({ email: userData.email }, { isApproved: true });
        const userLogin = await request(app).post('/api/auth/login').send({
            email: userData.email,
            password: userData.password
        });
        userCookie = userLogin.headers['set-cookie'].find(c => c.startsWith('jwt')).split(';')[0];
    });

    describe('POST /api/facilities', () => {
        it('should allow admin to create a facility', async () => {
            const res = await request(app)
                .post('/api/facilities')
                .set('Cookie', [adminCookie])
                .send({
                    name: 'TestFacility_BusStop',
                    type: 'Bus Stop',
                    areaId: testAreaId,
                    coordinates: { lat: 6.9271, lng: 79.8612 },
                    capacity: 50,
                    hasDisabledAccess: true
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toEqual('TestFacility_BusStop');
            testFacilityId = res.body.data._id;
        });

        it('should allow iOfficer to create a facility', async () => {
            const res = await request(app)
                .post('/api/facilities')
                .set('Cookie', [iOfficerCookie])
                .send({
                    name: 'TestFacility_Station',
                    type: 'Station',
                    areaId: testAreaId,
                    coordinates: { lat: 6.9275, lng: 79.8615 },
                    capacity: 200
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
        });

        it('should block regular user from creating a facility', async () => {
            const res = await request(app)
                .post('/api/facilities')
                .set('Cookie', [userCookie])
                .send({
                    name: 'TestFacility_Unauthorized',
                    type: 'Parking',
                    areaId: testAreaId,
                    coordinates: { lat: 0, lng: 0 },
                    capacity: 10
                });

            expect(res.statusCode).toEqual(403);
        });

        it('should fail if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/facilities')
                .set('Cookie', [adminCookie])
                .send({
                    name: 'TestFacility_Incomplete'
                    // Missing type, areaId, coordinates, capacity
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toBe(false);
        });

        it('should fail if invalid type is provided', async () => {
            const res = await request(app)
                .post('/api/facilities')
                .set('Cookie', [adminCookie])
                .send({
                    name: 'TestFacility_InvalidType',
                    type: 'Airport', // Invalid type
                    areaId: testAreaId,
                    coordinates: { lat: 6.9, lng: 79.8 },
                    capacity: 10
                });

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('GET /api/facilities', () => {
        it('should allow all authenticated users to list facilities', async () => {
            const res = await request(app)
                .get('/api/facilities')
                .set('Cookie', [userCookie]);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.count).toBeGreaterThan(0);
        });
    });

    describe('GET /api/facilities/:id', () => {
        it('should allow users to get facility by id', async () => {
            const res = await request(app)
                .get(`/api/facilities/${testFacilityId}`)
                .set('Cookie', [userCookie]);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data._id).toEqual(testFacilityId);
        });

        it('should return 404 for non-existent facility', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/api/facilities/${fakeId}`)
                .set('Cookie', [userCookie]);

            expect(res.statusCode).toEqual(404);
        });
    });

    describe('PUT /api/facilities/:id', () => {
        it('should allow iOfficer to update facility', async () => {
            const res = await request(app)
                .put(`/api/facilities/${testFacilityId}`)
                .set('Cookie', [iOfficerCookie])
                .send({
                    capacity: 75
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.capacity).toEqual(75);
        });

        it('should block regular user from updating facility', async () => {
            const res = await request(app)
                .put(`/api/facilities/${testFacilityId}`)
                .set('Cookie', [userCookie])
                .send({ capacity: 100 });

            expect(res.statusCode).toEqual(403);
        });
    });

    describe('DELETE /api/facilities/:id', () => {
        it('should block regular user from deleting facility', async () => {
            const res = await request(app)
                .delete(`/api/facilities/${testFacilityId}`)
                .set('Cookie', [userCookie]);

            expect(res.statusCode).toEqual(403);
        });

        it('should allow admin to delete facility', async () => {
            const res = await request(app)
                .delete(`/api/facilities/${testFacilityId}`)
                .set('Cookie', [adminCookie]);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toMatch(/deleted successfully/i);
        });
    });
});
