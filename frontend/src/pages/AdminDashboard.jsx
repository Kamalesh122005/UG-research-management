import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Avatar, Button, Divider, useTheme } from '@mui/material';
import { Group, FolderCopy, Analytics, PersonAdd, Timeline, ArrowForward, PieChart as PieIcon, BarChart as BarIcon, TrendingUp } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const StatCard = ({ title, count, icon, color }) => (
  <Paper elevation={0} sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid #eef2f6', bgcolor: 'background.paper' }}>
    <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 56, height: 56 }}>
      {icon}
    </Avatar>
    <Box>
      <Typography variant="h4" fontWeight="800">{count}</Typography>
      <Typography variant="body2" color="textSecondary" fontWeight="600" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</Typography>
    </Box>
  </Paper >
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error("Stats fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
  if (!stats) return <Box display="flex" justifyContent="center" py={10}><Typography color="error">Failed to load dashboard data.</Typography></Box>;

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="900" sx={{ color: 'text.primary', mb: 1 }}>System Intelligence</Typography>
        <Typography variant="body1" color="textSecondary">Welcome back, {user?.name}. Here is the real-time research ecosystem overview.</Typography>
      </Box>

      {/* Summary Row */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
          <StatCard title="Total Students" count={stats.total_students} icon={<Group fontSize="large" />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Research Projects" count={stats.total_projects} icon={<Timeline fontSize="large" />} color="success" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="System Staff" count={stats.total_staff} icon={<Analytics fontSize="large" />} color="secondary" />
        </Grid>
      </Grid>

      {/* Main Charts Row */}
      <Grid container spacing={3} mb={4}>
        {/* Project Type Distribution */}
        <Grid item xs={12} lg={7}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: 400, border: '1px solid #eef2f6' }}>
            <Typography variant="h6" fontWeight="700" mb={3} display="flex" alignItems="center" gap={1}>
              <BarIcon sx={{ color: 'primary.main' }} /> Research Classification Trends
            </Typography>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={stats.type_distribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f5f5f5' }}
                />
                <Bar dataKey="count" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Domain Distribution */}
        <Grid item xs={12} lg={5}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: 400, border: '1px solid #eef2f6' }}>
            <Typography variant="h6" fontWeight="700" mb={3} display="flex" alignItems="center" gap={1}>
              <PieIcon sx={{ color: 'secondary.main' }} /> Domain Specialization
            </Typography>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={stats.domain_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {stats.domain_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Monthly & Status Row */}
      <Grid container spacing={3} mb={4}>
        {/* Monthly Trend */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: 350, border: '1px solid #eef2f6' }}>
            <Typography variant="h6" fontWeight="700" mb={3} display="flex" alignItems="center" gap={1}>
              <TrendingUp sx={{ color: 'success.main' }} /> Research Productivity Index
            </Typography>
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={stats.monthly_submissions}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="count" stroke={theme.palette.success.main} strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Status Breakdown */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: 350, border: '1px solid #eef2f6' }}>
            <Typography variant="h6" fontWeight="700" mb={3} display="flex" alignItems="center" gap={1}>
              <PieIcon sx={{ color: 'warning.main' }} /> Submission Lifecycle
            </Typography>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={stats.status_distribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label
                >
                  {stats.status_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Approved' ? '#2e7d32' : entry.name === 'Rejected' ? '#d32f2f' : '#0288d1'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Control Panel Bottom */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #eef2f6' }}>
        <Typography variant="h6" fontWeight="800" mb={3}>System Infrastructure Controls</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth variant="soft" color="primary"
              startIcon={<PersonAdd />} endIcon={<ArrowForward />}
              onClick={() => navigate('/manage-users')}
              sx={{ justifyContent: 'space-between', py: 2, borderRadius: 3, bgcolor: 'primary.lighter', color: 'primary.main', '&:hover': { bgcolor: 'primary.light', color: 'white' } }}
            >
              Access Management
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth variant="soft" color="success"
              startIcon={<FolderCopy />} endIcon={<ArrowForward />}
              onClick={() => navigate('/all-activities')}
              sx={{ justifyContent: 'space-between', py: 2, borderRadius: 3, bgcolor: '#e8f5e9', color: '#2e7d32', '&:hover': { bgcolor: '#2e7d32', color: 'white' } }}
            >
              Enterprise Ledger
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth variant="soft" color="secondary"
              startIcon={<Group />} endIcon={<ArrowForward />}
              onClick={() => navigate('/student-list')}
              sx={{ justifyContent: 'space-between', py: 2, borderRadius: 3, bgcolor: '#f3e5f5', color: '#9c27b0', '&:hover': { bgcolor: '#9c27b0', color: 'white' } }}
            >
              Student Directory
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;