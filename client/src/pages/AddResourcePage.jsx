import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Upload, ShieldCheck, AlertTriangle, ArrowLeft } from 'lucide-react';
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
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    tags: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let res;
      if (imageFile) {
        const data = new FormData();
        data.append('name', formData.name);
        data.append('category', formData.category);
        data.append('resourceType', formData.resourceType);
        data.append('description', formData.description);
        data.append('department', formData.department);
        data.append('location', formData.location);
        data.append('quantity', formData.quantity);
        data.append('minBookingDurationHours', formData.minBookingDurationHours);
        data.append('maxBookingDurationHours', formData.maxBookingDurationHours);
        data.append('eligibilityRequirements', JSON.stringify({
          requiresVerifiedUser: formData.requiresVerifiedUser,
          minFairUsageScore: parseInt(formData.minFairUsageScore),
          requiresTraining: formData.requiresTraining,
          trainingCourseName: formData.trainingCourseName,
          requiresSupervision: formData.requiresSupervision,
          supervisorName: formData.supervisorName,
        }));
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
          name: formData.name,
          category: formData.category,
          resourceType: formData.resourceType,
          description: formData.description,
          department: formData.department,
          location: formData.location,
          quantity: parseInt(formData.quantity),
          minBookingDurationHours: parseFloat(formData.minBookingDurationHours),
          maxBookingDurationHours: parseFloat(formData.maxBookingDurationHours),
          eligibilityRequirements: {
            requiresVerifiedUser: formData.requiresVerifiedUser,
            minFairUsageScore: parseInt(formData.minFairUsageScore),
            requiresTraining: formData.requiresTraining,
            trainingCourseName: formData.trainingCourseName,
            requiresSupervision: formData.requiresSupervision,
            supervisorName: formData.supervisorName,
          },
          safetyInstructions: formData.safetyInstructions,
          usageGuidelines: formData.usageGuidelines,
          securityDeposit: parseFloat(formData.securityDeposit),
          isPaid: formData.isPaid,
          hourlyFee: parseFloat(formData.hourlyFee),
          cancellationPolicy: formData.cancellationPolicy,
          images: [formData.imageUrl],
          tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
        };
        res = await api.post('/resources', payload);
      }
      navigate(`/resources/${res.data.resource._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to list resource.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="app-container" style={{ maxWidth: '800px' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div className="al-card" style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '2rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '1.25rem' }}>
            <span className="badge badge-green" style={{ marginBottom: '0.45rem' }}>
              Resource Custody
            </span>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>
              List New Campus Resource
            </h1>
            <p>
              Make your laboratory spaces, fabrication machines, or technical equipment safely accessible to verified campus members.
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '0.85rem',
                backgroundColor: '#FEE2E2',
                color: '#B91C1C',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#17231C' }}>
              1. Basic Information
            </h3>

            <div className="form-group">
              <label className="form-label">Resource Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. Sony Alpha A7 IV Cinema Rig"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
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
                <label className="form-label">Resource Type *</label>
                <select
                  name="resourceType"
                  className="form-select"
                  value={formData.resourceType}
                  onChange={handleChange}
                  required
                >
                  <option value="equipment">Equipment / Tool</option>
                  <option value="space">Space / Laboratory</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Description *</label>
              <textarea
                name="description"
                rows={4}
                className="form-textarea"
                placeholder="Include specifications, key features, bundled accessories, and software..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="form-label">Department *</label>
                <input
                  type="text"
                  name="department"
                  className="form-input"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="form-label">Location / Room Number *</label>
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  placeholder="e.g. Robotics Bay 2, Cabinet 04"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Duration & Availability */}
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#17231C', borderTop: '1px solid #E5E7EB', paddingTop: '1.5rem' }}>
              2. Booking Duration & Quantity
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="form-label">Quantity</label>
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

            {/* Eligibility & Safety */}
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#17231C', borderTop: '1px solid #E5E7EB', paddingTop: '1.5rem' }}>
              3. Eligibility & Safety Rules
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="requiresVerifiedUser"
                  checked={formData.requiresVerifiedUser}
                  onChange={handleChange}
                />
                <span>Requires Verified Institutional Account (Student/Employee ID)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="requiresTraining"
                  checked={formData.requiresTraining}
                  onChange={handleChange}
                />
                <span>Requires Certified Safety / Workshop Training</span>
              </label>

              {formData.requiresTraining && (
                <div style={{ paddingLeft: '1.85rem' }}>
                  <input
                    type="text"
                    name="trainingCourseName"
                    className="form-input"
                    placeholder="e.g. Class 4 Laser Certification or CNC Safety Orientation"
                    value={formData.trainingCourseName}
                    onChange={handleChange}
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
              />
            </div>

            {/* Pricing & Deposit */}
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#17231C', borderTop: '1px solid #E5E7EB', paddingTop: '1.5rem' }}>
              4. Security Deposit & Image
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="form-label">Security Deposit (₹)</label>
                <input
                  type="number"
                  name="securityDeposit"
                  min={0}
                  className="form-input"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="form-label">Upload Image File (or enter URL below)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-input"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                    }
                  }}
                  style={{ marginBottom: '0.45rem' }}
                />
                <input
                  type="text"
                  name="imageUrl"
                  className="form-input"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => {
                    handleChange(e);
                    setImageFile(null);
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {loading ? 'Listing Resource...' : 'Publish Resource to AccessLoop'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddResourcePage;
