import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Button, useTheme, Skeleton } from '@mui/material';
import { Group, FolderCopy, EmojiEvents, ArrowForward, Assignment } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const PALETTE = ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED'];

/* ─── Shared ─── */
const StatCard = ({ title, count, icon, gradient, loading }) => (
  <Paper elevation={0} sx={{
    p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' },
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
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary" lineHeight={1.1}>{count ?? '—'}</Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>{title}</Typography>
        </Box>
      </Box>
    )}
  </Paper>
);

const ChartCard = ({ title, subtitle, children, loading, minHeight = 420 }) => (
  <Paper elevation={0} sx={{
    p: 3, borderRadius: '16px', minHeight,
    border: '1px solid', borderColor: 'divider',
    display: 'flex', flexDirection: 'column',
    transition: 'box-shadow 0.2s',
    '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
  }}>
    <Box mb={2.5}>
      <Typography variant="h6" fontWeight={700} color="text.primary" lineHeight={1.3}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" mt={0.3}>{subtitle}</Typography>
    </Box>
    <Box flex={1} display="flex" alignItems="center">
      {loading ? <Box flex={1} display="flex" justifyContent="center"><CircularProgress size={36} /></Box> : children}
    </Box>
  </Paper>
);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '10px', p: 1.5, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
        <Typography variant="body2" fontWeight={700} color="text.primary">{payload[0].name || payload[0].dataKey}</Typography>
        <Typography variant="body2" color="text.secondary">{payload[0].value}</Typography>
      </Box>
    );
  }
  return null;
};

/* ─── Page ─── */
const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Staff stats error:', err))
      .finally(() => setLoading(false));
  }, []);

  const axisStyle = { fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B', fontWeight: 500 };
  const gridStroke = { strokeDasharray: '3 3', stroke: isDark ? '#1E293B' : '#F1F5F9', vertical: false };
  const legendColor = isDark ? '#94A3B8' : '#64748B';

  const getStatusColor = (name) => {
    if (name === 'Approved') return '#059669';
    if (name === 'Rejected') return '#DC2626';
    return '#D97706';
  };

  const pendingCount = stats?.approval_distribution?.find(s => s.name === 'Pending')?.count || 0;

  return (
    <Box>
      {/* ── Header ── */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>Mentorship Dashboard</Typography>
          <Typography variant="body1" color="text.secondary">Welcome, {user?.name}. Here's your mentees' research progress.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Assignment />}
          onClick={() => navigate('/mentor-dashboard')}
          sx={{ borderRadius: '10px', px: 3, py: 1.2, fontWeight: 700 }}
        >
          Workflow Manager
        </Button>
      </Box>

      {/* ── Stat Cards ── */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6}>
          <StatCard loading={loading} title="Mentee Projects" count={stats?.total_mentee_projects} icon={<FolderCopy />} gradient="linear-gradient(135deg,#2563EB,#1D4ED8)" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard loading={loading} title="Pending Review" count={pendingCount} icon={<EmojiEvents />} gradient="linear-gradient(135deg,#D97706,#B45309)" />
        </Grid>
      </Grid>

      {/* ── Charts ── */}
      <Grid container spacing={3} mb={4}>
        {/* Bar Chart – Activity Types */}
        <Grid item xs={12} md={7}>
          <ChartCard title="Research Portfolio by Category" subtitle="Breakdown of mentee activity types" loading={loading} minHeight={420}>
            <ResponsiveContainer width="100%" height={310}>
              <BarChart data={stats?.type_distribution || []} barCategoryGap="35%" margin={{ top: 4, right: 8, bottom: 4, left: -8 }}>
                <CartesianGrid {...gridStroke} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisStyle} interval={0} />
                <YAxis axisLine={false} tickLine={false} tick={axisStyle} width={32} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={52}>
                  {(stats?.type_distribution || []).map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* Donut – Approval Status */}
        <Grid item xs={12} md={5}>
          <ChartCard title="Mentee Progress Status" subtitle="Distribution by mentor approval" loading={loading} minHeight={420}>
            <Box width="100%" display="flex" flexDirection="column" alignItems="center" gap={2}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={stats?.approval_distribution || []}
                    cx="50%" cy="42%"
                    innerRadius={70} outerRadius={105}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {(stats?.approval_distribution || []).map((entry, i) => (
                      <Cell key={i} fill={getStatusColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle" iconSize={9}
                    wrapperStyle={{ paddingTop: 12, fontSize: '0.78rem' }}
                    formatter={(value) => <span style={{ color: legendColor, fontWeight: 600 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        </Grid>
      </Grid>

      {/* ── Quick Navigation ── */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700} color="text.primary" mb={3}>Quick Navigation</Typography>
        <Grid container spacing={2}>
          {[
            { label: 'Student Profiles', desc: 'Browse your mentees', icon: <Group />, color: '#2563EB', path: '/students', bg: isDark ? '#1E3A5F' : '#EFF6FF' },
            { label: 'Research Feed', desc: 'All submitted research', icon: <FolderCopy />, color: '#059669', path: '/all', bg: isDark ? '#022C22' : '#ECFDF5' },
          ].map(item => (
            <Grid item xs={12} sm={6} key={item.label}>
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

export default StaffDashboard;