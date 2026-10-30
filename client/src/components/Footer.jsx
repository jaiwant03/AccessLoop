import React from 'react';
import { Link } from 'react-router-dom';
import { Repeat, ShieldCheck, HeartHandshake, Scale, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        padding: '3.5rem 0 2rem',
        marginTop: 'auto',
      }}
    >
      <div className="app-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div className="brand-icon-wrapper" style={{ width: '32px', height: '32px' }}>
                <Repeat size={18} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#17231C' }}>
                Access<span style={{ color: '#16A34A' }}>Loop</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.6, marginBottom: '1rem' }}>
              Unlocking underused equipment, laboratories, and specialized spaces across colleges and research communities with trusted verification and fair allocation.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803D', fontSize: '0.8rem', fontWeight: 600 }}>
              <ShieldCheck size={16} />
              <span>Campus Verified Ecosystem</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.925rem', fontWeight: 700, marginBottom: '1rem', color: '#17231C' }}>
              Platform Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li>
                <Link to="/explore" style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Explore All Resources
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  5-Step Sharing Lifecycle
                </a>
              </li>
              <li>
                <a href="/#trust-safety" style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Trust & Condition Proof
                </a>
              </li>
              <li>
                <a href="/#fair-access" style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Fair Access Engine
                </a>
              </li>
              <li>
                <Link to="/audit-logs" style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Public Audit Logs
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 style={{ fontSize: '0.925rem', fontWeight: 700, marginBottom: '1rem', color: '#17231C' }}>
              Resource Categories
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li>
                <Link to="/explore?category=Laboratories" style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Specialized Laboratories
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Cameras" style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Cinema & 4K Cameras
                </Link>
              </li>
              <li>
                <Link to="/explore?category=3D Printers" style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Rapid Prototyping & 3D Printers
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Scientific Instruments" style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Research Microscopes & EEG
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Fabrication Tools" style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  CNC & PCB Milling Stations
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust Guarantees */}
          <div>
            <h4 style={{ fontSize: '0.925rem', fontWeight: 700, marginBottom: '1rem', color: '#17231C' }}>
              Trust & Governance
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.825rem', color: '#64748B' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Scale size={18} color="#16A34A" style={{ flexShrink: 0 }} />
                <span>Transparent Fair Usage algorithm prevents resource hoarding.</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <HeartHandshake size={18} color="#16A34A" style={{ flexShrink: 0 }} />
                <span>Two-way photographic handover & return inspection.</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Award size={18} color="#16A34A" style={{ flexShrink: 0 }} />
                <span>Strict human oversight on incident and damage claims.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid #E5E7EB',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: '#94A3B8',
          }}
        >
          <div>
            © {new Date().getFullYear()} AccessLoop Ecosystem. Built for Academic & Community Resource Optimization.
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <span>Institutional Security</span>
            <span>Privacy Guidelines</span>
            <span>Fair Allocation Charter</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
