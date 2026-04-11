import Facility from '../models/Facility.model.js'; 

export const createFacility = async (facilityData) => {
  return await Facility.create(facilityData);
};

export const getAllFacilities = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return await Facility.find()
    .populate('areaId', 'name city')
    .populate('transportId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export const countFacilities = async () => {
  return await Facility.countDocuments();
};

export const getFacilityById = async (id) => {
  return await Facility.findById(id).populate('areaId', 'name city').populate('transportId');
 //return await Facility.findById(id);
};

export const updateFacility = async (id, updateData) => {
  return await Facility.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

export const deleteFacility = async (id) => {
  return await Facility.findByIdAndDelete(id);
};