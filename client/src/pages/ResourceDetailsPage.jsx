import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Check,
  Zap,
  RotateCcw,
  Home,
  Camera,
  UploadCloud,
  Package,
} from 'lucide-react';
import api, { resolveImageUrl, DEFAULT_AVATAR } from '../services/api';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';

// Time options from 08:00 AM to 08:00 PM (30 min increments)
const TIME_OPTIONS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00',
];

const formatTime12Hour = (time24) => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
};

const addHoursToTime = (time24, hoursToAdd) => {
  if (!time24) return '11:00';
  const [hStr, mStr] = time24.split(':');
  const totalMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr || '0', 10) + Math.round(hoursToAdd * 60);
  const clampedMinutes = Math.min(Math.max(totalMinutes, 0), 23 * 60 + 59);
  const newH = Math.floor(clampedMinutes / 60);
  const newM = clampedMinutes % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
};

const toDateStringISO = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayISO = () => toDateStringISO(new Date());

const getTomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toDateStringISO(d);
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return 'Select Reservation Date';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const todayStr = getTodayISO();
    const tomorrowStr = getTomorrowISO();

    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = dateObj.getDate();
    const yr = dateObj.getFullYear();

    let relativeLabel = '';
    if (dateStr === todayStr) relativeLabel = ' • Today';
    else if (dateStr === tomorrowStr) relativeLabel = ' • Tomorrow';

    return `${dayName}, ${monthName} ${dayNum}, ${yr}${relativeLabel}`;
  } catch {
    return dateStr;
  }
};

const ResourceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const resourcePhotoInputRef = useRef(null);

  const [resource, setResource] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);
  const [updatingPhoto, setUpdatingPhoto] = useState(false);

  // Modern Calendar Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  const datePickerRef = useRef(null);

  // Booking Form State
  const [startDate, setStartDate] = useState('');
  const [startTimeStr, setStartTimeStr] = useState('09:00');
  const [endTimeStr, setEndTimeStr] = useState('11:00');
  const [purpose, setPurpose] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [conflictDetected, setConflictDetected] = useState(false);
  const [waitingListSuccess, setWaitingListSuccess] = useState('');

  // Close calendar popover on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    };
    if (showDatePicker) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showDatePicker]);

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
        const tomorrowStr = toDateStringISO(tomorrow);
        setStartDate(tomorrowStr);
        setCalendarViewDate(tomorrow);

        // Intelligently initialize start and end time to be valid by default
        const minDur = res.data.resource?.minBookingDurationHours || 1;
        const maxDur = res.data.resource?.maxBookingDurationHours || 8;
        const defaultDur = Math.min(Math.max(minDur, 1), maxDur);
        setStartTimeStr('09:00');
        setEndTimeStr(addHoursToTime('09:00', defaultDur));
      } catch (err) {
        console.error('Error fetching resource:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  useEffect(() => {
    setImgFailed(false);
  }, [selectedImage, resource?.images]);

  const handleResourcePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUpdatingPhoto(true);
    try {
      const dataUri = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = Math.round((width * MAX_HEIGHT) / height);
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          };
          img.onerror = () => resolve('');
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });

      if (!dataUri) throw new Error('Failed to process image');

      const res = await api.put(`/resources/${resource._id}`, { images: [dataUri] });
      setResource((prev) => ({ ...prev, images: res.data.resource?.images || [dataUri] }));
      setImgFailed(false);
      setSelectedImage(0);
    } catch (err) {
      console.error('Failed to update resource photo:', err);
      alert('Failed to update resource photo. Please try again.');
    } finally {
      setUpdatingPhoto(false);
      if (resourcePhotoInputRef.current) resourcePhotoInputRef.current.value = '';
    }
  };

  const isOwner =
    Boolean(user && resource?.owner) &&
    (user._id === (resource.owner._id || resource.owner) ||
      user.id === (resource.owner._id || resource.owner) ||
      user.role === 'admin' ||
      user.role === 'manager');

  if (loading) {
    return (
      <div className="main-content">
        <div className="app-container" style={{ textAlign: 'center', padding: '6rem 0' }}>
          <div className="badge badge-green" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
            Loading resource specifications...
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="main-content">
        <div className="app-container" style={{ textAlign: 'center', padding: '6rem 0' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: '#0F172A' }}>Resource not found</h2>
          <p style={{ marginTop: '0.5rem', marginBottom: '1.75rem', color: '#64748B' }}>
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
        {/* Modern Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem', color: '#64748B', marginBottom: '1.75rem' }}>
          <Link to="/" style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Home size={13} />
            <span>Home</span>
          </Link>
          <ChevronRight size={13} color="#CBD5E1" />
          <Link to="/explore" style={{ color: '#64748B' }}>Explore</Link>
          <ChevronRight size={13} color="#CBD5E1" />
          <span style={{ color: '#0F172A', fontWeight: 600 }}>{resource.name}</span>
        </div>

        <div className="responsive-detail-grid">
          {/* ================= LEFT COLUMN: DETAILS & GALLERY ================= */}
          <div>
            {/* Gallery */}
            <div style={{ marginBottom: '2rem' }}>
              {(() => {
                const currentImg = resource.images && resource.images[selectedImage];
                const resolvedUrl = resolveImageUrl(currentImg);
                const hasUploadedImage = Boolean(resolvedUrl && !imgFailed);

                return (
                  <div
                    style={{
                      height: '400px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: 'var(--radius-xl)',
                      overflow: 'hidden',
                      border: '1px solid #E2E8F0',
                      marginBottom: '1rem',
                      boxShadow: 'var(--shadow-sm)',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {hasUploadedImage ? (
                      <img
                        src={resolvedUrl}
                        alt={resource.name}
                        onError={() => setImgFailed(true)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                        <div
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            backgroundColor: '#F1F5F9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94A3B8',
                            margin: '0 auto 1rem',
                          }}
                        >
                          <Camera size={32} />
                        </div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                          No photograph uploaded
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '340px', margin: '0 auto' }}>
                          Only custodian-uploaded photos are displayed for this resource.
                        </p>
                      </div>
                    )}

                    {/* Owner/Custodian Photo Upload & Update Action */}
                    {isOwner && (
                      <label
                        style={{
                          position: 'absolute',
                          bottom: '1rem',
                          right: '1rem',
                          backgroundColor: 'rgba(15, 23, 42, 0.85)',
                          backdropFilter: 'blur(8px)',
                          color: '#FFFFFF',
                          padding: '0.55rem 1rem',
                          borderRadius: '10px',
                          fontSize: '0.825rem',
                          fontWeight: 600,
                          cursor: updatingPhoto ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                          transition: 'all 0.2s ease',
                          border: '1px solid rgba(255,255,255,0.2)',
                          userSelect: 'none',
                        }}
                      >
                        <UploadCloud size={15} />
                        <span>
                          {updatingPhoto
                            ? 'Processing photo...'
                            : hasUploadedImage
                            ? 'Change Photograph'
                            : 'Upload Resource Photo'}
                        </span>
                        <input
                          ref={resourcePhotoInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          style={{ display: 'none' }}
                          onChange={handleResourcePhotoUpload}
                          disabled={updatingPhoto}
                        />
                      </label>
                    )}
                  </div>
                );
              })()}

              {resource.images && resource.images.length > 1 && (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {resource.images.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      style={{
                        width: '84px',
                        height: '62px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: selectedImage === i ? '2px solid #22C55E' : '1px solid #E2E8F0',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <img
                        src={resolveImageUrl(img)}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Header Information */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                <span className="badge badge-green">{resource.category}</span>
                <span className="badge badge-gray">{resource.resourceType}</span>
                <span className="badge badge-blue">Condition: {resource.condition}</span>
                <span className="badge badge-gray">Capacity: {resource.quantity} unit(s)</span>
              </div>

              <h1 style={{ fontSize: '2.15rem', marginBottom: '0.75rem', lineHeight: 1.25, letterSpacing: '-0.03em' }}>
                {resource.name}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#64748B', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={15} color="#16A34A" />
                  <span style={{ fontWeight: 500 }}>{resource.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Building size={15} color="#16A34A" />
                  <span style={{ fontWeight: 500 }}>{resource.department}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={15} color="#16A34A" />
                  <span>Max: {resource.maxBookingDurationHours} hrs / session</span>
                </div>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="al-card" style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', color: '#0F172A', fontWeight: 700 }}>
                Overview & Technical Specifications
              </h3>
              <p style={{ lineHeight: 1.7, fontSize: '0.925rem', color: '#334155', whiteSpace: 'pre-line' }}>
                {resource.description}
              </p>
            </div>

            {/* Safety & Handling Instructions */}
            <div className="al-card" style={{ marginBottom: '1.75rem', borderLeft: '4px solid #F59E0B' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <AlertTriangle size={18} color="#D97706" />
                <h3 style={{ fontSize: '1.05rem', color: '#0F172A', fontWeight: 700 }}>Safety Instructions & Laboratory Protocols</h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
                {resource.safetyInstructions}
              </p>
              <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0', fontSize: '0.825rem', color: '#64748B' }}>
                <strong>Guidelines:</strong> {resource.usageGuidelines}
              </div>
            </div>

            {/* Custodian Card */}
            <div className="al-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <UserAvatar
                  src={resource.owner?.avatar}
                  name={resource.owner?.name}
                  size={48}
                  border="1.5px solid #22C55E"
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>
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
                  borderBottom: '1px solid #E2E8F0',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, letterSpacing: '0.04em' }}>
                    Access Fee
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16A34A', letterSpacing: '-0.02em' }}>
                    {resource.isPaid ? `₹${resource.hourlyFee}/hr` : 'Free'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, letterSpacing: '0.04em' }}>
                    Security Deposit
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                    {resource.securityDeposit > 0 ? `₹${resource.securityDeposit}` : 'None Required'}
                  </div>
                </div>
              </div>

              {/* Eligibility Checklist */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  padding: '1rem',
                  border: '1px solid #E2E8F0',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontSize: '0.785rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '0.65rem', letterSpacing: '0.04em' }}>
                  Your Eligibility Assessment
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>Verified Academic Status:</span>
                    <strong style={{ color: isVerifiedUser ? '#16A34A' : '#EF4444' }}>
                      {isVerifiedUser ? 'Verified ✓' : 'Pending Verification'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>Fair Usage Standing (Min {resource.eligibilityRequirements?.minFairUsageScore || 50}):</span>
                    <strong style={{ color: fairScoreOk ? '#16A34A' : '#EF4444' }}>
                      {user?.fairUsageScore || 100}/100 {fairScoreOk ? '✓' : '✕'}
                    </strong>
                  </div>

                  {trainingRequired && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#475569' }}>Safety Certification:</span>
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
                    backgroundColor: '#ECFDF5',
                    borderRadius: '8px',
                    fontSize: '0.825rem',
                    marginBottom: '1.25rem',
                    border: '1px solid rgba(34, 197, 94, 0.25)',
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
                      backgroundColor: '#FEF2F2',
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
                      backgroundColor: '#FAF5FF',
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
                      backgroundColor: '#ECFDF5',
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
                  style={{ width: '100%', height: '48px', fontSize: '0.975rem', gap: '0.5rem' }}
                >
                  {bookingLoading ? (
                    'Evaluating Request...'
                  ) : (
                    <>
                      <span>Submit Booking Request</span>
                      <ArrowRight size={17} />
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
