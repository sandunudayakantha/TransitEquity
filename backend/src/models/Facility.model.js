import mongoose from 'mongoose';

const facilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Bus Stop', 'Station', 'Parking', 'Bike Hub'],
    required: true
  },
  areaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area', 
    required: true
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  hasDisabledAccess: {
    type: Boolean,
    default: false
  },
  capacity: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Index for map queries (Critical for Gap Analysis)
facilitySchema.index({ coordinates: '2dsphere' });

const Facility = mongoose.model('Facility', facilitySchema);
export default Facility;