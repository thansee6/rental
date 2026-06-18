import mongoose from 'mongoose';

const RouteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  town: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Town',
    required: true,
  },
  description: {
    type: String,
    required: true,
  }
}, { timestamps: true });

// Ensure unique route name per town
RouteSchema.index({ name: 1, town: 1 }, { unique: true });

const Route = mongoose.models.Route || mongoose.model('Route', RouteSchema);
export default Route;
