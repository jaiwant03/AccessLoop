import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, UserCheck, Star, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

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

        {/* Subtle gradient vignette for badge readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.35) 0%, transparent 45%)',
            pointerEvents: 'none',
          }}
        />

        {/* Badges Over Image */}
        <div className="resource-card-badges">
          <span
            className={`badge ${
              isAvailable ? 'badge-green' : 'badge-amber'
            }`}
            style={{
              backdropFilter: 'blur(8px)',
              backgroundColor: isAvailable ? 'rgba(236, 253, 245, 0.95)' : 'rgba(255, 251, 235, 0.95)',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
            }}
          >
            {isAvailable ? 'Available Now' : 'Currently Reserved'}
          </span>

          <span
            className="badge badge-gray"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              fontWeight: 700,
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
            }}
          >
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
          <MapPin size={13} color="#64748B" style={{ flexShrink: 0 }} />
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
            padding: '0.4rem 0.65rem',
            backgroundColor: '#F8FAFC',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #E2E8F0',
            fontSize: '0.75rem',
            color: '#475569',
            marginBottom: '0.85rem',
          }}
        >
          {resource.eligibilityRequirements?.requiresTraining ? (
            <>
              <AlertTriangle size={13} color="#F59E0B" style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 500 }}>Safety Training Required</span>
            </>
          ) : (
            <>
              <ShieldCheck size={13} color="#16A34A" style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 500 }}>Standard Verified Access</span>
            </>
          )}
        </div>

        {/* Footer with Uniform Baseline */}
        <div className="resource-card-footer">
          <div>
            <div style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 500 }}>Custodian</div>
            <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0F172A' }}>
              {resource.owner?.name?.split(' ')[0] || 'Faculty'}
            </div>
          </div>

          <Link
            to={`/resources/${resource._id}`}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.35rem' }}
          >
            <span>View Details</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
