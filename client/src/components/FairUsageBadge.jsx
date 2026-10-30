import React, { useState } from 'react';
import { Scale, Info, CheckCircle2, AlertCircle } from 'lucide-react';

const FairUsageBadge = ({ metrics, score = 100, showDetails = false }) => {
  const [openBreakdown, setOpenBreakdown] = useState(false);

  const displayScore = metrics ? metrics.score : score;
  let color = '#22C55E';
  let tier = 'High Community Standing';

  if (displayScore < 50) {
    color = '#EF4444';
    tier = 'Cooldown / Low Priority';
  } else if (displayScore < 75) {
    color = '#F59E0B';
    tier = 'Moderate Priority';
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onClick={() => setOpenBreakdown(!openBreakdown)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.75rem',
          backgroundColor: '#FFFFFF',
          border: `1px solid ${color}`,
          borderRadius: 'var(--radius-full)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-xs)',
          transition: 'all 0.2s ease',
        }}
        title="Click to view transparent Fair Access breakdown"
      >
        <Scale size={14} color={color} />
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#17231C' }}>
          Fair Share Score:
        </span>
        <span
          style={{
            fontSize: '0.825rem',
            fontWeight: 800,
            color: color,
          }}
        >
          {displayScore}/100
        </span>
        <Info size={12} color="#94A3B8" />
      </div>

      {openBreakdown && (
        <div
          className="al-card"
          style={{
            position: 'absolute',
            top: '120%',
            left: 0,
            width: '320px',
            zIndex: 150,
            padding: '1rem',
            boxShadow: 'var(--shadow-xl)',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <strong style={{ fontSize: '0.875rem', color: '#17231C' }}>
              Fair Allocation Breakdown
            </strong>
            <button
              onClick={() => setOpenBreakdown(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#64748B' }}
            >
              ✕
            </button>
          </div>

          <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.75rem' }}>
            Status: <strong style={{ color }}>{tier}</strong>. AccessLoop dynamically computes access priority to ensure no single user monopolizes high-demand campus equipment.
          </p>

          {metrics?.factors && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid #E5E7EB', paddingTop: '0.65rem' }}>
              {metrics.factors.map((f, idx) => (
                <div key={idx} style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>{f.name}</span>
                  <strong style={{ color: f.impact >= 0 ? '#16A34A' : '#EF4444' }}>
                    {f.impact > 0 ? `+${f.impact}` : f.impact}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FairUsageBadge;
