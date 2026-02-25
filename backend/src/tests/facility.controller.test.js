import { jest } from '@jest/globals';
import httpMocks from 'node-mocks-http';

// ----------------------------------------------------------------------------
// 1. MOCK THE SERVICE LAYER (The ESM Way)
// We use unstable_mockModule because standard jest.mock fails with "require is not defined"
// ----------------------------------------------------------------------------
jest.unstable_mockModule('../services/facility.service.js', () => ({
  createFacility: jest.fn(),
  getAllFacilities: jest.fn(),
  getFacilityById: jest.fn(),
  updateFacility: jest.fn(),
  deleteFacility: jest.fn(),
}));

// 2. DYNAMIC IMPORT (Must happen AFTER the mock)
const facilityController = await import('../controllers/facility.controller.js');
const facilityService = await import('../services/facility.service.js');

describe('Facility Controller - Complete CRUD Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  // =========================================================
  // TEST: CREATE FACILITY (POST)
  // =========================================================
  it('should create a facility successfully and return 201', async () => {
    // FIX: Added common required fields (like location, status, coordinates) 
    // so the controller's validation doesn't reject it with a 400 error.
    // NOTE: Adjust these fields to match exactly what your MongoDB Schema requires!
    const mockData = { 
      name: 'Pettah Stop', 
      type: 'Bus Stop', 
      capacity: 100,
      //location: 'Colombo',
      coordinates: { 
        lat: 6.9361, 
        lng: 79.8450 
      }, 
      //status: 'Active',
      areaId: '507f1f77bcf86cd799439011' 
    };
    
    req.body = mockData;
    
    // Mock the service
    facilityService.createFacility.mockResolvedValue(mockData);

    await facilityController.create(req, res);

    // If this still fails, uncomment the line below to see what field your controller is complaining about:
     console.log("CREATE ERROR:", res._getJSONData());

    expect(res.statusCode).toBe(201);
    expect(res._getJSONData().success).toBe(true);
    expect(res._getJSONData().data).toEqual(mockData);
  });

  it('should return 400 if validation fails', async () => {
    req.body = {}; // Empty body
    await facilityController.create(req, res);
    expect(res.statusCode).toBe(400); // Validation error
  });

  // =========================================================
  // TEST: GET ALL (GET)
  // =========================================================
  it('should get all facilities and return 200', async () => {
    const mockList =[{ name: 'Stop A' }, { name: 'Stop B' }];
    facilityService.getAllFacilities.mockResolvedValue(mockList);

    await facilityController.getAll(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().count).toBe(2);
  });

  it('should return 500 if service throws error', async () => {
    facilityService.getAllFacilities.mockRejectedValue(new Error('DB Error'));
    await facilityController.getAll(req, res);
    expect(res.statusCode).toBe(500);
  });

  // =========================================================
  // TEST: GET ONE (GET /:id)
  // =========================================================
  it('should get one facility and return 200', async () => {
    // FIX: Use a standard 24-character MongoDB ID instead of "123" to prevent validation casting errors
    const validMongoId = '507f1f77bcf86cd799439011';
    const mockItem = { _id: validMongoId, name: 'Stop A' };
    
    req.params.id = validMongoId;
    facilityService.getFacilityById.mockResolvedValue(mockItem);

    await facilityController.getOne(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().data).toEqual(mockItem);
  });

  it('should return 404 if not found', async () => {
    req.params.id = '507f1f77bcf86cd799439012'; // Valid format, but fake ID
    facilityService.getFacilityById.mockResolvedValue(null);

    await facilityController.getOne(req, res);

    expect(res.statusCode).toBe(404);
  });

  // =========================================================
  // TEST: UPDATE (PUT /:id)
  // =========================================================
  it('should update facility and return 200', async () => {
    const updated = { name: 'Updated' };
    req.params.id = '507f1f77bcf86cd799439011';
    req.body = updated;
    facilityService.updateFacility.mockResolvedValue(updated);

    await facilityController.update(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().data).toEqual(updated);
  });

  it('should return 404 on update if not found', async () => {
    // FIX 1: Provide a valid 24-char MongoDB ID format so it doesn't fail ID validation
    req.params.id = '507f1f77bcf86cd799439012'; 
    
    // FIX 2: Provide a body. Without this, the controller rejects it with a 400 because there is nothing to update!
    req.body = { name: 'Updated Name' }; 

    facilityService.updateFacility.mockResolvedValue(null);
    await facilityController.update(req, res);
    
    expect(res.statusCode).toBe(404);
  });

  // =========================================================
  // TEST: DELETE (DELETE /:id)
  // =========================================================
  it('should delete facility and return 200', async () => {
    const validMongoId = '507f1f77bcf86cd799439011';
    req.params.id = validMongoId;
    facilityService.deleteFacility.mockResolvedValue({ _id: validMongoId });

    await facilityController.remove(req, res);

    expect(res.statusCode).toBe(200);
  });

  it('should return 404 on delete if not found', async () => {
    req.params.id = '507f1f77bcf86cd799439012'; // Valid format, but fake ID
    facilityService.deleteFacility.mockResolvedValue(null);
    await facilityController.remove(req, res);
    expect(res.statusCode).toBe(404);
  });
});