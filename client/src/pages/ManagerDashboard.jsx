import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Layers,
  Check,
  X,
  ExternalLink,
  Inbox,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications' | 'incidents'

  const fetchManagerData = async () => {
    setLoading(true);
    try {
      const [dashRes, verifRes, incRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/verifications?status=Pending Review'),
        api.get('/incidents?status=Reported'),
      ]);

      setAnalytics(dashRes.data);
      setVerifications(verifRes.data.verifications || []);
      setIncidents(incRes.data.incidents || []);
    } catch (err) {
      console.error('Error fetching manager dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerData();
  }, []);

  const handleReviewVerification = async (id, status) => {
    try {
      await api.put(`/verifications/${id}/review`, {
        status,
        reviewerNotes: `Reviewed and approved by Institution Manager ${user?.name}.`,
      });
      await fetchManagerData();
    } catch (err) {
      alert(err.response?.data?.message || 'Review failed');
    }
  };

  return (
    <div className="main-content">
      <div className="app-container">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
            marginBottom: '2.25rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-green">Institutional Governance</span>
              <span className="badge badge-gray">{user?.department}</span>
            </div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', letterSpacing: '-0.03em' }}>
              Institution Manager Console
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
              Apex Institute of Technology & Science • Oversight on safety credentials, policy compliance and incident disputes
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/audit-logs" className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
              <FileText size={14} />
              <span>Audit Trail</span>
            </Link>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Card 1: Active Campus Bookings */}
          <div className="stat-card-kpi" style={{ borderLeft: '4px solid #22C55E' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Active Campus Bookings</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem', letterSpacing: '-0.03em' }}>
                  {analytics?.summary?.activeBookings || 0}
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#ECFDF5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16A34A',
                }}
              >
                <CheckCircle size={20} />
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600, marginTop: '0.75rem' }}>Operating normally</div>
          </div>

          {/* Card 2: ID Verifications Queue */}
          <div className="stat-card-kpi" style={{ borderLeft: '4px solid #F59E0B' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>ID Verifications Queue</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem', letterSpacing: '-0.03em' }}>
                  {verifications.length}
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFBEB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D97706',
                }}
              >
                <Clock size={20} />
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600, marginTop: '0.75rem' }}>Student credentials pending</div>
          </div>

          {/* Card 3: Reported Incidents */}
          <div className="stat-card-kpi" style={{ borderLeft: '4px solid #EF4444' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Reported Incidents</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem', letterSpacing: '-0.03em' }}>
                  {incidents.length}
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#FEF2F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#DC2626',
                }}
              >
                <AlertTriangle size={20} />
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 600, marginTop: '0.75rem' }}>Under human investigation</div>
          </div>

          {/* Card 4: Audit Accountability */}
          <div className="stat-card-kpi" style={{ borderLeft: '4px solid #3B82F6' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Audit Accountability</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem', letterSpacing: '-0.03em' }}>
                  100%
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563EB',
                }}
              >
                <ShieldCheck size={20} />
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600, marginTop: '0.75rem' }}>Server-logged actions</div>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #E2E8F0', marginBottom: '2rem' }}>
          <button
            onClick={() => setActiveTab('verifications')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: activeTab === 'verifications' ? '#16A34A' : '#64748B',
              borderBottom: activeTab === 'verifications' ? '2px solid #16A34A' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Credential Verifications ({verifications.length})
          </button>

          <button
            onClick={() => setActiveTab('incidents')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: activeTab === 'incidents' ? '#16A34A' : '#64748B',
              borderBottom: activeTab === 'incidents' ? '2px solid #16A34A' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Incident Resolutions ({incidents.length})
          </button>
        </div>

        {/* TAB 1: Verifications Queue */}
        {activeTab === 'verifications' && (
          <div>
            {verifications.length === 0 ? (
              <div className="al-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', borderStyle: 'dashed' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    color: '#16A34A',
                  }}
                >
                  <CheckCircle size={26} />
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>Verification Queue Clear</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '420px', margin: '0 auto' }}>
                  All student and researcher credential submissions have been reviewed and validated.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {verifications.map((v) => (
                  <div
                    key={v._id}
                    className="al-card al-card-hover"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1.25rem',
                      borderLeft: '4px solid #F59E0B',
                      padding: '1.25rem 1.35rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '1rem', color: '#0F172A' }}>
                          {v.user?.name}
                        </strong>
                        <span className="badge badge-amber">{v.verificationType}</span>
                        <span className="badge badge-gray">ID: {v.idNumber}</span>
                      </div>
                      <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '4px' }}>
                        {v.user?.department} • Email: {v.user?.email}
                      </div>
                      <div style={{ fontSize: '0.785rem', color: '#64748B', marginTop: '4px' }}>
                        Notes: "{v.submittedNotes}"
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <a
                        href={v.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <ExternalLink size={14} />
                        <span>Inspect ID Document</span>
                      </a>

                      <button
                        onClick={() => handleReviewVerification(v._id, 'Verified')}
                        className="btn btn-primary btn-sm"
                        style={{ gap: '0.35rem' }}
                      >
                        <Check size={14} />
                        <span>Approve Identity</span>
                      </button>

                      <button
                        onClick={() => handleReviewVerification(v._id, 'Rejected')}
                        className="btn btn-danger btn-sm"
                        style={{ gap: '0.35rem' }}
                      >
                        <X size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Incidents Review */}
        {activeTab === 'incidents' && (
          <div>
            {incidents.length === 0 ? (
              <div className="al-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', borderStyle: 'dashed' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    color: '#16A34A',
                  }}
                >
                  <CheckCircle size={26} />
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>No Open Incidents</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '420px', margin: '0 auto' }}>
                  No unresolved damages, malfunctions or schedule disputes on record. All campus equipment is operating safely.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {incidents.map((inc) => (
                  <div
                    key={inc._id}
                    className="al-card al-card-hover"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      borderLeft: '4px solid #EF4444',
                      padding: '1.25rem 1.35rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-red">{inc.category.replace('_', ' ')}</span>
                        <strong style={{ fontSize: '0.975rem', color: '#0F172A' }}>{inc.resource?.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>({inc.incidentNumber})</span>
                      </div>
                      <p style={{ fontSize: '0.825rem', color: '#334155', marginTop: '4px' }}>
                        "{inc.description}"
                      </p>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                        Reported by: {inc.reportedBy?.name} ({inc.reportedBy?.department})
                      </div>
                    </div>

                    <Link to={`/incidents/${inc._id}`} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
                      <span>Investigate & Resolve</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
