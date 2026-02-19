/**
 * @file Facility.model.js
 * @description Mongoose schema for Infrastructure & Facilities Management.
 * Includes geospatial indexing for Gap Analysis.
 */

const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Facility name is required'], // Custom Error Message
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: {
      values: ['Bus Stop', 'Station', 'Parking', 'Bike Hub'],
      message: '{VALUE} is not a valid facility type' // Custom Error Message
    },
    required: [true, 'Facility type is required']
  },
  areaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area',
    required: [true, 'Facility must be linked to a valid Area']
  },
  coordinates: {
    lat: { 
      type: Number, 
      required: [true, 'Latitude is required'] 
    },
    lng: { 
      type: Number, 
      required: [true, 'Longitude is required'] 
    }
  },
  hasDisabledAccess: {
    type: Boolean,
    default: false
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [0, 'Capacity cannot be negative']
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Best Practice: 2dsphere index for geospatial queries (Gap Analysis)
facilitySchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Facility', facilitySchema);