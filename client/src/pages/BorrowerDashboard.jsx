import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Search,
  ArrowRight,
  ShieldCheck,
  Scale,
  Sparkles,
  Camera,
  Layers,
  Inbox,
} from 'lucide-react';
import api, { resolveImageUrl, DEFAULT_AVATAR } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FairUsageBadge from '../components/FairUsageBadge';

const BorrowerDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [waitingList, setWaitingList] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [dashRes, bookRes, waitRes, recRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/bookings?limit=10'),
          api.get('/waiting-list/my'),
          api.get('/resources?limit=4'),
        ]);

        setAnalytics(dashRes.data);
        setBookings(bookRes.data.bookings || []);
        setWaitingList(waitRes.data.waitingList || []);
        setRecommended(recRes.data.resources || []);
      } catch (err) {
        console.error('Error fetching borrower dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="main-content">
      <div className="app-container">
        {/* Welcome & Fair Usage Standing Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <img
              src={resolveImageUrl(user?.avatar) || DEFAULT_AVATAR}
              alt={user?.name || 'Borrower'}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_AVATAR;
              }}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2.5px solid #22C55E',
                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.2)',
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span className="badge badge-green">Borrower Workspace</span>
                <span className="badge badge-gray">{user?.verificationStatus} Account</span>
              </div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', letterSpacing: '-0.03em' }}>
                Welcome back, {user?.name}
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                {user?.department} • ID: {user?.studentOrEmployeeId || 'STU-VERIFIED'} • {user?.institution}
              </p>
            </div>
          </div>

          <div>
            <FairUsageBadge
              metrics={analytics?.fairMetrics}
              score={user?.fairUsageScore}
              showDetails={true}
            />
          </div>
        </div>

        {/* KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Card 1: Active Borrowings */}
          <div className="stat-card-kpi" style={{ borderLeft: '4px solid #22C55E' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                  Active Borrowings
                </div>
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
            <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600, marginTop: '0.75rem' }}>
              Handover confirmed & active
            </div>
          </div>

          {/* Card 2: Pending Requests */}
          <div className="stat-card-kpi" style={{ borderLeft: '4px solid #F59E0B' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                  Pending Requests
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem', letterSpacing: '-0.03em' }}>
                  {analytics?.summary?.pendingRequests || 0}
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
            <div style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600, marginTop: '0.75rem' }}>
              Awaiting custodian review
            </div>
          </div>

          {/* Card 3: Waiting List Entries */}
          <div className="stat-card-kpi" style={{ borderLeft: '4px solid #8B5CF6' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                  Waiting List
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem', letterSpacing: '-0.03em' }}>
                  {waitingList.length}
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
                <Layers size={20} />
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 600, marginTop: '0.75rem' }}>
              Auto-queue notification active
            </div>
          </div>

          {/* Card 4: Completed Sessions */}
          <div className="stat-card-kpi" style={{ borderLeft: '4px solid #3B82F6' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                  Completed Sessions
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem', letterSpacing: '-0.03em' }}>
                  {analytics?.summary?.completedBookings || 0}
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
            <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600, marginTop: '0.75rem' }}>
              Documented & audited
            </div>
          </div>
        </div>

        {/* Active & Pending Reservations Section */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem' }}>Current Reservations & Actions</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Track equipment status, check in upon collection, or request return inspection.</p>
            </div>
            <Link to="/explore" className="btn btn-primary btn-sm" style={{ gap: '0.4rem' }}>
              <Search size={14} />
              <span>Explore More Resources</span>
            </Link>
          </div>

          {bookings.length === 0 ? (
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
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>No Active Reservations</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                You do not have any active or upcoming equipment requests right now. Discover equipment across campus labs.
              </p>
              <Link to="/explore" className="btn btn-primary btn-sm">
                Explore Campus Resources
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {bookings.map((b) => (
                <div
                  key={b._id}
                  className="al-card al-card-hover"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    padding: '1.15rem 1.35rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                      src={
                        b.resource?.images?.[0] ||
                        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=120&q=80'
                      }
                      alt=""
                      style={{ width: '68px', height: '54px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '0.975rem', color: '#0F172A', fontWeight: 700 }}>
                          {b.resource?.name}
                        </h4>
                        <span
                          className={`badge ${
                            b.status === 'Completed'
                              ? 'badge-green'
                              : b.status === 'Active'
                              ? 'badge-blue'
                              : b.status === 'Approved'
                              ? 'badge-green'
                              : b.status === 'Rejected'
                              ? 'badge-red'
                              : 'badge-amber'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.785rem', color: '#64748B', marginTop: '3px' }}>
                        {new Date(b.startTime).toLocaleDateString()} ({b.durationHours} hrs) • Ref: <strong>{b.bookingNumber}</strong> • {b.resource?.location || 'Campus Facility'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    {b.status === 'Approved' && !b.checkIn?.checkedInAt && (
                      <span className="badge badge-amber" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
                        Check-In Required
                      </span>
                    )}

                    <Link to={`/bookings/${b._id}`} className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
                      <span>View & Actions</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Waiting List Queue Section */}
        {waitingList.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.35rem' }}>Your Waiting List Queue</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>When a reserved slot opens up, you will be notified immediately to confirm.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {waitingList.map((entry) => (
                <div
                  key={entry._id}
                  className="al-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: '4px solid #8B5CF6',
                    padding: '1.15rem 1.35rem',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>
                      {entry.resource?.name}
                    </strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                      Requested Slot: {new Date(entry.requestedStartTime).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="badge badge-purple" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                      Queue Position: #{entry.queuePosition}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>
                      Auto-Notify Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended for Your Department */}
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem' }}>Recommended Resources in {user?.department || 'Your Faculty'}</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>High-demand items frequently utilized by your academic division.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {recommended.map((r) => (
              <Link
                key={r._id}
                to={`/resources/${r._id}`}
                className="al-card al-card-hover"
                style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}
              >
                <img
                  src={r.images?.[0]}
                  alt=""
                  style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' }}
                />
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#16A34A', fontWeight: 700, letterSpacing: '0.04em' }}>
                  {r.category}
                </div>
                <h4 style={{ fontSize: '0.925rem', color: '#0F172A', margin: '0.2rem 0 0.5rem', lineHeight: 1.35, fontWeight: 700 }}>
                  {r.name}
                </h4>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 'auto' }}>
                  {r.location}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowerDashboard;
