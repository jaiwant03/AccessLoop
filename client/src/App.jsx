import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatbotDrawer from './components/ChatbotDrawer';

// Pages
import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';
import ResourceDetailsPage from './pages/ResourceDetailsPage';
import AddResourcePage from './pages/AddResourcePage';
import BookingDetailsPage from './pages/BookingDetailsPage';
import BorrowerDashboard from './pages/BorrowerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AuditLogPage from './pages/AuditLogPage';
import IncidentCenterPage from './pages/IncidentCenterPage';
import ProfilePage from './pages/ProfilePage';
import { LoginPage, RegisterPage } from './pages/AuthPages';

// Role-protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
        <span className="badge badge-green">Loading session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to their respective authorized dashboard
    const defaultDash =
      role === 'admin'
        ? '/dashboard/admin'
        : role === 'manager'
        ? '/dashboard/manager'
        : role === 'owner'
        ? '/dashboard/owner'
        : '/dashboard/borrower';
    return <Navigate to={defaultDash} replace />;
  }

  return children;
};

function AppContent() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onOpenChatbot={() => setIsChatbotOpen(true)} />

      {/* Global AI Chatbot Drawer (Always accessible from top-left navbar) */}
      <ChatbotDrawer
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/resources/:id" element={<ResourceDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Authenticated Routes */}
        <Route
          path="/bookings/:id"
          element={
            <ProtectedRoute>
              <BookingDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents"
          element={
            <ProtectedRoute>
              <IncidentCenterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents/:id"
          element={
            <ProtectedRoute>
              <IncidentCenterPage />
            </ProtectedRoute>
          }
        />

        {/* Role Dashboards */}
        <Route
          path="/dashboard/borrower"
          element={
            <ProtectedRoute allowedRoles={['borrower', 'admin', 'manager', 'owner']}>
              <BorrowerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/owner"
          element={
            <ProtectedRoute allowedRoles={['owner', 'admin', 'manager']}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/manager"
          element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Resource Creation */}
        <Route
          path="/resources/new"
          element={
            <ProtectedRoute allowedRoles={['owner', 'admin', 'manager']}>
              <AddResourcePage />
            </ProtectedRoute>
          }
        />

        {/* Audit Logs */}
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'owner', 'borrower']}>
              <AuditLogPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
