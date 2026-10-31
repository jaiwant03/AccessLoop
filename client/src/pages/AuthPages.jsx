import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Repeat, GraduationCap, Layers, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loggedUser = await login(email, password);
      if (redirectUrl !== '/') {
        navigate(redirectUrl);
      } else {
        navigate(
          loggedUser.role === 'admin'
            ? '/dashboard/admin'
            : loggedUser.role === 'manager'
            ? '/dashboard/manager'
            : loggedUser.role === 'owner'
            ? '/dashboard/owner'
            : '/dashboard/borrower'
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="app-container" style={{ maxWidth: '440px', width: '100%' }}>
        <div className="al-card" style={{ padding: '2.25rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div
              className="brand-icon-wrapper"
              style={{ width: '44px', height: '44px', margin: '0 auto 0.75rem' }}
            >
              <Repeat size={24} />
            </div>
            <h1 style={{ fontSize: '1.65rem', marginBottom: '0.25rem' }}>Sign In to AccessLoop</h1>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Access underused campus equipment, labs, and tools.
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#FEE2E2',
                color: '#B91C1C',
                borderRadius: '8px',
                fontSize: '0.825rem',
                marginBottom: '1.25rem',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Campus Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@accessloop.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', height: '44px', marginTop: '0.5rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748B' }}>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: '#16A34A', fontWeight: 600 }}>
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    institution: 'Apex Institute of Technology & Science',
    department: '',
    role: 'borrower',
    studentOrEmployeeId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (roleKey) => {
    setFormData((prev) => ({ ...prev, role: roleKey }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const newUser = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        institution: formData.institution.trim(),
        department: formData.department.trim(),
        role: formData.role,
        studentOrEmployeeId: formData.studentOrEmployeeId.trim(),
      });

      navigate(
        newUser.role === 'admin'
          ? '/dashboard/admin'
          : newUser.role === 'manager'
          ? '/dashboard/manager'
          : newUser.role === 'owner'
          ? '/dashboard/owner'
          : '/dashboard/borrower'
      );
    } catch (err) {
      console.error('Registration error:', err);
      const msg =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' || err.message === 'Network Error'
          ? 'Network Error: Cannot connect to the backend server. Please verify your backend deployment URL and network connection.'
          : err.message) ||
        'Registration failed. Please check your credentials and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem' }}>
      <div className="app-container" style={{ maxWidth: '820px', width: '100%' }}>
        <div className="al-card" style={{ padding: '2.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              className="brand-icon-wrapper"
              style={{ width: '48px', height: '48px', margin: '0 auto 0.75rem', borderRadius: '12px' }}
            >
              <Repeat size={26} />
            </div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem', fontWeight: 800 }}>Create Your Account</h1>
            <p style={{ fontSize: '0.925rem', color: '#64748B' }}>
              Join the trusted campus sharing network to discover, reserve, and manage premium equipment.
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
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ fontWeight: 700 }}>•</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Modern Interactive Role Selection Option Buttons */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.65rem' }}>
                Select Your Role *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                {/* Role 1: Borrower */}
                <div
                  onClick={() => handleRoleSelect('borrower')}
                  style={{
                    padding: '1.1rem',
                    borderRadius: '12px',
                    border: formData.role === 'borrower' ? '2px solid #22C55E' : '1px solid #E2E8F0',
                    backgroundColor: formData.role === 'borrower' ? '#F0FDF4' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: formData.role === 'borrower' ? '0 4px 14px rgba(34, 197, 94, 0.16)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: formData.role === 'borrower' ? '#DCFCE7' : '#F1F5F9',
                        color: formData.role === 'borrower' ? '#16A34A' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <GraduationCap size={20} />
                    </div>
                    {formData.role === 'borrower' && <CheckCircle2 size={18} color="#16A34A" />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>Borrower / Student</div>
                    <div style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '3px', lineHeight: 1.35 }}>
                      Browse & request campus equipment, labs and tools
                    </div>
                  </div>
                </div>

                {/* Role 2: Owner */}
                <div
                  onClick={() => handleRoleSelect('owner')}
                  style={{
                    padding: '1.1rem',
                    borderRadius: '12px',
                    border: formData.role === 'owner' ? '2px solid #22C55E' : '1px solid #E2E8F0',
                    backgroundColor: formData.role === 'owner' ? '#F0FDF4' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: formData.role === 'owner' ? '0 4px 14px rgba(34, 197, 94, 0.16)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: formData.role === 'owner' ? '#DCFCE7' : '#F1F5F9',
                        color: formData.role === 'owner' ? '#16A34A' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Layers size={20} />
                    </div>
                    {formData.role === 'owner' && <CheckCircle2 size={18} color="#16A34A" />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>Resource Owner</div>
                    <div style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '3px', lineHeight: 1.35 }}>
                      List & manage lab equipment, slots and handovers
                    </div>
                  </div>
                </div>

                {/* Role 3: Manager */}
                <div
                  onClick={() => handleRoleSelect('manager')}
                  style={{
                    padding: '1.1rem',
                    borderRadius: '12px',
                    border: formData.role === 'manager' ? '2px solid #22C55E' : '1px solid #E2E8F0',
                    backgroundColor: formData.role === 'manager' ? '#F0FDF4' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: formData.role === 'manager' ? '0 4px 14px rgba(34, 197, 94, 0.16)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: formData.role === 'manager' ? '#DCFCE7' : '#F1F5F9',
                        color: formData.role === 'manager' ? '#16A34A' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ShieldCheck size={20} />
                    </div>
                    {formData.role === 'manager' && <CheckCircle2 size={18} color="#16A34A" />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>Institution Manager</div>
                    <div style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '3px', lineHeight: 1.35 }}>
                      Verify members, audit bookings & resolve incidents
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields in Clean 2-Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.15rem', marginBottom: '1.15rem' }}>
              <div>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g. Jaiwant Karrun"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="form-label">Campus Email *</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="e.g. student@accessloop.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.15rem', marginBottom: '1.15rem' }}>
              <div>
                <label className="form-label">Institution *</label>
                <input
                  type="text"
                  name="institution"
                  className="form-input"
                  placeholder="e.g. Apex Institute of Technology"
                  value={formData.institution}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="form-label">Department *</label>
                <input
                  type="text"
                  name="department"
                  className="form-input"
                  placeholder="e.g. Computer Science & Robotics"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.15rem', marginBottom: '1.15rem' }}>
              <div>
                <label className="form-label">Student / Employee ID</label>
                <input
                  type="text"
                  name="studentOrEmployeeId"
                  className="form-input"
                  placeholder="e.g. STU-2026-081"
                  value={formData.studentOrEmployeeId}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="form-label">Phone Number (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="e.g. +91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.15rem', marginBottom: '1.75rem' }}>
              <div>
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                height: '48px',
                fontSize: '1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                borderRadius: '10px',
              }}
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: '#64748B' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#16A34A', fontWeight: 700 }}>
              Sign In to AccessLoop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
