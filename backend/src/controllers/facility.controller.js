const facilityService = require('../services/facility.service');
const { createFacilitySchema, updateFacilitySchema } = require('../validations/facility.validation');

// @desc    Create new facility
// @route   POST /api/facilities
exports.create = async (req, res) => {
  try {
    // 1. Validate Input
    const { error } = createFacilitySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    // 2. Call Service
    const facility = await facilityService.createFacility(req.body);
    
    // 3. Send Response
    res.status(201).json({ success: true, data: facility });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all facilities
// @route   GET /api/facilities
exports.getAll = async (req, res) => {
  try {
    const facilities = await facilityService.getAllFacilities();
    res.status(200).json({ 
      success: true, 
      count: facilities.length, 
      data: facilities 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single facility
// @route   GET /api/facilities/:id
exports.getOne = async (req, res) => {
  try {
    const facility = await facilityService.getFacilityById(req.params.id);
    
    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }
    
    res.status(200).json({ success: true, data: facility });
  } catch (error) {
    // If ID is not a valid MongoDB ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update facility
// @route   PUT /api/facilities/:id
exports.update = async (req, res) => {
  try {
    // 1. Validate Input
    const { error } = updateFacilitySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    // 2. Call Service
    const facility = await facilityService.updateFacility(req.params.id, req.body);
    
    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    res.status(200).json({ success: true, data: facility });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete facility
// @route   DELETE /api/facilities/:id
exports.remove = async (req, res) => {
  try {
    const facility = await facilityService.deleteFacility(req.params.id);
    
    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    // 204 No Content is standard for delete, but standard JSON is easier for React
    res.status(200).json({ success: true, message: 'Facility deleted successfully' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};