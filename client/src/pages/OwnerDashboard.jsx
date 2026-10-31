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
  Inbox,
  ArrowRight,
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
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'active' | 'resources'

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
            gap: '1.25rem',
            marginBottom: '2.25rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-green">Resource Custodian</span>
              <span className="badge badge-gray">{user?.department}</span>
            </div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', letterSpacing: '-0.03em' }}>
              {user?.name}'s Custody Console
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
              {user?.department} • {user?.institution}
            </p>
          </div>

          <Link to="/resources/new" className="btn btn-primary" style={{ gap: '0.45rem' }}>
            <PlusCircle size={17} />
            <span>List New Resource</span>
          </Link>
        </div>

        {/* KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Card 1: My Resources */}
          <div className="stat-card-kpi" style={{ borderLeft: '4px solid #22C55E' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>My Resources</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem', letterSpacing: '-0.03em' }}>
                  {myResources.length}
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
                <Layers size={20} />
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600, marginTop: '0.75rem' }}>Verified active</div>
          </div>

          {/* Card 2: Pending Requests */}
          <div className="stat-card-kpi" style={{ borderLeft: '4px solid #F59E0B' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Pending Requests</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem', letterSpacing: '-0.03em' }}>
                  {requests.length}
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
            <div style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600, marginTop: '0.75rem' }}>Requires decision</div>
          </div>

          {/* Card 3: Active Borrowings */}
          <div className="stat-card-kpi" style={{ borderLeft: '4px solid #3B82F6' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Active Borrowings</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem', letterSpacing: '-0.03em' }}>
                  {activeBorrowings.length}
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
                <CheckCircle size={20} />
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600, marginTop: '0.75rem' }}>Currently in use</div>
          </div>

          {/* Card 4: Return Queue */}
          <div className="stat-card-kpi" style={{ borderLeft: '4px solid #8B5CF6' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Return Queue</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem', letterSpacing: '-0.03em' }}>
                  {activeBorrowings.filter((b) => b.status === 'Return Pending').length}
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#FAF5FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7C3AED',
                }}
              >
                <Camera size={20} />
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 600, marginTop: '0.75rem' }}>Inspections due</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid #E2E8F0',
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
              transition: 'all 0.15s ease',
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
              transition: 'all 0.15s ease',
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
              transition: 'all 0.15s ease',
            }}
          >
            My Listed Resources ({myResources.length})
          </button>
        </div>

        {/* TAB 1: Pending Requests */}
        {activeTab === 'requests' && (
          <div>
            {requests.length === 0 ? (
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
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>All Requests Reviewed</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '420px', margin: '0 auto' }}>
                  No pending student or borrower requests awaiting your sign-off right now. New requests will appear here with instant notifications.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {requests.map((b) => (
                  <div
                    key={b._id}
                    className="al-card al-card-hover"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      borderLeft: '4px solid #F59E0B',
                      padding: '1.25rem 1.35rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img
                        src={b.borrower?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt=""
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '0.975rem', color: '#0F172A' }}>
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
                          Slot: {new Date(b.startTime).toLocaleString()} ({b.durationHours} hrs) • Ref: {b.bookingNumber}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <button
                        onClick={() => handleQuickApprove(b._id)}
                        className="btn btn-primary btn-sm"
                        style={{ gap: '0.35rem' }}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {activeBorrowings.length === 0 ? (
              <div className="al-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', borderStyle: 'dashed' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    color: '#94A3B8',
                  }}
                >
                  <Inbox size={26} />
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>No Active Borrowings</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748B' }}>No active borrowings under your custody currently.</p>
              </div>
            ) : (
              activeBorrowings.map((b) => (
                <div
                  key={b._id}
                  className="al-card al-card-hover"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    padding: '1.25rem 1.35rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.975rem', color: '#0F172A' }}>
                      {b.resource?.name}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#64748B', marginTop: '2px' }}>
                      Borrower: {b.borrower?.name} ({b.borrower?.department}) • Ref: <strong>{b.bookingNumber}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.5rem' }}>
            {myResources.length === 0 ? (
              <div className="al-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem 1.5rem', borderStyle: 'dashed' }}>
                <p style={{ color: '#64748B', marginBottom: '1.25rem' }}>You have not listed any campus resources yet.</p>
                <Link to="/resources/new" className="btn btn-primary btn-sm">List Your First Resource</Link>
              </div>
            ) : (
              myResources.map((r) => (
                <div key={r._id} className="al-card al-card-hover" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column' }}>
                  <img
                    src={r.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80'}
                    alt=""
                    style={{ width: '100%', height: '145px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' }}
                  />
                  <div style={{ marginBottom: '0.45rem' }}>
                    <span className="badge badge-green">
                      {r.category}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1rem', color: '#0F172A', marginBottom: '0.35rem', fontWeight: 700 }}>
                    {r.name}
                  </h4>
                  <div style={{ fontSize: '0.785rem', color: '#64748B', marginBottom: '0.85rem' }}>
                    {r.location}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', marginTop: 'auto' }}>
                    <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>
                      {r.totalBookingsCount || 0} Bookings Completed
                    </span>
                    <Link to={`/resources/${r._id}`} className="btn btn-secondary btn-sm">
                      View
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
