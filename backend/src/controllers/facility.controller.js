import * as facilityService from '../services/facility.service.js';
import { createFacilitySchema, updateFacilitySchema } from '../validations/facility.validation.js';

// Create
export const create = async (req, res) => {
  try {
    const { error } = createFacilitySchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const facility = await facilityService.createFacility(req.body);
    res.status(201).json({ success: true, data: facility });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All
export const getAll = async (req, res) => {
  try {
    const facilities = await facilityService.getAllFacilities();
    res.status(200).json({ success: true, count: facilities.length, data: facilities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get One
export const getOne = async (req, res) => {
  try {
    const facility = await facilityService.getFacilityById(req.params.id);
    if (!facility) return res.status(404).json({ success: false, message: 'Facility not found' });
    res.status(200).json({ success: true, data: facility });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update
export const update = async (req, res) => {
  try {
    const { error } = updateFacilitySchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const facility = await facilityService.updateFacility(req.params.id, req.body);
    if (!facility) return res.status(404).json({ success: false, message: 'Facility not found' });

    res.status(200).json({ success: true, data: facility });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete  
export const remove = async (req, res) => {
  try {
    const facility = await facilityService.deleteFacility(req.params.id);
    if (!facility) return res.status(404).json({ success: false, message: 'Facility not found' });
    res.status(200).json({ success: true, message: 'Facility deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};