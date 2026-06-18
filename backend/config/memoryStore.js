// In-memory fallback database for the platform
import { getDBStatus } from './db.js';

export const mockTowns = [
  { _id: 'town-1', name: 'Metroville', description: 'A bustling urban hub with skyscrapers, rapid transit, and a vibrant nightlife.' },
  { _id: 'town-2', name: 'Riverwood', description: 'A scenic, peaceful town located alongside the winding Whispering River.' },
  { _id: 'town-3', name: 'Greenfield', description: 'A cozy suburban town known for its vast parks, libraries, and family-friendly community.' },
  { _id: 'town-4', name: 'Seaside', description: 'A beautiful coastal town with golden beaches, marine walks, and seafood dining.' }
];

export const mockRoutes = [
  // Metroville routes
  { _id: 'route-1-1', name: 'Red Line Transit Corridor', town: 'town-1', description: 'High-speed metro connection through the financial district.' },
  { _id: 'route-1-2', name: 'Broadway Boulevard', town: 'town-1', description: 'Main commercial artery with theatre access and shopping malls.' },
  
  // Riverwood routes
  { _id: 'route-2-1', name: 'Riverfront Expressway', town: 'town-2', description: 'Scenic drive along the east bank connecting suburbs to center.' },
  { _id: 'route-2-2', name: 'Bridge Road Route', town: 'town-2', description: 'Key transit link bridging the north and south sectors.' },
  
  // Greenfield routes
  { _id: 'route-3-1', name: 'Maple Avenue Route', town: 'town-3', description: 'Tree-lined residential avenue running east-west.' },
  { _id: 'route-3-2', name: 'Meadow Lane Bypass', town: 'town-3', description: 'Outer ring road connecting Greenfield to local highways.' },
  
  // Seaside routes
  { _id: 'route-4-1', name: 'Ocean Drive Coastway', town: 'town-4', description: 'Famous coastal route overlooking the Atlantic shoreline.' },
  { _id: 'route-4-2', name: 'Sandy Boardwalk Route', town: 'town-4', description: 'Pedestrian and tramway access connecting hotels and attractions.' }
];

export const mockProperties = [
  {
    _id: 'prop-1',
    title: 'High-rise Studio Room near Downtown',
    description: 'Fully furnished studio room perfect for young professionals. Located on the 14th floor with a gorgeous city view.',
    type: 'Room',
    price: 850,
    address: '402 Broadway Blvd, Suite 14B',
    town: 'town-1',
    route: 'route-1-2',
    nearStaircase: false,
    amenities: ['Wifi', 'AC', 'Furnished', 'Laundry', 'Gym'],
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    contactName: 'Sarah Jenkins',
    contactPhone: '+1 (555) 019-2834',
    contactEmail: 'sarah.j@metrorentals.com',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prop-2',
    title: 'Cozy Room Right by Metro Station',
    description: 'Affordable single bedroom in a shared flat. Directly next to the subway entrance for quick commuting.',
    type: 'Room',
    price: 490,
    address: '12 Red Line Blvd, Apt 3A',
    town: 'town-1',
    route: 'route-1-1',
    nearStaircase: true,
    amenities: ['Wifi', 'Kitchen', 'Laundry'],
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
    contactName: 'David Miller',
    contactPhone: '+1 (555) 014-9988',
    contactEmail: 'dmiller@webmail.com',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prop-3',
    title: 'Grand Commercial Building - Broadway',
    description: 'Entire 5-story commercial building suitable for corporate headquarters, retail, or mixed-use operations. Prime frontage.',
    type: 'Building',
    price: 7500,
    address: '789 Broadway Blvd',
    town: 'town-1',
    route: 'route-1-2',
    nearStaircase: false, // buildings don't care
    amenities: ['AC', 'Parking', 'Gym', 'Elevator', 'Security System'],
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    contactName: 'Apex Holdings Ltd.',
    contactPhone: '+1 (555) 011-0011',
    contactEmail: 'leasing@apexholdings.com',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prop-4',
    title: 'Riverside Luxury Apartment Room',
    description: 'En-suite master bedroom in a quiet riverfront condo. Beautiful sunset views and serene atmosphere.',
    type: 'Room',
    price: 980,
    address: '88 Riverfront Expy, Apt 104',
    town: 'town-2',
    route: 'route-2-1',
    nearStaircase: false,
    amenities: ['Wifi', 'AC', 'Parking', 'Kitchen', 'Pool'],
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    contactName: 'Elena Rostova',
    contactPhone: '+1 (555) 018-4721',
    contactEmail: 'elena.r@riverwoodliving.net',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prop-5',
    title: 'Old Town Heritage Building',
    description: 'Historic 3-story block perfect for boutique hotels, creative studios, or co-working spaces. Full restoration done.',
    type: 'Building',
    price: 3400,
    address: '24 Bridge Rd Route',
    town: 'town-2',
    route: 'route-2-2',
    nearStaircase: false,
    amenities: ['Parking', 'Kitchen', 'Furnished'],
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
    contactName: 'Marcus Aurelius',
    contactPhone: '+1 (555) 013-1212',
    contactEmail: 'marcus@heritagerentals.com',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prop-6',
    title: 'Sunny Double Room with Garden View',
    description: 'Charming double room overlooking a sprawling cottage garden. Peaceful environment, ideal for researchers/students.',
    type: 'Room',
    price: 600,
    address: '109 Maple Ave Route',
    town: 'town-3',
    route: 'route-3-1',
    nearStaircase: true,
    amenities: ['Wifi', 'Kitchen', 'Parking', 'Laundry'],
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    contactName: 'Elizabeth Bennet',
    contactPhone: '+1 (555) 017-3841',
    contactEmail: 'lizzie.b@pemberley.org',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prop-7',
    title: 'Modern Duplex Office Building',
    description: 'Highly energy-efficient corporate duplex building on the Greenfield outer ring road. Ample EV-ready parking spots.',
    type: 'Building',
    price: 2800,
    address: '15 Meadow Lane Bypass',
    town: 'town-3',
    route: 'route-3-2',
    amenities: ['AC', 'Parking', 'Security System'],
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    contactName: 'Greenspace Developers',
    contactPhone: '+1 (555) 015-8844',
    contactEmail: 'info@greenspacedev.com',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prop-8',
    title: 'Beachfront Boardwalk Guest Room',
    description: 'Vacation style room steps away from the sandy shore. Catch the refreshing sea breeze straight from your balcony.',
    type: 'Room',
    price: 1100,
    address: '75 Sandy Boardwalk Route',
    town: 'town-4',
    route: 'route-4-2',
    nearStaircase: false,
    amenities: ['Wifi', 'AC', 'Furnished', 'Pool'],
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    contactName: 'Sunny Coast Properties',
    contactPhone: '+1 (555) 019-3729',
    contactEmail: 'vacations@sunnycoast.com',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prop-9',
    title: 'Staircase-adjacent Room (Budget Friendly)',
    description: 'Small budget bedroom situated directly beside the main staircase. Some noise during peak hours, but very economical.',
    type: 'Room',
    price: 390,
    address: '18 Ocean Drive Coastway, Apt 1C',
    town: 'town-4',
    route: 'route-4-1',
    nearStaircase: true,
    amenities: ['Wifi', 'Kitchen'],
    imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
    contactName: 'Peter Parker',
    contactPhone: '+1 (555) 012-3456',
    contactEmail: 'peter.p@dailybugle.com',
    createdAt: new Date().toISOString()
  }
];

