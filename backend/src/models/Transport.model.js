import mongoose from 'mongoose';

const TransportSchema = new mongoose.Schema({
  routeNumber: {
    type: String,
    required: true,
    unique: true
  },
  serviceType: {
    type: String,
    enum: ['Bus', 'Train'],
    required: true
  },
  frequency: {
    type: Number,
    required: true,
    min: 1
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  coveredAreas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area'
  }],
  startPoint: {
    type: String,
    required: true
  },
  endPoint: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Transport = mongoose.model('Transport', TransportSchema);
export default Transport;