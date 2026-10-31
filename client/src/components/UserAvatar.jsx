import React from 'react';
import { User } from 'lucide-react';
import { resolveImageUrl } from '../services/api';

/**
 * UserAvatar Component
 * Displays the user's uploaded photo if available.
 * If no photo has been uploaded, renders a clean, neutral empty avatar placeholder (no random stock photos).
 */
const UserAvatar = ({
  src,
  name = '',
  size = 40,
  border = '1.5px solid #22C55E',
  borderRadius = '50%',
  style = {},
  className = '',
  showInitial = false,
}) => {
  const resolved = resolveImageUrl(src);
  const initial = name ? name.trim().charAt(0).toUpperCase() : '';

  if (resolved) {
    return (
      <img
        src={resolved}
        alt={name || 'User avatar'}
        className={className}
        onError={(e) => {
          e.target.style.display = 'none';
          if (e.target.nextSibling) {
            e.target.nextSibling.style.display = 'flex';
          }
        }}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius,
          objectFit: 'cover',
          border,
          flexShrink: 0,
          ...style,
        }}
      />
    );
  }

  // Clean, neutral empty avatar state when no photo is uploaded
  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius,
        backgroundColor: '#F1F5F9',
        border: border || '1px solid #CBD5E1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748B',
        fontWeight: 700,
        fontSize: `${Math.max(11, Math.round(size * 0.38))}px`,
        flexShrink: 0,
        ...style,
      }}
      title={name ? `${name} (No photo uploaded)` : 'No photo uploaded'}
    >
      {showInitial && initial ? (
        initial
      ) : (
        <User size={Math.round(size * 0.52)} color="#94A3B8" />
      )}
    </div>
  );
};

export default UserAvatar;
