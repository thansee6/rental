import mongoose from 'mongoose';

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Room', 'Building'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  town: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Town',
    required: true,
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true,
  },
  nearStaircase: {
    type: Boolean,
    default: false,
    // Note: In application logic, this is only relevant if type is 'Room'
  },
  amenities: [String],
  imageUrl: {
    type: String,
    required: true,
  },
  contactName: {
    type: String,
    required: true,
  },
  contactPhone: {
    type: String,
    required: true,
  },
  contactEmail: {
    type: String,
    required: true,
  },
  creatorEmail: {
    type: String,
    default: 'guest',
  }
}, { timestamps: true });

const Property = mongoose.models.Property || mongoose.model('Property', PropertySchema);
export default Property;
