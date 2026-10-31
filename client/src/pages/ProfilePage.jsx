import React, { useState } from 'react';
import { User, ShieldCheck, Upload, AlertCircle, CheckCircle, Scale, Building, Mail, Phone, Camera } from 'lucide-react';
import api, { resolveImageUrl, DEFAULT_AVATAR } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FairUsageBadge from '../components/FairUsageBadge';

const ProfilePage = () => {
  const { user, refreshUser, updateAvatar } = useAuth();

  const [idNumber, setIdNumber] = useState(user?.studentOrEmployeeId || '');
  const [verificationType, setVerificationType] = useState('Student ID');
  const [docFile, setDocFile] = useState(null);
  const [docUrl, setDocUrl] = useState(
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80'
  );
  const [notes, setNotes] = useState('Enrolled in academic degree program. Requesting equipment borrowing clearance.');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile avatar upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState('');
  const [avatarError, setAvatarError] = useState('');

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
      setAvatarSuccess('Profile photo uploaded and saved! It will now appear whenever you log into this account.');
      setTimeout(() => setAvatarSuccess(''), 6000);
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      setAvatarError(err.response?.data?.message || 'Failed to upload profile photo. Please try again.');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (docFile) {
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

      setSuccess('Verification documentation submitted! An Institution Manager will review it.');
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Verification submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="app-container" style={{ maxWidth: '840px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span className="badge badge-green" style={{ marginBottom: '0.45rem' }}>
            Account Settings
          </span>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
            Profile & Trust Verification
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
            Manage your verified identity, campus department affiliations, and community standing.
          </p>
        </div>

        {/* User Card with Photo Upload */}
        <div className="al-card" style={{ marginBottom: '2rem' }}>
          {/* Avatar Feedback Messages */}
          {avatarSuccess && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: '#F0FDF4',
                color: '#15803D',
                borderRadius: '8px',
                border: '1px solid #BBF7D0',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '1rem',
              }}
            >
              <CheckCircle size={16} color="#16A34A" />
              <span>{avatarSuccess}</span>
            </div>
          )}

          {avatarError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                borderRadius: '8px',
                border: '1px solid #FECACA',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '1rem',
              }}
            >
              <AlertCircle size={16} color="#DC2626" />
              <span>{avatarError}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              {/* Profile Avatar with Camera Button */}
              <div style={{ position: 'relative' }}>
                <img
                  src={resolveImageUrl(user?.avatar) || DEFAULT_AVATAR}
                  alt={user?.name || 'Profile'}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_AVATAR;
                  }}
                  style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #22C55E',
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.25)',
                  }}
                />
                <label
                  htmlFor="profile-avatar-input"
                  title="Upload profile photo"
                  style={{
                    position: 'absolute',
                    bottom: '0px',
                    right: '0px',
                    background: '#16A34A',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    border: '2px solid #ffffff',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Camera size={14} />
                  <input
                    id="profile-avatar-input"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', color: '#17231C' }}>{user?.name}</h2>
                  <span className="badge badge-green">{user?.role}</span>
                </div>
                <div style={{ fontSize: '0.825rem', color: '#64748B', marginTop: '2px' }}>
                  {user?.department} • {user?.institution}
                </div>
                <div style={{ marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label
                    htmlFor="profile-avatar-input"
                    style={{
                      fontSize: '0.78rem',
                      color: '#16A34A',
                      fontWeight: 600,
                      cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      backgroundColor: '#F0FDF4',
                      borderRadius: '6px',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                    }}
                  >
                    <Upload size={13} />
                    {uploadingAvatar ? 'Uploading photo...' : 'Change profile photo'}
                  </label>
                </div>
              </div>
            </div>

            <FairUsageBadge score={user?.fairUsageScore} showDetails={true} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              borderTop: '1px solid #E5E7EB',
              paddingTop: '1.25rem',
              marginTop: '1.25rem',
              fontSize: '0.85rem',
            }}
          >
            <div>
              <div style={{ color: '#64748B', fontSize: '0.75rem' }}>Official Email</div>
              <strong style={{ color: '#17231C' }}>{user?.email}</strong>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.75rem' }}>Student / Employee ID</div>
              <strong style={{ color: '#17231C' }}>{user?.studentOrEmployeeId || 'STU-VERIFIED'}</strong>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.75rem' }}>Verification Status</div>
              <span
                className={`badge ${
                  user?.verificationStatus === 'Verified'
                    ? 'badge-green'
                    : user?.verificationStatus === 'Pending Review'
                    ? 'badge-amber'
                    : 'badge-gray'
                }`}
              >
                {user?.verificationStatus || 'Not Submitted'}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Submission Form */}
        <div className="al-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <ShieldCheck size={20} color="#16A34A" />
            <h3 style={{ fontSize: '1.15rem', color: '#17231C' }}>
              Academic & Safety Verification
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Certain high-value research tools, cleanrooms, and cinema rigs require verified campus membership. Submit your student/faculty ID card or workshop training certificate for institutional sign-off.
          </p>

          {success && (
            <div style={{ padding: '0.85rem', backgroundColor: '#F0FDF4', color: '#15803D', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
              {success}
            </div>
          )}

          {error && (
            <div style={{ padding: '0.85rem', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleVerificationSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="form-label">Verification Type</label>
                <select
                  className="form-select"
                  value={verificationType}
                  onChange={(e) => setVerificationType(e.target.value)}
                >
                  <option value="Student ID">Student ID Card</option>
                  <option value="Employee ID">Faculty / Staff ID</option>
                  <option value="Training Certificate">Workshop Safety Certificate</option>
                  <option value="Lab Safety Qualification">Class 4 Laser / Cleanroom Qualification</option>
                </select>
              </div>

              <div>
                <label className="form-label">Official ID / Roll Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="e.g. STU-2024-9901"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Upload ID / Certificate File (or enter URL below)</label>
              <input
                type="file"
                accept="image/*,.pdf"
                className="form-input"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setDocFile(e.target.files[0]);
                  }
                }}
                style={{ marginBottom: '0.5rem' }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Or enter image URL https://..."
                value={docUrl}
                onChange={(e) => {
                  setDocUrl(e.target.value);
                  setDocFile(null);
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Applicant Statement</label>
              <textarea
                rows={3}
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? 'Submitting...' : 'Submit Verification for Manager Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
