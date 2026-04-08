import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Button, useTheme, Skeleton, Chip } from '@mui/material';
import { Group, FolderCopy, Analytics, PersonAdd, Timeline, ArrowForward } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const PALETTE = ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0891B2', '#DB2777', '#16A34A'];

/* ─── Shared Components ─── */
const StatCard = ({ title, count, icon, gradient, loading, onClick }) => (
  <Paper elevation={0} onClick={onClick} sx={{
    p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': onClick ? { transform: 'translateY(-4px)', boxShadow: '0 10px 28px rgba(0,0,0,0.10)' } : {},
  }}>
    {loading ? (
      <Box display="flex" alignItems="center" gap={2}>
        <Skeleton variant="rounded" width={52} height={52} />
        <Box flex={1}><Skeleton width="50%" height={32} /><Skeleton width="70%" height={18} /></Box>
      </Box>
    ) : (
      <Box display="flex" alignItems="center" gap={2}>
        <Box sx={{ width: 52, height: 52, borderRadius: '14px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {React.cloneElement(icon, { sx: { color: '#fff', fontSize: 24 } })}
        </Box>
        <Box flex={1}>
          <Typography variant="h4" fontWeight={800} color="text.primary" lineHeight={1.1}>{count ?? '—'}</Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>{title}</Typography>
        </Box>
        {onClick && <ArrowForward sx={{ color: 'text.disabled', fontSize: 18, opacity: 0.5 }} />}
      </Box>
    )}
  </Paper>
);

const ChartCard = ({ title, subtitle, children, loading, minHeight = 460 }) => (
  <Paper elevation={0} sx={{
    p: 3.5, borderRadius: '16px', minHeight,
    border: '1px solid', borderColor: 'divider',
    display: 'flex', flexDirection: 'column',
    transition: 'box-shadow 0.2s',
    '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.07)' },
  }}>
    <Box mb={3}>
      <Typography variant="h6" fontWeight={700} color="text.primary" lineHeight={1.3}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" mt={0.4}>{subtitle}</Typography>
    </Box>
    <Box flex={1} display="flex" flexDirection="column" justifyContent="center">
      {loading
        ? <Box display="flex" justifyContent="center" py={6}><CircularProgress size={40} /></Box>
        : children
      }
    </Box>
  </Paper>
);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{
        bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
        borderRadius: '10px', p: 1.5, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      }}>
        <Typography variant="body2" fontWeight={700} color="text.primary">{payload[0].name || payload[0].payload?.name}</Typography>
        <Typography variant="body2" color="text.secondary">{payload[0].value} projects</Typography>
      </Box>
    );
  }
  return null;
};

// Abbreviate long category names for the bar x-axis
const abbr = (str = '') => {
  if (str.length <= 12) return str;
  const words = str.split(' ');
  if (words.length === 1) return str.slice(0, 11) + '…';
  return words.map(w => w[0].toUpperCase()).join('');
};

