import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, PlusCircle, MessageSquare, ShieldCheck, Clock, CheckCircle, Edit, Send, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const IncidentCenterPage = () => {
  const { id: targetIncidentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [resources, setResources] = useState([]);

  // Resolve / Update Modal State
  const [incidentToUpdate, setIncidentToUpdate] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('Under Review');
  const [managerNotes, setManagerNotes] = useState('');
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  // Comment State
  const [activeCommentIncidentId, setActiveCommentIncidentId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Form State
  const [selectedResource, setSelectedResource] = useState('');
  const [category, setCategory] = useState('physical_damage');
  const [severity, setSeverity] = useState('Medium');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const [incRes, resRes] = await Promise.all([
        api.get('/incidents'),
        api.get('/resources?limit=50'),
      ]);
      setIncidents(incRes.data.incidents || []);
      setResources(resRes.data.resources || []);
      if (resRes.data.resources?.length > 0) {
        setSelectedResource(resRes.data.resources[0]._id);
      }
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      await api.post('/incidents', {
        resourceId: selectedResource,
        category,
        severity,
        description,
        evidenceImages: [evidenceUrl],
      });
      setShowNewModal(false);
      setDescription('');
      await fetchIncidents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to file incident report.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!incidentToUpdate) return;
    setUpdateLoading(true);
    try {
      await api.put(`/incidents/${incidentToUpdate._id}/status`, {
        status: updateStatus,
        managerNotes,
        resolutionDetails: updateStatus === 'Resolved' || updateStatus === 'Closed' ? (resolutionDetails || managerNotes) : resolutionDetails,
      });
      setIncidentToUpdate(null);
      await fetchIncidents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update incident status.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleAddComment = async (incidentId) => {
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      await api.post(`/incidents/${incidentId}/comments`, {
        message: commentText.trim(),
      });
      setCommentText('');
      await fetchIncidents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add comment.');
    } finally {
      setCommentLoading(false);
    }
  };

  const canManage = ['manager', 'admin', 'owner'].includes(user?.role);

  return (
    <div className="main-content">
      <div className="app-container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span className="badge badge-amber" style={{ marginBottom: '0.45rem' }}>
              Safety & Incident Resolution
            </span>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
              Incident & Damage Governance Center
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
              Transparent damage logging, technical malfunction resolution and human-adjudicated dispute claims.
            </p>
          </div>

          <button onClick={() => setShowNewModal(true)} className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Report Incident</span>
          </button>
        </div>

        {/* Incidents List */}
        {loading ? (
          <div className="al-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <span className="badge badge-green">Loading incident logs...</span>
          </div>
        ) : incidents.length === 0 ? (
          <div className="al-card" style={{ textAlign: 'center', padding: '3.5rem' }}>
            <ShieldCheck size={40} color="#22C55E" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>Campus Operations Safe & Intact</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              No active damage claims or equipment disputes on record.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {incidents.map((inc) => (
              <div
                key={inc._id}
                className="al-card"
                style={{
                  borderLeft:
                    inc.severity === 'Critical'
                      ? '4px solid #EF4444'
                      : inc.severity === 'High'
                      ? '4px solid #F97316'
                      : '4px solid #F59E0B',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="badge badge-red">{inc.category.replace('_', ' ')}</span>
                      <span className="badge badge-gray">Severity: {inc.severity}</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>{inc.incidentNumber}</span>
                      {targetIncidentId === inc._id && (
                        <span className="badge badge-blue">Selected</span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', color: '#17231C' }}>
                      {inc.resource?.name}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      className={`badge ${
                        inc.status === 'Resolved' || inc.status === 'Closed'
                          ? 'badge-green'
                          : 'badge-amber'
                      }`}
                    >
                      Status: {inc.status}
                    </span>

                    {canManage && (
                      <button
                        onClick={() => {
                          setIncidentToUpdate(inc);
                          setUpdateStatus(inc.status);
                          setManagerNotes(inc.managerNotes || '');
                          setResolutionDetails(inc.resolutionDetails || '');
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Edit size={13} />
                        <span>Update Status</span>
                      </button>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, marginBottom: '1rem' }}>
                  "{inc.description}"
                </p>

                {/* Evidence and Meta */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    borderTop: '1px solid #E5E7EB',
                    paddingTop: '0.75rem',
                    fontSize: '0.8rem',
                    color: '#64748B',
                  }}
                >
                  <div>
                    Reported by <strong>{inc.reportedBy?.name}</strong> ({inc.reportedBy?.role}) • {new Date(inc.createdAt).toLocaleString()}
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {inc.evidenceImages && inc.evidenceImages.length > 0 && (
                      <a
                        href={inc.evidenceImages[0]}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <span>View Evidence ({inc.evidenceImages.length})</span>
                      </a>
                    )}

                    <button
                      onClick={() =>
                        setActiveCommentIncidentId(
                          activeCommentIncidentId === inc._id ? null : inc._id
                        )
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#3B82F6',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.8rem',
                      }}
                    >
                      <MessageSquare size={13} />
                      <span>Discussion ({inc.comments?.length || 0})</span>
                    </button>
                  </div>
                </div>

                {inc.managerNotes && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: '#F8FAF9',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      color: '#475569',
                      border: '1px solid #E5E7EB',
                    }}
                  >
                    <strong>Supervisor Findings:</strong> {inc.managerNotes}
                  </div>
                )}

                {inc.resolutionDetails && (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: '#F0FDF4',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      color: '#15803D',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                    }}
                  >
                    <strong>Resolution Agreed:</strong> {inc.resolutionDetails}
                    {inc.resolvedBy && (
                      <span style={{ marginLeft: '0.5rem', color: '#166534', fontSize: '0.75rem' }}>
                        (Resolved by {inc.resolvedBy?.name || 'Staff'})
                      </span>
                    )}
                  </div>
                )}

                {/* Comments Section */}
                {activeCommentIncidentId === inc._id && (
                  <div
                    style={{
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid #E5E7EB',
                    }}
                  >
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#17231C' }}>
                      Incident Discussion & Oversight Notes
                    </h4>

                    {(!inc.comments || inc.comments.length === 0) ? (
                      <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.75rem' }}>
                        No comments recorded yet.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {inc.comments.map((c, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '0.5rem 0.75rem',
                              backgroundColor: '#F8FAF9',
                              borderRadius: '6px',
                              border: '1px solid #E5E7EB',
                              fontSize: '0.8rem',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                              <strong style={{ color: '#17231C' }}>{c.authorName} ({c.authorRole})</strong>
                              <span style={{ color: '#94A3B8', fontSize: '0.7rem' }}>
                                {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div style={{ color: '#334155' }}>{c.message}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Type an official remark or update..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        style={{ fontSize: '0.825rem' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(inc._id);
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(inc._id)}
                        disabled={commentLoading || !commentText.trim()}
                        className="btn btn-primary btn-sm"
                      >
                        <Send size={13} />
                        <span>Send</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* New Incident Modal */}
        {showNewModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 style={{ fontSize: '1.15rem' }}>File New Incident / Damage Report</h3>
                <button onClick={() => setShowNewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>
              <form onSubmit={handleCreateIncident}>
                <div className="modal-body">
                  {error && (
                    <div style={{ padding: '0.75rem', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '6px', fontSize: '0.825rem', marginBottom: '1rem' }}>
                      {error}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Related Campus Asset</label>
                    <select
                      className="form-select"
                      value={selectedResource}
                      onChange={(e) => setSelectedResource(e.target.value)}
                      required
                    >
                      {resources.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.name} ({r.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="physical_damage">Physical Damage</option>
                        <option value="missing_components">Missing Components</option>
                        <option value="late_return">Late Return</option>
                        <option value="equipment_malfunction">Equipment Malfunction</option>
                        <option value="safety_incident">Safety Protocol Incident</option>
                        <option value="misuse">Unauthorized Misuse</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Severity Level</label>
                      <select
                        className="form-select"
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                      >
                        <option value="Low">Low (Cosmetic / Wear)</option>
                        <option value="Medium">Medium (Operational Delay)</option>
                        <option value="High">High (Hardware Damage)</option>
                        <option value="Critical">Critical (Safety Hazard)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Evidence Image URL</label>
                    <input
                      type="text"
                      className="form-input"
                      value={evidenceUrl}
                      onChange={(e) => setEvidenceUrl(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Factual Description</label>
                    <textarea
                      rows={4}
                      className="form-textarea"
                      placeholder="Describe what occurred, any injury/damage, and current location of asset..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowNewModal(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={formLoading} className="btn btn-danger btn-sm">
                    {formLoading ? 'Submitting...' : 'Submit Official Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Update Incident Status Modal */}
        {incidentToUpdate && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 style={{ fontSize: '1.15rem' }}>Update Status: {incidentToUpdate.incidentNumber}</h3>
                <button
                  onClick={() => setIncidentToUpdate(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleStatusUpdateSubmit}>
                <div className="modal-body">
                  <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: '#475569' }}>
                    Asset: <strong>{incidentToUpdate.resource?.name}</strong> • Reported by: {incidentToUpdate.reportedBy?.name}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Workflow Status</label>
                    <select
                      className="form-select"
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value)}
                    >
                      <option value="Reported">Reported</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Action Required">Action Required</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Supervisor / Manager Notes</label>
                    <textarea
                      rows={3}
                      className="form-textarea"
                      placeholder="Enter investigation observations, assessment of culpability or technical findings..."
                      value={managerNotes}
                      onChange={(e) => setManagerNotes(e.target.value)}
                    />
                  </div>

                  {(updateStatus === 'Resolved' || updateStatus === 'Closed' || updateStatus === 'Action Required') && (
                    <div className="form-group">
                      <label className="form-label">Resolution Details / Settlement</label>
                      <textarea
                        rows={3}
                        className="form-textarea"
                        placeholder="Detail agreement: replacement parts arranged, repair completed, deposit refunded/retained..."
                        value={resolutionDetails}
                        onChange={(e) => setResolutionDetails(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setIncidentToUpdate(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="btn btn-primary btn-sm"
                  >
                    {updateLoading ? 'Saving...' : 'Save & Notify Reporter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentCenterPage;
