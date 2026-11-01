import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Upload,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Wrench,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  DollarSign,
  GraduationCap,
  Users,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Laboratories',
  'Classrooms',
  'Meeting Rooms',
  'Makerspaces',
  'Workshops',
  'Computers',
  'Laptops',
  'Cameras',
  'Projectors',
  '3D Printers',
  'Fabrication Tools',
  'Testing Devices',
  'Scientific Instruments',
  'Electronic Components',
  'Audio Equipment',
  'Specialised Technical Resources',
];

const AddResourcePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Cameras',
    resourceType: 'equipment',
    description: '',
    department: user?.department || 'Mechanical Engineering',
    location: '',
    quantity: 1,
    minBookingDurationHours: 1,
    maxBookingDurationHours: 8,
    requiresVerifiedUser: true,
    minFairUsageScore: 50,
    requiresTraining: false,
    trainingCourseName: '',
    requiresSupervision: false,
    supervisorName: '',
    safetyInstructions: 'Handle with care. Follow standard operating protocols.',
    usageGuidelines: 'Return in clean, original condition with all accessories.',
    securityDeposit: 0,
    isPaid: false,
    hourlyFee: 0,
    cancellationPolicy: 'Free cancellation up to 2 hours before scheduled slot.',
    imageUrl: '',
    tags: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTypeSelect = (typeKey) => {
    setFormData((prev) => ({ ...prev, resourceType: typeKey }));
  };

  const handlePricingSelect = (isPaid) => {
    setFormData((prev) => ({ ...prev, isPaid }));
  };

  const handleToggle = (fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const compressResourceImage = (file) => {
    return new Promise((resolve) => {
      if (!file || !(file instanceof File)) return resolve('');
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
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

            const dataUri = canvas.toDataURL('image/jpeg', 0.85);
            resolve(dataUri);
          } catch (err) {
            console.warn('Canvas compression error:', err);
            resolve('');
          }
        };
        img.onerror = () => resolve('');
        img.src = e.target.result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleImageFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const compressed = await compressResourceImage(file);
      if (compressed) {
        setImagePreview(compressed);
        setFormData((prev) => ({ ...prev, imageUrl: compressed }));
      } else {
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let res;
      if (formData.imageUrl && formData.imageUrl.startsWith('data:image')) {
        const payload = {
          name: formData.name.trim(),
          category: formData.category,
          resourceType: formData.resourceType,
          description: formData.description.trim(),
          department: formData.department.trim(),
          location: formData.location.trim(),
          quantity: parseInt(formData.quantity) || 1,
          minBookingDurationHours: parseFloat(formData.minBookingDurationHours) || 1,
          maxBookingDurationHours: parseFloat(formData.maxBookingDurationHours) || 8,
          eligibilityRequirements: {
            requiresVerifiedUser: formData.requiresVerifiedUser,
            minFairUsageScore: parseInt(formData.minFairUsageScore) || 50,
            requiresTraining: formData.requiresTraining,
            trainingCourseName: formData.trainingCourseName,
            requiresSupervision: formData.requiresSupervision,
            supervisorName: formData.supervisorName,
          },
          safetyInstructions: formData.safetyInstructions,
          usageGuidelines: formData.usageGuidelines,
          securityDeposit: parseFloat(formData.securityDeposit) || 0,
          isPaid: formData.isPaid,
          hourlyFee: parseFloat(formData.hourlyFee) || 0,
          cancellationPolicy: formData.cancellationPolicy,
          tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
          images: [formData.imageUrl],
        };
        res = await api.post('/resources', payload);
      } else if (imageFile) {
        const data = new FormData();
        data.append('name', formData.name.trim());
        data.append('category', formData.category);
        data.append('resourceType', formData.resourceType);
        data.append('description', formData.description.trim());
        data.append('department', formData.department.trim());
        data.append('location', formData.location.trim());
        data.append('quantity', formData.quantity);
        data.append('minBookingDurationHours', formData.minBookingDurationHours);
        data.append('maxBookingDurationHours', formData.maxBookingDurationHours);
        data.append(
          'eligibilityRequirements',
          JSON.stringify({
            requiresVerifiedUser: formData.requiresVerifiedUser,
            minFairUsageScore: parseInt(formData.minFairUsageScore) || 50,
            requiresTraining: formData.requiresTraining,
            trainingCourseName: formData.trainingCourseName,
            requiresSupervision: formData.requiresSupervision,
            supervisorName: formData.supervisorName,
          })
        );
        data.append('safetyInstructions', formData.safetyInstructions);
        data.append('usageGuidelines', formData.usageGuidelines);
        data.append('securityDeposit', formData.securityDeposit);
        data.append('isPaid', formData.isPaid);
        data.append('hourlyFee', formData.hourlyFee);
        data.append('cancellationPolicy', formData.cancellationPolicy);
        data.append('tags', formData.tags);
        data.append('images', imageFile);

        res = await api.post('/resources', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        const payload = {
          name: formData.name.trim(),
          category: formData.category,
          resourceType: formData.resourceType,
          description: formData.description.trim(),
          department: formData.department.trim(),
          location: formData.location.trim(),
          quantity: parseInt(formData.quantity) || 1,
          minBookingDurationHours: parseFloat(formData.minBookingDurationHours) || 1,
          maxBookingDurationHours: parseFloat(formData.maxBookingDurationHours) || 8,
          eligibilityRequirements: {
            requiresVerifiedUser: formData.requiresVerifiedUser,
            minFairUsageScore: parseInt(formData.minFairUsageScore) || 50,
            requiresTraining: formData.requiresTraining,
            trainingCourseName: formData.trainingCourseName,
            requiresSupervision: formData.requiresSupervision,
            supervisorName: formData.supervisorName,
          },
          safetyInstructions: formData.safetyInstructions,
          usageGuidelines: formData.usageGuidelines,
          securityDeposit: parseFloat(formData.securityDeposit) || 0,
          isPaid: formData.isPaid,
          hourlyFee: parseFloat(formData.hourlyFee) || 0,
          cancellationPolicy: formData.cancellationPolicy,
          images: [formData.imageUrl],
          tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
        };
        res = await api.post('/resources', payload);
      }
      navigate(`/resources/${res.data.resource._id}`);
    } catch (err) {
      console.error('Resource create error:', err);
      setError(
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK'
          ? 'Network error: Cannot reach the backend API server.'
          : err.message) ||
        'Failed to list resource. Please review form entries.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ padding: '2rem 1rem' }}>
      <div className="app-container" style={{ maxWidth: '860px' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Resources</span>
        </button>

        <div className="al-card" style={{ padding: '2.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}>
          {/* Header */}
          <div style={{ marginBottom: '2.25rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '1.5rem' }}>
            <span className="badge badge-green" style={{ marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
              Resource Custody & Sharing
            </span>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 800, color: '#0F172A' }}>
              List New Campus Resource
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
              Make your laboratory spaces, fabrication machines, or technical equipment safely accessible to verified campus members with automated schedules and safety gates.
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '0.9rem 1.15rem',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#B91C1C',
                borderRadius: '10px',
                fontSize: '0.875rem',
                marginBottom: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Section 1: Basic Information */}
            <div style={{ marginBottom: '2.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <span
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                  }}
                >
                  1
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Basic Information
                </h3>
              </div>

              {/* Resource Type Option Buttons */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.55rem' }}>
                  Resource Type *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div
                    onClick={() => handleTypeSelect('equipment')}
                    style={{
                      padding: '1.1rem',
                      borderRadius: '12px',
                      border: formData.resourceType === 'equipment' ? '2px solid #22C55E' : '1px solid #E2E8F0',
                      backgroundColor: formData.resourceType === 'equipment' ? '#F0FDF4' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: formData.resourceType === 'equipment' ? '0 4px 12px rgba(34, 197, 94, 0.15)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          backgroundColor: formData.resourceType === 'equipment' ? '#DCFCE7' : '#F1F5F9',
                          color: formData.resourceType === 'equipment' ? '#16A34A' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Wrench size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>Equipment / Tool</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                          Physical devices, cameras, test kits & instruments
                        </div>
                      </div>
                    </div>
                    {formData.resourceType === 'equipment' && <CheckCircle2 size={20} color="#16A34A" />}
                  </div>

                  <div
                    onClick={() => handleTypeSelect('space')}
                    style={{
                      padding: '1.1rem',
                      borderRadius: '12px',
                      border: formData.resourceType === 'space' ? '2px solid #22C55E' : '1px solid #E2E8F0',
                      backgroundColor: formData.resourceType === 'space' ? '#F0FDF4' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: formData.resourceType === 'space' ? '0 4px 12px rgba(34, 197, 94, 0.15)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          backgroundColor: formData.resourceType === 'space' ? '#DCFCE7' : '#F1F5F9',
                          color: formData.resourceType === 'space' ? '#16A34A' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>Space / Facility</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                          Laboratories, studios, testing rooms & bays
                        </div>
                      </div>
                    </div>
                    {formData.resourceType === 'space' && <CheckCircle2 size={20} color="#16A34A" />}
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Resource Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g. Sony Alpha A7 IV Cinema Rig with 24-70mm GM Lens"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.15rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label">Category *</label>
                  <select
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Managing Department *</label>
                  <input
                    type="text"
                    name="department"
                    className="form-input"
                    placeholder="e.g. Mechanical Engineering"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Location / Room Number *</label>
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  placeholder="e.g. Robotics Bay 2, Cabinet 04, North Campus"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description & Specifications *</label>
                <textarea
                  name="description"
                  rows={3}
                  className="form-textarea"
                  placeholder="Describe the asset, its key specifications, condition, and included accessories..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Section 2: Duration & Capacity */}
            <div style={{ marginBottom: '2.25rem', borderTop: '1px solid #E5E7EB', paddingTop: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <span
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                  }}
                >
                  2
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Booking Limits & Quantity
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.15rem' }}>
                <div>
                  <label className="form-label">Available Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    min={1}
                    className="form-input"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Min Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min={0.5}
                    name="minBookingDurationHours"
                    className="form-input"
                    value={formData.minBookingDurationHours}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Max Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min={1}
                    name="maxBookingDurationHours"
                    className="form-input"
                    value={formData.maxBookingDurationHours}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Eligibility & Safety Controls */}
            <div style={{ marginBottom: '2.25rem', borderTop: '1px solid #E5E7EB', paddingTop: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <span
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                  }}
                >
                  3
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Eligibility & Safety Controls
                </h3>
              </div>

              {/* Modern Option Toggle Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
                {/* Toggle Card 1: Verified Users */}
                <div
                  onClick={() => handleToggle('requiresVerifiedUser')}
                  style={{
                    padding: '1.1rem 1.25rem',
                    borderRadius: '12px',
                    border: formData.requiresVerifiedUser ? '2px solid #22C55E' : '1px solid #E2E8F0',
                    backgroundColor: formData.requiresVerifiedUser ? '#F0FDF4' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: formData.requiresVerifiedUser ? '#DCFCE7' : '#F1F5F9',
                        color: formData.requiresVerifiedUser ? '#16A34A' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>
                        Verified Campus Identity Required
                      </div>
                      <div style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '2px' }}>
                        Restricts booking only to students and faculty with verified Institutional IDs.
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      width: '42px',
                      height: '24px',
                      borderRadius: '12px',
                      backgroundColor: formData.requiresVerifiedUser ? '#22C55E' : '#CBD5E1',
                      position: 'relative',
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        position: 'absolute',
                        top: '3px',
                        left: formData.requiresVerifiedUser ? '21px' : '3px',
                        transition: 'left 0.2s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Toggle Card 2: Training Course */}
                <div
                  onClick={() => handleToggle('requiresTraining')}
                  style={{
                    padding: '1.1rem 1.25rem',
                    borderRadius: '12px',
                    border: formData.requiresTraining ? '2px solid #22C55E' : '1px solid #E2E8F0',
                    backgroundColor: formData.requiresTraining ? '#F0FDF4' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: formData.requiresTraining ? '#DCFCE7' : '#F1F5F9',
                        color: formData.requiresTraining ? '#16A34A' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>
                        Requires Certified Safety / Workshop Training
                      </div>
                      <div style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '2px' }}>
                        Enforces prior completion of laser, hazardous material, or fabrication certifications.
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      width: '42px',
                      height: '24px',
                      borderRadius: '12px',
                      backgroundColor: formData.requiresTraining ? '#22C55E' : '#CBD5E1',
                      position: 'relative',
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        position: 'absolute',
                        top: '3px',
                        left: formData.requiresTraining ? '21px' : '3px',
                        transition: 'left 0.2s ease',
                      }}
                    />
                  </div>
                </div>

                {formData.requiresTraining && (
                  <div style={{ padding: '0 0.5rem' }}>
                    <label className="form-label">Required Training Course / Certification Name *</label>
                    <input
                      type="text"
                      name="trainingCourseName"
                      className="form-input"
                      placeholder="e.g. Class 4 Laser Safety & Optics Certification"
                      value={formData.trainingCourseName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Safety Instructions & Handling Cautions</label>
                <textarea
                  name="safetyInstructions"
                  rows={2}
                  className="form-textarea"
                  value={formData.safetyInstructions}
                  onChange={handleChange}
                  placeholder="e.g. Wear eye protection, do not leave equipment unattended while powered."
                />
              </div>
            </div>

            {/* Section 4: Access Pricing, Deposit & Photo */}
            <div style={{ marginBottom: '2.5rem', borderTop: '1px solid #E5E7EB', paddingTop: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <span
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                  }}
                >
                  4
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Access Model & Asset Imagery
                </h3>
              </div>

              {/* Pricing Mode Option Buttons */}
              <div style={{ marginBottom: '1.35rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.55rem' }}>
                  Pricing Model *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div
                    onClick={() => handlePricingSelect(false)}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      border: !formData.isPaid ? '2px solid #22C55E' : '1px solid #E2E8F0',
                      backgroundColor: !formData.isPaid ? '#F0FDF4' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: !formData.isPaid ? '0 4px 12px rgba(34, 197, 94, 0.15)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          backgroundColor: !formData.isPaid ? '#DCFCE7' : '#F1F5F9',
                          color: !formData.isPaid ? '#16A34A' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0F172A' }}>Free Campus Access</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                          ₹0 charge for institutional members
                        </div>
                      </div>
                    </div>
                    {!formData.isPaid && <CheckCircle2 size={18} color="#16A34A" />}
                  </div>

                  <div
                    onClick={() => handlePricingSelect(true)}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      border: formData.isPaid ? '2px solid #22C55E' : '1px solid #E2E8F0',
                      backgroundColor: formData.isPaid ? '#F0FDF4' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: formData.isPaid ? '0 4px 12px rgba(34, 197, 94, 0.15)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          backgroundColor: formData.isPaid ? '#DCFCE7' : '#F1F5F9',
                          color: formData.isPaid ? '#16A34A' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <DollarSign size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0F172A' }}>Cost Recovery / Fee</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                          Hourly maintenance or consumable fee
                        </div>
                      </div>
                    </div>
                    {formData.isPaid && <CheckCircle2 size={18} color="#16A34A" />}
                  </div>
                </div>
              </div>

              {formData.isPaid && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Hourly Usage Fee (₹) *</label>
                  <input
                    type="number"
                    name="hourlyFee"
                    min={0}
                    className="form-input"
                    value={formData.hourlyFee}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.15rem', marginBottom: '1.35rem' }}>
                <div>
                  <label className="form-label">Security Deposit (₹)</label>
                  <input
                    type="number"
                    name="securityDeposit"
                    min={0}
                    className="form-input"
                    placeholder="0 for no deposit"
                    value={formData.securityDeposit}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="form-label">Tags / Keywords (Comma separated)</label>
                  <input
                    type="text"
                    name="tags"
                    className="form-input"
                    placeholder="e.g. cinema, 4k, robotics, optics"
                    value={formData.tags}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Modern Image Upload & Preview Card */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.55rem', display: 'block' }}>
                  Resource Photograph
                </label>
                <div
                  style={{
                    border: '2px dashed #E2E8F0',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    backgroundColor: '#F8FAFC',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
                    {imagePreview ? (
                      <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                        <img
                          src={imagePreview}
                          alt="Resource Preview"
                          style={{
                            width: '180px',
                            height: '110px',
                            objectFit: 'cover',
                            borderRadius: '10px',
                            border: '1px solid #E2E8F0',
                            boxShadow: 'var(--shadow-sm)',
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          backgroundColor: '#ECFDF5',
                          color: '#16A34A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Upload size={22} />
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <label
                        className="btn btn-secondary btn-sm"
                        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                      >
                        <Upload size={14} />
                        <span>Select File from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleImageFileChange}
                        />
                      </label>
                      <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>or paste an image URL below</span>
                    </div>

                    <input
                      type="text"
                      name="imageUrl"
                      className="form-input"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.imageUrl}
                      onChange={(e) => {
                        handleChange(e);
                        setImagePreview(e.target.value);
                        setImageFile(null);
                      }}
                      style={{ maxWidth: '520px', marginTop: '0.5rem' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                height: '52px',
                fontSize: '1.05rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-green)',
              }}
            >
              <PlusCircle size={20} />
              <span>{loading ? 'Publishing to Network...' : 'Publish Resource to AccessLoop'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddResourcePage;
