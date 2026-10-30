import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, UserCheck, Star, Clock, AlertTriangle } from 'lucide-react';

const ResourceCard = ({ resource }) => {
  if (!resource) return null;

  const isAvailable = resource.availableQuantity > 0;
  const mainImage =
    resource.images && resource.images.length > 0
      ? resource.images[0]
      : 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="resource-card">
      {/* Image Wrap */}
      <div className="resource-card-image-wrap">
        <img
          src={mainImage}
          alt={resource.name}
          className="resource-card-image"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Badges Over Image */}
        <div className="resource-card-badges">
          <span
            className={`badge ${
              isAvailable ? 'badge-green' : 'badge-amber'
            }`}
          >
            {isAvailable ? 'Available Now' : 'Currently Reserved'}
          </span>

          <span className="badge badge-gray" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
            {resource.isPaid ? `₹${resource.hourlyFee}/hr` : 'Free to Share'}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="resource-card-body">
        <div className="resource-card-category">{resource.category}</div>
        <h3 className="resource-card-title" title={resource.name}>
          {resource.name}
        </h3>

        <div className="resource-card-location">
          <MapPin size={13} color="#64748B" />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {resource.location}
          </span>
        </div>

        {/* Eligibility Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.55rem',
            backgroundColor: '#F8FAF9',
            borderRadius: '6px',
            border: '1px solid #E5E7EB',
            fontSize: '0.75rem',
            color: '#475569',
            marginBottom: '0.75rem',
          }}
        >
          {resource.eligibilityRequirements?.requiresTraining ? (
            <>
              <AlertTriangle size={13} color="#F59E0B" />
              <span>Safety Training Required</span>
            </>
          ) : (
            <>
              <ShieldCheck size={13} color="#16A34A" />
              <span>Standard Verified Access</span>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="resource-card-footer">
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Custodian</div>
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#17231C' }}>
              {resource.owner?.name?.split(' ')[0] || 'Faculty'}
            </div>
          </div>

          <Link
            to={`/resources/${resource._id}`}
            className="btn btn-primary btn-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