/* ─── Page ─── */
const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Stats fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const axisStyle = { fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B', fontWeight: 500 };
  const gridStroke = { strokeDasharray: '4 4', stroke: isDark ? '#1E293B' : '#F1F5F9', vertical: false };
  const lineFill = isDark ? '#34D399' : '#059669';

  const getStatusColor = (name) => {
    if (name === 'Approved') return '#059669';
    if (name === 'Rejected') return '#DC2626';
    return '#D97706';
  };

  // Prepare abbreviated bar data
  const barData = (stats?.type_distribution || []).map((d, i) => ({
    ...d,
    label: abbr(d.name),
    fill: PALETTE[i % PALETTE.length],
  }));

  const domainData = stats?.domain_distribution || [];
  const approvalData = stats?.approval_distribution || [];

  return (
    <Box>
      {/* ── Header ── */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>System Overview</Typography>
          <Typography variant="body1" color="text.secondary">Welcome, {user?.name}. Here's the live research ecosystem dashboard.</Typography>
        </Box>
      </Box>

      {/* ── Stat Cards ── */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
          <StatCard
            loading={loading}
            title="Total Students"
            count={stats?.total_students}
            icon={<Group />}
            gradient="linear-gradient(135deg,#2563EB,#1D4ED8)"
            onClick={() => navigate('/manage-users')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            loading={loading}
            title="Research Projects"
            count={stats?.total_projects}
            icon={<Timeline />}
            gradient="linear-gradient(135deg,#059669,#047857)"
            onClick={() => navigate('/all')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            loading={loading}
            title="System Staff"
            count={stats?.total_staff}
            icon={<Analytics />}
            gradient="linear-gradient(135deg,#7C3AED,#6D28D9)"
            onClick={() => navigate('/manage-users?tab=staff')}
          />
        </Grid>
      </Grid>

      {/* ── Row 1 ── */}
      <Grid container spacing={3} mb={3}>

        {/* Bar Chart – Activity classification */}
        <Grid item xs={12} lg={7}>
          <ChartCard title="Research Classification Trends" subtitle="Total activities submitted per category" loading={loading} minHeight={480}>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart
                data={barData}
                barCategoryGap="30%"
                margin={{ top: 6, right: 12, bottom: 48, left: -4 }}
              >
                <CartesianGrid {...gridStroke} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B', fontWeight: 600 }}
                  interval={0}
                />
                <YAxis axisLine={false} tickLine={false} tick={axisStyle} width={28} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={56}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Colour-coded key below */}
            <Box display="flex" flexWrap="wrap" gap={1} mt={1} px={0.5}>
              {barData.map((entry) => (
                <Box key={entry.name} display="flex" alignItems="center" gap={0.6}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.fill, flexShrink: 0 }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600} noWrap>
                    {entry.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </ChartCard>
        </Grid>

        {/* Domain Specialization – Horizontal Bar (no cramped donut) */}
        <Grid item xs={12} lg={5}>
          <ChartCard title="Domain Specialization" subtitle="Projects per research domain" loading={loading} minHeight={480}>
            {domainData.length === 0 ? (
              <Box textAlign="center" py={6}>
                <Typography variant="body2" color="text.secondary">No domain data yet</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <BarChart
                  data={domainData}
                  layout="vertical"
                  barCategoryGap="20%"
                  margin={{ top: 4, right: 24, bottom: 4, left: 4 }}
                >
                  <CartesianGrid {...gridStroke} horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={axisStyle} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B', fontWeight: 600 }}
                    width={110}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }} />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} maxBarSize={32}>
                    {domainData.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>

      </Grid>

      {/* ── Row 2 ── */}
      <Grid container spacing={3} mb={4}>

        {/* Line Chart – Monthly */}
        <Grid item xs={12} lg={8}>
          <ChartCard title="Research Productivity Index" subtitle="Monthly submission trends over time" loading={loading} minHeight={380}>
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={stats?.monthly_submissions || []} margin={{ top: 6, right: 12, bottom: 4, left: -4 }}>
                <CartesianGrid {...gridStroke} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisStyle} />
                <YAxis axisLine={false} tickLine={false} tick={axisStyle} width={28} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone" dataKey="count"
                  stroke={lineFill} strokeWidth={2.5}
                  dot={{ r: 5, fill: lineFill, strokeWidth: 0 }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* Approval Status – solid donut with custom legend */}
        <Grid item xs={12} lg={4}>
          <ChartCard title="Submission Lifecycle" subtitle="By mentor approval status" loading={loading} minHeight={380}>
            <Box display="flex" flexDirection="column" alignItems="center" width="100%" gap={2}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={approvalData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={95}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="name"
                  >
                    {approvalData.map((entry, i) => (
                      <Cell key={i} fill={getStatusColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Custom legend – no Recharts Legend component (avoids "count" label) */}
              <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
                {[
                  { label: 'Approved', color: '#059669' },
                  { label: 'Pending', color: '#D97706' },
                  { label: 'Rejected', color: '#DC2626' },
                ].map(item => {
                  const entry = approvalData.find(d => d.name === item.label) || { count: 0 };
                  return (
                    <Box key={item.label} display="flex" alignItems="center" gap={0.8}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {item.label} ({entry.count})
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </ChartCard>
        </Grid>

      </Grid>

      {/* ── Quick Actions ── */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700} color="text.primary" mb={3}>Quick Actions</Typography>
        <Grid container spacing={2}>
          {[
            { label: 'User Management', desc: 'Manage roles & access', icon: <PersonAdd />, color: '#2563EB', path: '/manage-users', bg: isDark ? '#1E3A5F' : '#EFF6FF' },
            { label: 'Research Ledger', desc: 'Browse all activities', icon: <FolderCopy />, color: '#059669', path: '/all', bg: isDark ? '#022C22' : '#ECFDF5' },
            { label: 'Student Directory', desc: 'View all students', icon: <Group />, color: '#7C3AED', path: '/students', bg: isDark ? '#2E1B5E' : '#F5F3FF' },
          ].map(item => (
            <Grid item xs={12} sm={4} key={item.label}>
              <Box
                onClick={() => navigate(item.path)}
                sx={{
                  p: 2.5, borderRadius: '12px', bgcolor: item.bg, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 2, border: '1px solid transparent',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: item.color + '50', transform: 'translateY(-2px)' },
                }}
              >
                <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: item.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {React.cloneElement(item.icon, { sx: { color: item.color, fontSize: 20 } })}
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" fontWeight={700} color="text.primary">{item.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                </Box>
                <ArrowForward sx={{ color: item.color, fontSize: 18, opacity: 0.6 }} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;