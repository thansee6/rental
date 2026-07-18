import React, { useState, useEffect } from 'react';
import { X, Plus, AlertCircle, Sparkles } from 'lucide-react';

const STANDARD_AMENITIES = [
  'Wifi', 'AC', 'Parking', 'Kitchen', 'Furnished', 'Gym', 'Elevator', 'Security System', 'Laundry', 'Pool'
];

const PRESET_IMAGES = [
  { name: 'Modern Apartment Studio', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80' },
  { name: 'Cozy Bedroom Flat', url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Elegant Living Quarters', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80' },
  { name: 'Commercial Office Tower', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80' },
  { name: 'Luxury Brick Building', url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80' }
];

const API_BASE = import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';

const PropertyForm = ({ towns, routes, onClose, onSubmit, currentUser }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Room',
    price: '',
    address: '',
    town: '',
    route: '',
    nearStaircase: false,
    amenities: [],
    imageUrl: '',
    contactName: currentUser ? currentUser.email.split('@')[0].toUpperCase() : '',
    contactPhone: '',
    contactEmail: currentUser ? currentUser.email : ''
  });

  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [customImage, setCustomImage] = useState(false);
  const [isAddingNewTown, setIsAddingNewTown] = useState(false);
  const [newTownName, setNewTownName] = useState('');
  const [newTownDesc, setNewTownDesc] = useState('');
  const [isAddingNewRoute, setIsAddingNewRoute] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteDesc, setNewRouteDesc] = useState('');

  // Update filtered routes when selected town changes
  useEffect(() => {
    if (formData.town) {
      const filtered = routes.filter(r => {
        // Handle both populated objects and ID strings
        const routeTownId = typeof r.town === 'object' && r.town !== null ? r.town._id : r.town;
        return routeTownId === formData.town;
      });
      setFilteredRoutes(filtered);
    } else {
      setFilteredRoutes([]);
    }
  }, [formData.town, routes]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => {
      const current = [...prev.amenities];
      if (current.includes(amenity)) {
        return { ...prev, amenities: current.filter(a => a !== amenity) };
      } else {
        return { ...prev, amenities: [...current, amenity] };
      }
    });
  };

  const selectPresetImage = (url) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
    setCustomImage(false);
  };

  const handleGenerateDescription = () => {
    const { title, type, price, address, town, route, nearStaircase, amenities, contactName } = formData;
    
    if (!title.trim()) {
      alert('Please enter a Title first.');
      return;
    }
    
    let selectedTownName = '';
    if (isAddingNewTown) {
      selectedTownName = newTownName;
    } else {
      const tObj = towns.find(t => t._id === town);
      selectedTownName = tObj ? tObj.name : '';
    }
    
    let selectedRouteName = '';
    if (isAddingNewRoute) {
      selectedRouteName = newRouteName;
    } else {
      const rObj = routes.find(r => r._id === route);
      selectedRouteName = rObj ? rObj.name : '';
    }

    let amenitiesStr = '';
    if (amenities.length > 0) {
      if (amenities.length === 1) {
        amenitiesStr = ` featuring standard amenities like ${amenities[0]}`;
      } else {
        const last = amenities[amenities.length - 1];
        const rest = amenities.slice(0, -1).join(', ');
        amenitiesStr = ` equipped with amenities including ${rest}, and ${last}`;
      }
    }

    const typeStr = type === 'Room' ? 'single room' : 'entire apartment';
    const staircaseStr = type === 'Room' 
      ? (nearStaircase ? '. It is located near the building staircase for rapid access' : '. Tucked away from high-traffic stairs, it offers an exceptionally quiet environment')
      : '';
    const locStr = selectedTownName ? ` inside the charming community of ${selectedTownName}` : '';
    const transitStr = selectedRouteName ? ` situated with excellent proximity to the ${selectedRouteName} transit line` : '';
    const priceStr = price ? ` for an affordable rate of $${price}/month` : '';

    const text = `Welcome to "${title}"! This premium ${typeStr} is located at ${address || '[Address]'}${locStr}${transitStr}${priceStr}.${staircaseStr}${amenitiesStr}. Managed by host ${contactName || 'us'}, it offers the perfect balance of premium comfort, high connectivity, and exceptional value. Contact us today to schedule an inspection!`;

    setFormData(prev => ({ ...prev, description: '' }));
    let i = 0;
    const interval = setInterval(() => {
      setFormData(prev => {
        if (i < text.length) {
          return { ...prev, description: text.slice(0, i + 1) };
        } else {
          clearInterval(interval);
          return prev;
        }
      });
      i += 3;
    }, 15);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.title.trim()) return setError('Title is required');
    if (!formData.description.trim()) return setError('Description is required');
    if (!formData.price || Number(formData.price) <= 0) return setError('Price must be a valid positive number');
    if (!formData.address.trim()) return setError('Address is required');
    if (!isAddingNewTown && !formData.town) return setError('Please select a Town');
    if (!isAddingNewTown && !isAddingNewRoute && !formData.route) return setError('Please select a Route');
    if (isAddingNewTown) {
      if (!newTownName.trim() || !newTownDesc.trim()) return setError('New Town name and description are required');
      if (!newRouteName.trim() || !newRouteDesc.trim()) return setError('New Route name and description are required for the new town');
    }
    if (!isAddingNewTown && isAddingNewRoute) {
      if (!newRouteName.trim() || !newRouteDesc.trim()) return setError('New Route name and description are required');
    }
    if (!formData.contactName.trim()) return setError('Contact Name is required');
    if (!formData.contactPhone.trim()) return setError('Contact Phone is required');
    if (!formData.contactEmail.trim()) return setError('Contact Email is required');

    setLoading(true);
    try {
      let townId = formData.town;
      let routeId = formData.route;

      // Handle new town creation
      if (isAddingNewTown) {
        const tRes = await fetch(`${API_BASE}/towns`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newTownName, description: newTownDesc })
        });
        if (!tRes.ok) {
          const tErr = await tRes.json();
          throw new Error(tErr.error || 'Failed to create new Town');
        }
        const createdTown = await tRes.json();
        townId = createdTown._id;

        const rRes = await fetch(`${API_BASE}/routes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newRouteName, town: townId, description: newRouteDesc })
        });
        if (!rRes.ok) {
          const rErr = await rRes.json();
          throw new Error(rErr.error || 'Failed to create new Route for custom Town');
        }
        const createdRoute = await rRes.json();
        routeId = createdRoute._id;
      }
      // Handle new route to existing town creation
      else if (isAddingNewRoute) {
        const rRes = await fetch(`${API_BASE}/routes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newRouteName, town: townId, description: newRouteDesc })
        });
        if (!rRes.ok) {
          const rErr = await rRes.json();
          throw new Error(rErr.error || 'Failed to create custom Route');
        }
        const createdRoute = await rRes.json();
        routeId = createdRoute._id;
      }

      // Pick a default image if none chosen
      let finalImg = formData.imageUrl;
      if (!finalImg) {
        const randIndex = Math.floor(Math.random() * PRESET_IMAGES.length);
        finalImg = PRESET_IMAGES[randIndex].url;
      }

      await onSubmit({
        ...formData,
        town: townId,
        route: routeId,
        imageUrl: finalImg
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to submit property listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '750px' }}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="form-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles className="text-gradient" /> List Your Rental Property
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Create a premium room or building listing in your selected town.
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="form-body">
          {error && (
            <div className="btn-danger" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'default' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Type */}
          <div className="form-row">
            <div className="form-group">
              <label>Property Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Modern Double Bed Apartment Room"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Listing Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={(e) => {
                  handleChange(e);
                  // Reset staircase when switching type
                  if (e.target.value !== 'Room') {
                    setFormData(prev => ({ ...prev, nearStaircase: false }));
                  }
                }}
                className="form-input"
              >
                <option value="Room">Single Room / Flat</option>
                <option value="Building">Full Building / Block</option>
              </select>
            </div>
          </div>

          {/* Town & Route (Dependent Dropdowns or Custom Inputs) */}
          <div className="form-row">
            {isAddingNewTown ? (
              <>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ marginBottom: 0 }}>New Town Name *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewTown(false);
                        setIsAddingNewRoute(false);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                    >
                      Select Existing Town
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newTownName}
                    onChange={(e) => setNewTownName(e.target.value)}
                    placeholder="e.g. Uptown"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Town Description *</label>
                  <input
                    type="text"
                    value={newTownDesc}
                    onChange={(e) => setNewTownDesc(e.target.value)}
                    placeholder="e.g. Shopping and residential district"
                    className="form-input"
                    required
                  />
                </div>
              </>
            ) : (
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ marginBottom: 0 }}>Select Town *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewTown(true);
                      setIsAddingNewRoute(true);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  >
                    + Add New Town
                  </button>
                </div>
                <select
                  name="town"
                  value={formData.town}
                  onChange={(e) => {
                    handleChange(e);
                    setIsAddingNewRoute(false);
                  }}
                  className="form-input"
                  required
                >
                  <option value="">-- Choose Town --</option>
                  {towns.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}

            {!isAddingNewTown && (
              isAddingNewRoute ? (
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ marginBottom: 0 }}>New Route Name *</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewRoute(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                    >
                      Select Existing Route
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newRouteName}
                    onChange={(e) => setNewRouteName(e.target.value)}
                    placeholder="e.g. Express Line"
                    className="form-input"
                    required
                  />
                </div>
              ) : (
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ marginBottom: 0 }}>Select Route *</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewRoute(true)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                      disabled={!formData.town}
                    >
                      + Add New Route
                    </button>
                  </div>
                  <select
                    name="route"
                    value={formData.route}
                    onChange={handleChange}
                    className="form-input"
                    disabled={!formData.town}
                    required
                  >
                    <option value="">
                      {formData.town ? '-- Choose Route --' : 'Select a Town first'}
                    </option>
                    {filteredRoutes.map(r => (
                      <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              )
            )}
          </div>

          {/* Conditional Sub-forms for Description of new Town/Route */}
          {isAddingNewTown && (
            <div className="form-row" style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label>New Route Name (For the new Town) *</label>
                <input
                  type="text"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  placeholder="e.g. Corridor Express"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>New Route Description *</label>
                <input
                  type="text"
                  value={newRouteDesc}
                  onChange={(e) => setNewRouteDesc(e.target.value)}
                  placeholder="e.g. Rapid transit Corridor connecting Uptown"
                  className="form-input"
                  required
                />
              </div>
            </div>
          )}

          {!isAddingNewTown && isAddingNewRoute && (
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>New Route Description *</label>
              <input
                type="text"
                value={newRouteDesc}
                onChange={(e) => setNewRouteDesc(e.target.value)}
                placeholder="e.g. Connects downtown via east side transit lanes"
                className="form-input"
                required
              />
            </div>
          )}

          {/* Price & Address */}
          <div className="form-row">
            <div className="form-group">
              <label>Monthly Rent ($ USD) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 750"
                className="form-input"
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Exact Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. Apt 4B, 88 Park Avenue"
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ marginBottom: 0 }}>Detailed Description *</label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--primary)', 
                  fontSize: '0.75rem', 
                  cursor: 'pointer', 
                  textDecoration: 'underline', 
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}
              >
                <Sparkles size={12} /> Auto-Generate (AI Template)
              </button>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the property, transit convenience, nearby amenities, room dimensions..."
              className="form-input"
              style={{ minHeight: '80px', resize: 'vertical' }}
              required
            />
          </div>

          {/* CONDITIONAL FIELD: Near Staircase (Only for Rooms) */}
          {formData.type === 'Room' && (
            <div className="form-group" style={{ margin: '1.5rem 0' }}>
              <label>Staircase Proximity Check</label>
              <div 
                className={`checkbox-group ${formData.nearStaircase ? 'checkbox-group-danger' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, nearStaircase: !prev.nearStaircase }))}
              >
                <input
                  type="checkbox"
                  name="nearStaircase"
                  checked={formData.nearStaircase}
                  onChange={handleChange}
                  onClick={(e) => e.stopPropagation()} // Prevent double triggers
                />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                    This room is located near a staircase
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Selecting this informs potential tenants that the room has fast staircase access (which might increase foot-traffic noise).
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Amenities Selector */}
          <div className="form-group">
            <label>Select Key Amenities</label>
            <div className="amenities-selector">
              {STANDARD_AMENITIES.map(amenity => {
                const isChecked = formData.amenities.includes(amenity);
                return (
                  <div
                    key={amenity}
                    className={`amenity-checkbox ${isChecked ? 'checked' : ''}`}
                    onClick={() => handleAmenityChange(amenity)}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly
                      style={{ pointerEvents: 'none', accentColor: 'var(--primary)' }}
                    />
                    <span>{amenity}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Image Chooser */}
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label>Property Showcase Image</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {PRESET_IMAGES.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => selectPresetImage(preset.url)}
                  className="btn"
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.75rem',
                    border: '1px solid var(--border-color)',
                    background: formData.imageUrl === preset.url ? 'var(--primary)' : 'var(--bg-tertiary)',
                    color: formData.imageUrl === preset.url ? '#0b0f19' : 'var(--text-primary)',
                  }}
                >
                  Preset {idx + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setCustomImage(true);
                  setFormData(prev => ({ ...prev, imageUrl: '' }));
                }}
                className="btn"
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.75rem',
                  border: '1px solid var(--border-color)',
                  background: customImage ? 'var(--primary)' : 'var(--bg-tertiary)',
                  color: customImage ? '#0b0f19' : 'var(--text-primary)',
                }}
              >
                Custom URL
              </button>
            </div>
            
            {customImage && (
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/property-image.jpg"
                className="form-input"
              />
            )}
          </div>

          {/* Contact Details */}
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
              Host Contact Details
            </h4>
            <div className="form-row">
              <div className="form-group">
                <label>Contact Name *</label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="text"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="e.g. +1 (555) 123-4567"
                  className="form-input"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="e.g. john.doe@email.com"
                className="form-input"
                required
              />
            </div>
          </div>
        </form>

        <div className="form-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button type="button" onClick={handleFormSubmit} className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Post Listing'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;
