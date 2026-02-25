import mongoose from 'mongoose';

const gapReportSchema = new mongoose.Schema({
  areaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area',
    required: [true, 'Area ID is required']
  },
  population: {
    type: Number,
    required: [true, 'Population is required'],
    min: [0, 'Population cannot be negative']
  },
  transportFrequency: {
    type: Number,
    required: [true, 'Transport frequency is required'],
    min: [1, 'Frequency must be at least 1']
  },
  avgDistance: {
    type: Number,
    required: [true, 'Average distance is required'],
    min: [0, 'Distance cannot be negative']
  },
  gapScore: { type: Number },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High']
  },
  generatedAt: { type: Date, default: Date.now }
});

// Pre-save hook: auto-calculate gapScore and severity
gapReportSchema.pre('save', function () {
  this.gapScore = (this.population / this.transportFrequency) + this.avgDistance;

  if (this.gapScore > 3000) this.severity = 'High';
  else if (this.gapScore > 1000) this.severity = 'Medium';
  else this.severity = 'Low';
  
  console.log(`Gap score calculated: ${this.gapScore}, Severity: ${this.severity}`); // optional debug
});

const GapReport = mongoose.model('GapReport', gapReportSchema);
export default GapReport;