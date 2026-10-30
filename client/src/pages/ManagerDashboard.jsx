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
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications' | 'incidents' | 'overview'

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
        <div style={{ marginBottom: '2rem' }}>
          <span className="badge badge-green" style={{ marginBottom: '0.45rem' }}>
            Institutional Governance
          </span>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
            Institution Manager Console
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
            Apex Institute of Technology & Science • Oversight on safety credentials, policy compliance and incident disputes
          </p>
        </div>

        {/* Top Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          <div className="al-card" style={{ borderLeft: '4px solid #22C55E' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Active Campus Bookings</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#17231C', marginTop: '0.25rem' }}>
              {analytics?.summary?.activeBookings || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '0.25rem' }}>Operating normally</div>
          </div>

          <div className="al-card" style={{ borderLeft: '4px solid #F59E0B' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>ID Verifications Queue</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#17231C', marginTop: '0.25rem' }}>
              {verifications.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '0.25rem' }}>Student credentials pending</div>
          </div>

          <div className="al-card" style={{ borderLeft: '4px solid #EF4444' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Reported Incidents</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#17231C', marginTop: '0.25rem' }}>
              {incidents.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem' }}>Under human investigation</div>
          </div>

          <div className="al-card" style={{ borderLeft: '4px solid #3B82F6' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Audit Accountability</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#17231C', marginTop: '0.25rem' }}>
              100%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#2563EB', marginTop: '0.25rem' }}>Server-logged actions</div>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #E5E7EB', marginBottom: '2rem' }}>
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
            }}
          >
            Incident Resolutions ({incidents.length})
          </button>
        </div>

        {/* TAB 1: Verifications Queue */}
        {activeTab === 'verifications' && (
          <div>
            {verifications.length === 0 ? (
              <div className="al-card" style={{ textAlign: 'center', padding: '3.5rem' }}>
                <CheckCircle size={36} color="#22C55E" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Verification Queue Clear</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  All student and researcher credential submissions have been reviewed.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {verifications.map((v) => (
                  <div
                    key={v._id}
                    className="al-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1.25rem',
                      borderLeft: '4px solid #F59E0B',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '1rem', color: '#17231C' }}>
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                      >
                        <Check size={14} />
                        <span>Approve Identity</span>
                      </button>

                      <button
                        onClick={() => handleReviewVerification(v._id, 'Rejected')}
                        className="btn btn-danger btn-sm"
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
              <div className="al-card" style={{ textAlign: 'center', padding: '3.5rem' }}>
                <CheckCircle size={36} color="#22C55E" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>No Open Incidents</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  No unresolved damages, malfunctions or schedule disputes on record.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {incidents.map((inc) => (
                  <div
                    key={inc._id}
                    className="al-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      borderLeft: '4px solid #EF4444',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="badge badge-red">{inc.category.replace('_', ' ')}</span>
                        <strong style={{ fontSize: '0.95rem' }}>{inc.resource?.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>({inc.incidentNumber})</span>
                      </div>
                      <p style={{ fontSize: '0.825rem', color: '#334155', marginTop: '4px' }}>
                        "{inc.description}"
                      </p>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                        Reported by: {inc.reportedBy?.name} ({inc.reportedBy?.department})
                      </div>
                    </div>

                    <Link to={`/incidents/${inc._id}`} className="btn btn-secondary btn-sm">
                      Investigate & Resolve →
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
