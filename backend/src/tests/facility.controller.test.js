import { jest } from '@jest/globals';
import httpMocks from 'node-mocks-http';
import * as facilityController from '../controllers/facility.controller.js';
import * as facilityService from '../services/facility.service.js';

// ----------------------------------------------------------------------------
// 1. MOCK THE SERVICE LAYER
// We mock the service so we don't need a real database connection.
// This ensures the test runs fast and in isolation.
// ----------------------------------------------------------------------------
jest.mock('../services/facility.service.js');

describe('Facility Controller - Complete CRUD Unit Tests', () => {
  let req, res;

  // Reset request and response objects before every single test
  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    jest.clearAllMocks(); // Clear previous mock data
  });

  // =========================================================
  // TEST: CREATE FACILITY (POST)
  // =========================================================
  it('should create a facility successfully and return 201', async () => {
    // Arrange
    const mockData = { name: 'Pettah Stop', type: 'Bus Stop', capacity: 100 };
    req.body = mockData;
    
    // Mock the service to return success
    facilityService.createFacility.mockResolvedValue(mockData);

    // Act
    await facilityController.create(req, res);

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res._getJSONData().success).toBe(true);
    expect(res._getJSONData().data).toEqual(mockData);
  });

  it('should return 400 if validation fails (handled by controller validation logic)', async () => {
    // Sending empty body to trigger validation error
    req.body = {}; 
    
    await facilityController.create(req, res);

    // Expect 400 Bad Request because Name/Type are required
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().success).toBe(false);
  });

  // =========================================================
  // TEST: GET ALL FACILITIES (GET)
  // =========================================================
  it('should get all facilities and return 200', async () => {
    const mockList = [
      { name: 'Stop A', type: 'Bus Stop' },
      { name: 'Station B', type: 'Station' }
    ];
    
    facilityService.getAllFacilities.mockResolvedValue(mockList);

    await facilityController.getAll(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().count).toBe(2);
    expect(res._getJSONData().data).toEqual(mockList);
  });

  it('should return 500 if the service throws an error', async () => {
    facilityService.getAllFacilities.mockRejectedValue(new Error('DB Error'));

    await facilityController.getAll(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData().message).toBe('DB Error');
  });

  // =========================================================
  // TEST: GET ONE FACILITY (GET /:id)
  // =========================================================
  it('should get one facility by ID and return 200', async () => {
    const mockFacility = { _id: '123', name: 'Specific Stop' };
    req.params.id = '123';

    facilityService.getFacilityById.mockResolvedValue(mockFacility);

    await facilityController.getOne(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().data).toEqual(mockFacility);
  });

  it('should return 404 if facility is not found', async () => {
    req.params.id = 'missing_id';
    
    // Mock service returning null (not found)
    facilityService.getFacilityById.mockResolvedValue(null);

    await facilityController.getOne(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData().message).toBe('Facility not found');
  });

  // =========================================================
  // TEST: UPDATE FACILITY (PUT /:id)
  // =========================================================
  it('should update a facility and return 200', async () => {
    const updatedData = { name: 'Updated Name' };
    req.params.id = '123';
    req.body = updatedData;

    // Mock service returning the updated object
    facilityService.updateFacility.mockResolvedValue(updatedData);

    await facilityController.update(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().data).toEqual(updatedData);
  });

  it('should return 404 when updating a non-existent facility', async () => {
    req.params.id = 'missing_id';
    req.body = { name: 'New Name' };

    facilityService.updateFacility.mockResolvedValue(null);

    await facilityController.update(req, res);

    expect(res.statusCode).toBe(404);
  });

  // =========================================================
  // TEST: DELETE FACILITY (DELETE /:id)
  // =========================================================
  it('should delete a facility and return 200', async () => {
    req.params.id = '123';

    // Mock service returning the deleted object
    facilityService.deleteFacility.mockResolvedValue({ _id: '123', name: 'Deleted' });

    await facilityController.remove(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().message).toContain('deleted');
  });

  it('should return 404 when deleting a non-existent facility', async () => {
    req.params.id = 'missing_id';

    facilityService.deleteFacility.mockResolvedValue(null);

    await facilityController.remove(req, res);

    expect(res.statusCode).toBe(404);
  });
});