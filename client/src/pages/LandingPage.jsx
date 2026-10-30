import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Scale,
  Sparkles,
  Repeat,
  Camera,
  Microscope,
  Cpu,
  Box,
  Compass,
  CheckCircle,
  Clock,
  FileCheck,
  HelpCircle,
  ChevronDown,
  Building2,
  Users,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { name: 'Laboratories', icon: Microscope, count: '4 Facilities', desc: 'Optics, cleanrooms, and biomedical suites' },
  { name: 'Cameras & AV', icon: Camera, count: '6 Rigs', desc: 'Full-frame 4K/6K cinema kits & soundproof studios' },
  { name: '3D Printers', icon: Box, count: '5 Systems', desc: 'Industrial dual-extrusion & rapid prototyping' },
  { name: 'HPC & AI Clusters', icon: Cpu, count: '3 Nodes', desc: 'NVIDIA DGX A100 GPU compute & workstations' },
];

const FAQS = [
  {
    q: 'How does AccessLoop protect expensive equipment from damage?',
    a: 'Every reservation enforces a strict two-way photographic condition inspection during check-in handover and return. Any defects must be confirmed by the owner before completion, and all incident investigations are handled with verified human oversight.',
  },
  {
    q: 'How does the Fair Access Engine prevent hoarding?',
    a: 'AccessLoop uses a dynamic Fair Usage Score that tracks reservation frequency and active holdings. Borrowers who recently reserved high-demand items enter a transparent community cooldown, giving other researchers and students fair opportunity.',
  },
  {
    q: 'What happens if a resource is already booked?',
    a: 'You can join the automated Waiting List. When an approved reservation is cancelled or a slot opens up, the next eligible user in the queue is immediately notified and given a 2-hour window to claim the slot.',
  },
  {
    q: 'Who reviews student verification and training credentials?',
    a: 'Institution Managers and laboratory custodians review uploaded student IDs, safety certifications, and departmental clearances before approving access to specialized machinery.',
  },
];

