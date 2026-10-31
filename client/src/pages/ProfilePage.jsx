import React, { useState, useRef } from 'react';
import {
  User,
  ShieldCheck,
  Upload,
  AlertCircle,
  CheckCircle,
  Scale,
  Building,
  Mail,
  Phone,
  Camera,
  GraduationCap,
  Briefcase,
  Award,
  CreditCard,
  FileText,
  UploadCloud,
  Check,
  X,
  Trash2,
  ArrowRight,
  Link2,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import api, { resolveImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FairUsageBadge from '../components/FairUsageBadge';
import UserAvatar from '../components/UserAvatar';

const VERIFICATION_OPTIONS = [
  {
    id: 'Student ID',
    title: 'Student ID Card',
    desc: 'Official active enrolled student ID',
    icon: GraduationCap,
  },
  {
    id: 'Employee ID',
    title: 'Faculty / Staff ID',
    desc: 'Institutional staff employment pass',
    icon: Briefcase,
  },
  {
    id: 'Training Certificate',
    title: 'Safety Certificate',
    desc: 'Workshop or equipment training clearance',
    icon: Award,
  },
  {
    id: 'Lab Safety Qualification',
    title: 'Lab Qualification',
    desc: 'Class 4 Laser or cleanroom certification',
    icon: ShieldCheck,
  },
];

const ProfilePage = () => {
  const { user, refreshUser, updateAvatar } = useAuth();
  const fileInputRef = useRef(null);

  const [idNumber, setIdNumber] = useState(user?.studentOrEmployeeId || '');
  const [verificationType, setVerificationType] = useState('Student ID');
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
  const [docFile, setDocFile] = useState(null);
  const [docUrl, setDocUrl] = useState('');
  const [notes, setNotes] = useState('Enrolled in academic degree program. Requesting equipment borrowing clearance.');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile avatar upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setAvatarError('Image file size must be less than 10MB.');
      return;
    }

    setUploadingAvatar(true);
    setAvatarError('');
    setAvatarSuccess('');

    try {
      await updateAvatar(file);
      setAvatarSuccess('Profile photo updated successfully! It will persist across all sessions.');
      setTimeout(() => setAvatarSuccess(''), 5000);
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      setAvatarError(err.response?.data?.message || 'Failed to upload profile photo. Please try again.');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;
    setUploadingAvatar(true);
    setAvatarError('');
    setAvatarSuccess('');

    try {
      await updateAvatar('');
      setAvatarSuccess('Profile photo removed. Neutral empty avatar restored.');
      setTimeout(() => setAvatarSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to remove avatar:', err);
      setAvatarError(err.response?.data?.message || 'Failed to remove profile photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setDocFile(e.dataTransfer.files[0]);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (uploadMode === 'file' && docFile) {
        const formData = new FormData();
        formData.append('verificationType', verificationType);
        formData.append('idNumber', idNumber);
        formData.append('department', user?.department || '');
        formData.append('submittedNotes', notes);
        formData.append('verificationDoc', docFile);
        await api.post('/auth/verify-request', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/auth/verify-request', {
          verificationType,
          idNumber,
          department: user?.department,
          documentUrl: docUrl,
          submittedNotes: notes,
        });
      }

      setSuccess('Verification documentation submitted successfully! An Institution Manager will review it.');
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Verification submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasPhoto = Boolean(resolveImageUrl(user?.avatar));

  return (
    <div className="main-content" style={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 70px)', padding: '2.5rem 0 5rem' }}>
      <div className="app-container" style={{ maxWidth: '880px' }}>
        
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
            <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={13} /> Account Settings
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>•</span>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Access Credentials</span>
          </div>
          <h1 style={{ fontSize: '2.15rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', marginBottom: '0.35rem' }}>
            Profile & Trust Verification
          </h1>
          <p style={{ fontSize: '0.925rem', color: '#64748B', maxWidth: '640px', lineHeight: 1.5 }}>
            Manage your verified identity, institutional standing, and submit academic credentials for high-value equipment access.
          </p>
        </div>

        {/* ==========================================================================
            CARD 1: USER PROFILE & IDENTITY OVERVIEW
           ========================================================================== */}
        <div
          className="al-card"
          style={{
            marginBottom: '2rem',
            padding: '2rem',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
          }}
        >
          {/* Subtle Top Accent Ribbon */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #22C55E 0%, #16A34A 50%, #10B981 100%)',
            }}
          />

          {/* Feedback Banners */}
          {avatarSuccess && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.85rem 1.15rem',
                backgroundColor: '#F0FDF4',
                color: '#15803D',
                borderRadius: '10px',
                border: '1px solid #BBF7D0',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
                boxShadow: '0 1px 3px rgba(22, 163, 74, 0.08)',
              }}
            >
              <CheckCircle size={18} color="#16A34A" style={{ flexShrink: 0 }} />
              <span>{avatarSuccess}</span>
            </div>
          )}

          {avatarError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.85rem 1.15rem',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                borderRadius: '10px',
                border: '1px solid #FECACA',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
              }}
            >
              <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
              <span>{avatarError}</span>
            </div>
          )}

          {/* Main Profile Info Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            {/* Left: Avatar + Details + Modern Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              
              {/* Interactive Avatar with Camera Overlay */}
              <div style={{ position: 'relative' }}>
                <UserAvatar
                  src={user?.avatar}
                  name={user?.name}
                  size={84}
                  border="3px solid #22C55E"
                  style={{
                    boxShadow: '0 4px 14px rgba(34, 197, 94, 0.22)',
                  }}
                />

                {/* Camera Overlay Trigger */}
                <label
                  htmlFor="profile-avatar-file-input"
                  title={hasPhoto ? 'Change profile photo' : 'Upload profile photo'}
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#16A34A',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.18)',
                    border: '2.5px solid #FFFFFF',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.backgroundColor = '#15803D';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = '#16A34A';
                  }}
                >
                  <Camera size={15} />
                  <input
                    id="profile-avatar-file-input"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>

              {/* User Identity Details */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                    {user?.name || 'Authorized User'}
                  </h2>
                  <span
                    className="badge badge-green"
                    style={{
                      padding: '0.2rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {user?.role || 'Borrower'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#64748B', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                  <Building size={14} color="#94A3B8" />
                  <span>{user?.department || 'Department Member'}</span>
                  <span>•</span>
                  <span>{user?.institution || 'Apex Institute'}</span>
                </div>

                {/* Modern Option Buttons: Photo Management */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
                  <label
                    htmlFor="profile-avatar-file-input"
                    className="btn"
                    style={{
                      padding: '0.45rem 0.95rem',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      borderRadius: '8px',
                      backgroundColor: '#F0FDF4',
                      color: '#15803D',
                      border: '1px solid #BBF7D0',
                      cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      boxShadow: '0 1px 2px rgba(22, 163, 74, 0.05)',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#DCFCE7';
                      e.currentTarget.style.borderColor = '#86EFAC';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 3px 8px rgba(22, 163, 74, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F0FDF4';
                      e.currentTarget.style.borderColor = '#BBF7D0';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(22, 163, 74, 0.05)';
                    }}
                  >
                    <UploadCloud size={15} />
                    <span>
                      {uploadingAvatar
                        ? 'Uploading...'
                        : hasPhoto
                        ? 'Change profile photo'
                        : 'Upload photo'}
                    </span>
                  </label>

                  {hasPhoto && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={uploadingAvatar}
                      className="btn"
                      style={{
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        borderRadius: '8px',
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        border: '1px solid #FECACA',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FEE2E2';
                        e.currentTarget.style.borderColor = '#FCA5A5';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FEF2F2';
                        e.currentTarget.style.borderColor = '#FECACA';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      title="Remove custom photo and restore neutral empty avatar"
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Fair Usage Trust Badge */}
            <div style={{ alignSelf: 'flex-start' }}>
              <FairUsageBadge score={user?.fairUsageScore} showDetails={true} />
            </div>
          </div>

          {/* Three Modern Stat Tiles */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginTop: '1.75rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #F1F5F9',
            }}
          >
            {/* Stat 1: Official Email */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.85rem 1rem',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16A34A',
                  flexShrink: 0,
                }}
              >
                <Mail size={18} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.725rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Official Email
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.email || 'N/A'}
                </div>
              </div>
            </div>

            {/* Stat 2: Student / Employee ID */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.85rem 1rem',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563EB',
                  flexShrink: 0,
                }}
              >
                <CreditCard size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.725rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Institutional ID
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', fontFamily: 'monospace' }}>
                  {user?.studentOrEmployeeId || 'STU-0001'}
                </div>
              </div>
            </div>

            {/* Stat 3: Verification Status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.85rem 1rem',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color:
                    user?.verificationStatus === 'Verified'
                      ? '#16A34A'
                      : user?.verificationStatus === 'Pending Review'
                      ? '#D97706'
                      : '#64748B',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.725rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Trust Standing
                </div>
                <div>
                  <span
                    className={`badge ${
                      user?.verificationStatus === 'Verified'
                        ? 'badge-green'
                        : user?.verificationStatus === 'Pending Review'
                        ? 'badge-amber'
                        : 'badge-gray'
                    }`}
                    style={{ fontSize: '0.775rem', padding: '0.2rem 0.6rem' }}
                  >
                    {user?.verificationStatus || 'Not Submitted'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================================================
            CARD 2: ACADEMIC & SAFETY VERIFICATION (MODERN UI FORM)
           ========================================================================== */}
        <div
          className="al-card"
          style={{
            padding: '2rem',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
            backgroundColor: '#FFFFFF',
          }}
        >
          {/* Card Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.95rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16A34A',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 0.35rem 0' }}>
                Academic & Safety Verification
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, lineHeight: 1.55 }}>
                Certain high-value research tools, cleanrooms, and cinema rigs require verified campus membership. Submit your student/faculty ID card or workshop training certificate for institutional sign-off.
              </p>
            </div>
          </div>

          {/* Form Feedback Alerts */}
          {success && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.95rem 1.25rem',
                backgroundColor: '#F0FDF4',
                color: '#15803D',
                borderRadius: '12px',
                border: '1px solid #BBF7D0',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.08)',
              }}
            >
              <CheckCircle size={20} color="#16A34A" style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.95rem 1.25rem',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                borderRadius: '12px',
                border: '1px solid #FECACA',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
              }}
            >
              <AlertCircle size={20} color="#DC2626" style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerificationSubmit}>
            
            {/* Section 1: Modern Option Cards for Verification Type */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>
                  Select Verification Credential Type <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <span style={{ fontSize: '0.775rem', color: '#64748B' }}>Click an option to select</span>
              </div>

              {/* 4 Interactive Modern Option Cards */}
              <div className="option-cards-grid">
                {VERIFICATION_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = verificationType === opt.id;
                  return (
                    <div
                      key={opt.id}
                      className={`option-btn-card ${isSelected ? 'active' : ''}`}
                      onClick={() => setVerificationType(opt.id)}
                    >
                      {isSelected && (
                        <div className="option-btn-card-check">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                      <div className="option-btn-card-icon">
                        <Icon size={18} />
                      </div>
                      <div className="option-btn-card-title">{opt.title}</div>
                      <div className="option-btn-card-desc">{opt.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Official ID / Roll Number Input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A', marginBottom: '0.45rem' }}>
                Official ID / Roll Number <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div className="input-with-icon-wrapper">
                <CreditCard size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="e.g. STU-2024-9901"
                  required
                  style={{
                    height: '46px',
                    borderRadius: '10px',
                    fontSize: '0.925rem',
                    borderColor: '#E2E8F0',
                  }}
                />
              </div>
              <div style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '0.35rem' }}>
                Must match the official ID number printed on your institutional card.
              </div>
            </div>

            {/* Section 3: Modern Document Upload with Option Switcher */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>
                  Document Verification Proof <span style={{ color: '#EF4444' }}>*</span>
                </label>

                {/* Option Buttons: File Upload vs Document URL */}
                <div className="modern-segmented-control" style={{ margin: 0 }}>
                  <button
                    type="button"
                    className={`modern-segmented-btn ${uploadMode === 'file' ? 'active' : ''}`}
                    onClick={() => setUploadMode('file')}
                  >
                    <UploadCloud size={14} />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    className={`modern-segmented-btn ${uploadMode === 'url' ? 'active' : ''}`}
                    onClick={() => setUploadMode('url')}
                  >
                    <Link2 size={14} />
                    <span>Document URL</span>
                  </button>
                </div>
              </div>

              {/* MODE A: Modern Drag-and-Drop Dropzone */}
              {uploadMode === 'file' ? (
                <div>
                  {!docFile ? (
                    <div
                      className="file-dropzone-modern"
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: '2rem 1.5rem',
                        borderRadius: '12px',
                        border: isDragging ? '2px dashed #16A34A' : '2px dashed #CBD5E1',
                        backgroundColor: isDragging ? '#F0FDF4' : '#FAFCFB',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setDocFile(e.target.files[0]);
                          }
                        }}
                      />
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          backgroundColor: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#16A34A',
                          margin: '0 auto 0.75rem',
                        }}
                      >
                        <UploadCloud size={24} />
                      </div>
                      <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                        Click to browse or drag & drop document
                      </div>
                      <div style={{ fontSize: '0.785rem', color: '#64748B' }}>
                        Supports PDF, PNG, JPG, or WEBP (Max 10MB)
                      </div>
                    </div>
                  ) : (
                    /* Attached File Card */
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.25rem',
                        backgroundColor: '#F0FDF4',
                        border: '1.5px solid #86EFAC',
                        borderRadius: '12px',
                        boxShadow: '0 2px 6px rgba(22, 163, 74, 0.08)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #BBF7D0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#16A34A',
                          }}
                        >
                          <FileCheck size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {docFile.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#15803D', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                            <span>{(docFile.size / 1024).toFixed(1)} KB</span>
                            <span>•</span>
                            <span style={{ fontWeight: 600 }}>Ready for verification</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setDocFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          color: '#64748B',
                          padding: '0.4rem 0.65rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#DC2626';
                          e.currentTarget.style.borderColor = '#FCA5A5';
                          e.currentTarget.style.backgroundColor = '#FEF2F2';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#64748B';
                          e.currentTarget.style.borderColor = '#CBD5E1';
                          e.currentTarget.style.backgroundColor = '#FFFFFF';
                        }}
                        title="Remove attached file"
                      >
                        <X size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* MODE B: Modern Document URL Input */
                <div>
                  <div className="input-with-icon-wrapper">
                    <Link2 size={18} className="input-icon" />
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://institution.edu/credentials/verify-id-123.jpg"
                      value={docUrl}
                      onChange={(e) => {
                        setDocUrl(e.target.value);
                        setDocFile(null);
                      }}
                      style={{
                        height: '46px',
                        borderRadius: '10px',
                        fontSize: '0.925rem',
                        borderColor: '#E2E8F0',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '0.35rem' }}>
                    Provide a direct verifiable URL to your institutional ID or public credentials page.
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Applicant Statement */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>
                  Applicant Statement & Resource Access Justification
                </label>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{notes.length} characters</span>
              </div>
              <textarea
                rows={3}
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe your academic courses, degree capstone, or research project requiring lab equipment clearance..."
                style={{
                  borderRadius: '10px',
                  borderColor: '#E2E8F0',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  padding: '0.85rem',
                }}
              />
            </div>

            {/* Section 5: Modern Primary Submit Action Button */}
            <button
              type="submit"
              disabled={loading || (uploadMode === 'file' && !docFile && !docUrl) || (uploadMode === 'url' && !docUrl)}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                padding: '0.95rem 1.5rem',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                boxShadow: '0 4px 14px 0 rgba(34, 197, 94, 0.38)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(34, 197, 94, 0.48)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(34, 197, 94, 0.38)';
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      border: '2.5px solid rgba(255, 255, 255, 0.3)',
                      borderTopColor: '#FFFFFF',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span>Submitting Verification for Manager Review...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  <span>Submit Verification for Manager Review</span>
                  <ArrowRight size={18} style={{ marginLeft: '4px' }} />
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;