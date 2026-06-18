import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/api.js';
import seedRoutes, { seedDatabase } from './routes/seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for local development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api', apiRoutes);
app.use('/api', seedRoutes);

// Health check root route
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Rental Property Listing Platform API is running.'
  });
});

// Start Server & Connect Database
const startServer = async () => {
  // Try to connect to MongoDB
  await connectDB();
  
  // Auto-seed if database is empty
  try {
    await seedDatabase(false);
  } catch (err) {
    console.error('Failed to run automatic seeding:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`API URL: http://localhost:${PORT}`);
    console.log(`================================================================`);
  });
};

startServer();
