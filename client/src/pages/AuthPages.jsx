import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Repeat } from 'lucide-react';
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
    department: 'Engineering & Technology',
    role: 'borrower',
    studentOrEmployeeId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const newUser = await register(formData);
      navigate(
        newUser.role === 'owner' ? '/dashboard/owner' : '/dashboard/borrower'
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="app-container" style={{ maxWidth: '520px', width: '100%' }}>
        <div className="al-card" style={{ padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div
              className="brand-icon-wrapper"
              style={{ width: '44px', height: '44px', margin: '0 auto 0.75rem' }}
            >
              <Repeat size={24} />
            </div>
            <h1 style={{ fontSize: '1.65rem', marginBottom: '0.25rem' }}>Create Your Account</h1>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Join the trusted campus sharing network.
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
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Dr. / Prof. / Student Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="form-label">Campus Email *</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="name@accessloop.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="form-label">Role *</label>
                <select
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="borrower">Borrower (Student / Scholar)</option>
                  <option value="owner">Resource Custodian / Owner</option>
                  <option value="manager">Institution Manager</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="form-label">Department *</label>
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

              <div>
                <label className="form-label">Student / Employee ID</label>
                <input
                  type="text"
                  name="studentOrEmployeeId"
                  className="form-input"
                  placeholder="e.g. STU-2024-1102"
                  value={formData.studentOrEmployeeId}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
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
                  placeholder="••••••••"
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
              style={{ width: '100%', height: '44px' }}
            >
              {loading ? 'Creating Account...' : 'Register on AccessLoop'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748B' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#16A34A', fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
