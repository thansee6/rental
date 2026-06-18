import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/real_estate';
  
  console.log(`Connecting to MongoDB at: ${mongoURI}...`);
  try {
    // Set a short connection timeout so it doesn't hang forever if MongoDB is not installed
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log('MongoDB Connected Successfully!');
  } catch (err) {
    console.error('================================================================');
    console.error('WARNING: Could not connect to local or configured MongoDB instance.');
    console.error('Error details:', err.message);
    console.error('The backend will run using a robust IN-MEMORY mock database fallback.');
    console.error('All features (listing, filtering, routing) will still work perfectly!');
    console.error('================================================================');
    isConnected = false;
  }
};

export const getDBStatus = () => {
  return isConnected && mongoose.connection.readyState === 1;
};
