import { Router } from 'express';
import mongoose from 'mongoose';
import { getDBStatus } from '../config/db.js';
import Town from '../models/Town.js';
import Route from '../models/Route.js';
import Property from '../models/Property.js';
import { mockTowns, mockRoutes, mockProperties, dbTowns, dbRoutes, dbProperties } from '../config/memoryStore.js';

const router = Router();

export const seedDatabase = async (force = false) => {
  if (!getDBStatus()) {
    console.log('Running in-memory database mode: In-memory arrays are pre-seeded.');
    if (force) {
      // Reset memory arrays
      dbTowns.length = 0;
      dbTowns.push(...mockTowns);
      
      dbRoutes.length = 0;
      dbRoutes.push(...mockRoutes);
      
      dbProperties.length = 0;
      dbProperties.push(...mockProperties);
      return { message: 'In-memory database reset to default seed data successfully!' };
    }
    return { message: 'In-memory database already seeded by default' };
  }

  try {
    // Check if database already has data
    const townCount = await Town.countDocuments();
    if (townCount > 0 && !force) {
      return { message: 'Database already has data. Skipping automatic seed.' };
    }

    console.log('Seeding MongoDB database...');
    
    // Clear existing collections
    await Town.deleteMany({});
    await Route.deleteMany({});
    await Property.deleteMany({});

    // 1. Seed Towns and build a mapping table
    const townIdMap = {};
    const townsToInsert = [];
    
    for (const mt of mockTowns) {
      const newId = new mongoose.Types.ObjectId();
      townIdMap[mt._id] = newId;
      townsToInsert.push({
        _id: newId,
        name: mt.name,
        description: mt.description
      });
    }
    await Town.insertMany(townsToInsert);

    // 2. Seed Routes and build a mapping table
    const routeIdMap = {};
    const routesToInsert = [];
    
    for (const mr of mockRoutes) {
      const newId = new mongoose.Types.ObjectId();
      routeIdMap[mr._id] = newId;
      routesToInsert.push({
        _id: newId,
        name: mr.name,
        town: townIdMap[mr.town],
        description: mr.description
      });
    }
    await Route.insertMany(routesToInsert);

    // 3. Seed Properties
    const propertiesToInsert = [];
    for (const mp of mockProperties) {
      propertiesToInsert.push({
        title: mp.title,
        description: mp.description,
        type: mp.type,
        price: mp.price,
        address: mp.address,
        town: townIdMap[mp.town],
        route: routeIdMap[mp.route],
        nearStaircase: mp.type === 'Room' ? mp.nearStaircase === true : false,
        amenities: mp.amenities,
        imageUrl: mp.imageUrl,
        contactName: mp.contactName,
        contactPhone: mp.contactPhone,
        contactEmail: mp.contactEmail,
        creatorEmail: mp.creatorEmail || mp.contactEmail || 'guest'
      });
    }
    await Property.insertMany(propertiesToInsert);
    
    console.log('MongoDB Seeding Completed Successfully!');
    return { message: 'MongoDB database seeded successfully!' };
  } catch (err) {
    console.error('Error seeding MongoDB:', err);
    throw err;
  }
};

// Route to manually trigger a re-seed (resets db to default state)
router.post('/seed', async (req, res) => {
  try {
    const result = await seedDatabase(true);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to seed database', details: err.message });
  }
});

export default router;
