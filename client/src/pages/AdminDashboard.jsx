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
  ArrowRight,
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
            gap: '1.25rem',
            marginBottom: '2.25rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-green">Central Platform Governance</span>
              <span className="badge badge-gray">Root Administrator</span>
            </div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', letterSpacing: '-0.03em' }}>
              Platform Administrator Command Center
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
              System-wide metrics, utilization analytics, fair access distribution and immutable audit logs
            </p>
          </div>

          <Link to="/audit-logs" className="btn btn-primary" style={{ gap: '0.45rem' }}>
            <FileText size={17} />
            <span>Open System Audit Logs</span>
          </Link>
        </div>

        {/* Global KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Card 1: Users */}
          <div className="stat-card-kpi" style={{ borderLeft: '4px solid #22C55E' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Total Registered Users</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem', letterSpacing: '-0.03em' }}>
                  {analytics?.summary?.totalUsers || 10}
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#ECFDF5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16A34A',
                }}
              >
                <Users size={20} />
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600, marginTop: '0.75rem' }}>Across 4 roles</div>
          </div>

          {/* Card 2: Resources */}
          <div className="stat-card-kpi" style={{ borderLeft: '4px solid #3B82F6' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Verified Assets Listed</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem', letterSpacing: '-0.03em' }}>
                  {analytics?.summary?.totalResources || 16}
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563EB',
                }}
              >
                <Layers size={20} />
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600, marginTop: '0.75rem' }}>Active catalog inventory</div>
          </div>

          {/* Card 3: Active Reservations */}
          <div className="stat-card-kpi" style={{ borderLeft: '4px solid #F59E0B' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Active Reservations</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem', letterSpacing: '-0.03em' }}>
                  {analytics?.summary?.activeBookings || 0}
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFBEB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D97706',
                }}
              >
                <Clock size={20} />
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600, marginTop: '0.75rem' }}>Handover completed</div>
          </div>

          {/* Card 4: Open Incidents */}
          <div className="stat-card-kpi" style={{ borderLeft: '4px solid #EF4444' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Open Incidents</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem', letterSpacing: '-0.03em' }}>
                  {analytics?.summary?.openIncidents || 0}
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#FEF2F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#DC2626',
                }}
              >
                <ShieldAlert size={20} />
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 600, marginTop: '0.75rem' }}>Disputes / damages</div>
          </div>
        </div>

        {/* Analytics Charts Section (Recharts) */}
        <div className="responsive-admin-grid">
          {/* BarChart: Resources by Category */}
          <div className="al-card">
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0F172A', fontWeight: 700 }}>
                Resource Distribution by Category
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Breakdown of campus assets currently registered across departments.</p>
            </div>
            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      boxShadow: 'var(--shadow-md)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#22C55E" radius={[6, 6, 0, 0]} name="Resources" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PieChart: Lifecycle Status Distribution */}
          <div className="al-card">
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0F172A', fontWeight: 700 }}>
                Booking Lifecycle Distribution
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Platform reservation states from pending review to completion.</p>
            </div>
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      boxShadow: 'var(--shadow-md)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Underutilized Assets Identification */}
        <div className="al-card" style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#0F172A', fontWeight: 700 }}>
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
                <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', backgroundColor: '#F8FAFC' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Resource Name</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Location</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Lifetime Bookings</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.underutilizedResources?.map((r) => (
                  <tr
                    key={r._id}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#0F172A' }}>
                      {r.name}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>
                      <span className="badge badge-gray">{r.category}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>
                      {r.location}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#16A34A' }}>
                      {r.totalBookingsCount || 0} sessions
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <Link to={`/resources/${r._id}`} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
                        <span>View Details</span>
                        <ArrowRight size={13} />
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
