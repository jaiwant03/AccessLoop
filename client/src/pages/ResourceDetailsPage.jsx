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
  Trash2,
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

  // Delete Resource Modal State (For Owner & Manager)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [forceDelete, setForceDelete] = useState(false);

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

  const handleDeleteResource = async () => {
    if (!resource) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.delete(`/resources/${resource._id}`);
      if (user?.role === 'owner') {
        navigate('/dashboard/owner');
      } else if (user?.role === 'manager') {
        navigate('/dashboard/manager');
      } else {
        navigate('/explore');
      }
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || 'Failed to delete resource. Please review active bookings.'
      );
      setDeleteLoading(false);
    }
  };

  // Calculate duration
  const startDateTime = new Date(`${startDate}T${startTimeStr}`);
  const endDateTime = new Date(`${startDate}T${endTimeStr}`);
  const durationHours =
    endDateTime > startDateTime
      ? (endDateTime - startDateTime) / (1000 * 60 * 60)
      : 0;

  const minDurAllowed = resource?.minBookingDurationHours || 1;
  const maxDurAllowed = resource?.maxBookingDurationHours || 8;
  const durationExceedsMax = durationHours > maxDurAllowed;
  const durationBelowMin = durationHours < minDurAllowed && durationHours > 0;

  // Calendar Days computation (Called before any return to guarantee hook consistency)
  const calendarDays = useMemo(() => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const todayStr = getTodayISO();
    const days = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, daysInPrevMonth - i);
      const isoStr = toDateStringISO(prevDate);
      days.push({
        date: prevDate,
        dateString: isoStr,
        dayNumber: daysInPrevMonth - i,
        isCurrentMonth: false,
        isPast: isoStr < todayStr,
        isToday: isoStr === todayStr,
        isSelected: isoStr === startDate,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const currDate = new Date(year, month, d);
      const isoStr = toDateStringISO(currDate);
      const hasBooking = bookedSlots.some((slot) => {
        const slotDate = slot.startTime ? slot.startTime.split('T')[0] : '';
        return slotDate === isoStr;
      });

      days.push({
        date: currDate,
        dateString: isoStr,
        dayNumber: d,
        isCurrentMonth: true,
        isPast: isoStr < todayStr,
        isToday: isoStr === todayStr,
        isSelected: isoStr === startDate,
        hasBooking,
      });
    }

    // Next month filler days up to 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const isoStr = toDateStringISO(nextDate);
      days.push({
        date: nextDate,
        dateString: isoStr,
        dayNumber: d,
        isCurrentMonth: false,
        isPast: isoStr < todayStr,
        isToday: isoStr === todayStr,
        isSelected: isoStr === startDate,
      });
    }

    return days;
  }, [calendarViewDate, startDate, bookedSlots]);

  // Allowed Durations for Quick Selection Pills (Called before any return to guarantee hook consistency)
  const allowedDurations = useMemo(() => {
    const minDur = resource?.minBookingDurationHours || 1;
    const maxDur = resource?.maxBookingDurationHours || 8;
    const candidates = [1, 1.5, 2, 3, 4, 6, 8];
    const filtered = candidates.filter((c) => c >= minDur && c <= maxDur);
    if (!filtered.includes(minDur)) filtered.unshift(minDur);
    if (!filtered.includes(maxDur)) filtered.push(maxDur);
    return Array.from(new Set(filtered)).sort((a, b) => a - b);
  }, [resource?.minBookingDurationHours, resource?.maxBookingDurationHours]);

  const handleApplyDuration = (dur) => {
    setEndTimeStr(addHoursToTime(startTimeStr, dur));
    setBookingError('');
  };

  const handleStartTimeChange = (newStartTime) => {
    setStartTimeStr(newStartTime);
    const validDur = durationHours > 0 && !durationExceedsMax ? durationHours : Math.min(2, maxDurAllowed);
    setEndTimeStr(addHoursToTime(newStartTime, validDur));
    setBookingError('');
  };

  // Eligibility Evaluation for the logged in user
  const isVerifiedUser = user?.verificationStatus === 'Verified';
  const fairScoreOk = (user?.fairUsageScore || 100) >= (resource?.eligibilityRequirements?.minFairUsageScore || 50);
  const trainingRequired = resource?.eligibilityRequirements?.requiresTraining;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setConflictDetected(false);
    setWaitingListSuccess('');

    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!resource) return;

    if (!purpose.trim()) {
      setBookingError('Please describe the purpose of use.');
      return;
    }

    if (durationHours < (resource.minBookingDurationHours || 1)) {
      setBookingError(
        `Minimum reservation duration is ${resource.minBookingDurationHours || 1} hour(s).`
      );
      return;
    }

    if (durationHours > (resource.maxBookingDurationHours || 8)) {
      setBookingError(
        `Maximum reservation duration is ${resource.maxBookingDurationHours || 8} hour(s).`
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
    if (!resource) return;
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-green">{resource.category}</span>
                  <span className="badge badge-gray">{resource.resourceType}</span>
                  <span className="badge badge-blue">Condition: {resource.condition}</span>
                  <span className="badge badge-gray">Capacity: {resource.quantity} unit(s)</span>
                </div>

                {/* Owner & Manager Action: Delete mistakenly created resource */}
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      color: '#DC2626',
                      borderColor: '#FECACA',
                      backgroundColor: '#FEF2F2',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      borderRadius: '8px',
                      padding: '0.4rem 0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    title="Delete mistakenly created resource"
                  >
                    <Trash2 size={14} />
                    <span>Delete Resource</span>
                  </button>
                )}
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
            <div className="al-card" style={{ boxShadow: 'var(--shadow-md)', borderRadius: '16px' }}>
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
                  <div style={{ fontSize: '0.725rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Access Fee
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#16A34A', letterSpacing: '-0.02em' }}>
                    {resource.isPaid ? `₹${resource.hourlyFee}/hr` : 'Free'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.725rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Security Deposit
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A' }}>
                    {resource.securityDeposit > 0 ? `₹${resource.securityDeposit}` : 'None Required'}
                  </div>
                </div>
              </div>

              {/* Eligibility Assessment Card */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '1.1rem',
                  border: '1px solid #E2E8F0',
                  marginBottom: '1.35rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#334155', letterSpacing: '0.04em' }}>
                    Eligibility Standing
                  </div>
                  <span
                    className={`badge ${isVerifiedUser && fairScoreOk ? 'badge-green' : 'badge-amber'}`}
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                  >
                    {isVerifiedUser && fairScoreOk ? 'Eligible to Reserve' : 'Action Required'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {/* Academic Status */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                    <span style={{ color: '#475569' }}>Academic Verification:</span>
                    {isVerifiedUser ? (
                      <span style={{ color: '#16A34A', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={14} />
                        <span>Verified Account</span>
                      </span>
                    ) : (
                      <Link
                        to="/profile"
                        style={{
                          color: '#D97706',
                          fontWeight: 700,
                          textDecoration: 'none',
                          fontSize: '0.785rem',
                          backgroundColor: '#FEF3C7',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <span>Pending Verification</span>
                        <ChevronRight size={12} />
                      </Link>
                    )}
                  </div>

                  {/* Fair Usage Score */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: '#475569' }}>
                        Fair Usage Standing (Min {resource.eligibilityRequirements?.minFairUsageScore || 50}):
                      </span>
                      <strong style={{ color: fairScoreOk ? '#16A34A' : '#EF4444' }}>
                        {user?.fairUsageScore || 100}/100 {fairScoreOk ? '✓' : '✕'}
                      </strong>
                    </div>
                    <div
                      style={{
                        height: '5px',
                        width: '100%',
                        backgroundColor: '#E2E8F0',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(user?.fairUsageScore || 100, 100)}%`,
                          backgroundColor: fairScoreOk ? '#22C55E' : '#EF4444',
                          borderRadius: '3px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Training Requirement if any */}
                  {trainingRequired && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                      <span style={{ color: '#475569' }}>Safety Certification:</span>
                      <strong style={{ color: '#D97706', fontSize: '0.785rem' }}>
                        Required ({resource.eligibilityRequirements?.trainingCourseName || 'Shop Orientation'})
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Request Form */}
              <form onSubmit={handleBookingSubmit}>
                {/* Modern Interactive Date Picker */}
                <div className="form-group" style={{ position: 'relative', marginBottom: '1.25rem' }} ref={datePickerRef}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>Reservation Date</span>
                    <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 700 }}>
                      {startDate === getTodayISO() ? 'Today' : startDate === getTomorrowISO() ? 'Tomorrow' : ''}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowDatePicker((prev) => !prev)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.95rem',
                      backgroundColor: '#FFFFFF',
                      border: showDatePicker ? '1.5px solid #22C55E' : '1px solid #E2E8F0',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: showDatePicker ? '0 0 0 3px rgba(34, 197, 94, 0.18)' : 'var(--shadow-xs)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#ECFDF5',
                          color: '#16A34A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Calendar size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#0F172A' }}>
                          {formatDisplayDate(startDate)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          Click to select a date
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      size={18}
                      color="#64748B"
                      style={{
                        transform: showDatePicker ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </button>

                  {/* Modern Date Picker Popover */}
                  {showDatePicker && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: 0,
                        right: 0,
                        zIndex: 60,
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
                        padding: '1.15rem',
                      }}
                    >
                      {/* Quick Preset Buttons */}
                      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.9rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const today = getTodayISO();
                            setStartDate(today);
                            setCalendarViewDate(new Date());
                            setShowDatePicker(false);
                          }}
                          style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: startDate === getTodayISO() ? '1.5px solid #16A34A' : '1px solid #E2E8F0',
                            backgroundColor: startDate === getTodayISO() ? '#ECFDF5' : '#F8FAFC',
                            color: startDate === getTodayISO() ? '#15803D' : '#475569',
                            cursor: 'pointer',
                          }}
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const tom = getTomorrowISO();
                            setStartDate(tom);
                            const d = new Date();
                            d.setDate(d.getDate() + 1);
                            setCalendarViewDate(d);
                            setShowDatePicker(false);
                          }}
                          style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: startDate === getTomorrowISO() ? '1.5px solid #16A34A' : '1px solid #E2E8F0',
                            backgroundColor: startDate === getTomorrowISO() ? '#ECFDF5' : '#F8FAFC',
                            color: startDate === getTomorrowISO() ? '#15803D' : '#475569',
                            cursor: 'pointer',
                          }}
                        >
                          Tomorrow
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setDate(d.getDate() + 2);
                            const iso = toDateStringISO(d);
                            setStartDate(iso);
                            setCalendarViewDate(d);
                            setShowDatePicker(false);
                          }}
                          style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: '1px solid #E2E8F0',
                            backgroundColor: '#F8FAFC',
                            color: '#475569',
                            cursor: 'pointer',
                          }}
                        >
                          +2 Days
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            const day = d.getDay();
                            const diff = (8 - day) % 7 || 7;
                            d.setDate(d.getDate() + diff);
                            const iso = toDateStringISO(d);
                            setStartDate(iso);
                            setCalendarViewDate(d);
                            setShowDatePicker(false);
                          }}
                          style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: '1px solid #E2E8F0',
                            backgroundColor: '#F8FAFC',
                            color: '#475569',
                            cursor: 'pointer',
                          }}
                        >
                          Next Mon
                        </button>
                      </div>

                      {/* Calendar Month & Navigation Header */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.85rem',
                          padding: '0 0.25rem',
                        }}
                      >
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                          {calendarViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => {
                              const prev = new Date(calendarViewDate);
                              prev.setMonth(prev.getMonth() - 1);
                              setCalendarViewDate(prev);
                            }}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: '1px solid #E2E8F0',
                              backgroundColor: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#475569',
                              cursor: 'pointer',
                            }}
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const next = new Date(calendarViewDate);
                              next.setMonth(next.getMonth() + 1);
                              setCalendarViewDate(next);
                            }}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: '1px solid #E2E8F0',
                              backgroundColor: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#475569',
                              cursor: 'pointer',
                            }}
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Weekdays header */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(7, 1fr)',
                          textAlign: 'center',
                          marginBottom: '0.45rem',
                        }}
                      >
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((w) => (
                          <span
                            key={w}
                            style={{
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              color: '#94A3B8',
                              textTransform: 'uppercase',
                            }}
                          >
                            {w}
                          </span>
                        ))}
                      </div>

                      {/* Days Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
                        {calendarDays.map((cell, idx) => {
                          let bg = 'transparent';
                          let color = cell.isCurrentMonth ? '#0F172A' : '#CBD5E1';
                          let border = '1px solid transparent';
                          let cursor = cell.isPast ? 'not-allowed' : 'pointer';

                          if (cell.isSelected) {
                            bg = 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)';
                            color = '#FFFFFF';
                          } else if (cell.isToday) {
                            border = '1.5px solid #22C55E';
                            color = '#15803D';
                            bg = '#F0FDF4';
                          }

                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled={cell.isPast}
                              onClick={() => {
                                if (cell.isPast) return;
                                setStartDate(cell.dateString);
                                setShowDatePicker(false);
                              }}
                              style={{
                                height: '34px',
                                borderRadius: '8px',
                                border,
                                background: bg,
                                color,
                                fontSize: '0.825rem',
                                fontWeight: cell.isSelected || cell.isToday ? 700 : 500,
                                cursor,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                opacity: cell.isPast ? 0.35 : 1,
                                transition: 'all 0.1s ease',
                              }}
                            >
                              <span>{cell.dayNumber}</span>
                              {cell.hasBooking && !cell.isSelected && (
                                <span
                                  style={{
                                    position: 'absolute',
                                    bottom: '3px',
                                    width: '4px',
                                    height: '4px',
                                    borderRadius: '50%',
                                    backgroundColor: '#F59E0B',
                                  }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Footer summary */}
                      <div
                        style={{
                          marginTop: '0.85rem',
                          paddingTop: '0.75rem',
                          borderTop: '1px solid #F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.75rem',
                        }}
                      >
                        <div style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                          <span>Reserved slots</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowDatePicker(false)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modern Time Selector (Start & End Time) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}>
                      Start Time
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select
                        className="form-input"
                        value={startTimeStr}
                        onChange={(e) => handleStartTimeChange(e.target.value)}
                        style={{
                          height: '44px',
                          fontWeight: 600,
                          paddingLeft: '2.25rem',
                          cursor: 'pointer',
                        }}
                      >
                        {TIME_OPTIONS.slice(0, -1).map((t) => (
                          <option key={t} value={t}>
                            {formatTime12Hour(t)}
                          </option>
                        ))}
                      </select>
                      <Clock
                        size={16}
                        color="#16A34A"
                        style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}>
                      End Time
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select
                        className="form-input"
                        value={endTimeStr}
                        onChange={(e) => {
                          setEndTimeStr(e.target.value);
                          setBookingError('');
                        }}
                        style={{
                          height: '44px',
                          fontWeight: 600,
                          paddingLeft: '2.25rem',
                          cursor: 'pointer',
                        }}
                      >
                        {TIME_OPTIONS.filter((t) => t > startTimeStr).map((t) => {
                          const diff = (new Date(`2000-01-01T${t}`) - new Date(`2000-01-01T${startTimeStr}`)) / (1000 * 60 * 60);
                          return (
                            <option key={t} value={t}>
                              {formatTime12Hour(t)} ({diff} hr{diff > 1 ? 's' : ''})
                            </option>
                          );
                        })}
                      </select>
                      <Clock
                        size={16}
                        color="#16A34A"
                        style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Duration Preset Pills */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Quick Duration
                    </span>
                    <span style={{ fontSize: '0.725rem', color: '#16A34A', fontWeight: 600 }}>
                      Limit: {resource.minBookingDurationHours || 1}–{resource.maxBookingDurationHours || 8} hrs
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {allowedDurations.map((dur) => {
                      const isSelected = Math.abs(durationHours - dur) < 0.05;
                      return (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => handleApplyDuration(dur)}
                          style={{
                            border: isSelected ? '1.5px solid #16A34A' : '1px solid #E2E8F0',
                            backgroundColor: isSelected ? '#DCFCE7' : '#FFFFFF',
                            color: isSelected ? '#15803D' : '#475569',
                            fontWeight: isSelected ? 700 : 600,
                            fontSize: '0.785rem',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: isSelected ? '0 2px 6px rgba(34, 197, 94, 0.2)' : 'none',
                          }}
                        >
                          {dur} {dur === 1 ? 'hr' : 'hrs'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration Exceeded Warning & Auto-Fix Banner */}
                {durationExceedsMax && (
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '12px',
                      marginBottom: '1.15rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                    }}
                  >
                    <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#991B1B', marginBottom: '0.2rem' }}>
                        Duration Exceeds Allowed Limit
                      </div>
                      <div style={{ fontSize: '0.775rem', color: '#B91C1C', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                        Selected duration is {durationHours} hours, but this resource permits a maximum of {resource.maxBookingDurationHours} hour(s).
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyDuration(resource.maxBookingDurationHours)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem 0.75rem',
                          backgroundColor: '#DC2626',
                          color: '#FFFFFF',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
                        }}
                      >
                        <Zap size={13} />
                        <span>Adjust to {resource.maxBookingDurationHours} hour(s)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Duration Below Min Warning */}
                {durationBelowMin && (
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: '12px',
                      marginBottom: '1.15rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                    }}
                  >
                    <AlertCircle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#92400E', marginBottom: '0.2rem' }}>
                        Minimum Reservation Requirement
                      </div>
                      <div style={{ fontSize: '0.775rem', color: '#B45309', marginBottom: '0.5rem' }}>
                        Minimum reservation duration is {resource.minBookingDurationHours} hour(s).
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyDuration(resource.minBookingDurationHours)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem 0.75rem',
                          backgroundColor: '#D97706',
                          color: '#FFFFFF',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <Zap size={13} />
                        <span>Adjust to {resource.minBookingDurationHours} hour(s)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Real-Time Duration & Cost Summary */}
                {!durationExceedsMax && !durationBelowMin && durationHours > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0.95rem',
                      backgroundColor: '#F0FDF4',
                      borderRadius: '10px',
                      fontSize: '0.825rem',
                      marginBottom: '1.25rem',
                      border: '1px solid rgba(34, 197, 94, 0.25)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} color="#16A34A" />
                      <span style={{ color: '#15803D', fontWeight: 600 }}>Total Duration:</span>
                      <strong style={{ color: '#16A34A', fontSize: '0.9rem' }}>
                        {durationHours} hr{durationHours > 1 ? 's' : ''}
                      </strong>
                    </div>
                    <span
                      className="badge badge-green"
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', fontWeight: 700 }}
                    >
                      ✓ Within limits
                    </span>
                  </div>
                )}

                {/* Purpose of Use Section with Quick Presets */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                    <label className="form-label" style={{ margin: 0, fontWeight: 600, color: '#0F172A' }}>
                      Purpose of Use <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                      {purpose.length}/300
                    </span>
                  </div>

                  {/* Quick Purpose Chips */}
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.55rem' }}>
                    {[
                      { label: 'Academic Project', text: 'Enrolled coursework and academic degree project.' },
                      { label: 'Lab Experiment', text: 'Faculty-guided laboratory experiment and data collection.' },
                      { label: 'Campus Media', text: 'Campus media production and documentation project.' },
                      { label: 'Workshop Session', text: 'Hands-on practical training and workshop session.' },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setPurpose(preset.text)}
                        style={{
                          padding: '0.25rem 0.55rem',
                          fontSize: '0.725rem',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: '1px solid #E2E8F0',
                          backgroundColor: purpose === preset.text ? '#ECFDF5' : '#F8FAFC',
                          color: purpose === preset.text ? '#15803D' : '#64748B',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    className="form-textarea"
                    placeholder="Specify project title, research objective, or class experiment..."
                    value={purpose}
                    maxLength={300}
                    onChange={(e) => setPurpose(e.target.value)}
                    required
                    style={{ resize: 'vertical', borderRadius: '10px' }}
                  />
                  <div className="form-hint" style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: '#94A3B8' }}>
                    Resource custodians review your stated purpose before approving.
                  </div>
                </div>

                {/* API / Server Error Banner */}
                {bookingError && !durationExceedsMax && !durationBelowMin && (
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '10px',
                      color: '#B91C1C',
                      fontSize: '0.825rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0 }} />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* Waiting List CTA if Conflicted */}
                {conflictDetected && (
                  <div
                    style={{
                      padding: '1.15rem',
                      backgroundColor: '#FAF5FF',
                      border: '1px solid #DDD6FE',
                      borderRadius: '12px',
                      marginBottom: '1.25rem',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#6D28D9', marginBottom: '0.35rem' }}>
                      Slot Conflicted — Join Waiting List
                    </div>
                    <p style={{ fontSize: '0.785rem', color: '#6B7280', marginBottom: '0.85rem', lineHeight: 1.45 }}>
                      You will be automatically queued. If the current reservation is cancelled, you will receive priority notification.
                    </p>
                    <button
                      type="button"
                      onClick={handleJoinWaitingList}
                      className="btn btn-sm"
                      style={{
                        backgroundColor: '#8B5CF6',
                        color: '#FFF',
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        fontWeight: 600,
                      }}
                    >
                      <Users size={14} />
                      <span>Join Queue Position</span>
                    </button>
                  </div>
                )}

                {waitingListSuccess && (
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: '#ECFDF5',
                      color: '#15803D',
                      borderRadius: '10px',
                      fontSize: '0.825rem',
                      marginBottom: '1rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <CheckCircle2 size={16} color="#16A34A" />
                    <span>{waitingListSuccess}</span>
                  </div>
                )}

                {/* Modern Primary Submit Action */}
                <button
                  type="submit"
                  disabled={bookingLoading || durationExceedsMax || durationBelowMin}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    height: '50px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    gap: '0.5rem',
                    borderRadius: '12px',
                    boxShadow: durationExceedsMax || durationBelowMin ? 'none' : '0 4px 14px rgba(34, 197, 94, 0.35)',
                    opacity: durationExceedsMax || durationBelowMin ? 0.6 : 1,
                    cursor: durationExceedsMax || durationBelowMin ? 'not-allowed' : 'pointer',
                  }}
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

              {/* Trust Badge */}
              <div
                style={{
                  textAlign: 'center',
                  marginTop: '1.15rem',
                  fontSize: '0.75rem',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                }}
              >
                <ShieldCheck size={14} color="#16A34A" />
                <span>Protected by 5-Step Handover & Return Verification Protocol</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Delete Resource Confirmation Modal */}
      {showDeleteModal && (
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
                  Permanently remove mistakenly created resource
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Are you sure you want to permanently delete <strong>{resource.name}</strong>? This will remove this resource from AccessLoop, exploration catalogs, and inventory schedules.
            </p>

            {deleteError && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  color: '#B91C1C',
                  fontSize: '0.825rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0 }} />
                <span>{deleteError}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => {
                  setShowDeleteModal(false);
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
                onClick={handleDeleteResource}
                className="btn btn-primary"
                style={{
                  backgroundColor: '#DC2626',
                  borderColor: '#DC2626',
                  color: '#FFFFFF',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: deleteLoading ? 'not-allowed' : 'pointer',
                }}
              >
                <Trash2 size={16} />
                <span>{deleteLoading ? 'Deleting...' : 'Yes, Delete Resource'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceDetailsPage;
