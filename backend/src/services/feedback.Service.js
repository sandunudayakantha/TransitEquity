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
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const pipeline = [];

  // 1. Initial Filtering
  const match = {};
  if (filters.status && filters.status !== 'All') match.status = filters.status;
  if (filters.urgency) match.urgency = filters.urgency;
  if (filters.issueType) match.issueType = filters.issueType;
  
  if (filters.areaId && mongoose.Types.ObjectId.isValid(filters.areaId)) {
    match.areaId = new mongoose.Types.ObjectId(filters.areaId);
  }
  
  if (filters.submittedBy && mongoose.Types.ObjectId.isValid(filters.submittedBy)) {
    match.submittedBy = new mongoose.Types.ObjectId(filters.submittedBy);
  }

  // Handle Search if provided
  if (filters.search) {
    match.$or = [
      { description: { $regex: filters.search, $options: 'i' } },
      { issueType: { $regex: filters.search, $options: 'i' } }
    ];
  }
  
  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match });
  }

  // 2. Join with Area for name/city (Moved earlier to allow searching by area name)
  pipeline.push({
    $lookup: {
      from: 'areas',
      localField: 'areaId',
      foreignField: '_id',
      as: 'areaDetails'
    }
  }, { 
    $unwind: {
      path: '$areaDetails',
      preserveNullAndEmptyArrays: true
    }
  });

  // Re-apply search on area name if needed
  if (filters.search) {
    pipeline.push({
      $match: {
        $or: [
          { description: { $regex: filters.search, $options: 'i' } },
          { issueType: { $regex: filters.search, $options: 'i' } },
          { 'areaDetails.name': { $regex: filters.search, $options: 'i' } }
        ]
      }
    });
  }

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

  // 5. Pagination using Facet
  pipeline.push({
    $facet: {
      metadata: [{ $count: 'total' }],
      data: [{ $skip: skip }, { $limit: limit }]
    }
  });

  const result = await Feedback.aggregate(pipeline);
  const total = result[0]?.metadata[0]?.total || 0;
  
  return {
    total,
    pages: Math.ceil(total / limit),
    page,
    count: result[0]?.data.length,
    data: result[0]?.data
  };
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