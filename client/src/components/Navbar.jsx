import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Layers,
  PlusCircle,
  ShieldCheck,
  Activity,
  Calendar,
  AlertCircle,
  Menu,
  X,
  Repeat,
  CheckCircle,
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';

const Navbar = ({ onOpenChatbot }) => {
  const { user, role, logout, demoLogin, isAuthenticated } = useAuth();
  const { liveNotification } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showDemoSwitcher, setShowDemoSwitcher] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch notifications if logged in
  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/notifications');
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        } catch (err) {
          // Silent catch
        }
      };
      fetchNotifications();
    }
  }, [isAuthenticated, location.pathname]);

  // Handle live incoming notifications from Socket.IO
  useEffect(() => {
    if (liveNotification) {
      setNotifications((prev) => [liveNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    }
  }, [liveNotification]);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSwitchDemoRole = async (key) => {
    try {
      await demoLogin(key);
      setShowDemoSwitcher(false);
      navigate(
        key === 'admin'
          ? '/dashboard/admin'
          : key === 'manager'
          ? '/dashboard/manager'
          : key.includes('owner')
          ? '/dashboard/owner'
          : '/dashboard/borrower'
      );
    } catch (err) {
      console.error(err);
    }
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/dashboard/admin';
    if (role === 'manager') return '/dashboard/manager';
    if (role === 'owner') return '/dashboard/owner';
    return '/dashboard/borrower';
  };

  return (
    <nav className="navbar">
      <div className="app-container navbar-inner">
        {/* Left Section: AI Assistant Badge & Brand Logo */}
        <div className="navbar-left">
          {/* Global AI Chatbot Top-Left Indicator (Required Section 4) */}
          <button
            className="ai-trigger-badge"
            onClick={onOpenChatbot}
            title="Ask AccessLoop AI - Smart Campus Assistant"
            id="global-ai-assistant-btn"
          >
            <span className="ai-pulse-dot" />
            <Sparkles size={14} color="#16A34A" />
            <span>Ask AI</span>
          </button>

          {/* Brand Logo */}
          <Link to="/" className="brand-logo">
            <div className="brand-icon-wrapper">
              <Repeat size={20} />
            </div>
            <span>
              Access<span className="brand-text-loop">Loop</span>
            </span>
          </Link>
        </div>

        {/* Center Section: Navigation Links */}
        <ul className="navbar-nav">
          <li>
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/explore"
              className={`nav-link ${
                location.pathname === '/explore' ? 'active' : ''
              }`}
            >
              Explore Resources
            </Link>
          </li>

          {isAuthenticated ? (
            <>
              <li>
                <Link
                  to={getDashboardPath()}
                  className={`nav-link ${
                    location.pathname.startsWith('/dashboard') ? 'active' : ''
                  }`}
                >
                  Dashboard
                </Link>
              </li>

              {role === 'owner' && (
                <li>
                  <Link
                    to="/resources/new"
                    className="nav-link"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: '#16A34A',
                      fontWeight: 600,
                    }}
                  >
                    <PlusCircle size={15} />
                    <span>List Resource</span>
                  </Link>
                </li>
              )}

              {['admin', 'manager'].includes(role) && (
                <li>
                  <Link
                    to="/audit-logs"
                    className={`nav-link ${
                      location.pathname === '/audit-logs' ? 'active' : ''
                    }`}
                  >
                    Audit Trail
                  </Link>
                </li>
              )}

              <li>
                <Link
                  to="/incidents"
                  className={`nav-link ${
                    location.pathname === '/incidents' ? 'active' : ''
                  }`}
                >
                  Incidents
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <a href="/#how-it-works" className="nav-link">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#trust-safety" className="nav-link">
                  Trust & Safety
                </a>
              </li>
            </>
          )}
        </ul>

        {/* Right Section: Role Switcher, Notifications, Auth */}
        <div className="navbar-right">
          {/* Quick Demo Switcher Pill for Judges */}
          <div style={{ position: 'relative' }}>
            <button
              className="demo-role-badge"
              onClick={() => setShowDemoSwitcher(!showDemoSwitcher)}
              title="Test platform under different authorized roles"
            >
              <ShieldCheck size={14} color="#16A34A" />
              <span>Demo Role: {role || 'Guest'}</span>
              <ChevronDown size={12} />
            </button>

            {showDemoSwitcher && (
              <div
                className="al-card"
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: '260px',
                  padding: '0.75rem',
                  zIndex: 200,
                  boxShadow: 'var(--shadow-xl)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#64748B',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem',
                    paddingBottom: '0.35rem',
                    borderBottom: '1px solid #E5E7EB',
                  }}
                >
                  Switch Demo Account
                </div>
                {Object.entries(DEMO_ACCOUNTS).map(([key, acc]) => (
                  <button
                    key={key}
                    onClick={() => handleSwitchDemoRole(key)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor:
                        user?.email === acc.email ? '#F0FDF4' : 'transparent',
                      color:
                        user?.email === acc.email ? '#16A34A' : '#17231C',
                      fontWeight: user?.email === acc.email ? 700 : 500,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.2rem',
                    }}
                  >
                    <div>
                      <div>{acc.label}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                        {acc.email}
                      </div>
                    </div>
                    {user?.email === acc.email && (
                      <CheckCircle size={14} color="#16A34A" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '50%',
                    position: 'relative',
                  }}
                  aria-label="Notifications"
                >
                  <Bell size={18} color="#17231C" />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        backgroundColor: '#EF4444',
                        color: '#FFF',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div
                    className="al-card"
                    style={{
                      position: 'absolute',
                      top: '120%',
                      right: 0,
                      width: '320px',
                      maxHeight: '380px',
                      overflowY: 'auto',
                      padding: '0.75rem',
                      zIndex: 200,
                      boxShadow: 'var(--shadow-xl)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingBottom: '0.5rem',
                        borderBottom: '1px solid #E5E7EB',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <strong style={{ fontSize: '0.85rem' }}>Notifications</strong>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#16A34A',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div
                        style={{
                          padding: '1.5rem 0',
                          textAlign: 'center',
                          color: '#64748B',
                          fontSize: '0.825rem',
                        }}
                      >
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n._id}
                          style={{
                            padding: '0.55rem',
                            borderRadius: '6px',
                            backgroundColor: n.isRead ? '#FFF' : '#F0FDF4',
                            borderBottom: '1px solid #F1F5F9',
                            fontSize: '0.8rem',
                          }}
                        >
                          <div style={{ fontWeight: 600, color: '#17231C' }}>
                            {n.title}
                          </div>
                          <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '2px' }}>
                            {n.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* User Profile Avatar / Menu */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: '1px solid #E5E7EB',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.25rem 0.65rem 0.25rem 0.35rem',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={
                      user.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                    }
                    alt={user.name}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#17231C',
                      maxWidth: '100px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} color="#64748B" />
                </button>

                {showProfileDropdown && (
                  <div
                    className="al-card"
                    style={{
                      position: 'absolute',
                      top: '120%',
                      right: 0,
                      width: '240px',
                      padding: '0.85rem',
                      zIndex: 200,
                      boxShadow: 'var(--shadow-xl)',
                    }}
                  >
                    <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '0.65rem', marginBottom: '0.65rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#17231C' }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {user.email}
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.45rem' }}>
                        <span className="badge badge-green">
                          {user.role}
                        </span>
                        <span className="badge badge-blue">
                          Score: {user.fairUsageScore || 100}
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setShowProfileDropdown(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.45rem 0.5rem',
                        fontSize: '0.85rem',
                        color: '#17231C',
                        borderRadius: '6px',
                      }}
                    >
                      <User size={16} />
                      <span>Profile & Verification</span>
                    </Link>

                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        logout();
                        navigate('/');
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.45rem 0.5rem',
                        fontSize: '0.85rem',
                        color: '#EF4444',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        marginTop: '0.25rem',
                      }}
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none' }} // Visible on mobile via media queries
            id="mobile-nav-toggle"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
