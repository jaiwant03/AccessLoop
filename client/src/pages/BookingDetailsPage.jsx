import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Upload,
  Camera,
  X,
  FileText,
  AlertCircle,
  CheckCircle2,
  Repeat,
  ArrowLeft,
  User,
  Package,
  Users,
  Award,
  ExternalLink,
} from 'lucide-react';
import api, { resolveImageUrl, DEFAULT_AVATAR } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import UserAvatar from '../components/UserAvatar';

const STEPS = [
  'Requested',
  'Approved',
  'Checked-In',
  'Active',
  'Return Pending',
  'Completed',
];

const BookingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookingUpdate } = useSocket();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Modals state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInNotes, setCheckInNotes] = useState('Equipment inspected upon collection. Pristine condition.');
  const [checkInPhotoUrl, setCheckInPhotoUrl] = useState('');
  const [checkInFile, setCheckInFile] = useState(null);

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnNotes, setReturnNotes] = useState('Resource returned in complete working order with accessories.');
  const [returnPhotoUrl, setReturnPhotoUrl] = useState('');
  const [returnFile, setReturnFile] = useState(null);

  const [showInspectModal, setShowInspectModal] = useState(false);
  const [inspectionNotes, setInspectionNotes] = useState('All components verified intact. Lens clean. Battery charged.');
  const [damageDetected, setDamageDetected] = useState(false);

  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentCategory, setIncidentCategory] = useState('physical_damage');
  const [incidentDesc, setIncidentDesc] = useState('');

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data.booking);
    } catch (err) {
      console.error('Error fetching booking:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  useEffect(() => {
    if (bookingUpdate && bookingUpdate._id === id) {
      setBooking(bookingUpdate);
    }
  }, [bookingUpdate, id]);

  if (loading) {
    return (
      <div className="main-content">
        <div className="app-container" style={{ textAlign: 'center', padding: '5rem 0' }}>
          <div className="badge badge-green" style={{ padding: '0.5rem 1rem' }}>
            Loading transaction lifecycle...
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="main-content">
        <div className="app-container" style={{ textAlign: 'center', padding: '5rem 0' }}>
          <h2>Reservation record not found</h2>
          <Link to="/explore" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Explore Resources
          </Link>
        </div>
      </div>
    );
  }

  const currentUserId = (user?._id || user?.id)?.toString();
  const borrowerId = (booking.borrower?._id || booking.borrower)?.toString();
  const ownerId = (booking.owner?._id || booking.owner)?.toString();
  const isBorrower = Boolean(currentUserId && borrowerId === currentUserId);
  const isOwner = Boolean(currentUserId && ownerId === currentUserId);
  const isStaff = ['admin', 'manager'].includes(user?.role);

  // Stepper Calculation
  let activeStepIndex = 0;
  if (booking.status === 'Pending') {
    activeStepIndex = 0;
  } else if (booking.status === 'Approved') {
    if (booking.checkIn?.checkedInAt && !booking.checkIn?.verifiedByOwner) {
      activeStepIndex = 2; // Step 3: Checked-In (Awaiting Handover Confirmation)
    } else {
      activeStepIndex = 1; // Step 2: Approved (Awaiting Borrower Check-in)
    }
  } else if (booking.status === 'Active') {
    activeStepIndex = 3; // Step 4: Active
  } else if (booking.status === 'Return Pending') {
    activeStepIndex = 4; // Step 5: Return Pending
  } else if (booking.status === 'Completed') {
    activeStepIndex = 6; // All 6 steps completed!
  }

  const handleStepClick = (stepIndex) => {
    if (stepIndex === 1 && booking.status === 'Pending') {
      handleReview('approve');
    } else if (stepIndex === 2 && booking.status === 'Approved' && !booking.checkIn?.checkedInAt) {
      setShowCheckInModal(true);
    } else if (stepIndex === 3 && booking.status === 'Approved' && booking.checkIn?.checkedInAt) {
      handleVerifyHandover();
    } else if (stepIndex === 4 && (booking.status === 'Active' || booking.status === 'Overdue')) {
      setShowReturnModal(true);
    } else if (stepIndex === 5 && booking.status === 'Return Pending') {
      setShowInspectModal(true);
    }
  };

  // Actions
  const handleReview = async (action) => {
    setActionLoading(true);
    setActionError('');
    try {
      await api.put(`/bookings/${booking._id}/review`, {
        action,
        rejectionReason: action === 'reject' ? rejectionReason : undefined,
      });
      setShowRejectModal(false);
      setActionSuccess(`Booking request successfully ${action}d!`);
      await fetchBooking();
    } catch (err) {
      setActionError(err.response?.data?.message || `Failed to ${action} booking.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError('');
    try {
      if (checkInFile) {
        const formData = new FormData();
        formData.append('borrowerNotes', checkInNotes);
        formData.append('photos', checkInFile);
        await api.post(`/check-in-out/${booking._id}/check-in`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post(`/check-in-out/${booking._id}/check-in`, {
          borrowerNotes: checkInNotes,
          initialPhotos: [checkInPhotoUrl],
        });
      }
      setShowCheckInModal(false);
      setActionSuccess('Check-in details submitted! Awaiting owner handover confirmation.');
      await fetchBooking();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to submit check-in.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyHandover = async () => {
    setActionLoading(true);
    setActionError('');
    try {
      await api.post(`/check-in-out/${booking._id}/verify-handover`, {
        ownerNotes: 'Handover verified and physical condition approved.',
      });
      setActionSuccess('Handover verified! Booking is now Active.');
      await fetchBooking();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to verify handover.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError('');
    try {
      if (returnFile) {
        const formData = new FormData();
        formData.append('borrowerNotes', returnNotes);
        formData.append('photos', returnFile);
        await api.post(`/check-in-out/${booking._id}/request-return`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post(`/check-in-out/${booking._id}/request-return`, {
          borrowerNotes: returnNotes,
          returnPhotos: [returnPhotoUrl],
        });
      }
      setShowReturnModal(false);
      setActionSuccess('Return request submitted! Awaiting custodian inspection.');
      await fetchBooking();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to request return.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyReturn = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError('');
    try {
      await api.post(`/check-in-out/${booking._id}/verify-return`, {
        ownerInspectionNotes: inspectionNotes,
        damageDetected,
        conditionStatus: damageDetected ? 'Damage Reported' : 'Intact & Clean',
      });
      setShowInspectModal(false);
      setActionSuccess('Return inspection confirmed! Booking marked Completed.');
      await fetchBooking();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to complete return inspection.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReportIncident = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/incidents', {
        category: incidentCategory,
        resourceId: booking.resource._id,
        bookingId: booking._id,
        description: incidentDesc,
        evidenceImages: [
          booking.checkOut?.returnPhotos?.[0] ||
            booking.checkIn?.initialPhotos?.[0] ||
            '',
        ].filter(Boolean),
      });
      setShowIncidentModal(false);
      setActionSuccess('Incident report filed. Staff will investigate with human oversight.');
      await fetchBooking();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to file incident.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="app-container" style={{ maxWidth: '960px' }}>
        {/* Navigation & Status Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Booking Ref:</span>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#17231C' }}>
              {booking.bookingNumber}
            </span>
            <span
              className={`badge ${
                booking.status === 'Completed'
                  ? 'badge-green'
                  : booking.status === 'Active'
                  ? 'badge-blue'
                  : booking.status === 'Approved'
                  ? 'badge-green'
                  : booking.status === 'Rejected'
                  ? 'badge-red'
                  : 'badge-amber'
              }`}
            >
              {booking.status}
            </span>
          </div>
        </div>

        {/* Action Alerts */}
        {actionSuccess && (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#F0FDF4',
              color: '#15803D',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
            }}
          >
            {actionSuccess}
          </div>
        )}

        {actionError && (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#FEE2E2',
              color: '#B91C1C',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
            }}
          >
            {actionError}
          </div>
        )}

        {/* Unified Hero Lifecycle Card */}
        <div
          className="al-card"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
            padding: 0,
            marginBottom: '2rem',
            overflow: 'hidden',
          }}
        >
          {/* Top Section: Stage Headline & Action CTAs */}
          <div
            style={{
              padding: '1.5rem 1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem',
              borderLeft: `5px solid ${
                booking.status === 'Completed' || booking.status === 'Active' || booking.status === 'Approved'
                  ? '#16A34A'
                  : booking.status === 'Rejected'
                  ? '#EF4444'
                  : '#F59E0B'
              }`,
              backgroundColor: '#FFFFFF',
            }}
          >
            <div style={{ flex: '1 1 320px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <span
                  className={`badge ${
                    booking.status === 'Completed'
                      ? 'badge-green'
                      : booking.status === 'Active'
                      ? 'badge-blue'
                      : booking.status === 'Approved'
                      ? 'badge-green'
                      : booking.status === 'Rejected'
                      ? 'badge-red'
                      : 'badge-amber'
                  }`}
                  style={{ fontSize: '0.725rem', padding: '0.2rem 0.65rem', fontWeight: 700 }}
                >
                  {booking.status === 'Approved' && booking.checkIn?.checkedInAt && !booking.checkIn?.verifiedByOwner
                    ? 'Stage 3 of 6 • Checked-In'
                    : `Stage ${activeStepIndex < 6 ? activeStepIndex + 1 : 6} of 6 • ${booking.status}`}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                  {booking.status === 'Completed' && 'All checkpoints verified'}
                  {booking.status === 'Active' && 'Session in progress'}
                  {booking.status === 'Pending' && 'Awaiting custodian action'}
                  {booking.status === 'Approved' && !booking.checkIn?.checkedInAt && 'Action required from borrower'}
                  {booking.status === 'Approved' && booking.checkIn?.checkedInAt && !booking.checkIn?.verifiedByOwner && 'Action required from custodian'}
                  {booking.status === 'Return Pending' && 'Inspection required from custodian'}
                </span>
              </div>

              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {booking.status === 'Pending' && 'Custodian Review Pending'}
                {booking.status === 'Approved' && !booking.checkIn?.checkedInAt && 'Approved • Pre-Use Check-In Required'}
                {booking.status === 'Approved' && booking.checkIn?.checkedInAt && !booking.checkIn?.verifiedByOwner && 'Photos Uploaded • Confirm Physical Handover'}
                {booking.status === 'Active' && 'Session Active • In Possession of Borrower'}
                {booking.status === 'Return Pending' && 'Return Documentation Submitted • Inspection Required'}
                {booking.status === 'Completed' && 'Session Fully Completed & Verified'}
                {booking.status === 'Rejected' && `Request Rejected: ${booking.rejectionReason}`}
              </h2>

              <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.35rem 0 0 0', lineHeight: 1.5 }}>
                {booking.status === 'Pending' && 'Custodian review is currently underway. Check back or approve below.'}
                {booking.status === 'Approved' && !booking.checkIn?.checkedInAt && 'The request was approved. Borrower must upload pre-use condition documentation before handover.'}
                {booking.status === 'Approved' && booking.checkIn?.checkedInAt && !booking.checkIn?.verifiedByOwner && 'Pre-use check-in photos have been documented. Confirm physical handover to activate this session.'}
                {booking.status === 'Active' && 'Equipment is actively in use. When finished, submit return photos to initiate inspection and return.'}
                {booking.status === 'Return Pending' && 'Borrower returned equipment with condition photos. Custodian inspection is required to finalize.'}
                {booking.status === 'Completed' && 'Physical handover and return condition inspections are completed. Full immutable audit trail archived.'}
              </p>
            </div>

            {/* Action Trigger Buttons */}
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Step 2: Owner/Staff Approves Pending */}
              {booking.status === 'Pending' && (
                <>
                  <button
                    onClick={() => handleReview('approve')}
                    disabled={actionLoading}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '0.4rem', fontWeight: 600 }}
                  >
                    <CheckCircle size={15} />
                    <span>Approve Request</span>
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="btn btn-danger btn-sm"
                    style={{ fontWeight: 600 }}
                  >
                    <span>Reject...</span>
                  </button>
                </>
              )}

              {/* Step 3: Check-In Photos */}
              {booking.status === 'Approved' && !booking.checkIn?.checkedInAt && (
                <button
                  onClick={() => setShowCheckInModal(true)}
                  disabled={actionLoading}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.65rem 1.25rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(34, 197, 94, 0.35)',
                  }}
                >
                  <Camera size={16} />
                  <span>Complete Check-In & Photos</span>
                </button>
              )}

              {/* Step 4: Handover Verification */}
              {booking.status === 'Approved' && booking.checkIn?.checkedInAt && (
                <button
                  onClick={handleVerifyHandover}
                  disabled={actionLoading}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.65rem 1.25rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(34, 197, 94, 0.35)',
                  }}
                >
                  <CheckCircle size={16} />
                  <span>Confirm Handover & Activate Session</span>
                </button>
              )}

              {/* Step 5: Request Return */}
              {(booking.status === 'Active' || booking.status === 'Overdue') && (
                <button
                  onClick={() => setShowReturnModal(true)}
                  disabled={actionLoading}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.65rem 1.25rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(34, 197, 94, 0.35)',
                  }}
                >
                  <Repeat size={16} />
                  <span>Request Return & Submit Photos</span>
                </button>
              )}

              {/* Step 6: Return Inspection */}
              {booking.status === 'Return Pending' && (
                <button
                  onClick={() => setShowInspectModal(true)}
                  disabled={actionLoading}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.65rem 1.25rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(34, 197, 94, 0.35)',
                  }}
                >
                  <ShieldCheck size={16} />
                  <span>Inspect Return & Complete Session</span>
                </button>
              )}

              {/* Incident Filing */}
              <button
                onClick={() => setShowIncidentModal(true)}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 0.95rem',
                  fontWeight: 600,
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <AlertTriangle size={15} color="#D97706" />
                <span>Report Issue</span>
              </button>
            </div>
          </div>

          {/* Bottom Section: Connected Horizontal Progress Stepper */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              padding: '1.5rem 1.75rem 1.75rem',
              overflowX: 'auto',
            }}
          >
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                minWidth: '580px',
              }}
            >
              {/* Background gray connecting line */}
              <div
                style={{
                  position: 'absolute',
                  top: '19px',
                  left: '35px',
                  right: '35px',
                  height: '3px',
                  backgroundColor: '#E2E8F0',
                  zIndex: 0,
                  borderRadius: '2px',
                }}
              />
              {/* Active green progress connecting line */}
              <div
                style={{
                  position: 'absolute',
                  top: '19px',
                  left: '35px',
                  width: `calc(${Math.min(100, Math.max(0, (Math.min(activeStepIndex, STEPS.length - 1) / (STEPS.length - 1)) * 100))}% - 70px)`,
                  height: '3px',
                  backgroundColor: '#16A34A',
                  zIndex: 0,
                  borderRadius: '2px',
                  transition: 'width 0.4s ease',
                }}
              />

              {STEPS.map((step, idx) => {
                const isCompleted = idx < activeStepIndex;
                const isActive = idx === activeStepIndex;
                const isClickable =
                  (idx === 1 && booking.status === 'Pending') ||
                  (idx === 2 && booking.status === 'Approved' && !booking.checkIn?.checkedInAt) ||
                  (idx === 3 && booking.status === 'Approved' && booking.checkIn?.checkedInAt) ||
                  (idx === 4 && (booking.status === 'Active' || booking.status === 'Overdue')) ||
                  (idx === 5 && booking.status === 'Return Pending');

                return (
                  <div
                    key={idx}
                    onClick={() => handleStepClick(idx)}
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '15%',
                      minWidth: '75px',
                      cursor: isClickable ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                    title={isClickable ? `Click to advance: ${step}` : step}
                  >
                    {/* Circle Node */}
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        backgroundColor: isCompleted ? '#16A34A' : isActive ? '#22C55E' : '#FFFFFF',
                        color: isCompleted || isActive ? '#FFFFFF' : '#94A3B8',
                        border: isCompleted
                          ? '2px solid #16A34A'
                          : isActive
                          ? '2px solid #22C55E'
                          : '2px solid #CBD5E1',
                        boxShadow: isActive
                          ? '0 0 0 4px rgba(34, 197, 94, 0.25)'
                          : isCompleted
                          ? '0 2px 6px rgba(22, 163, 74, 0.2)'
                          : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {isCompleted ? <CheckCircle2 size={18} color="#FFFFFF" strokeWidth={2.5} /> : idx + 1}
                    </div>

                    {/* Step Label */}
                    <div style={{ marginTop: '0.6rem', textAlign: 'center' }}>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: isActive ? 700 : isCompleted ? 600 : 500,
                          color: isActive ? '#0F172A' : isCompleted ? '#16A34A' : '#64748B',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {step}
                      </div>
                      {isActive && (
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: '2px',
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            color: '#16A34A',
                            backgroundColor: '#DCFCE7',
                            padding: '1px 6px',
                            borderRadius: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Booking Details Grid */}
        <div className="responsive-booking-grid">
          {/* Left Column: Resource & Condition Documentation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Resource Information Card */}
            <div
              className="al-card"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '1.5rem',
                boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#ECFDF5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Package size={17} color="#16A34A" />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Resource Information
                  </h3>
                </div>
                <span className="badge badge-gray" style={{ fontSize: '0.72rem', letterSpacing: '0.02em' }}>
                  Asset ID: {booking.resource?._id?.slice(-6).toUpperCase() || 'ITEM'}
                </span>
              </div>

              {/* Asset Snapshot Row */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                {resolveImageUrl(booking.resource?.images?.[0]) ? (
                  <img
                    src={resolveImageUrl(booking.resource?.images?.[0])}
                    alt={booking.resource?.name || 'Resource'}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                    style={{
                      width: '92px',
                      height: '74px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                      border: '1px solid #E2E8F0',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '92px',
                      height: '74px',
                      borderRadius: '10px',
                      backgroundColor: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94A3B8',
                      flexShrink: 0,
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <Camera size={24} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.35rem 0' }}>
                    {booking.resource?.name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                    <span className="badge badge-gray" style={{ fontSize: '0.72rem' }}>
                      {booking.resource?.category}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={13} color="#94A3B8" />
                      {booking.resource?.location}
                    </span>
                  </div>
                  <Link
                    to={`/resources/${booking.resource?._id}`}
                    style={{
                      fontSize: '0.775rem',
                      color: '#16A34A',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      textDecoration: 'none',
                    }}
                  >
                    <span>View Resource Page</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>

              {/* Schedule Details Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                    <Calendar size={13} color="#16A34A" />
                    <span>Scheduled Start</span>
                  </div>
                  <strong style={{ fontSize: '0.84rem', color: '#0F172A' }}>
                    {new Date(booking.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </strong>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                    <Clock size={13} color="#16A34A" />
                    <span>Scheduled End</span>
                  </div>
                  <strong style={{ fontSize: '0.84rem', color: '#0F172A' }}>
                    {new Date(booking.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </strong>
                </div>
              </div>

              {/* Purpose Callout Box */}
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                  Stated Purpose of Use
                </div>
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderLeft: '3px solid #22C55E',
                    padding: '0.75rem 1rem',
                    borderRadius: '0 8px 8px 0',
                    fontSize: '0.85rem',
                    color: '#334155',
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                  }}
                >
                  "{booking.purpose}"
                </div>
              </div>
            </div>

            {/* Condition Documentation Photos: Check-in vs Return */}
            <div
              className="al-card"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '1.5rem',
                boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#ECFDF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldCheck size={17} color="#16A34A" />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Condition Documentation & Verification Proof
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 1.25rem 0', lineHeight: 1.4 }}>
                Tamper-resistant visual proof captured during handover and return sign-off.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* 1. Initial Check-In Photos */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#0F172A' }}>
                      1. Check-In Condition
                    </span>
                    <span
                      className={`badge ${booking.checkIn?.checkedInAt ? 'badge-green' : 'badge-gray'}`}
                      style={{ fontSize: '0.65rem', padding: '1px 6px' }}
                    >
                      {booking.checkIn?.checkedInAt ? '✓ Uploaded' : 'Pending'}
                    </span>
                  </div>

                  {booking.checkIn?.initialPhotos && booking.checkIn.initialPhotos.length > 0 ? (
                    <div>
                      <img
                        src={resolveImageUrl(booking.checkIn.initialPhotos[0])}
                        alt="Initial Condition"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                        style={{
                          width: '100%',
                          height: '140px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          marginBottom: '0.6rem',
                        }}
                      />
                      <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.4, fontStyle: 'italic', marginBottom: '0.4rem' }}>
                        "{booking.checkIn.borrowerNotes}"
                      </div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: booking.checkIn.verifiedByOwner ? '#16A34A' : '#D97706',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        {booking.checkIn.verifiedByOwner ? <CheckCircle size={13} /> : <Clock size={13} />}
                        <span>Handover: {booking.checkIn.verifiedByOwner ? 'Verified by Custodian' : 'Awaiting sign-off'}</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem 1rem',
                        textAlign: 'center',
                        color: '#94A3B8',
                      }}
                    >
                      <Camera size={26} strokeWidth={1.5} style={{ marginBottom: '0.4rem', opacity: 0.7 }} />
                      <span style={{ fontSize: '0.78rem' }}>No check-in photo recorded</span>
                    </div>
                  )}
                </div>

                {/* 2. Final Return Photos */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#0F172A' }}>
                      2. Return Condition
                    </span>
                    <span
                      className={`badge ${
                        booking.status === 'Completed'
                          ? 'badge-green'
                          : booking.status === 'Return Pending'
                          ? 'badge-amber'
                          : 'badge-gray'
                      }`}
                      style={{ fontSize: '0.65rem', padding: '1px 6px' }}
                    >
                      {booking.status === 'Completed'
                        ? '✓ Verified'
                        : booking.status === 'Return Pending'
                        ? 'Submitted'
                        : 'Pending'}
                    </span>
                  </div>

                  {booking.checkOut?.returnPhotos && booking.checkOut.returnPhotos.length > 0 ? (
                    <div>
                      <img
                        src={resolveImageUrl(booking.checkOut.returnPhotos[0])}
                        alt="Return Condition"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                        style={{
                          width: '100%',
                          height: '140px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          marginBottom: '0.6rem',
                        }}
                      />
                      <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.4, fontStyle: 'italic', marginBottom: '0.4rem' }}>
                        "{booking.checkOut.borrowerNotes}"
                      </div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: '#16A34A',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <ShieldCheck size={13} />
                        <span>Inspection: {booking.checkOut.conditionStatus || 'Completed'}</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem 1rem',
                        textAlign: 'center',
                        color: '#94A3B8',
                      }}
                    >
                      <Clock size={26} strokeWidth={1.5} style={{ marginBottom: '0.4rem', opacity: 0.7 }} />
                      <span style={{ fontSize: '0.78rem' }}>Return documentation pending</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stakeholders & Audit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Parties Involved Card */}
            <div
              className="al-card"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '1.5rem',
                boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#ECFDF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Users size={17} color="#16A34A" />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Parties Involved
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {/* Borrower */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <UserAvatar
                    src={booking.borrower?.avatar}
                    name={booking.borrower?.name}
                    size={44}
                    border="2px solid #22C55E"
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Borrower
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {booking.borrower?.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '1px' }}>
                      {booking.borrower?.department} • ID: {booking.borrower?.studentOrEmployeeId || 'STU-VERIFIED'}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />

                {/* Custodian / Owner */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <UserAvatar
                    src={booking.owner?.avatar}
                    name={booking.owner?.name}
                    size={44}
                    border="2px solid #CBD5E1"
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Custodian / Asset Owner
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {booking.owner?.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '1px' }}>
                      {booking.owner?.department || 'Resource Custodian'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fair Allocation Standing Card */}
            <div
              className="al-card"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '1.5rem',
                boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#ECFDF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Award size={17} color="#16A34A" />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Fair Allocation Audit Snapshot
                </h3>
              </div>

              {/* Score Metric Tile */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                    Score at Reservation
                  </span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#16A34A' }}>
                    {booking.fairAllocationScoreAtBooking || 100}/100
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#64748B' }}>Verified Campus Standing</span>
                  <span className="badge badge-green" style={{ fontSize: '0.68rem', padding: '2px 7px' }}>
                    {booking.eligibilitySnapshot?.isVerified ? 'Campus Verified' : 'Good Standing'}
                  </span>
                </div>
              </div>

              {/* Audit Compliance Check */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '0.785rem',
                  color: '#15803D',
                  backgroundColor: '#F0FDF4',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #DCFCE7',
                  lineHeight: 1.45,
                }}
              >
                <CheckCircle2 size={16} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Transparent community fair share rules verified. No consecutive reservation breach detected.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= MODALS ================= */}

        {/* Check-In Modal */}
        {showCheckInModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 style={{ fontSize: '1.15rem' }}>Step 3: Document Check-In Condition</h3>
                <button onClick={() => setShowCheckInModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCheckInSubmit}>
                <div className="modal-body">
                  <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
                    Document the physical state and all packaged accessories before collecting the asset.
                  </p>

                  <div className="form-group">
                    <label className="form-label">Upload Photo File (or provide URL below)</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-input"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setCheckInFile(e.target.files[0]);
                        }
                      }}
                      style={{ marginBottom: '0.5rem' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Or enter image URL https://..."
                      value={checkInPhotoUrl}
                      onChange={(e) => {
                        setCheckInPhotoUrl(e.target.value);
                        setCheckInFile(null);
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Condition Notes upon Handover</label>
                    <textarea
                      rows={3}
                      className="form-textarea"
                      value={checkInNotes}
                      onChange={(e) => setCheckInNotes(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowCheckInModal(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={actionLoading} className="btn btn-primary btn-sm">
                    {actionLoading ? 'Submitting...' : 'Confirm Check-In Handover'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Return Modal */}
        {showReturnModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 style={{ fontSize: '1.15rem' }}>Step 5: Request Return Verification</h3>
                <button onClick={() => setShowReturnModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleReturnSubmit}>
                <div className="modal-body">
                  <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
                    Upload final condition photographs to verify the equipment is returned intact and clean.
                  </p>

                  <div className="form-group">
                    <label className="form-label">Upload Return Photo File (or provide URL below)</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-input"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setReturnFile(e.target.files[0]);
                        }
                      }}
                      style={{ marginBottom: '0.5rem' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Or enter image URL https://..."
                      value={returnPhotoUrl}
                      onChange={(e) => {
                        setReturnPhotoUrl(e.target.value);
                        setReturnFile(null);
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Operational Notes & Cleanliness</label>
                    <textarea
                      rows={3}
                      className="form-textarea"
                      value={returnNotes}
                      onChange={(e) => setReturnNotes(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowReturnModal(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={actionLoading} className="btn btn-primary btn-sm">
                    {actionLoading ? 'Submitting...' : 'Submit Return Documentation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Owner Inspect & Complete Return Modal */}
        {showInspectModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 style={{ fontSize: '1.15rem' }}>Owner Inspection & Booking Sign-Off</h3>
                <button onClick={() => setShowInspectModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleVerifyReturn}>
                <div className="modal-body">
                  <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
                    Inspect returned item against check-in condition documentation before confirming completion.
                  </p>

                  <div className="form-group">
                    <label className="form-label">Owner Inspection Details</label>
                    <textarea
                      rows={3}
                      className="form-textarea"
                      value={inspectionNotes}
                      onChange={(e) => setInspectionNotes(e.target.value)}
                      required
                    />
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', color: '#B91C1C' }}>
                    <input
                      type="checkbox"
                      checked={damageDetected}
                      onChange={(e) => setDamageDetected(e.target.checked)}
                    />
                    <span>Flag Damage or Missing Parts (Triggers Incident Review)</span>
                  </label>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowInspectModal(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={actionLoading} className="btn btn-primary btn-sm">
                    {actionLoading ? 'Processing...' : 'Complete & Close Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 style={{ fontSize: '1.15rem' }}>Reject Booking Request</h3>
                <button onClick={() => setShowRejectModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
                  Transparency is mandatory on AccessLoop. Please provide a factual explanation for the borrower.
                </p>
                <div className="form-group">
                  <label className="form-label">Reason for Rejection *</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    placeholder="e.g. Scheduled maintenance window, safety certificate missing, or conflicting lab priority..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowRejectModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button
                  onClick={() => handleReview('reject')}
                  disabled={!rejectionReason.trim() || actionLoading}
                  className="btn btn-danger btn-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report Incident Modal */}
        {showIncidentModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 style={{ fontSize: '1.15rem' }}>Report Incident or Damage</h3>
                <button onClick={() => setShowIncidentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleReportIncident}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={incidentCategory}
                      onChange={(e) => setIncidentCategory(e.target.value)}
                    >
                      <option value="physical_damage">Physical Damage</option>
                      <option value="missing_components">Missing Components / Cables</option>
                      <option value="late_return">Late Return</option>
                      <option value="equipment_malfunction">Equipment Malfunction</option>
                      <option value="safety_incident">Safety Incident</option>
                      <option value="misuse">Protocol Misuse</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Factual Description</label>
                    <textarea
                      rows={4}
                      className="form-textarea"
                      placeholder="Detail what happened, when it occurred, and current operational status..."
                      value={incidentDesc}
                      onChange={(e) => setIncidentDesc(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowIncidentModal(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={actionLoading || !incidentDesc.trim()} className="btn btn-danger btn-sm">
                    Submit Incident Report
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

export default BookingDetailsPage;
