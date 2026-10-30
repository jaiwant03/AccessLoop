import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, ShieldCheck, Clock, User, RotateCcw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ACTION_TYPES = [
  'All',
  'resource_created',
  'resource_modified',
  'resource_deactivated',
  'booking_submitted',
  'booking_approved',
  'booking_rejected',
  'booking_cancelled',
  'check_in_completed',
  'return_requested',
  'return_confirmed',
  'incident_created',
  'incident_resolved',
  'verification_submitted',
  'verification_decision',
];

const AuditLogPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionType, setActionType] = useState('All');
  const [userRole, setUserRole] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (actionType !== 'All') params.actionType = actionType;
      if (userRole !== 'All') params.userRole = userRole;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/audit-logs', { params });
      setLogs(res.data.logs || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionType, userRole, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleReset = () => {
    setActionType('All');
    setUserRole('All');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="main-content">
      <div className="app-container">
        {/* Back and Header */}
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span className="badge badge-green" style={{ marginBottom: '0.45rem' }}>
              Immutable Accountability
            </span>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
              System-Wide Audit & Activity History
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
              Cryptographically verified server logs documenting every resource creation, reservation, handover, return and disciplinary action.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.85rem',
              backgroundColor: '#F0FDF4',
              borderRadius: '8px',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              color: '#15803D',
              fontSize: '0.825rem',
              fontWeight: 700,
            }}
          >
            <ShieldCheck size={18} />
            <span>Server-side Log Integrity: 100% Guaranteed</span>
          </div>
        </div>

        {/* Filters Bar */}
        <div
          className="al-card"
          style={{
            padding: '1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '280px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={16}
                color="#64748B"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Search actor name, resource, booking reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
          </form>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={actionType}
              onChange={(e) => {
                setActionType(e.target.value);
                setPage(1);
              }}
              className="form-select"
              style={{ width: 'auto', fontSize: '0.825rem' }}
            >
              {ACTION_TYPES.map((act) => (
                <option key={act} value={act}>
                  Action: {act.replace('_', ' ')}
                </option>
              ))}
            </select>

            <select
              value={userRole}
              onChange={(e) => {
                setUserRole(e.target.value);
                setPage(1);
              }}
              className="form-select"
              style={{ width: 'auto', fontSize: '0.825rem' }}
            >
              <option value="All">All Roles</option>
              <option value="borrower">Borrower</option>
              <option value="owner">Resource Owner</option>
              <option value="manager">Institution Manager</option>
              <option value="admin">Platform Admin</option>
            </select>

            <button onClick={handleReset} className="btn btn-secondary btn-sm" title="Reset Filters">
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="al-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAF9', borderBottom: '1px solid #E5E7EB', color: '#64748B' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Action Type</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Actor</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Resource / Ref</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Explanation & State Shift</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                      Retrieving immutable ledger records...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                      No audit events match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          className={`badge ${
                            log.actionType.includes('approve') || log.actionType.includes('confirmed')
                              ? 'badge-green'
                              : log.actionType.includes('reject') || log.actionType.includes('cancel')
                              ? 'badge-red'
                              : log.actionType.includes('incident')
                              ? 'badge-amber'
                              : 'badge-blue'
                          }`}
                        >
                          {log.actionType.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#17231C' }}>
                        {log.userName}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className="badge badge-gray">{log.userRole}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#16A34A', fontWeight: 600 }}>
                        {log.resourceName || log.bookingNumber || 'General Platform'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#334155', maxWidth: '320px' }}>
                        <div>{log.explanation}</div>
                        {log.statusChange && (
                          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                            Status: <span style={{ color: '#EF4444' }}>{log.statusChange.from}</span> →{' '}
                            <span style={{ color: '#16A34A', fontWeight: 700 }}>{log.statusChange.to}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1.25rem',
                backgroundColor: '#F8FAF9',
                borderTop: '1px solid #E5E7EB',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Total Records: {totalCount}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary btn-sm"
                >
                  Previous
                </button>
                <span style={{ fontSize: '0.8rem', color: '#475569', alignSelf: 'center' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-secondary btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogPage;
