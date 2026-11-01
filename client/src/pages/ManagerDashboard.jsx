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
  Trash2,
  Camera,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import api, { resolveImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications' | 'incidents' | 'resources'
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [forceDelete, setForceDelete] = useState(false);

  const fetchManagerData = async () => {
    setLoading(true);
    try {
      const [dashRes, verifRes, incRes, resRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/verifications?status=Pending Review'),
        api.get('/incidents?status=Reported'),
        api.get('/resources'),
      ]);

      setAnalytics(dashRes.data);
      setVerifications(verifRes.data.verifications || []);
      setIncidents(incRes.data.incidents || []);
      setResources(resRes.data.resources || []);
    } catch (err) {
      console.error('Error fetching manager dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteResource = async (overrideForce) => {
    if (!resourceToDelete) return;
    const shouldForce = typeof overrideForce === 'boolean' ? overrideForce : forceDelete;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.delete(`/resources/${resourceToDelete._id}${shouldForce ? '?force=true' : ''}`);
      setResourceToDelete(null);
      setForceDelete(false);
      await fetchManagerData();
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || 'Failed to delete resource. Please review active bookings.'
      );
    } finally {
      setDeleteLoading(false);
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

          <button
            onClick={() => setActiveTab('resources')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: activeTab === 'resources' ? '#16A34A' : '#64748B',
              borderBottom: activeTab === 'resources' ? '2px solid #16A34A' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Campus Resources ({resources.length})
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

        {/* TAB 3: Campus Resources Inventory & Deletion */}
        {activeTab === 'resources' && (
          <div>
            {resources.length === 0 ? (
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
                  <Layers size={26} />
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>No Campus Resources Listed</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
                  There are currently no resources registered in your campus inventory.
                </p>
                <Link to="/resources/new" className="btn btn-primary btn-sm" style={{ gap: '0.4rem' }}>
                  <PlusCircle size={14} />
                  <span>List New Resource</span>
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {resources.map((r) => (
                  <div
                    key={r._id}
                    className="al-card al-card-hover"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '1.25rem',
                    }}
                  >
                    {r.imageUrl ? (
                      <div
                        style={{
                          height: '140px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          marginBottom: '0.75rem',
                          backgroundColor: '#F1F5F9',
                        }}
                      >
                        <img
                          src={resolveImageUrl(r.imageUrl)}
                          alt={r.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.parentElement) {
                              e.currentTarget.parentElement.innerHTML =
                                '<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#94A3B8;font-size:0.75rem;">Image unavailable</div>';
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          height: '120px',
                          borderRadius: '8px',
                          backgroundColor: '#F1F5F9',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94A3B8',
                          marginBottom: '0.75rem',
                          gap: '0.35rem',
                        }}
                      >
                        <Camera size={26} />
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>No photo</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.45rem' }}>
                      <span className="badge badge-green">{r.category}</span>
                      <span className={`badge ${r.isActive ? 'badge-blue' : 'badge-gray'}`} style={{ fontSize: '0.7rem' }}>
                        {r.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1rem', color: '#0F172A', marginBottom: '0.25rem', fontWeight: 700 }}>
                      {r.name}
                    </h4>

                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.45rem' }}>
                      📍 {r.location || 'Campus Location'} • {r.department || 'Department'}
                    </div>

                    {r.owner && (
                      <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '0.85rem' }}>
                        Custodian: <strong style={{ color: '#0F172A' }}>{r.owner?.name || 'Owner'}</strong>
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid #E2E8F0',
                        paddingTop: '0.75rem',
                        marginTop: 'auto',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>
                        {r.condition || 'Good Condition'}
                      </span>

                      <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                        <Link to={`/resources/${r._id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.3rem 0.65rem' }}>
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setResourceToDelete(r);
                            setDeleteError('');
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{
                            color: '#DC2626',
                            borderColor: '#FECACA',
                            backgroundColor: '#FEF2F2',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.3rem 0.6rem',
                          }}
                          title="Delete resource"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal for Institution Manager */}
        {resourceToDelete && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '480px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Delete Resource
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '2px 0 0' }}>
                    Manager Authority • Mistakenly created resource removal
                  </p>
                </div>
              </div>

              <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Are you sure you want to permanently delete <strong>{resourceToDelete.name}</strong>? This action will permanently remove the resource from the campus catalog. Resources with active reservations cannot be deleted until those bookings conclude.
              </p>

              {deleteError && (
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '10px',
                    color: '#B91C1C',
                    fontSize: '0.85rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.65rem' }}>
                    <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ display: 'block', color: '#991B1B', marginBottom: '2px' }}>Active Reservation Notice</strong>
                      <span>{deleteError}</span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px dashed #FCA5A5', paddingTop: '0.65rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      disabled={deleteLoading}
                      onClick={() => confirmDeleteResource(true)}
                      className="btn btn-primary btn-sm"
                      style={{
                        backgroundColor: '#DC2626',
                        borderColor: '#DC2626',
                        color: '#FFFFFF',
                        fontSize: '0.8rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.4rem 0.85rem',
                        fontWeight: 700,
                      }}
                    >
                      <Trash2 size={13} />
                      <span>Force Delete (Cancel Bookings & Delete)</span>
                    </button>
                  </div>
                </div>
              )}

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.825rem',
                  color: '#475569',
                  marginBottom: '1.25rem',
                  cursor: 'pointer',
                  userSelect: 'none',
                  backgroundColor: '#F8FAFC',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <input
                  type="checkbox"
                  checked={forceDelete}
                  onChange={(e) => setForceDelete(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#DC2626', cursor: 'pointer' }}
                />
                <span>Force delete: Cancel active or pending bookings and remove resource</span>
              </label>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={() => {
                    setResourceToDelete(null);
                    setDeleteError('');
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600 }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={confirmDeleteResource}
                  className="btn btn-primary"
                  style={{
                    backgroundColor: '#DC2626',
                    borderColor: '#DC2626',
                    color: '#FFFFFF',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {deleteLoading ? (
                    <span>Deleting...</span>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>Yes, Delete Resource</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
