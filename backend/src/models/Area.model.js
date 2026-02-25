import mongoose from 'mongoose';

const AreaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    city: {
        type: String,
        required: true
    },
    population: {
        type: Number,
        required: true,
        min: 0
    },
    areaSize: {
        type: Number,
        required: true,
        min: 0.01
    },
    density: {
        type: Number,
        default: 0
    },
    coordinates: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate density before saving
AreaSchema.pre('save', function () {
    if (this.isModified('population') || this.isModified('areaSize')) {
        if (this.areaSize > 0) {
            this.density = this.population / this.areaSize;
        }
    }
});

const Area = mongoose.model('Area', AreaSchema);
export default Area;
