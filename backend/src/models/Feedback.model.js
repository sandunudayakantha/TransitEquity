import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    areaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Area',
      required: [true, 'Area ID is required']
    },
    issueType: {
      type: String,
      enum: ['New Route', 'New Bus Stop', 'Increase Frequency', 'Accessibility'],
      required: [true, 'Issue type is required']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [10, 'Description must be at least 10 characters']
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
     submittedAddress: {
      type: String
    },
    urgency: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: [true, 'Urgency is required']
    },
    votes: { type: Number, default: 0, min: 0 },
    priorityScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Approved', 'Resolved'],
      default: 'Pending'
    }
  },
  { timestamps: true }
);

// Pre-save hook: auto-calculate priorityScore
feedbackSchema.pre('save', function () {
  const multipliers = { Low: 1, Medium: 1.5, High: 2 };
  this.priorityScore = this.votes * (multipliers[this.urgency] || 1);
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;