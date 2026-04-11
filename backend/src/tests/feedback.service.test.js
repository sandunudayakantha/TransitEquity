import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import Area from '../models/Area.model.js';
import Feedback from '../models/Feedback.model.js';
import dotenv from 'dotenv';

dotenv.config();
jest.setTimeout(30000);

// Use dynamic import for the service to ensure any mocks are applied (though we aren't mocking much here)
const feedbackService = await import('../services/feedback.Service.js');

describe('Feedback Service Logic', () => {
    let testAreaId;
    let userId;

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }
        await Feedback.deleteMany({});
        await Area.deleteMany({ name: 'ServiceFeedbackTestArea' });
        
        const area = await Area.create({
            name: 'ServiceFeedbackTestArea',
            city: 'Test City',
            population: 1000,
            areaSize: 5,
            coordinates: { lat: 6.9, lng: 79.8 }
        });
        testAreaId = area._id;
        userId = new mongoose.Types.ObjectId();
    });

    afterAll(async () => {
        await Feedback.deleteMany({});
        await Area.deleteMany({ name: 'ServiceFeedbackTestArea' });
        await mongoose.connection.close();
    });

    describe('getAllFeedback', () => {
        it('should show feedback even if its area was deleted (visibility fix)', async () => {
            // 1. Create feedback for a "fake" area ID
            const fakeAreaId = new mongoose.Types.ObjectId();
            await Feedback.create({
                areaId: fakeAreaId,
                issueType: 'New Route',
                description: 'This is a test feedback for a missing area',
                coordinates: { lat: 7.0, lng: 80.0 },
                urgency: 'Medium',
                submittedBy: userId
            });

            // 2. Query feedback
            const feedbacks = await feedbackService.getAllFeedback({ submittedBy: userId });

            // 3. Verify it shows up despite area details lookup failing
            expect(feedbacks.length).toEqual(1);
            expect(feedbacks[0].description).toMatch(/missing area/i);
            expect(feedbacks[0].areaDetails).toBeUndefined(); // Or null/empty due to preserveNullAndEmptyArrays
        });

        it('should filter correctly by submittedBy', async () => {
            const otherUserId = new mongoose.Types.ObjectId();
            await Feedback.create({
                areaId: testAreaId,
                issueType: 'Accessibility',
                description: 'Another user feedback',
                coordinates: { lat: 6.9, lng: 79.8 },
                urgency: 'Low',
                submittedBy: otherUserId
            });

            const myFeedbacks = await feedbackService.getAllFeedback({ submittedBy: userId });
            expect(myFeedbacks.length).toEqual(1);
            expect(myFeedbacks[0].submittedBy.toString()).toEqual(userId.toString());
        });
    });
});
