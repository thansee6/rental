import React from 'react';
import { MapPin, Navigation, Compass, Layers, ArrowUpRight, Trash2, Heart } from 'lucide-react';

const PropertyCard = ({ property, onClick, isAdmin, onDelete, isFavorite, onToggleFavorite }) => {
  const {
    _id,
    title,
    type,
    price,
    address,
    town,
    route,
    nearStaircase,
    amenities,
    imageUrl
  } = property;

  return (
    <div className="property-card" onClick={onClick}>
      <div className="card-img-container">
        <img src={imageUrl} alt={title} className="card-img" loading="lazy" />
        
        <div className="card-badges">
          {type === 'Room' ? (
            <>
              <span className="badge badge-room">Room</span>
              {nearStaircase ? (
                <span className="badge badge-staircase-danger" title="Located right next to the stairs (might have more foot traffic)">
                  Near Staircase ⚠
                </span>
              ) : (
                <span className="badge badge-staircase-safe" title="Located away from the stairs (quieter location)">
                  Quiet Room
                </span>
              )}
            </>
          ) : (
            <span className="badge badge-building">Full Building</span>
          )}
        </div>

        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
          <button 
            className={`card-action-btn btn-favorite ${isFavorite ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(_id, e);
            }}
            title={isFavorite ? "Remove from Saved" : "Save Property"}
          >
            <Heart size={15} fill={isFavorite ? "var(--accent-rose)" : "none"} color={isFavorite ? "var(--accent-rose)" : "currentColor"} />
          </button>

          {isAdmin && (
            <button 
              className="card-action-btn btn-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(e);
              }}
              title="Delete this listing"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="card-content">
        <div className="card-price">
          ${price.toLocaleString()}<span>/month</span>
        </div>
        
        <h3 className="card-title" title={title}>{title}</h3>
        
        <div className="card-location">
          <MapPin size={14} className="text-gradient" />
          <span>{town?.name || 'Unknown Town'}</span>
        </div>

        <div className="card-route">
          <Navigation size={14} />
          <span>Route: {route?.name || 'General Route'}</span>
        </div>

        <div className="card-amenities">
          {amenities && amenities.slice(0, 3).map((amenity, idx) => (
            <span key={idx} className="amenity-tag">
              {amenity}
            </span>
          ))}
          {amenities && amenities.length > 3 && (
            <span className="amenity-tag">+{amenities.length - 3} more</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
