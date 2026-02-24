import mongoose from 'mongoose';

const ServiceStatusSchema = new mongoose.Schema({
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transport',
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  currentLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  status: {
    type: String,
    enum: ['Active', 'Delayed', 'Completed', 'Cancelled'],
    default: 'Active'
  },
  delayMinutes: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const ServiceStatus = mongoose.model('ServiceStatus', ServiceStatusSchema);
export default ServiceStatus;