const LandingPage = () => {
  const { isAuthenticated, role } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div>
      {/* =================================================================
          HERO SECTION
          ================================================================= */}
      <section className="hero-section">
        <div className="app-container">
          <div className="hero-grid">
            {/* Hero Left Content */}
            <div>
              <div className="hero-badge">
                <Sparkles size={14} color="#16A34A" />
                <span>Smart, Trusted & Fair Resource Sharing Ecosystem</span>
              </div>

              <h1 className="hero-title">
                Unlock Resources. <br />
                <span>Unlock Possibilities.</span>
              </h1>

              <p className="hero-subtitle">
                Discover, share and access valuable equipment and spaces through a trusted community-driven platform. Bridging institutional resources with eligible students, creators, and researchers.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/explore" className="btn btn-primary btn-lg">
                  <Search size={18} />
                  <span>Explore Resources</span>
                </Link>

                <Link
                  to={isAuthenticated ? (role === 'owner' ? '/resources/new' : '/dashboard/borrower') : '/register'}
                  className="btn btn-secondary btn-lg"
                >
                  <Repeat size={18} color="#16A34A" />
                  <span>Share Your Resources</span>
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="hero-stats-row">
                <div className="stat-item">
                  <h3>16+</h3>
                  <p>Verified Resources</p>
                </div>
                <div className="stat-item">
                  <h3>100%</h3>
                  <p>Condition Proof</p>
                </div>
                <div className="stat-item">
                  <h3>99.4%</h3>
                  <p>Trust Score</p>
                </div>
                <div className="stat-item">
                  <h3>0%</h3>
                  <p>Resource Hoarding</p>
                </div>
              </div>
            </div>

            {/* Hero Right Visual */}
            <div
              className="al-card"
              style={{
                background: 'linear-gradient(145deg, #FFFFFF, #F0FDF4)',
                border: '1px solid #E5E7EB',
                padding: '2rem',
                position: 'relative',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid #E5E7EB',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div className="brand-icon-wrapper" style={{ width: '32px', height: '32px' }}>
                    <Repeat size={16} />
                  </div>
                  <strong style={{ fontSize: '0.95rem', color: '#17231C' }}>
                    Live Sharing Cycle
                  </strong>
                </div>
                <span className="badge badge-green">Audited Active</span>
              </div>

              {/* Interactive Preview Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    boxShadow: 'var(--shadow-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: '#F0FDF4',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Camera size={18} color="#16A34A" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#17231C' }}>
                        Sony Alpha A7 IV Cinema Rig
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        Media Center • Check-in Verified
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-blue">Active</span>
                </div>

                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    boxShadow: 'var(--shadow-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: '#FEF3C7',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Box size={18} color="#D97706" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#17231C' }}>
                        Ultimaker S5 3D Printer
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        Robotics Bay • Return Inspected
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-green">Completed</span>
                </div>

                <div
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: '#F8FAF9',
                    borderRadius: '8px',
                    border: '1px dashed #CBD5E1',
                    fontSize: '0.8rem',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Scale size={16} color="#16A34A" />
                  <span>Fair Allocation Engine: 100% anti-monopoly balance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          RESOURCE CATEGORIES
          ================================================================= */}
      <section style={{ padding: '4rem 0', backgroundColor: '#FFFFFF', borderTop: '1px solid #E5E7EB' }}>
        <div className="app-container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem' }}>
            <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>
              Resource Spectrum
            </span>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
              Explore Underused Campus Assets
            </h2>
            <p>
              From specialized scientific instrumentation to full-scale fabrication workshops and multimedia suites.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {CATEGORIES.map((cat, idx) => {
              const IconComponent = cat.icon;
              return (
                <Link
                  key={idx}
                  to={`/explore?category=${encodeURIComponent(cat.name)}`}
                  className="al-card al-card-hover"
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: '#F0FDF4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#16A34A',
                    }}
                  >
                    <IconComponent size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                      {cat.name}
                    </h3>
                    <p style={{ fontSize: '0.825rem', marginBottom: '0.5rem' }}>
                      {cat.desc}
                    </p>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16A34A' }}>
                      {cat.count} →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* =================================================================
          5-STEP SHARING LIFECYCLE (HOW IT WORKS)
          ================================================================= */}
      <section id="how-it-works" style={{ padding: '4.5rem 0', backgroundColor: '#F8FAF9', borderTop: '1px solid #E5E7EB' }}>
        <div className="app-container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>
              Accountable Sharing
            </span>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
              The 5-Step Trusted Lifecycle
            </h2>
            <p>
              AccessLoop replaces informal borrowing with a verified, auditable end-to-end operational protocol.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              { num: '01', title: 'Discover & Check', desc: 'Browse available spaces & gear. System verifies prerequisites & Fair Usage score.' },
              { num: '02', title: 'Owner Approval', desc: 'Resource custodian reviews applicant purpose and approves or sets waitlist priority.' },
              { num: '03', title: 'Check-in Handover', desc: 'Borrower uploads initial condition photos upon collection. Owner signs off to activate.' },
              { num: '04', title: 'Accountable Use', desc: 'Real-time usage tracking with transparent extension requests if needed.' },
              { num: '05', title: 'Return & Inspect', desc: 'Borrower submits final condition photos. Custodian inspects and closes booking.' },
            ].map((step, sIdx) => (
              <div
                key={sIdx}
                className="al-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  borderTop: '3px solid #22C55E',
                }}
              >
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: '#16A34A',
                  }}
                >
                  {step.num}
                </div>
                <h4 style={{ fontSize: '1rem', color: '#17231C' }}>{step.title}</h4>
                <p style={{ fontSize: '0.825rem', color: '#64748B', lineHeight: 1.5 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================================
          TRUST, SAFETY & FAIR ACCESS SECTION
          ================================================================= */}
      <section id="trust-safety" style={{ padding: '4.5rem 0', backgroundColor: '#FFFFFF', borderTop: '1px solid #E5E7EB' }}>
        <div className="app-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            <div>
              <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>
                Trust Architecture
              </span>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                Built for Safety, Accountability & Human Oversight
              </h2>
              <p style={{ marginBottom: '1.5rem' }}>
                Institutions hesitate to share high-value technical assets without confidence. AccessLoop guarantees complete auditability without reliance on opaque black-box decisions.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <ShieldCheck size={20} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ fontSize: '0.925rem', color: '#17231C' }}>Photographic Handover & Return Proof:</strong>
                    <p style={{ fontSize: '0.825rem' }}>Both parties document condition at handover and return, eliminating disputes.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Scale size={20} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ fontSize: '0.925rem', color: '#17231C' }}>Fair Access Engine:</strong>
                    <p style={{ fontSize: '0.825rem' }}>Dynamic community scoring prevents individuals or groups from monopolizing limited campus assets.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <FileCheck size={20} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ fontSize: '0.925rem', color: '#17231C' }}>Strict Human Oversight:</strong>
                    <p style={{ fontSize: '0.825rem' }}>Incident claims and disciplinary penalties are never automated; they remain reviewed by authorized staff.</p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="al-card"
              style={{
                backgroundColor: '#F8FAF9',
                border: '1px solid #E5E7EB',
                padding: '2rem',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: '#17231C' }}>
                Dual-Sided Stakeholder Benefits
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                  <strong style={{ color: '#16A34A', fontSize: '0.9rem' }}>For Resource Owners & Labs:</strong>
                  <ul style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.5rem', paddingLeft: '1.2rem', lineHeight: 1.6 }}>
                    <li>Full control over who books your equipment</li>
                    <li>Verified safety training enforcement</li>
                    <li>Security deposit management and incident logging</li>
                    <li>Comprehensive utilization analytics for grants</li>
                  </ul>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                  <strong style={{ color: '#16A34A', fontSize: '0.9rem' }}>For Students & Researchers:</strong>
                  <ul style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.5rem', paddingLeft: '1.2rem', lineHeight: 1.6 }}>
                    <li>Access otherwise unaffordable multi-lakh gear</li>
                    <li>Transparent waiting lists with live queue positions</li>
                    <li>Equal access guaranteed by fair usage rules</li>
                    <li>Clear reason feedback if a request is not approved</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          FAQS SECTION
          ================================================================= */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#F8FAF9', borderTop: '1px solid #E5E7EB' }}>
        <div className="app-container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>
              Common Questions
            </span>
            <h2 style={{ fontSize: '2rem' }}>Frequently Asked Questions</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {FAQS.map((faq, fIdx) => (
              <div
                key={fIdx}
                className="al-card"
                style={{ padding: '1.25rem', cursor: 'pointer' }}
                onClick={() => setOpenFaq(openFaq === fIdx ? null : fIdx)}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <strong style={{ fontSize: '0.95rem', color: '#17231C' }}>
                    {faq.q}
                  </strong>
                  <ChevronDown
                    size={18}
                    color="#64748B"
                    style={{
                      transform: openFaq === fIdx ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </div>
                {openFaq === fIdx && (
                  <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6 }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================================
          BOTTOM CTA
          ================================================================= */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#15803D', color: '#FFFFFF' }}>
        <div className="app-container" style={{ textAlign: 'center', maxWidth: '680px' }}>
          <h2 style={{ fontSize: '2.25rem', color: '#FFFFFF', marginBottom: '1rem' }}>
            Ready to Unlock Underused Potential?
          </h2>
          <p style={{ color: '#DCFCE7', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Join Apex Institute's verified resource sharing loop. Safe, auditable, and built for equitable academic discovery.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/explore" className="btn btn-secondary btn-lg" style={{ color: '#15803D', fontWeight: 700 }}>
              Discover Resources Now
            </Link>
            <Link to="/register" className="btn btn-outline-green btn-lg" style={{ color: '#FFFFFF', borderColor: '#FFFFFF' }}>
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
