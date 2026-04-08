import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, CircularProgress, useTheme, Skeleton } from '@mui/material';
import { FolderCopy, CheckCircle, AddCircle, Campaign, HourglassEmpty } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  RadialBarChart, RadialBar
} from 'recharts';

const PALETTE = ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0891B2'];

/* ─── Shared Components ─── */
const StatCard = ({ title, count, icon, gradient, loading }) => {
  const theme = useTheme();
  return (
    <Paper elevation={0} sx={{
      p: 3, borderRadius: '16px',
      border: '1px solid', borderColor: 'divider',
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
};

const ChartCard = ({ title, subtitle, children, loading, minHeight = 380 }) => (
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
    <Box flex={1} display="flex" alignItems="center" justifyContent="center">
      {loading
        ? <CircularProgress size={36} />
        : children
      }
    </Box>
  </Paper>
);

const CustomTooltip = ({ active, payload }) => {
  const theme = useTheme();
  if (active && payload && payload.length) {
    return (
      <Box sx={{
        bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
        borderRadius: '10px', p: 1.5, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      }}>
        <Typography variant="body2" fontWeight={700} color="text.primary">{payload[0].name}</Typography>
        <Typography variant="body2" color="text.secondary">{payload[0].value} activities</Typography>
      </Box>
    );
  }
  return null;
};

const ApprovalChip = ({ label, count, color, loading }) => (
  <Box sx={{
    flex: 1, p: 2.5, borderRadius: '14px', textAlign: 'center',
    bgcolor: `${color}12`, border: `1px solid ${color}28`,
    minWidth: 100,
    transition: 'all 0.2s',
    '&:hover': { bgcolor: `${color}1E`, transform: 'translateY(-2px)' },
  }}>
    {loading
      ? <Skeleton width="50%" height={36} sx={{ mx: 'auto' }} />
      : <Typography variant="h4" fontWeight={800} sx={{ color, lineHeight: 1.1 }}>{count}</Typography>
    }
    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ letterSpacing: '0.04em' }}>{label}</Typography>
  </Box>
);

/* ─── Page ─── */
const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Student stats error:', err))
      .finally(() => setLoading(false));
  }, []);

  const total = stats?.total_projects || 0;
  const completed = stats?.completed_projects || 0;
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const progressData = [
    { name: 'Completed', value: completionPct, fill: isDark ? '#34D399' : '#059669' },
  ];

  const legendColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <Box>
      {/* ── Header ── */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's your academic research overview.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddCircle />}
          onClick={() => navigate('/submit')}
          sx={{ borderRadius: '10px', px: 3, py: 1.2, fontWeight: 700 }}
        >
          New Activity
        </Button>
      </Box>

      {/* ── Stat Cards ── */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6}>
          <StatCard loading={loading} title="Total Activities" count={total} icon={<FolderCopy />} gradient="linear-gradient(135deg,#2563EB,#1D4ED8)" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard loading={loading} title="Completed" count={completed} icon={<CheckCircle />} gradient="linear-gradient(135deg,#059669,#047857)" />
        </Grid>
      </Grid>

      {/* ── Mentor Approval Tracking ── */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700} color="text.primary" mb={0.5}>Mentor Approval Tracking</Typography>
        <Typography variant="body2" color="text.secondary" mb={2.5}>Real-time status of your submitted activities</Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <ApprovalChip loading={loading} label="Awaiting Approval" count={stats?.approval_distribution?.find(s => s.name === 'Pending')?.count || 0} color="#D97706" />
          <ApprovalChip loading={loading} label="Approved" count={stats?.approval_distribution?.find(s => s.name === 'Approved')?.count || 0} color="#059669" />
          <ApprovalChip loading={loading} label="Needs Revision" count={stats?.approval_distribution?.find(s => s.name === 'Rejected')?.count || 0} color="#DC2626" />
        </Box>
      </Paper>

      {/* ── Charts ── */}
      <Grid container spacing={3} mb={4}>

        {/* Research Mix – Donut */}
        <Grid item xs={12} md={7}>
          <ChartCard title="Research Mix" subtitle="Distribution across activity types" loading={loading} minHeight={400}>
            {stats?.type_distribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.type_distribution}
                    cx="50%" cy="45%"
                    innerRadius={72} outerRadius={108}
                    paddingAngle={4}
                    dataKey="count"
                    label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                    labelLine={false}
                  >
                    {stats.type_distribution.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle" iconSize={9}
                    wrapperStyle={{ paddingTop: 16, fontSize: '0.78rem' }}
                    formatter={(value) => (
                      <span style={{ color: legendColor, fontWeight: 600 }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box textAlign="center">
                <FolderCopy sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">No activity data yet</Typography>
              </Box>
            )}
          </ChartCard>
        </Grid>

        {/* Completion Rate – Gauge */}
        <Grid item xs={12} md={5}>
          <ChartCard title="Completion Rate" subtitle="Finished projects vs total submitted" loading={loading} minHeight={400}>
            <Box width="100%" display="flex" flexDirection="column" alignItems="center">
              <Box sx={{ position: 'relative', width: '100%', maxWidth: 280 }}>
                <ResponsiveContainer width="100%" height={220}>
                  <RadialBarChart
                    cx="50%" cy="80%"
                    innerRadius="60%" outerRadius="90%"
                    startAngle={180} endAngle={0}
                    data={progressData}
                    barSize={18}
                  >
                    {/* Background track */}
                    <RadialBar
                      background={{ fill: isDark ? '#334155' : '#F1F5F9' }}
                      dataKey="value"
                      cornerRadius={8}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <Box sx={{
                  position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
                  textAlign: 'center', pointerEvents: 'none',
                }}>
                  <Typography variant="h3" fontWeight={900} sx={{ color: isDark ? '#34D399' : '#059669', lineHeight: 1 }}>
                    {completionPct}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: '0.06em' }}>
                    COMPLETION
                  </Typography>
                </Box>
              </Box>
              {/* Legend */}
              <Box display="flex" gap={3} mt={1}>
                {[
                  { label: `${completed} Completed`, color: isDark ? '#34D399' : '#059669' },
                  { label: `${total - completed} Remaining`, color: isDark ? '#334155' : '#E2E8F0' },
                ].map(item => (
                  <Box key={item.label} display="flex" alignItems="center" gap={0.8}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>{item.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </ChartCard>
        </Grid>

      </Grid>

      {/* ── CTA Banner ── */}
      <Paper elevation={0} sx={{
        p: 4, borderRadius: '16px',
        background: isDark
          ? 'linear-gradient(135deg,#1E3A5F 0%,#2E1B5E 100%)'
          : 'linear-gradient(135deg,#2563EB 0%,#7C3AED 100%)',
        color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h5" fontWeight={800} mb={1}>Ready to log your next achievement?</Typography>
          <Typography variant="body1" mb={3} sx={{ opacity: 0.85 }}>
            Build your verified academic portfolio with research projects, publications, and more.
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<AddCircle />}
              onClick={() => navigate('/submit')}
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
            >
              Log Activity
            </Button>
            <Button
              variant="outlined"
              startIcon={<Campaign />}
              onClick={() => navigate('/all')}
              sx={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              Explore Feed
            </Button>
          </Box>
        </Box>
        <FolderCopy sx={{ position: 'absolute', right: -30, bottom: -30, fontSize: 200, opacity: 0.07 }} />
      </Paper>
    </Box>
  );
};

export default StudentDashboard;