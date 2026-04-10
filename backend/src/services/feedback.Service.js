import mongoose from 'mongoose';
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
  const pipeline = [];

  // 1. Initial Filtering
  const match = {};
  if (filters.status) match.status = filters.status;
  if (filters.urgency) match.urgency = filters.urgency;
  if (filters.issueType) match.issueType = filters.issueType;
  
  if (filters.areaId && mongoose.Types.ObjectId.isValid(filters.areaId)) {
    match.areaId = new mongoose.Types.ObjectId(filters.areaId);
  }
  
  if (filters.submittedBy && mongoose.Types.ObjectId.isValid(filters.submittedBy)) {
    match.submittedBy = new mongoose.Types.ObjectId(filters.submittedBy);
  }
  
  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match });
  }

  // 2. Join with Area for name/city
  pipeline.push({
    $lookup: {
      from: 'areas',
      localField: 'areaId',
      foreignField: '_id',
      as: 'areaDetails'
    }
  }, { $unwind: '$areaDetails' });

  // 3. Join with GapReport for current severity context
  pipeline.push({
    $lookup: {
      from: 'gapreports',
      let: { areaId: '$areaId' },
      pipeline: [
        { $match: { $expr: { $eq: ['$areaId', '$$areaId'] } } },
        { $sort: { generatedAt: -1 } },
        { $limit: 1 }
      ],
      as: 'latestGap'
    }
  }, {
    $addFields: {
      latestGap: { $arrayElemAt: ['$latestGap', 0] }
    }
  });

  // 4. Final Sorting
  pipeline.push({ $sort: { priorityScore: -1, createdAt: -1 } });

  return await Feedback.aggregate(pipeline);
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

export const voteFeedback = async (id, userId) => {
  const feedback = await Feedback.findById(id);
  if (!feedback) return null;
  
  // Check if user has already voted
  const voterIndex = feedback.voters ? feedback.voters.indexOf(userId) : -1;

  if (voterIndex !== -1) {
    // Already voted -> UNVOTE (Remove)
    feedback.voters.splice(voterIndex, 1);
    feedback.votes = Math.max(0, feedback.votes - 1);
    console.log(`📉 Vote removed by user ${userId} for feedback ${id}`);
  } else {
    // Not voted yet -> VOTE (Add)
    if (!feedback.voters) feedback.voters = [];
    feedback.voters.push(userId);
    feedback.votes += 1;
    console.log(`📈 Vote added by user ${userId} for feedback ${id}`);
  }
  
  // ✅ AUTOMATED ESCALATION: 
  // If votes > 50 and urgency is High, move to Reviewed automatically
  if (feedback.votes > 50 && feedback.urgency === 'High' && feedback.status === 'Pending') {
    feedback.status = 'Reviewed';
    console.log(`🚀 Automated Escalation: Feedback ${id} moved to Reviewed due to high engagement.`);
  }

  await feedback.save();
  return feedback;
};

export const deleteFeedback = async (id) => {
  return await Feedback.findByIdAndDelete(id);
};