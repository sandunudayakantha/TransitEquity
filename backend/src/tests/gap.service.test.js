import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import Area from '../models/Area.model.js';
import Transport from '../models/Transport.model.js';
import Facility from '../models/Facility.model.js';
import GapReport from '../models/GapReport.model.js';
import dotenv from 'dotenv';

dotenv.config();

// Mock the distance API
jest.unstable_mockModule('../utils/distanceApi.js', () => ({
  calculateDrivingDistance: jest.fn(),
}));

const { calculateDrivingDistance } = await import('../utils/distanceApi.js');
const gapService = await import('../services/gap.Service.js');

describe('Gap Service Logic', () => {
    let testAreaId;

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }
        await GapReport.deleteMany({});
        await Area.deleteMany({ name: 'ServiceGapTestArea' });
        
        const area = await Area.create({
            name: 'ServiceGapTestArea',
            city: 'Test City',
            population: 5000,
            areaSize: 10,
            coordinates: { lat: 6.9, lng: 79.8 }
        });
        testAreaId = area._id;
    });

    afterAll(async () => {
        await GapReport.deleteMany({});
        await Area.deleteMany({ name: 'ServiceGapTestArea' });
        await mongoose.connection.close();
    });

    describe('analyzeGapForArea', () => {
        it('should calculate gap report correctly with multiple facilities', async () => {
            // Setup facilities
            await Facility.create([
                { name: 'F1', type: 'Bus Stop', areaId: testAreaId, coordinates: { lat: 6.91, lng: 79.81 }, capacity: 10 },
                { name: 'F2', type: 'Bus Stop', areaId: testAreaId, coordinates: { lat: 6.92, lng: 79.82 }, capacity: 10 }
            ]);

            // Setup Transport
            await Transport.create({
                routeNumber: 'T1',
                serviceType: 'Bus',
                frequency: 20,
                capacity: 50,
                startPoint: 'A',
                endPoint: 'B',
                coveredAreas: [testAreaId]
            });

            // Mock distance results
            calculateDrivingDistance.mockResolvedValueOnce(1.5).mockResolvedValueOnce(2.5);

            const report = await gapService.analyzeGapForArea(testAreaId);

            expect(report.areaId.toString()).toBe(testAreaId.toString());
            expect(report.transportFrequency).toBe(20);
            expect(report.avgDistance).toBe(2.0); // (1.5 + 2.5) / 2
            expect(report.severity).toBeDefined();

            // Cleanup
            await Transport.deleteMany({ routeNumber: 'T1' });
            await Facility.deleteMany({ areaId: testAreaId });
        });

        it('should use fallback distance if API fails', async () => {
            await Facility.create({ 
                name: 'F3', 
                type: 'Bus Stop', 
                areaId: testAreaId, 
                coordinates: { lat: 7.0, lng: 79.9 }, 
                capacity: 10 
            });

            calculateDrivingDistance.mockRejectedValue(new Error('API Down'));

            const report = await gapService.analyzeGapForArea(testAreaId);
            
            expect(report.avgDistance).toBeGreaterThan(0);
            expect(calculateDrivingDistance).toHaveBeenCalled();
            
            await Facility.deleteMany({ areaId: testAreaId });
        });

        it('should return default distance if no facilities exist', async () => {
            const report = await gapService.analyzeGapForArea(testAreaId);
            expect(report.avgDistance).toBe(5.0);
        });

        it('should throw error if area not found', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            await expect(gapService.analyzeGapForArea(fakeId)).rejects.toThrow('Area not found');
        });
    });

    describe('getAllReports Aggregation', () => {
        it('should return aggregated reports with feedback counts', async () => {
            // Create a report
            await GapReport.create({
                areaId: testAreaId,
                population: 1000,
                transportFrequency: 10,
                avgDistance: 2.0
            });

            // Need to create feedback for this area if we want to test that join
            // But for 100% coverage, even an empty array join is fine if the branches are hit.
            
            const reports = await gapService.getAllReports({ areaId: testAreaId });
            expect(reports.length).toBeGreaterThan(0);
            expect(reports[0]).toHaveProperty('unresolvedFeedbackCount');
        });
    });
});
