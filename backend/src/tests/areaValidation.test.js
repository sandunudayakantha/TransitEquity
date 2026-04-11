import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import User from '../models/User.model.js';
import Area from '../models/Area.model.js';
import dotenv from 'dotenv';

dotenv.config();

describe('Area Validation Endpoints', () => {
    let adminCookie;

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }

        // Clean up
        await User.deleteMany({ email: 'admin-area-test@example.com' });
        await Area.deleteMany({ name: /^Test Area/ });

        // Create Admin
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Admin User',
                email: 'admin-area-test@example.com',
                password: 'password123',
                phoneNumber: '9876543210'
            });

        await User.findOneAndUpdate({ email: 'admin-area-test@example.com' }, { role: 'admin' });

        // Login Admin
        const resAdmin = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin-area-test@example.com',
                password: 'password123',
            });

        const adminCookies = resAdmin.headers['set-cookie'];
        adminCookie = adminCookies.find(cookie => cookie.startsWith('jwt')).split(';')[0];
    });

    afterAll(async () => {
        await User.deleteMany({ email: 'admin-area-test@example.com' });
        await Area.deleteMany({ name: /^Test Area/ });
        await mongoose.connection.close();
    });

    describe('POST /api/areas', () => {
        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/areas')
                .set('Cookie', [adminCookie])
                .send({
                    name: 'Test Area 1'
                    // missing city, population, areaSize, coordinates
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toBeDefined();
        });

        it('should return 400 if coordinates are invalid', async () => {
            const res = await request(app)
                .post('/api/areas')
                .set('Cookie', [adminCookie])
                .send({
                    name: 'Test Area 2',
                    city: 'Test City',
                    population: 1000,
                    areaSize: 10,
                    coordinates: {
                        lat: 100, // Invalid lat (> 90)
                        lng: 50
                    }
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toMatch(/lat/i);
        });

        it('should return 201 for valid area data', async () => {
            const res = await request(app)
                .post('/api/areas')
                .set('Cookie', [adminCookie])
                .send({
                    name: 'Test Area 3',
                    city: 'Test City',
                    population: 1000,
                    areaSize: 10,
                    coordinates: {
                        lat: 10,
                        lng: 20
                    }
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body.name).toEqual('Test Area 3');
            expect(res.body.density).toEqual(100);
        });
    });

    describe('PUT /api/areas/:id', () => {
        let areaId;

        beforeAll(async () => {
            const area = new Area({
                name: 'Test Area Update',
                city: 'Test City',
                population: 500,
                areaSize: 5,
                coordinates: { lat: 0, lng: 0 }
            });
            const saved = await area.save();
            areaId = saved._id;
        });

        it('should return 400 if update data is invalid (negative population)', async () => {
            const res = await request(app)
                .put(`/api/areas/${areaId}`)
                .set('Cookie', [adminCookie])
                .send({
                    population: -100
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toMatch(/population/i);
        });

        it('should return 200 and update density for valid partial update', async () => {
            const res = await request(app)
                .put(`/api/areas/${areaId}`)
                .set('Cookie', [adminCookie])
                .send({
                    population: 1000
                });
            expect(res.statusCode).toEqual(200);
            expect(res.body.population).toEqual(1000);
            expect(res.body.density).toEqual(200); // 1000 / 5
        });
    });
});
