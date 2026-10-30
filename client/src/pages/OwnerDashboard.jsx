import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  Repeat,
  ShieldCheck,
  Calendar,
  Eye,
  Camera,
  Check,
  X,
  Layers,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [myResources, setMyResources] = useState([]);
  const [activeBorrowings, setActiveBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'returns' | 'resources' | 'active'

  const fetchOwnerData = async () => {
    setLoading(true);
    try {
      const currentUserId = (user?._id || user?.id)?.toString();
      const [dashRes, bookRes, resRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/bookings?roleFilter=owner'),
        api.get('/resources'),
      ]);

      setAnalytics(dashRes.data.summary);
      const allOwnerBookings = bookRes.data.bookings || [];
      setRequests(allOwnerBookings.filter((b) => b.status === 'Pending'));
      setActiveBorrowings(allOwnerBookings.filter((b) => ['Active', 'Approved', 'Return Pending', 'Overdue'].includes(b.status)));
      setMyResources(resRes.data.resources?.filter((r) => (r.owner?._id || r.owner)?.toString() === currentUserId) || []);
    } catch (err) {
      console.error('Error fetching owner data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerData();
  }, [user?._id, user?.id]);

  const handleQuickApprove = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}/review`, { action: 'approve' });
      await fetchOwnerData();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
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
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <span className="badge badge-green" style={{ marginBottom: '0.45rem' }}>
              Resource Custodian
            </span>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
              {user?.name}'s Custody Console
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
              {user?.department} • {user?.institution}
            </p>
          </div>

          <Link to="/resources/new" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>List New Resource</span>
          </Link>
        </div>

        {/* KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          <div className="al-card" style={{ borderLeft: '4px solid #22C55E' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>My Resources</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#17231C', marginTop: '0.25rem' }}>
              {myResources.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '0.25rem' }}>Verified active</div>
          </div>

          <div className="al-card" style={{ borderLeft: '4px solid #F59E0B' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Pending Requests</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#17231C', marginTop: '0.25rem' }}>
              {requests.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '0.25rem' }}>Requires decision</div>
          </div>

          <div className="al-card" style={{ borderLeft: '4px solid #3B82F6' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Active Borrowings</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#17231C', marginTop: '0.25rem' }}>
              {activeBorrowings.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#2563EB', marginTop: '0.25rem' }}>Currently in use</div>
          </div>

          <div className="al-card" style={{ borderLeft: '4px solid #8B5CF6' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Return Queue</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#17231C', marginTop: '0.25rem' }}>
              {analytics?.openIncidents || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6D28D9', marginTop: '0.25rem' }}>Inspections due</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid #E5E7EB',
            marginBottom: '2rem',
          }}
        >
          <button
            onClick={() => setActiveTab('requests')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: activeTab === 'requests' ? '#16A34A' : '#64748B',
              borderBottom: activeTab === 'requests' ? '2px solid #16A34A' : 'none',
              cursor: 'pointer',
            }}
          >
            Pending Requests ({requests.length})
          </button>

          <button
            onClick={() => setActiveTab('active')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: activeTab === 'active' ? '#16A34A' : '#64748B',
              borderBottom: activeTab === 'active' ? '2px solid #16A34A' : 'none',
              cursor: 'pointer',
            }}
          >
            Active & Approved ({activeBorrowings.length})
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
            }}
          >
            My Listed Resources ({myResources.length})
          </button>
        </div>

        {/* TAB 1: Pending Requests */}
        {activeTab === 'requests' && (
          <div>
            {requests.length === 0 ? (
              <div className="al-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <CheckCircle size={36} color="#22C55E" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>All Requests Reviewed</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  No pending student or borrower requests awaiting your sign-off right now.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {requests.map((b) => (
                  <div
                    key={b._id}
                    className="al-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      borderLeft: '4px solid #F59E0B',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img
                        src={b.borrower?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt=""
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '0.95rem', color: '#17231C' }}>
                            {b.borrower?.name}
                          </strong>
                          <span className="badge badge-green">Score: {b.borrower?.fairUsageScore || 100}</span>
                          <span className="badge badge-gray">{b.borrower?.department}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#16A34A', marginTop: '2px' }}>
                          Resource: {b.resource?.name}
                        </div>
                        <div style={{ fontSize: '0.785rem', color: '#64748B', marginTop: '2px' }}>
                          Purpose: "{b.purpose}"
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                          Slot: {new Date(b.startTime).toLocaleString()} ({b.durationHours} hrs)
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <button
                        onClick={() => handleQuickApprove(b._id)}
                        className="btn btn-primary btn-sm"
                      >
                        <Check size={14} />
                        <span>Approve</span>
                      </button>
                      <Link to={`/bookings/${b._id}`} className="btn btn-secondary btn-sm">
                        <span>Review Details</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Active & Approved */}
        {activeTab === 'active' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeBorrowings.length === 0 ? (
              <div className="al-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: '#64748B' }}>No active borrowings under your custody currently.</p>
              </div>
            ) : (
              activeBorrowings.map((b) => (
                <div
                  key={b._id}
                  className="al-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#17231C' }}>
                      {b.resource?.name}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#64748B', marginTop: '2px' }}>
                      Borrower: {b.borrower?.name} ({b.borrower?.department})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      Return Scheduled: {new Date(b.endTime).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span
                      className={`badge ${
                        b.status === 'Return Pending'
                          ? 'badge-amber'
                          : b.status === 'Active'
                          ? 'badge-blue'
                          : 'badge-green'
                      }`}
                    >
                      {b.status}
                    </span>
                    <Link
                      to={`/bookings/${b._id}`}
                      className={`btn btn-sm ${
                        b.status === 'Return Pending' ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {b.status === 'Return Pending' ? 'Inspect & Sign-Off' : 'Inspect & Details'}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: My Resources */}
        {activeTab === 'resources' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {myResources.map((r) => (
              <div key={r._id} className="al-card" style={{ padding: '1rem' }}>
                <img
                  src={r.images?.[0]}
                  alt=""
                  style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' }}
                />
                <span className="badge badge-green" style={{ marginBottom: '0.45rem' }}>
                  {r.category}
                </span>
                <h4 style={{ fontSize: '1rem', color: '#17231C', marginBottom: '0.35rem' }}>
                  {r.name}
                </h4>
                <div style={{ fontSize: '0.785rem', color: '#64748B', marginBottom: '0.75rem' }}>
                  {r.location}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E5E7EB', paddingTop: '0.65rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>
                    {r.totalBookingsCount || 0} Bookings Completed
                  </span>
                  <Link to={`/resources/${r._id}`} className="btn btn-secondary btn-sm">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