// Memory database storage arrays (which will grow as users POST data)
export const dbTowns = [...mockTowns];
export const dbRoutes = [...mockRoutes];
export const dbProperties = [...mockProperties];

// CRUD handlers for memory store
export const memoryStore = {
  getTowns: () => dbTowns,
  
  createTown: (townData) => {
    const newTown = {
      _id: `town-${Date.now()}`,
      name: townData.name,
      description: townData.description || ''
    };
    dbTowns.push(newTown);
    return newTown;
  },

  getRoutes: (townId) => {
    if (townId) {
      return dbRoutes.filter(r => r.town === townId);
    }
    return dbRoutes;
  },

  createRoute: (routeData) => {
    const newRoute = {
      _id: `route-${Date.now()}`,
      name: routeData.name,
      town: routeData.town,
      description: routeData.description || ''
    };
    dbRoutes.push(newRoute);
    return newRoute;
  },

  getProperties: (filters = {}) => {
    let list = [...dbProperties];
    
    if (filters.town) {
      list = list.filter(p => p.town === filters.town);
    }
    if (filters.route) {
      list = list.filter(p => p.route === filters.route);
    }
    if (filters.type) {
      list = list.filter(p => p.type === filters.type);
    }
    if (filters.nearStaircase !== undefined) {
      // filters.nearStaircase can be boolean or 'true'/'false' strings
      const isNear = String(filters.nearStaircase) === 'true';
      list = list.filter(p => p.type === 'Room' && p.nearStaircase === isNear);
    }
    if (filters.minPrice) {
      list = list.filter(p => p.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      list = list.filter(p => p.price <= Number(filters.maxPrice));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) || 
        p.address.toLowerCase().includes(q)
      );
    }
    
    // Sort by latest first
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  createProperty: (propData) => {
    const newProp = {
      _id: `prop-${Date.now()}`,
      title: propData.title,
      description: propData.description,
      type: propData.type,
      price: Number(propData.price),
      address: propData.address,
      town: propData.town,
      route: propData.route,
      nearStaircase: propData.type === 'Room' ? (String(propData.nearStaircase) === 'true') : false,
      amenities: Array.isArray(propData.amenities) ? propData.amenities : [],
      imageUrl: propData.imageUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
      contactName: propData.contactName,
      contactPhone: propData.contactPhone,
      contactEmail: propData.contactEmail,
      creatorEmail: propData.creatorEmail || propData.contactEmail || 'guest',
      createdAt: new Date().toISOString()
    };
    dbProperties.push(newProp);
    return newProp;
  },

  deleteProperty: (id) => {
    const idx = dbProperties.findIndex(p => p._id === id);
    if (idx !== -1) {
      const deleted = dbProperties.splice(idx, 1);
      return deleted[0];
    }
    return null;
  }
};
