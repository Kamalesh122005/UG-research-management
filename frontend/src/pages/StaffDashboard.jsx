import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Avatar, Button, useTheme } from '@mui/material';
import { Group, FolderCopy, EmojiEvents, ArrowForward, PieChart as PieIcon, BarChart as BarIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const StatCard = ({ title, count, icon, color }) => (
  <Paper elevation={0} sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid #eef2f6' }}>
    <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 56, height: 56 }}>
      {icon}
    </Avatar>
    <Box>
      <Typography variant="h4" fontWeight="800">{count}</Typography>
      <Typography variant="body2" color="textSecondary" fontWeight="600" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</Typography>
    </Box>
  </Paper >
);

const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error("Staff stats error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
  if (!stats) return <Box display="flex" justifyContent="center" py={10}><Typography color="error">Failed to load mentor metrics.</Typography></Box>;

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Typography variant="h4" fontWeight="900" sx={{ mb: 1 }}>Mentorship Intelligence</Typography>
          <Typography variant="body1" color="textSecondary">Welcome back, {user?.name}. Tracking your mentees' research progress.</Typography>
        </Box>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6}>
          <StatCard title="My Mentees' Projects" count={stats.total_mentee_projects} icon={<FolderCopy fontSize="large" />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard title="Active Network" count="Verified" icon={<EmojiEvents fontSize="large" />} color="warning" />
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={4}>
        {/* Project Type Distribution */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: 400, border: '1px solid #eef2f6' }}>
            <Typography variant="h6" fontWeight="700" mb={3} display="flex" alignItems="center" gap={1}>
              <BarIcon sx={{ color: 'primary.main' }} /> Research Portfolio by Category
            </Typography>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={stats.type_distribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} cursor={{ fill: '#f5f5f5' }} />
                <Bar dataKey="count" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Status Distribution */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: 400, border: '1px solid #eef2f6' }}>
            <Typography variant="h6" fontWeight="700" mb={3} display="flex" alignItems="center" gap={1}>
              <PieIcon sx={{ color: 'warning.main' }} /> Mentee Progress Status
            </Typography>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={stats.status_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {stats.status_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Approved' ? '#2e7d32' : entry.name === 'Rejected' ? '#d32f2f' : '#0288d1'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #eef2f6' }}>
        <Typography variant="h6" fontWeight="800" mb={2}>Quick Navigation</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth variant="outlined" color="primary" size="large"
              endIcon={<ArrowForward />} onClick={() => navigate('/students')}
              sx={{ justifyContent: 'space-between', py: 2, borderRadius: 3 }}
            >
              Access Student Profiles
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth variant="contained" color="primary" size="large" disableElevation
              endIcon={<ArrowForward />} onClick={() => navigate('/all-activities')}
              sx={{ justifyContent: 'space-between', py: 2, borderRadius: 3 }}
            >
              Enterprise Research Feed
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default StaffDashboard;