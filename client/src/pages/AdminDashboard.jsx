import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building,
  Layers,
  Activity,
  ShieldAlert,
  BarChart2,
  FileText,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../services/api';

const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#0D9488'];

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/analytics/dashboard');
        setAnalytics(res.data);
      } catch (err) {
        console.error('Error fetching admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const categoryData = analytics?.categoryDistribution || [];

  const statusPieData = analytics?.statusCounts
    ? Object.entries(analytics.statusCounts).map(([status, count]) => ({
        name: status,
        value: count,
      }))
    : [];

  return (
    <div className="main-content">
      <div className="app-container">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <span className="badge badge-green" style={{ marginBottom: '0.45rem' }}>
              Central Platform Governance
            </span>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
              Platform Administrator Command Center
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
              System-wide metrics, utilization analytics, fair access distribution and immutable audit logs
            </p>
          </div>

          <Link to="/audit-logs" className="btn btn-primary">
            <FileText size={18} />
            <span>Open System Audit Logs</span>
          </Link>
        </div>

        {/* Global KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          <div className="al-card" style={{ borderLeft: '4px solid #22C55E' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Total Registered Users</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#17231C', marginTop: '0.25rem' }}>
              {analytics?.summary?.totalUsers || 10}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '0.25rem' }}>Across 4 roles</div>
          </div>

          <div className="al-card" style={{ borderLeft: '4px solid #3B82F6' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Verified Assets Listed</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#17231C', marginTop: '0.25rem' }}>
              {analytics?.summary?.totalResources || 16}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#2563EB', marginTop: '0.25rem' }}>In catalog</div>
          </div>

          <div className="al-card" style={{ borderLeft: '4px solid #F59E0B' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Active Reservations</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#17231C', marginTop: '0.25rem' }}>
              {analytics?.summary?.activeBookings || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '0.25rem' }}>Handover completed</div>
          </div>

          <div className="al-card" style={{ borderLeft: '4px solid #EF4444' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Open Incidents</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#17231C', marginTop: '0.25rem' }}>
              {analytics?.summary?.openIncidents || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem' }}>Disputes / damages</div>
          </div>
        </div>

        {/* Analytics Charts Section (Recharts) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', marginBottom: '2.5rem' }}>
          {/* BarChart: Resources by Category */}
          <div className="al-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#17231C' }}>
              Resource Distribution by Category
            </h3>
            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      boxShadow: 'var(--shadow-md)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#22C55E" radius={[4, 4, 0, 0]} name="Resources" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PieChart: Lifecycle Status Distribution */}
          <div className="al-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#17231C' }}>
              Booking Lifecycle Distribution
            </h3>
            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Underutilized Assets Identification */}
        <div className="al-card" style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#17231C' }}>
                Asset Utilization & Optimization Opportunities
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#64748B' }}>
                High-value campus assets with lowest reservation frequency (candidates for promotional sharing campaigns).
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E7EB', color: '#64748B' }}>
                  <th style={{ padding: '0.65rem 0.75rem' }}>Resource Name</th>
                  <th style={{ padding: '0.65rem 0.75rem' }}>Category</th>
                  <th style={{ padding: '0.65rem 0.75rem' }}>Location</th>
                  <th style={{ padding: '0.65rem 0.75rem' }}>Lifetime Bookings</th>
                  <th style={{ padding: '0.65rem 0.75rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.underutilizedResources?.map((r) => (
                  <tr key={r._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#17231C' }}>
                      {r.name}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#64748B' }}>
                      <span className="badge badge-gray">{r.category}</span>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#64748B' }}>
                      {r.location}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: '#16A34A' }}>
                      {r.totalBookingsCount || 0} sessions
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <Link to={`/resources/${r._id}`} className="btn btn-secondary btn-sm">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
