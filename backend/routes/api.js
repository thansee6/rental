import { Router } from 'express';
import { getDBStatus } from '../config/db.js';
import { memoryStore } from '../config/memoryStore.js';
import Town from '../models/Town.js';
import Route from '../models/Route.js';
import Property from '../models/Property.js';

const router = Router();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/debug-files', (req, res) => {
  try {
    const distPath = path.join(__dirname, '../../frontend/dist');
    const exists = fs.existsSync(distPath);
    if (!exists) {
      return res.json({ exists: false, message: 'frontend/dist does not exist' });
    }
    const files = fs.readdirSync(distPath);
    const assetsPath = path.join(distPath, 'assets');
    const assetsExist = fs.existsSync(assetsPath);
    const assetFiles = assetsExist ? fs.readdirSync(assetsPath) : [];
    
    res.json({
      exists: true,
      files,
      assetsExist,
      assetFiles,
      nodeVersion: process.version,
      env: process.env.NODE_ENV,
      port: process.env.PORT,
      dir: __dirname
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// TOWN ENDPOINTS
// ==========================================

// Get all towns
router.get('/towns', async (req, res) => {
  try {
    if (getDBStatus()) {
      const towns = await Town.find().sort({ name: 1 });
      return res.json(towns);
    } else {
      const towns = memoryStore.getTowns();
      return res.json(towns);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error loading towns' });
  }
});

// Create a town
router.post('/towns', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    if (getDBStatus()) {
      const existingTown = await Town.findOne({ name });
      if (existingTown) {
        return res.status(400).json({ error: 'Town name already exists' });
      }
      const newTown = new Town({ name, description });
      await newTown.save();
      return res.status(201).json(newTown);
    } else {
      const existingTown = memoryStore.getTowns().find(t => t.name.toLowerCase() === name.toLowerCase());
      if (existingTown) {
        return res.status(400).json({ error: 'Town name already exists' });
      }
      const newTown = memoryStore.createTown({ name, description });
      return res.status(201).json(newTown);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating town' });
  }
});

// ==========================================
// ROUTE ENDPOINTS
// ==========================================

// Get routes (optionally filtered by town)
router.get('/routes', async (req, res) => {
  try {
    const { town } = req.query;
    
    if (getDBStatus()) {
      let query = {};
      if (town) query.town = town;
      const routes = await Route.find(query).populate('town').sort({ name: 1 });
      return res.json(routes);
    } else {
      const routes = memoryStore.getRoutes(town);
      // Populate town reference manually
      const populated = routes.map(r => {
        const townObj = memoryStore.getTowns().find(t => t._id === r.town);
        return { ...r, town: townObj };
      });
      return res.json(populated);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error loading routes' });
  }
});

// Create a route
router.post('/routes', async (req, res) => {
  try {
    const { name, town, description } = req.body; // town is townId
    if (!name || !town || !description) {
      return res.status(400).json({ error: 'Name, town, and description are required' });
    }

    if (getDBStatus()) {
      const existingRoute = await Route.findOne({ name, town });
      if (existingRoute) {
        return res.status(400).json({ error: 'Route already exists for this town' });
      }
      const newRoute = new Route({ name, town, description });
      await newRoute.save();
      const populatedRoute = await Route.findById(newRoute._id).populate('town');
      return res.status(201).json(populatedRoute);
    } else {
      const existingRoute = memoryStore.getRoutes(town).find(r => r.name.toLowerCase() === name.toLowerCase());
      if (existingRoute) {
        return res.status(400).json({ error: 'Route already exists for this town' });
      }
      const newRoute = memoryStore.createRoute({ name, town, description });
      const townObj = memoryStore.getTowns().find(t => t._id === town);
      return res.status(201).json({ ...newRoute, town: townObj });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating route' });
  }
});

// ==========================================
// PROPERTY ENDPOINTS
// ==========================================

// Get properties (with filtering)
router.get('/properties', async (req, res) => {
  try {
    const { town, route, type, nearStaircase, minPrice, maxPrice, search } = req.query;
    
    if (getDBStatus()) {
      let query = {};
      
      if (town) query.town = town;
      if (route) query.route = route;
      if (type) query.type = type;
      if (nearStaircase !== undefined) {
        query.type = 'Room';
        query.nearStaircase = String(nearStaircase) === 'true';
      }
      
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } }
        ];
      }
      
      const properties = await Property.find(query)
        .populate('town')
        .populate('route')
        .sort({ createdAt: -1 });
        
      return res.json(properties);
    } else {
      const props = memoryStore.getProperties({
        town, route, type, nearStaircase, minPrice, maxPrice, search
      });
      
      // Populate town and route references manually
      const populated = props.map(p => {
        const townObj = memoryStore.getTowns().find(t => t._id === p.town);
        const routeObj = memoryStore.getRoutes().find(r => r._id === p.route);
        return {
          ...p,
          town: townObj,
          route: routeObj
        };
      });
      
      return res.json(populated);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error loading properties' });
  }
});

// Create a property
router.post('/properties', async (req, res) => {
  try {
    const {
      title, description, type, price, address,
      town, route, nearStaircase, amenities,
      imageUrl, contactName, contactPhone, contactEmail,
      creatorEmail
    } = req.body;

    // Validation
    const requiredFields = [
      'title', 'description', 'type', 'price', 'address',
      'town', 'route', 'contactName', 'contactPhone', 'contactEmail'
    ];
    
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === '') {
        return res.status(400).json({ error: `Field '${field}' is required` });
      }
    }

    if (type === 'Room' && nearStaircase === undefined) {
      return res.status(400).json({ error: 'Staircase proximity is required for rooms' });
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }

    // Default image if empty
    const finalImg = imageUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

    const creatorEmailVal = creatorEmail || contactEmail || 'guest';

    if (getDBStatus()) {
      const newProp = new Property({
        title, description, type, price: priceNum, address,
        town, route, 
        nearStaircase: type === 'Room' ? nearStaircase === true || nearStaircase === 'true' : false,
        amenities: Array.isArray(amenities) ? amenities : [],
        imageUrl: finalImg,
        contactName, contactPhone, contactEmail,
        creatorEmail: creatorEmailVal
      });
      
      await newProp.save();
      const populatedProp = await Property.findById(newProp._id)
        .populate('town')
        .populate('route');
      return res.status(201).json(populatedProp);
    } else {
      const newProp = memoryStore.createProperty({
        title, description, type, price: priceNum, address,
        town, route, nearStaircase, amenities,
        imageUrl: finalImg,
        contactName, contactPhone, contactEmail,
        creatorEmail: creatorEmailVal
      });
      
      const townObj = memoryStore.getTowns().find(t => t._id === town);
      const routeObj = memoryStore.getRoutes().find(r => r._id === route);
      
      return res.status(201).json({
        ...newProp,
        town: townObj,
        route: routeObj
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating property' });
  }
});

// Delete a property listing (Admin only capability)
router.delete('/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (getDBStatus()) {
      const deleted = await Property.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Property not found' });
      }
      return res.json({ message: 'Property deleted successfully', deletedId: id });
    } else {
      const deleted = memoryStore.deleteProperty(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Property not found' });
      }
      return res.json({ message: 'Property deleted successfully', deletedId: id });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting property' });
  }
});

export default router;
