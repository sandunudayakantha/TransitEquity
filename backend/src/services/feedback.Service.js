import Feedback from '../models/Feedback.model.js';
import { geocodeAddress } from '../utils/distanceApi.js';

export const createFeedback = async (data) => {
  console.log('Creating feedback with data:', data);
  
  // ✅ NEW: If address is provided (and no coordinates), geocode it
  if (data.address && !data.coordinates) {
    console.log(`📍 Geocoding address: "${data.address}"`);
    
    const geocodeResult = await geocodeAddress(data.address);
    
    if (geocodeResult) {
      console.log(`✅ Geocoding successful:`, geocodeResult);
      
      // Add coordinates to data
      data.coordinates = {
        lat: geocodeResult.lat,
        lng: geocodeResult.lng
      };
      
      // Store original address for reference
      data.submittedAddress = data.address;
      
      
      // Optional: Remove the address field if you don't want to store it
      // delete data.address;
    } else {
      throw new Error(`Could not geocode address: ${data.address}`);
    }
  }

  // Ensure coordinates exist now
  if (!data.coordinates) {
    throw new Error('Coordinates are required after processing');
  }

  // Create and save feedback
  const feedback = new Feedback(data);
  await feedback.save();
  console.log('✅ Feedback saved with ID:', feedback._id);
  
  return feedback;
};

export const getAllFeedback = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.urgency) query.urgency = filters.urgency;
  if (filters.areaId) query.areaId = filters.areaId;
  if (filters.issueType) query.issueType = filters.issueType;

  return await Feedback.find(query)
    .populate('areaId', 'name city')
    .sort({ priorityScore: -1, createdAt: -1 });
};

export const getFeedbackById = async (id) => {
  return await Feedback.findById(id).populate('areaId', 'name city');
};

export const updateFeedback = async (id, data) => {
  return await Feedback.findByIdAndUpdate(id, data, {
    returnDocument: 'after', 
    runValidators: true
  });
};

export const voteFeedback = async (id) => {
  const feedback = await Feedback.findById(id);
  if (!feedback) return null;
  feedback.votes += 1;
  await feedback.save();
  return feedback;
};

export const deleteFeedback = async (id) => {
  return await Feedback.findByIdAndDelete(id);
};