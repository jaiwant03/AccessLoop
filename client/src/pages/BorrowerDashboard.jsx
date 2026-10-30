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
} from 'lucide-react';
import api from '../services/api';
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

  const activeBookings = bookings.filter((b) =>
    ['Approved', 'Active', 'Return Pending'].includes(b.status)
  );

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
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <span className="badge badge-green" style={{ marginBottom: '0.45rem' }}>
              Borrower Workspace
            </span>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
              Welcome back, {user?.name}
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
              {user?.department} • ID: {user?.studentOrEmployeeId || 'STU-VERIFIED'} • Status: {user?.verificationStatus}
            </p>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          <div className="al-card" style={{ borderLeft: '4px solid #22C55E' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
              Active Borrowings
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#17231C', marginTop: '0.25rem' }}>
              {analytics?.summary?.activeBookings || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '0.25rem' }}>
              Handover confirmed
            </div>
          </div>

          <div className="al-card" style={{ borderLeft: '4px solid #F59E0B' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
              Pending Requests
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#17231C', marginTop: '0.25rem' }}>
              {analytics?.summary?.pendingRequests || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '0.25rem' }}>
              Awaiting custodian review
            </div>
          </div>

          <div className="al-card" style={{ borderLeft: '4px solid #8B5CF6' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
              Waiting List Entries
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#17231C', marginTop: '0.25rem' }}>
              {waitingList.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6D28D9', marginTop: '0.25rem' }}>
              Auto-queue notification active
            </div>
          </div>

          <div className="al-card" style={{ borderLeft: '4px solid #3B82F6' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
              Completed Sessions
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#17231C', marginTop: '0.25rem' }}>
              {analytics?.summary?.completedBookings || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#2563EB', marginTop: '0.25rem' }}>
              Documented & audited
            </div>
          </div>
        </div>

        {/* Active & Pending Reservations Section */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.35rem' }}>Current Reservations & Actions</h2>
            <Link to="/explore" className="btn btn-primary btn-sm">
              <Search size={14} />
              <span>Explore More Resources</span>
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="al-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <Calendar size={36} color="#CBD5E1" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>No Active Reservations</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
                You do not have any active or upcoming equipment requests right now.
              </p>
              <Link to="/explore" className="btn btn-primary btn-sm">
                Explore Campus Resources
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                      src={
                        b.resource?.images?.[0] ||
                        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=120&q=80'
                      }
                      alt=""
                      style={{ width: '70px', height: '54px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.975rem', color: '#17231C' }}>
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
                      <div style={{ fontSize: '0.785rem', color: '#64748B', marginTop: '2px' }}>
                        {new Date(b.startTime).toLocaleDateString()} ({b.durationHours} hrs) • Ref: {b.bookingNumber}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    {b.status === 'Approved' && !b.checkIn?.checkedInAt && (
                      <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
                        Check-In Required
                      </span>
                    )}

                    <Link to={`/bookings/${b._id}`} className="btn btn-primary btn-sm">
                      <span>View & Actions</span>
                      <ArrowRight size={14} />
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
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>
              Your Waiting List Queue
            </h2>
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
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#17231C' }}>
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
          <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>
            Recommended Resources in {user?.department || 'Your Faculty'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {recommended.map((r) => (
              <Link
                key={r._id}
                to={`/resources/${r._id}`}
                className="al-card al-card-hover"
                style={{ padding: '1rem' }}
              >
                <img
                  src={r.images?.[0]}
                  alt=""
                  style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', marginBottom: '0.75rem' }}
                />
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#16A34A', fontWeight: 700 }}>
                  {r.category}
                </div>
                <h4 style={{ fontSize: '0.925rem', color: '#17231C', margin: '0.2rem 0 0.5rem', lineHeight: 1.3 }}>
                  {r.name}
                </h4>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
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
