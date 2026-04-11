import { jest } from '@jest/globals';
import httpMocks from 'node-mocks-http';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import User from '../models/User.model.js';
import dotenv from 'dotenv';

dotenv.config();

describe('Auth Middleware Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        next = jest.fn();
        
        // Manual mock for User model
        User.findById = jest.fn().mockReturnValue({
            select: jest.fn().mockImplementation((fields) => {
                // If we want to simulate user not found, we can change this in specific tests
                return null; 
            })
        });
    });

    describe('protect middleware', () => {
        it('should return 401 if no token is provided', async () => {
            req.cookies = {};
            req.headers = {};
            
            await expect(protect(req, res, next)).rejects.toThrow('Not authorized, no token');
            expect(res.statusCode).toBe(401);
        });

        it('should return 401 if token is invalid', async () => {
            req.cookies = { jwt: 'invalidtoken' };
            
            await expect(protect(req, res, next)).rejects.toThrow('Not authorized, token failed');
            expect(res.statusCode).toBe(401);
        });

        it('should return 401 if user is not found in database', async () => {
            const token = jwt.sign({ userId: new mongoose.Types.ObjectId() }, process.env.JWT_SECRET);
            req.cookies = { jwt: token };
            
            await expect(protect(req, res, next)).rejects.toThrow('User not found');
            expect(res.statusCode).toBe(401);
        });
    });

    describe('authorize middleware', () => {
        it('should allow access if user role is authorized', () => {
            req.user = { role: 'admin' };
            const middleware = authorize('admin', 'officer');
            middleware(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should return 403 if user role is not authorized', () => {
            req.user = { role: 'user' };
            const middleware = authorize('admin');
            
            expect(() => middleware(req, res, next)).toThrow(/is not authorized/);
            expect(res.statusCode).toBe(403);
        });
    });

    describe('errorHandler middleware', () => {
        it('should return 500 if status code is 200', async () => {
            const err = new Error('Test Error');
            res.statusCode = 200;
            const { errorHandler } = await import('../middlewares/error.middleware.js');
            errorHandler(err, req, res, next);
            expect(res.statusCode).toBe(500);
            expect(res._getJSONData().message).toBe('Test Error');
        });

        it('should return original status code if not 200', async () => {
            const err = new Error('Not Found');
            res.statusCode = 404;
            const { errorHandler } = await import('../middlewares/error.middleware.js');
            errorHandler(err, req, res, next);
            expect(res.statusCode).toBe(404);
        });
    });
});
