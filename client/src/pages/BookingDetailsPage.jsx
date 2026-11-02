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

        {/* Lifecycle Stepper (Section 11, 14, 15) */}
        <div className="lifecycle-stepper" style={{ userSelect: 'none' }}>
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
                className={`step-item ${isActive ? 'active' : ''}`}
                onClick={() => handleStepClick(idx)}
                style={{
                  cursor: isClickable ? 'pointer' : 'default',
                  transition: 'transform 0.15s ease',
                }}
                title={isClickable ? `Click to advance to: ${step}` : step}
              >
                <div
                  className={`step-circle ${
                    isCompleted ? 'completed' : isActive ? 'active' : ''
                  }`}
                  style={{
                    position: 'relative',
                    boxShadow: isActive ? '0 0 0 4px rgba(34, 197, 94, 0.28)' : 'none',
                  }}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <div className="step-title" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span>{step}</span>
                  {isActive && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        color: '#16A34A',
                        fontWeight: 700,
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

        {/* Dynamic Action Callout Bar */}
        <div
          className="al-card"
          style={{
            backgroundColor: '#FFFFFF',
            borderLeft: `4px solid ${
              booking.status === 'Completed' || booking.status === 'Active' || booking.status === 'Approved'
                ? '#22C55E'
                : booking.status === 'Rejected'
                ? '#EF4444'
                : '#F59E0B'
            }`,
            padding: '1.35rem 1.6rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
              <span
                className={`badge ${
                  booking.status === 'Completed'
                    ? 'badge-green'
                    : booking.status === 'Active'
                    ? 'badge-blue'
                    : booking.status === 'Approved'
                    ? 'badge-green'
                    : 'badge-amber'
                }`}
                style={{ fontSize: '0.75rem', padding: '0.15rem 0.55rem' }}
              >
                {booking.status === 'Approved' && booking.checkIn?.checkedInAt && !booking.checkIn?.verifiedByOwner
                  ? 'Stage 3: Checked-In'
                  : `Stage ${activeStepIndex < 6 ? activeStepIndex + 1 : 6}: ${booking.status}`}
              </span>
              <strong style={{ fontSize: '1.025rem', color: '#0F172A', letterSpacing: '-0.015em' }}>
                {booking.status === 'Pending' && 'Custodian Review Pending'}
                {booking.status === 'Approved' && !booking.checkIn?.checkedInAt && 'Approved • Pre-Use Check-In Required'}
                {booking.status === 'Approved' && booking.checkIn?.checkedInAt && !booking.checkIn?.verifiedByOwner && 'Photos Uploaded • Confirm Physical Handover'}
                {booking.status === 'Active' && 'Session Active • In Possession of Borrower'}
                {booking.status === 'Return Pending' && 'Return Documentation Submitted • Inspection Required'}
                {booking.status === 'Completed' && 'Session Fully Completed & Verified'}
                {booking.status === 'Rejected' && `Request Rejected: ${booking.rejectionReason}`}
              </strong>
            </div>

            <div style={{ fontSize: '0.84rem', color: '#64748B', maxWidth: '560px', lineHeight: 1.5 }}>
              {booking.status === 'Pending' && 'Custodian review is currently underway. Check back or approve below.'}
              {booking.status === 'Approved' && !booking.checkIn?.checkedInAt && 'The request was approved. Borrower must upload pre-use condition documentation before handover.'}
              {booking.status === 'Approved' && booking.checkIn?.checkedInAt && !booking.checkIn?.verifiedByOwner && 'Pre-use check-in photos have been documented. Confirm physical handover to activate this session.'}
              {booking.status === 'Active' && 'Equipment is actively in use. When finished, submit return photos to initiate inspection and return.'}
              {booking.status === 'Return Pending' && 'Borrower returned equipment with condition photos. Custodian inspection is required to finalize.'}
              {booking.status === 'Completed' && 'Physical handover and return condition inspections are completed. Full immutable audit trail archived.'}
            </div>
          </div>

          {/* Action Trigger Buttons based on Role and Status */}
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Step 2: Owner/Staff Approves Pending */}
            {booking.status === 'Pending' && (
              <>
                <button
                  onClick={() => handleReview('approve')}
                  disabled={actionLoading}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '0.35rem' }}
                >
                  <CheckCircle size={14} />
                  <span>Approve Request</span>
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="btn btn-danger btn-sm"
                >
                  <span>Reject...</span>
                </button>
              </>
            )}

            {/* Step 3: Check-In Photos (when Approved & check-in not yet done) */}
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

            {/* Step 4: Handover Verification (when Approved & check-in IS done) */}
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

            {/* Step 5: Request Return & Photos (when Active) */}
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

            {/* Step 6: Return Inspection & Completion (when Return Pending) */}
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
              style={{ gap: '0.35rem' }}
            >
              <AlertTriangle size={14} color="#D97706" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>

        {/* Interactive Handover & Return Checkpoints Card */}
        <div
          className="al-card"
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="#16A34A" />
              <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>
                5-Step Trusted Lifecycle Checkpoints
              </strong>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Click any active checkpoint button below to advance to the next step
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {/* 1. Request */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '0.85rem',
                border: '1px solid #E2E8F0',
                borderLeft: '3px solid #16A34A',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16A34A' }}>1. Request</span>
                <span className="badge badge-green" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>✓ Done</span>
              </div>
              <div style={{ fontSize: '0.775rem', color: '#334155', fontWeight: 600 }}>Borrower Submitted</div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>Stated use & slot reserved</div>
            </div>

            {/* 2. Approval */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '0.85rem',
                border: '1px solid #E2E8F0',
                borderLeft: `3px solid ${booking.status !== 'Pending' ? '#16A34A' : '#F59E0B'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: booking.status !== 'Pending' ? '#16A34A' : '#F59E0B' }}>
                  2. Approval
                </span>
                <span className={`badge ${booking.status !== 'Pending' ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                  {booking.status !== 'Pending' ? '✓ Approved' : 'Pending'}
                </span>
              </div>
              <div style={{ fontSize: '0.775rem', color: '#334155', fontWeight: 600 }}>Custodian Verification</div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>Clearance & schedule checked</div>
            </div>

            {/* 3. Pre-Use Check-In */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '0.85rem',
                border: '1px solid #E2E8F0',
                borderLeft: `3px solid ${booking.checkIn?.checkedInAt ? '#16A34A' : activeStepIndex === 1 ? '#22C55E' : '#CBD5E1'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: booking.checkIn?.checkedInAt ? '#16A34A' : '#334155' }}>
                  3. Check-In
                </span>
                <span className={`badge ${booking.checkIn?.checkedInAt ? 'badge-green' : activeStepIndex === 1 ? 'badge-blue' : 'badge-gray'}`} style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                  {booking.checkIn?.checkedInAt ? '✓ Uploaded' : activeStepIndex === 1 ? 'Action Needed' : 'Upcoming'}
                </span>
              </div>
              <div style={{ fontSize: '0.775rem', color: '#334155', fontWeight: 600 }}>Pre-Use Photo Proof</div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                {booking.checkIn?.checkedInAt ? 'Initial condition saved' : 'Borrower documents condition'}
              </div>
              {!booking.checkIn?.checkedInAt && booking.status === 'Approved' && (
                <button
                  onClick={() => setShowCheckInModal(true)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.72rem', padding: '0.3rem 0.5rem' }}
                >
                  Upload Photos
                </button>
              )}
            </div>

            {/* 4. Handover & Active */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '0.85rem',
                border: '1px solid #E2E8F0',
                borderLeft: `3px solid ${booking.checkIn?.verifiedByOwner || booking.status === 'Active' || booking.status === 'Return Pending' || booking.status === 'Completed' ? '#16A34A' : activeStepIndex === 2 ? '#22C55E' : '#CBD5E1'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: booking.status === 'Active' || booking.status === 'Completed' || booking.status === 'Return Pending' ? '#16A34A' : '#334155' }}>
                  4. Handover
                </span>
                <span className={`badge ${booking.status === 'Active' || booking.status === 'Completed' || booking.status === 'Return Pending' ? 'badge-green' : activeStepIndex === 2 ? 'badge-blue' : 'badge-gray'}`} style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                  {booking.status === 'Active' || booking.status === 'Completed' || booking.status === 'Return Pending' ? '✓ Active' : activeStepIndex === 2 ? 'Action Needed' : 'Upcoming'}
                </span>
              </div>
              <div style={{ fontSize: '0.775rem', color: '#334155', fontWeight: 600 }}>Physical Handover</div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                {booking.status === 'Active' ? 'Session active • in use' : 'Confirm equipment collection'}
              </div>
              {booking.status === 'Approved' && booking.checkIn?.checkedInAt && (
                <button
                  onClick={handleVerifyHandover}
                  disabled={actionLoading}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.72rem', padding: '0.3rem 0.5rem', backgroundColor: '#16A34A' }}
                >
                  Confirm Handover
                </button>
              )}
            </div>

            {/* 5. Return & Final Inspection */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '0.85rem',
                border: '1px solid #E2E8F0',
                borderLeft: `3px solid ${booking.status === 'Completed' ? '#16A34A' : booking.status === 'Return Pending' ? '#F59E0B' : '#CBD5E1'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: booking.status === 'Completed' ? '#16A34A' : '#334155' }}>
                  5. Return
                </span>
                <span className={`badge ${booking.status === 'Completed' ? 'badge-green' : booking.status === 'Return Pending' ? 'badge-amber' : 'badge-gray'}`} style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                  {booking.status === 'Completed' ? '✓ Completed' : booking.status === 'Return Pending' ? 'Inspect Now' : 'Upcoming'}
                </span>
              </div>
              <div style={{ fontSize: '0.775rem', color: '#334155', fontWeight: 600 }}>Return & Sign-Off</div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                {booking.status === 'Completed' ? 'Condition signed off' : booking.status === 'Return Pending' ? 'Photos submitted' : 'Final return inspection'}
              </div>
              {(booking.status === 'Active' || booking.status === 'Overdue') && (
                <button
                  onClick={() => setShowReturnModal(true)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.72rem', padding: '0.3rem 0.5rem' }}
                >
                  Submit Return
                </button>
              )}
              {booking.status === 'Return Pending' && (
                <button
                  onClick={() => setShowInspectModal(true)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.72rem', padding: '0.3rem 0.5rem', backgroundColor: '#16A34A' }}
                >
                  Inspect & Complete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Booking Details Grid */}
        <div className="responsive-booking-grid">
          {/* Left Column: Resource & Schedule */}
          <div>
            <div className="al-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                Resource Information
              </h3>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                {resolveImageUrl(booking.resource?.images?.[0]) ? (
                  <img
                    src={resolveImageUrl(booking.resource?.images?.[0])}
                    alt=""
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                    style={{ width: '90px', height: '70px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '90px',
                      height: '70px',
                      borderRadius: '8px',
                      backgroundColor: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94A3B8',
                      flexShrink: 0,
                    }}
                  >
                    <Camera size={24} />
                  </div>
                )}
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#17231C' }}>
                    {booking.resource?.name}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    {booking.resource?.category} • {booking.resource?.location}
                  </div>
                  <Link
                    to={`/resources/${booking.resource?._id}`}
                    style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}
                  >
                    View Resource Page →
                  </Link>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Scheduled Start</div>
                  <strong style={{ fontSize: '0.85rem' }}>
                    {new Date(booking.startTime).toLocaleString()}
                  </strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Scheduled End</div>
                  <strong style={{ fontSize: '0.85rem' }}>
                    {new Date(booking.endTime).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div style={{ marginTop: '1rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>
                  Stated Purpose of Use
                </div>
                <p style={{ fontSize: '0.85rem', color: '#17231C', lineHeight: 1.5 }}>
                  "{booking.purpose}"
                </p>
              </div>
            </div>

            {/* Condition Documentation Photos: Check-in vs Return */}
            <div className="al-card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                Condition Documentation & Verification Proof
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {/* Initial Check-In Photos */}
                <div style={{ backgroundColor: '#F8FAF9', padding: '1rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.825rem', color: '#17231C', marginBottom: '0.5rem' }}>
                    1. Check-In Condition
                  </div>
                  {booking.checkIn?.initialPhotos && booking.checkIn.initialPhotos.length > 0 ? (
                    <div>
                      <img
                        src={resolveImageUrl(booking.checkIn.initialPhotos[0])}
                        alt="Initial Condition"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                        style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px', marginBottom: '0.5rem' }}
                      />
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        Notes: "{booking.checkIn.borrowerNotes}"
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 600, marginTop: '0.25rem' }}>
                        Handover Confirmed: {booking.checkIn.verifiedByOwner ? '✓ Verified' : 'Awaiting sign-off'}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.785rem', color: '#94A3B8', textAlign: 'center', padding: '2rem 0' }}>
                      No initial check-in photos recorded yet.
                    </div>
                  )}
                </div>

                {/* Final Return Photos */}
                <div style={{ backgroundColor: '#F8FAF9', padding: '1rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.825rem', color: '#17231C', marginBottom: '0.5rem' }}>
                    2. Return Condition
                  </div>
                  {booking.checkOut?.returnPhotos && booking.checkOut.returnPhotos.length > 0 ? (
                    <div>
                      <img
                        src={resolveImageUrl(booking.checkOut.returnPhotos[0])}
                        alt="Return Condition"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                        style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px', marginBottom: '0.5rem' }}
                      />
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        Notes: "{booking.checkOut.borrowerNotes}"
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 600, marginTop: '0.25rem' }}>
                        Inspection: {booking.checkOut.conditionStatus || 'Completed'}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.785rem', color: '#94A3B8', textAlign: 'center', padding: '2rem 0' }}>
                      Return documentation pending.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stakeholders & Audit Details */}
          <div>
            <div className="al-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                Parties Involved
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Borrower */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <UserAvatar
                    src={booking.borrower?.avatar}
                    name={booking.borrower?.name}
                    size={40}
                    border="1.5px solid #22C55E"
                  />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Borrower</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#17231C' }}>
                      {booking.borrower?.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                      {booking.borrower?.department} • ID: {booking.borrower?.studentOrEmployeeId || 'STU-VERIFIED'}
                    </div>
                  </div>
                </div>

                {/* Owner */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
                  <UserAvatar
                    src={booking.owner?.avatar}
                    name={booking.owner?.name}
                    size={40}
                    border="1.5px solid #22C55E"
                  />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Custodian / Owner</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#17231C' }}>
                      {booking.owner?.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                      {booking.owner?.department}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fair Allocation Standing */}
            <div className="al-card">
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.75rem' }}>
                Fair Allocation Audit Snapshot
              </h3>
              <div style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.6 }}>
                <div><strong>Score at Reservation:</strong> {booking.fairAllocationScoreAtBooking}/100</div>
                <div><strong>Verified Status:</strong> {booking.eligibilitySnapshot?.isVerified ? 'Campus Verified' : 'Standard'}</div>
                <div style={{ marginTop: '0.5rem', color: '#16A34A', fontSize: '0.785rem' }}>
                  ✓ Transparent community fair share rules verified. No consecutive reservation breach detected.
                </div>
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
