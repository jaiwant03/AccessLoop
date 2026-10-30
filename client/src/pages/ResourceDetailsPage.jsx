import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  User,
  Building,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Users,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ResourceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [resource, setResource] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  // Booking Form State
  const [startDate, setStartDate] = useState('');
  const [startTimeStr, setStartTimeStr] = useState('09:00');
  const [endTimeStr, setEndTimeStr] = useState('13:00');
  const [purpose, setPurpose] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [conflictDetected, setConflictDetected] = useState(false);
  const [waitingListSuccess, setWaitingListSuccess] = useState('');

  useEffect(() => {
    const fetchResource = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/resources/${id}`);
        setResource(res.data.resource);
        setBookedSlots(res.data.bookedSlots || []);

        // Default startDate to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setStartDate(tomorrow.toISOString().split('T')[0]);
      } catch (err) {
        console.error('Error fetching resource:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  if (loading) {
    return (
      <div className="main-content">
        <div className="app-container" style={{ textAlign: 'center', padding: '5rem 0' }}>
          <div className="badge badge-green" style={{ padding: '0.5rem 1rem' }}>
            Loading resource specifications...
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="main-content">
        <div className="app-container" style={{ textAlign: 'center', padding: '5rem 0' }}>
          <h2>Resource not found</h2>
          <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            The requested asset does not exist or may have been decommissioned.
          </p>
          <Link to="/explore" className="btn btn-primary">
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  // Calculate duration
  const startDateTime = new Date(`${startDate}T${startTimeStr}`);
  const endDateTime = new Date(`${startDate}T${endTimeStr}`);
  const durationHours =
    endDateTime > startDateTime
      ? (endDateTime - startDateTime) / (1000 * 60 * 60)
      : 0;

  // Eligibility Evaluation for the logged in user
  const isVerifiedUser = user?.verificationStatus === 'Verified';
  const fairScoreOk = (user?.fairUsageScore || 100) >= (resource.eligibilityRequirements?.minFairUsageScore || 50);
  const trainingRequired = resource.eligibilityRequirements?.requiresTraining;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setConflictDetected(false);
    setWaitingListSuccess('');

    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!purpose.trim()) {
      setBookingError('Please describe the purpose of use.');
      return;
    }

    if (durationHours < resource.minBookingDurationHours) {
      setBookingError(
        `Minimum reservation duration is ${resource.minBookingDurationHours} hour(s).`
      );
      return;
    }

    if (durationHours > resource.maxBookingDurationHours) {
      setBookingError(
        `Maximum reservation duration is ${resource.maxBookingDurationHours} hour(s).`
      );
      return;
    }

    setBookingLoading(true);

    try {
      const res = await api.post('/bookings', {
        resourceId: resource._id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        purpose: purpose.trim(),
      });

      // Redirect to newly created booking detail
      navigate(`/bookings/${res.data.booking._id}`);
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.conflict) {
        setConflictDetected(true);
        setBookingError(resp.message);
      } else {
        setBookingError(resp?.message || 'Failed to submit reservation request.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const handleJoinWaitingList = async () => {
    try {
      const res = await api.post('/waiting-list', {
        resourceId: resource._id,
        requestedStartTime: startDateTime.toISOString(),
        requestedEndTime: endDateTime.toISOString(),
        purpose: purpose.trim() || 'Waiting for slot availability',
      });
      setWaitingListSuccess(res.data.message);
      setConflictDetected(false);
    } catch (err) {
      setBookingError(
        err.response?.data?.message || 'Failed to join waiting list.'
      );
    }
  };

  return (
    <div className="main-content">
      <div className="app-container">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.825rem', color: '#64748B', marginBottom: '1.5rem' }}>
          <Link to="/" style={{ color: '#64748B' }}>Home</Link>
          <span>/</span>
          <Link to="/explore" style={{ color: '#64748B' }}>Explore</Link>
          <span>/</span>
          <span style={{ color: '#17231C', fontWeight: 600 }}>{resource.name}</span>
        </div>

        <div className="responsive-detail-grid">
          {/* ================= LEFT COLUMN: DETAILS & GALLERY ================= */}
          <div>
            {/* Gallery */}
            <div style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  height: '380px',
                  backgroundColor: '#F1F5F9',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid #E5E7EB',
                  marginBottom: '1rem',
                }}
              >
                <img
                  src={
                    resource.images && resource.images[selectedImage]
                      ? resource.images[selectedImage]
                      : 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={resource.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {resource.images && resource.images.length > 1 && (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {resource.images.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      style={{
                        width: '80px',
                        height: '60px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: selectedImage === i ? '2px solid #22C55E' : '1px solid #E5E7EB',
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Header Information */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-green">{resource.category}</span>
                <span className="badge badge-gray">{resource.resourceType}</span>
                <span className="badge badge-blue">Condition: {resource.condition}</span>
              </div>

              <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem', lineHeight: 1.25 }}>
                {resource.name}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: '#64748B', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={16} color="#16A34A" />
                  <span>{resource.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Building size={16} color="#16A34A" />
                  <span>{resource.department}</span>
                </div>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="al-card" style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Overview & Technical Specifications</h3>
              <p style={{ lineHeight: 1.7, fontSize: '0.925rem', color: '#334155', whiteSpace: 'pre-line' }}>
                {resource.description}
              </p>
            </div>

            {/* Safety & Handling Instructions */}
            <div className="al-card" style={{ marginBottom: '1.75rem', borderLeft: '4px solid #F59E0B' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <AlertTriangle size={18} color="#D97706" />
                <h3 style={{ fontSize: '1.05rem', color: '#17231C' }}>Safety Instructions & Laboratory Protocols</h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
                {resource.safetyInstructions}
              </p>
              <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid #E5E7EB', fontSize: '0.825rem', color: '#64748B' }}>
                <strong>Guidelines:</strong> {resource.usageGuidelines}
              </div>
            </div>

            {/* Custodian Card */}
            <div className="al-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <img
                  src={
                    resource.owner?.avatar ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
                  }
                  alt={resource.owner?.name}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#17231C' }}>
                    {resource.owner?.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    Resource Custodian • {resource.owner?.department}
                  </div>
                </div>
              </div>
              <span className="badge badge-green">Verified Custodian</span>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: BOOKING & ELIGIBILITY ================= */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div className="al-card" style={{ boxShadow: 'var(--shadow-md)' }}>
              {/* Pricing & Deposit Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  paddingBottom: '1.25rem',
                  borderBottom: '1px solid #E5E7EB',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700 }}>
                    Access Fee
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#16A34A' }}>
                    {resource.isPaid ? `₹${resource.hourlyFee}/hr` : 'Free'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700 }}>
                    Security Deposit
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#17231C' }}>
                    {resource.securityDeposit > 0 ? `₹${resource.securityDeposit}` : 'None Required'}
                  </div>
                </div>
              </div>

              {/* Eligibility Checklist */}
              <div
                style={{
                  backgroundColor: '#F8FAF9',
                  borderRadius: '10px',
                  padding: '1rem',
                  border: '1px solid #E5E7EB',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '0.65rem' }}>
                  Your Eligibility Assessment
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Verified Academic Status:</span>
                    <strong style={{ color: isVerifiedUser ? '#16A34A' : '#EF4444' }}>
                      {isVerifiedUser ? 'Verified ✓' : 'Pending Verification'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Fair Usage Standing (Min {resource.eligibilityRequirements?.minFairUsageScore || 50}):</span>
                    <strong style={{ color: fairScoreOk ? '#16A34A' : '#EF4444' }}>
                      {user?.fairUsageScore || 100}/100 {fairScoreOk ? '✓' : '✕'}
                    </strong>
                  </div>

                  {trainingRequired && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Safety Certification:</span>
                      <strong style={{ color: '#D97706' }}>
                        Required ({resource.eligibilityRequirements?.trainingCourseName || 'Shop Orientation'})
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Request Form */}
              <form onSubmit={handleBookingSubmit}>
                <div className="form-group">
                  <label className="form-label">Reservation Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label className="form-label">Start Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={startTimeStr}
                      onChange={(e) => setStartTimeStr(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">End Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={endTimeStr}
                      onChange={(e) => setEndTimeStr(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Purpose of Use <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    placeholder="Specify project title, research objective, or class experiment..."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    required
                  />
                  <div className="form-hint">
                    Resource custodians review your stated purpose before approving.
                  </div>
                </div>

                {/* Duration summary */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#F0FDF4',
                    borderRadius: '6px',
                    fontSize: '0.825rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <span style={{ color: '#15803D', fontWeight: 600 }}>Total Duration:</span>
                  <strong style={{ color: '#16A34A' }}>{durationHours} hour(s)</strong>
                </div>

                {/* Error Banner */}
                {bookingError && (
                  <div
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#FEE2E2',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '8px',
                      color: '#B91C1C',
                      fontSize: '0.8rem',
                      marginBottom: '1rem',
                    }}
                  >
                    {bookingError}
                  </div>
                )}

                {/* Waiting List CTA if Conflicted */}
                {conflictDetected && (
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: '#F5F3FF',
                      border: '1px solid #DDD6FE',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#6D28D9', marginBottom: '0.35rem' }}>
                      Slot Conflicted - Join Waiting List
                    </div>
                    <p style={{ fontSize: '0.775rem', color: '#6B7280', marginBottom: '0.75rem' }}>
                      You will be automatically queued. If the current reservation is cancelled, you will receive priority notification.
                    </p>
                    <button
                      type="button"
                      onClick={handleJoinWaitingList}
                      className="btn btn-sm"
                      style={{ backgroundColor: '#8B5CF6', color: '#FFF' }}
                    >
                      <Users size={14} />
                      <span>Join Queue Position</span>
                    </button>
                  </div>
                )}

                {waitingListSuccess && (
                  <div
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#F0FDF4',
                      color: '#15803D',
                      borderRadius: '8px',
                      fontSize: '0.825rem',
                      marginBottom: '1rem',
                      fontWeight: 600,
                    }}
                  >
                    {waitingListSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="btn btn-primary"
                  style={{ width: '100%', height: '48px', fontSize: '1rem' }}
                >
                  {bookingLoading ? (
                    'Evaluating Request...'
                  ) : (
                    <>
                      <span>Submit Booking Request</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: '#94A3B8' }}>
                Protected by 5-Step Handover & Return Verification Protocol
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailsPage;
