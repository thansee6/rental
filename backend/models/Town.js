import mongoose from 'mongoose';

const TownSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const Town = mongoose.models.Town || mongoose.model('Town', TownSchema);
export default Town;
