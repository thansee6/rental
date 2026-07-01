import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  MapPin, 
  Navigation, 
  Filter, 
  Plus, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  Info, 
  X, 
  Phone, 
  Mail, 
  User, 
  AlertTriangle,
  Trash2,
  LogIn,
  LogOut,
  ShieldAlert,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import PropertyCard from './components/PropertyCard';
import PropertyForm from './components/PropertyForm';

const API_BASE = import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';

function App() {
  // Database States
  const [properties, setProperties] = useState([]);
  const [towns, setTowns] = useState([]);
  const [routes, setRoutes] = useState([]);

  // Filter & Search States
  const [selectedTown, setSelectedTown] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [staircaseFilter, setStaircaseFilter] = useState('any'); // 'any', 'near', 'away'
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Client-side Filter & Sort States
  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem('luxeSpace_favorites');
    return stored ? JSON.parse(stored) : [];
  });
  const [sortBy, setSortBy] = useState('newest');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Contact Host Form States
  const [contactMessage, setContactMessage] = useState('');
  const [contactSenderName, setContactSenderName] = useState('');
  const [contactSenderEmail, setContactSenderEmail] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSentSuccess, setMessageSentSuccess] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  // UI Status States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Role-Based User States
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });

  // Toggle Favorite Handler
  const handleToggleFavorite = (propertyId, e) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const updated = prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId];
      localStorage.setItem('luxeSpace_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  // Reset/Initialize Contact Host Form states when selectedProperty changes
  useEffect(() => {
    if (selectedProperty) {
      setContactMessage(`Hi ${selectedProperty.contactName || 'Host'}, I am interested in your property "${selectedProperty.title}". Is it still available?`);
      setContactSenderName(currentUser ? currentUser.email.split('@')[0].toUpperCase() : '');
      setContactSenderEmail(currentUser ? currentUser.email : '');
      setMessageSentSuccess(false);
      setIsSendingMessage(false);
      setShowContactForm(false);
    }
  }, [selectedProperty, currentUser]);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Login Submit Handler
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      return setLoginError('Please enter both email and password.');
    }

    let loggedInUser = null;

    if (loginEmail === 'admin@admin.com' && loginPassword === 'qwer1234') {
      loggedInUser = { email: 'admin@admin.com', role: 'admin' };
    } else if (loginEmail === 'host@host.com' && loginPassword === 'host1234') {
      loggedInUser = { email: 'host@host.com', role: 'host' };
    } else {
      if (loginPassword.length < 4) {
        return setLoginError('Password must be at least 4 characters long.');
      }
      loggedInUser = { email: loginEmail, role: 'host' };
    }

    setCurrentUser(loggedInUser);
    localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
    setIsLoginOpen(false);
    setLoginEmail('');
    setLoginPassword('');
    
    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  // Logout Handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    confetti({
      particleCount: 30,
      spread: 30,
      origin: { y: 0.8 }
    });
  };

  // Helper: check if currentUser is authorized to delete a listing
  const canUserDeleteProperty = (property) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'host') {
      return property.creatorEmail === currentUser.email || property.contactEmail === currentUser.email;
    }
    return false;
  };

  // Delete Listing Handler
  const handleDeleteProperty = async (propertyId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this property listing?')) return;

    try {
      const res = await fetch(`${API_BASE}/properties/${propertyId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete listing');
      }

      // Refresh listings
      fetchProperties();
      setSelectedProperty(null);

      confetti({
        particleCount: 80,
        spread: 40,
        origin: { y: 0.8 }
      });
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [townsRes, routesRes] = await Promise.all([
        fetch(`${API_BASE}/towns`),
        fetch(`${API_BASE}/routes`)
      ]);
      
      if (!townsRes.ok || !routesRes.ok) throw new Error('Failed to load town/route metadata');
      
      const townsData = await townsRes.json();
      const routesData = await routesRes.json();
      
      setTowns(townsData);
      setRoutes(routesData);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server. Is the API running on port 5000?');
    }
  };

  // 1. Initial Load: Towns and Routes
  useEffect(() => {
    fetchMetadata();
  }, []);

  // 2. Fetch properties whenever filters change
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (selectedTown) params.append('town', selectedTown);
      if (selectedRoute) params.append('route', selectedRoute);
      if (selectedType) params.append('type', selectedType);
      
      if (selectedType === 'Room' && staircaseFilter !== 'any') {
        params.append('nearStaircase', staircaseFilter === 'near' ? 'true' : 'false');
      }
      
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`${API_BASE}/properties?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load listings');
      
      const data = await res.json();
      setProperties(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Error loading property listings. Check server status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [selectedTown, selectedRoute, selectedType, staircaseFilter, minPrice, maxPrice, searchQuery]);

  // Clean Route when Town selection changes (to ensure we do not filter a route belonging to another town)
  const handleTownSelect = (townId) => {
    setSelectedTown(townId);
    setSelectedRoute(''); // reset route selection
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedTown('');
    setSelectedRoute('');
    setSelectedType('');
    setStaircaseFilter('any');
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    setFavoritesOnly(false);
    setSortBy('newest');
    setSelectedAmenities([]);
  };

  // Seed / Reset Database to Default Data
  const handleSeedDatabase = async () => {
    if (!window.confirm('This will restore all default towns, routes, and properties. Do you want to continue?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/seed`, { method: 'POST' });
      if (!res.ok) throw new Error('Seed request failed');
      
      // Re-fetch everything
      const [townsRes, routesRes] = await Promise.all([
        fetch(`${API_BASE}/towns`),
        fetch(`${API_BASE}/routes`)
      ]);
      setTowns(await townsRes.json());
      setRoutes(await routesRes.json());
      
      // Reset active filters
      handleResetFilters();
      
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (err) {
      alert('Seeding failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit Listing Handler
  const handleCreateProperty = async (propertyData) => {
    const payload = {
      ...propertyData,
      creatorEmail: currentUser ? currentUser.email : 'guest'
    };

    const res = await fetch(`${API_BASE}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to submit property');
    }

    // Success! Refresh properties & metadata list
    fetchProperties();
    fetchMetadata();
    setIsFormOpen(false);

    // Blast celebratory confetti!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  // Process properties: apply client-side favorites filter, amenities filter & sorting
  const processedProperties = [...properties]
    .filter(p => {
      if (favoritesOnly) {
        return favorites.includes(p._id);
      }
      return true;
    })
    .filter(p => {
      if (selectedAmenities.length === 0) return true;
      return selectedAmenities.every(amenity => p.amenities && p.amenities.includes(amenity));
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price-desc') {
        return b.price - a.price;
      }
      if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      // default: newest first
      const dateA = a.createdAt ? new Date(a.createdAt) : 0;
      const dateB = b.createdAt ? new Date(b.createdAt) : 0;
      return dateB - dateA;
    });

  // Helper: Get active town details
  const activeTownObj = towns.find(t => t._id === selectedTown);
  const activeRouteObj = routes.find(r => r._id === selectedRoute);

  // Helper: Count properties matching current town/route (for sidebar counts)
  const getTownPropertyCount = (townId) => {
    return properties.filter(p => (p.town?._id === townId || p.town === townId)).length;
  };

  const getRoutePropertyCount = (routeId) => {
    return properties.filter(p => (p.route?._id === routeId || p.route === routeId)).length;
  };

  return (
    <div className="app-container">
      {/* Header Bar */}
      <header className="navbar">
        <div className="nav-content">
          <a href="#" className="logo-container">
            <div className="logo-icon">
              <Building2 size={24} />
            </div>
            <span className="logo-text">Luxe<span className="text-gradient">Space</span></span>
          </a>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {currentUser && (
              <span 
                className="badge" 
                style={{ 
                  background: currentUser.role === 'admin' ? 'var(--secondary)' : 'var(--primary-glow)', 
                  borderColor: currentUser.role === 'admin' ? 'transparent' : 'var(--primary)',
                  borderStyle: 'solid',
                  borderWidth: currentUser.role === 'admin' ? '0' : '1px',
                  color: currentUser.role === 'admin' ? '#fff' : 'var(--primary)',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.35rem', 
                  textTransform: 'none', 
                  padding: '0.5rem 0.75rem', 
                  fontSize: '0.85rem', 
                  fontWeight: '500', 
                  borderRadius: 'var(--radius-sm)' 
                }}
              >
                <ShieldAlert size={14} /> 
                {currentUser.role === 'admin' ? 'Admin' : 'Host'}: {currentUser.email}
              </span>
            )}
            <button className="btn btn-secondary" onClick={handleSeedDatabase} title="Reset DB values back to defaults">
              <RotateCcw size={16} />
              Reset DB
            </button>
            <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
              <Plus size={16} />
              List Property
            </button>
            {currentUser ? (
              <button className="btn btn-danger" onClick={handleLogout} title="Sign Out from Account">
                <LogOut size={16} />
                Sign Out
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={() => { setIsLoginOpen(true); setLoginError(''); }} title="Sign In to Account">
                <LogIn size={16} />
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="main-content">
        
        {/* Hero Banner */}
        <section className="hero">
          <h1 className="hero-title">
            Find Premium <span className="text-gradient">Rental Property</span>
          </h1>
          <p className="hero-subtitle">
            Explore single flat rooms or complete commercial/residential buildings listed by towns and specific transit routes.
          </p>

          {/* Large Search Input */}
          <div className="search-container">
            <Search className="search-icon" size={22} />
            <input
              type="text"
              placeholder="Search by keywords, title, address, or amenities..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Quick Statistics Banner */}
          <div className="hero-stats" style={{
            display: 'flex',
            gap: '2rem',
            justifyContent: 'center',
            marginTop: '2rem',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            padding: '1rem 2rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(8px)',
            maxWidth: '650px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            <div className="stat-item" style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                {properties.filter(p => p.type === 'Room').length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
                Rooms Available
              </div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-color)', height: '35px', alignSelf: 'center' }}></div>
            <div className="stat-item" style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                {properties.filter(p => p.type === 'Building').length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
                Buildings
              </div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-color)', height: '35px', alignSelf: 'center' }}></div>
            <div className="stat-item" style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-teal)' }}>
                {towns.length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
                Towns
              </div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-color)', height: '35px', alignSelf: 'center' }}></div>
            <div className="stat-item" style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-purple)' }}>
                {routes.length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
                Transit Routes
              </div>
            </div>
          </div>
        </section>

        {/* Outer Grid Layout (Sidebar Filters + Listings Grid) */}
        <div className="layout-grid">
          
          {/* Sidebar Filter Panel */}
          <aside className="filter-panel">
            {/* Personal Workspace section */}
            <div className="filter-section">
              <h3 className="filter-title">
                <Heart size={18} className="text-gradient" /> Personal Workspace
              </h3>
              <div className="selector-list">
                <button
                  className={`selector-item ${favoritesOnly ? 'active' : ''}`}
                  onClick={() => setFavoritesOnly(!favoritesOnly)}
                  style={{ width: '100%' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Heart size={14} fill={favoritesOnly ? "currentColor" : "none"} />
                    <span>Favorites Only</span>
                  </div>
                  <span className="badge-count">{favorites.length}</span>
                </button>
              </div>
            </div>

            <div className="filter-section">
              <h3 className="filter-title">
                <MapPin size={18} className="text-gradient" /> Towns
              </h3>
              <div className="selector-list">
                <button
                  className={`selector-item ${!selectedTown ? 'active' : ''}`}
                  onClick={() => handleTownSelect('')}
                >
                  <span>All Towns</span>
                  <span className="badge-count">{properties.length}</span>
                </button>
                {towns.map(t => (
                  <button
                    key={t._id}
                    className={`selector-item ${selectedTown === t._id ? 'active' : ''}`}
                    onClick={() => handleTownSelect(t._id)}
                  >
                    <span>{t.name}</span>
                    <span className="badge-count">{getTownPropertyCount(t._id)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Routes Filter (Filtered dynamically if a town is active) */}
            <div className="filter-section">
              <h3 className="filter-title">
                <Navigation size={18} className="text-gradient" /> Routes
              </h3>
              <div className="selector-list">
                <button
                  className={`selector-item ${!selectedRoute ? 'active' : ''}`}
                  onClick={() => setSelectedRoute('')}
                >
                  <span>All Routes</span>
                  <span className="badge-count">
                    {selectedTown 
                      ? properties.filter(p => (p.town?._id === selectedTown || p.town === selectedTown)).length 
                      : properties.length}
                  </span>
                </button>
                {routes
                  .filter(r => !selectedTown || (typeof r.town === 'object' ? r.town?._id === selectedTown : r.town === selectedTown))
                  .map(r => (
                    <button
                      key={r._id}
                      className={`selector-item ${selectedRoute === r._id ? 'active' : ''}`}
                      onClick={() => setSelectedRoute(r._id)}
                    >
                      <span>{r.name}</span>
                      <span className="badge-count">{getRoutePropertyCount(r._id)}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Property Type Filter */}
            <div className="filter-section">
              <h3 className="filter-title">
                <Layers size={18} className="text-gradient" /> Property Type
              </h3>
              <div className="selector-list">
                <button
                  className={`selector-item ${selectedType === '' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedType('');
                    setStaircaseFilter('any');
                  }}
                >
                  <span>All Properties</span>
                </button>
                <button
                  className={`selector-item ${selectedType === 'Room' ? 'active' : ''}`}
                  onClick={() => setSelectedType('Room')}
                >
                  <span>Rooms Only</span>
                </button>
                <button
                  className={`selector-item ${selectedType === 'Building' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedType('Building');
                    setStaircaseFilter('any');
                  }}
                >
                  <span>Full Buildings Only</span>
                </button>
              </div>
            </div>

            {/* STAIRCASE FILTER: Conditional filter, only shown when type is 'Room' or no type is set (but applies only to rooms) */}
            {selectedType === 'Room' && (
              <div className="filter-section" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <h3 className="filter-title">
                  <AlertTriangle size={18} className="text-gradient" /> Staircase Distance
                </h3>
                <div className="selector-list">
                  <button
                    className={`selector-item ${staircaseFilter === 'any' ? 'active' : ''}`}
                    onClick={() => setStaircaseFilter('any')}
                  >
                    <span>Any Proximity</span>
                  </button>
                  <button
                    className={`selector-item ${staircaseFilter === 'near' ? 'active' : ''}`}
                    onClick={() => setStaircaseFilter('near')}
                  >
                    <span>Near Staircase ⚠</span>
                  </button>
                  <button
                    className={`selector-item ${staircaseFilter === 'away' ? 'active' : ''}`}
                    onClick={() => setStaircaseFilter('away')}
                  >
                    <span>Away from Stairs</span>
                  </button>
                </div>
              </div>
            )}

            {/* Price Range */}
            <div className="filter-section">
              <h3 className="filter-title">
                <Filter size={18} className="text-gradient" /> Price Range
              </h3>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Min ($)</label>
                  <input
                    type="number"
                    placeholder="Min"
                    className="form-input"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Max ($)</label>
                  <input
                    type="number"
                    placeholder="Max"
                    className="form-input"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Amenities Filter */}
            <div className="filter-section">
              <h3 className="filter-title">
                <Sparkles size={18} className="text-gradient" /> Amenities
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.40rem' }}>
                {['Wifi', 'AC', 'Parking', 'Kitchen', 'Furnished', 'Gym', 'Elevator', 'Security System', 'Laundry', 'Pool'].map(amenity => {
                  const isSelected = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      className={`selector-item ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedAmenities(prev =>
                          prev.includes(amenity)
                            ? prev.filter(a => a !== amenity)
                            : [...prev, amenity]
                        );
                      }}
                      style={{ padding: '0.45rem 0.5rem', fontSize: '0.78rem', justifyContent: 'center', textAlign: 'center', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                      title={amenity}
                    >
                      <span>{amenity}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reset All Filters Button */}
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleResetFilters}>
              Clear Filters
            </button>
          </aside>

          {/* Listings Display Column */}
          <section>
            
            {/* Context Heading */}
            {(activeTownObj || activeRouteObj) && (
              <div className="town-header-info">
                <h2 className="town-header-title">
                  {activeTownObj?.name || 'Selected Area'} 
                  {activeRouteObj ? ` / Route: ${activeRouteObj.name}` : ''}
                </h2>
                <p className="town-header-desc">
                  {activeRouteObj?.description || activeTownObj?.description || 'Browse filtered property availability.'}
                </p>
              </div>
            )}

            <div className="listings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>Available Spaces</h2>
                <div className="listings-count">
                  Found {processedProperties.length} property listings
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sort by:</span>
                <select 
                  className="form-input" 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 1rem', fontSize: '0.85rem', cursor: 'pointer', height: '36px' }}
                >
                  <option value="newest">Newest Listed</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="title-asc">Title: A-Z</option>
                </select>
              </div>
            </div>

            {/* Main states view */}
            {loading ? (
              <div className="loader-container">
                <div className="spinner"></div>
                <p>Loading LuxeSpace properties...</p>
              </div>
            ) : error ? (
              <div className="empty-state" style={{ borderColor: 'var(--accent-rose)' }}>
                <AlertTriangle size={48} style={{ color: 'var(--accent-rose)', marginBottom: '1rem' }} />
                <h3 className="empty-state-title" style={{ color: 'var(--accent-rose)' }}>Connection Error</h3>
                <p style={{ maxWidth: '500px', margin: '0.5rem auto 1.5rem auto' }}>{error}</p>
                <button className="btn btn-primary" onClick={fetchProperties}>
                  Retry Connection
                </button>
              </div>
            ) : processedProperties.length === 0 ? (
              <div className="empty-state">
                <Building2 size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <h3 className="empty-state-title">No Listings Match</h3>
                <p style={{ maxWidth: '500px', margin: '0.5rem auto 1.5rem auto' }}>
                  We couldn't find any rooms or buildings matching your exact search or filter options. Try resetting your filters to explore everything.
                </p>
                <button className="btn btn-secondary" onClick={handleResetFilters}>
                  Reset Filter Inputs
                </button>
              </div>
            ) : (
              <div className="properties-grid">
                {processedProperties.map(property => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    onClick={() => setSelectedProperty(property)}
                    isAdmin={canUserDeleteProperty(property)}
                    onDelete={(e) => handleDeleteProperty(property._id, e)}
                    isFavorite={favorites.includes(property._id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </section>

        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '2rem 1.5rem', textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p>© 2026 LuxeSpace Rentals. All rights reserved.</p>
      </footer>

      {/* PORTAL MODALS */}
      
      {/* 1. Add Property Listing Modal Form */}
      {isFormOpen && (
        <PropertyForm
          towns={towns}
          routes={routes}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleCreateProperty}
          currentUser={currentUser}
        />
      )}

      {/* 2. Detail Display Modal */}
      {selectedProperty && (
        <div className="modal-overlay" onClick={() => setSelectedProperty(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedProperty(null)}>
              <X size={18} />
            </button>
            
            <img 
              src={selectedProperty.imageUrl} 
              alt={selectedProperty.title} 
              className="details-image"
            />
            
            <div className="details-body">
              <div className="details-price">
                ${selectedProperty.price.toLocaleString()}<span>/month</span>
              </div>
              
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#fff' }}>
                {selectedProperty.title}
              </h2>
              
              <div className="details-meta-row">
                <span className={`badge ${selectedProperty.type === 'Room' ? 'badge-room' : 'badge-building'}`}>
                  {selectedProperty.type === 'Room' ? 'Single Room' : 'Full Building'}
                </span>
                
                {selectedProperty.type === 'Room' && (
                  <span className={`badge ${selectedProperty.nearStaircase ? 'badge-staircase-danger' : 'badge-staircase-safe'}`}>
                    {selectedProperty.nearStaircase ? 'Staircase Proximity: Near Stairs ⚠' : 'Staircase Proximity: Quiet Area'}
                  </span>
                )}
                
                <span className="route-badge">
                  Town: {selectedProperty.town?.name}
                </span>
                <span className="route-badge">
                  Route: {selectedProperty.route?.name}
                </span>
                
                <button
                  className="btn"
                  onClick={(e) => handleToggleFavorite(selectedProperty._id, e)}
                  style={{ 
                    padding: '0.3rem 0.75rem', 
                    fontSize: '0.75rem', 
                    height: '26px', 
                    background: favorites.includes(selectedProperty._id) ? 'var(--accent-rose-bg)' : 'var(--bg-tertiary)',
                    borderColor: favorites.includes(selectedProperty._id) ? 'rgba(244, 63, 94, 0.3)' : 'var(--border-color)',
                    color: favorites.includes(selectedProperty._id) ? 'var(--accent-rose)' : 'var(--text-secondary)'
                  }}
                  title={favorites.includes(selectedProperty._id) ? "Remove from Saved" : "Save Listing"}
                >
                  <Heart size={12} fill={favorites.includes(selectedProperty._id) ? "currentColor" : "none"} />
                  {favorites.includes(selectedProperty._id) ? 'Saved' : 'Save Property'}
                </button>

                <button
                  className="btn"
                  onClick={() => {
                    const text = `Check out this space on LuxeSpace: "${selectedProperty.title}" located at ${selectedProperty.address} for $${selectedProperty.price.toLocaleString()}/month!`;
                    navigator.clipboard.writeText(text);
                    setShareCopied(true);
                    setTimeout(() => setShareCopied(false), 2000);
                  }}
                  style={{ 
                    padding: '0.3rem 0.75rem', 
                    fontSize: '0.75rem', 
                    height: '26px', 
                    background: shareCopied ? 'var(--primary-glow)' : 'var(--bg-tertiary)',
                    borderColor: shareCopied ? 'var(--primary)' : 'var(--border-color)',
                    color: shareCopied ? 'var(--primary)' : 'var(--text-secondary)'
                  }}
                  title="Copy Listing Summary to Clipboard"
                >
                  <Sparkles size={12} className={shareCopied ? "" : "text-gradient"} />
                  {shareCopied ? 'Summary Copied!' : 'Copy Summary'}
                </button>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                <MapPin size={18} style={{ flexShrink: 0, marginTop: '2px' }} className="text-gradient" />
                <span>{selectedProperty.address}</span>
              </div>

              <div className="details-section-title">About the Space</div>
              <p className="details-desc">{selectedProperty.description}</p>
              
              {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                <>
                  <div className="details-section-title">Amenities Offered</div>
                  <div className="card-amenities" style={{ borderTop: 'none', paddingTop: 0, marginBottom: '2rem' }}>
                    {selectedProperty.amenities.map((amenity, idx) => (
                      <span key={idx} className="amenity-tag" style={{ fontSize: '0.85rem', padding: '0.3rem 0.6rem' }}>
                        {amenity}
                      </span>
                    ))}
                  </div>
                </>
              )}
              
              <div className="details-section-title">Contact Property Host</div>
              <div className="details-contact-card">
                <div className="contact-row">
                  <User size={16} className="text-gradient" />
                  <span style={{ fontWeight: '600', color: '#fff' }}>{selectedProperty.contactName}</span>
                </div>
                <div className="contact-row">
                  <Phone size={16} />
                  <span>{selectedProperty.contactPhone}</span>
                </div>
                <div className="contact-row">
                  <Mail size={16} />
                  <a href={`mailto:${selectedProperty.contactEmail}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                    {selectedProperty.contactEmail}
                  </a>
                </div>

                {/* Contact Message Form */}
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  {!showContactForm ? (
                    <button 
                      className="btn btn-secondary" 
                      style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
                      onClick={() => setShowContactForm(true)}
                    >
                      ✉ Send Message to Host
                    </button>
                  ) : messageSentSuccess ? (
                    <div 
                      style={{ 
                        background: 'var(--accent-teal-bg)', 
                        border: '1px solid var(--primary)', 
                        borderRadius: 'var(--radius-sm)', 
                        padding: '0.75rem', 
                        color: 'var(--primary)', 
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        fontWeight: '500'
                      }}
                    >
                      🎉 Message sent successfully! The host has been notified.
                    </div>
                  ) : (
                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!contactSenderName.trim() || !contactSenderEmail.trim() || !contactMessage.trim()) return;
                        setIsSendingMessage(true);
                        // Simulate network call
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        setIsSendingMessage(false);
                        setMessageSentSuccess(true);
                        confetti({
                          particleCount: 50,
                          spread: 40,
                          origin: { y: 0.8 }
                        });
                      }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                    >
                      <div className="form-row">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem', display: 'block', color: 'var(--text-secondary)' }}>Your Name *</label>
                          <input
                            type="text"
                            className="form-input"
                            value={contactSenderName}
                            onChange={(e) => setContactSenderName(e.target.value)}
                            placeholder="Your Name"
                            required
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem', display: 'block', color: 'var(--text-secondary)' }}>Your Email *</label>
                          <input
                            type="email"
                            className="form-input"
                            value={contactSenderEmail}
                            onChange={(e) => setContactSenderEmail(e.target.value)}
                            placeholder="Your Email"
                            required
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                          />
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem', display: 'block', color: 'var(--text-secondary)' }}>Your Message *</label>
                        <textarea
                          className="form-input"
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          required
                          style={{ minHeight: '60px', padding: '0.4rem 0.6rem', fontSize: '0.8rem', resize: 'vertical' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          onClick={() => setShowContactForm(false)}
                          disabled={isSendingMessage}
                          style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', height: '28px' }}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-primary"
                          disabled={isSendingMessage}
                          style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', height: '28px' }}
                        >
                          {isSendingMessage ? 'Sending...' : 'Send Message'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Deletion Action Button (Authorized Role Only) */}
              {canUserDeleteProperty(selectedProperty) && (
                <div style={{ marginTop: '2rem' }}>
                  <button
                    className="btn btn-danger"
                    onClick={(e) => handleDeleteProperty(selectedProperty._id, e)}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Trash2 size={16} /> 
                    Delete Listing ({currentUser?.role === 'admin' ? 'Admin Mode' : 'Owned Listing'})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Role-Based Login Modal */}
      {isLoginOpen && (
        <div className="modal-overlay" onClick={() => setIsLoginOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <button className="modal-close-btn" onClick={() => setIsLoginOpen(false)}>
              <X size={18} />
            </button>
            
            <div className="form-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert className="text-gradient" /> Sign In / Portal Access
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Sign in to manage listed spaces or host a property.
              </p>
            </div>
            
            <form onSubmit={handleLoginSubmit} className="form-body">
              {loginError && (
                <div className="btn-danger" style={{ padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'default' }}>
                  <AlertTriangle size={14} />
                  <span>{loginError}</span>
                </div>
              )}
              
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. host@host.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Security Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>

              {/* Demo Help Box */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginTop: '1.25rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <div style={{ fontWeight: '600', color: 'var(--primary)', marginBottom: '0.25rem' }}>Demo Credentials:</div>
                <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <li><strong>Admin:</strong> admin@admin.com / qwer1234 (Manage all)</li>
                  <li><strong>Host:</strong> host@host.com / host1234 (Manage own listings)</li>
                  <li><strong>New Account:</strong> Enter any other email/password to auto-create and sign in as a new Host!</li>
                </ul>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setIsLoginOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Sign In / Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
