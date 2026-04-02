import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, CircularProgress, Avatar, useTheme } from '@mui/material';
import { FolderCopy, CheckCircle, AddCircle, Campaign, TrendingUp, PieChart as PieIcon, BarChart as BarIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
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

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error("Student stats error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
  if (!stats) return <Box display="flex" justifyContent="center" py={10}><Typography color="error">Failed to load personal analytics.</Typography></Box>;

  // Progress data for gauge chart
  const progressData = [
    { name: 'Completed', value: stats.completed_projects || 0 },
    { name: 'Remaining', value: Math.max(0, (stats.total_projects || 0) - (stats.completed_projects || 0)) }
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="900" sx={{ mb: 1 }}>Research Insights 👋</Typography>
        <Typography variant="body1" color="textSecondary">Welcome back, {user?.name?.split(' ')[0]}. Here is your academic progress report.</Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6}>
          <StatCard title="Total Activities" count={stats.total_projects} icon={<FolderCopy fontSize="large" />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard title="Milestones Met" count={stats.completed_projects} icon={<CheckCircle fontSize="large" />} color="success" />
        </Grid>
      </Grid>

      {/* Approval Status Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #eef2f6', bgcolor: '#fafafa' }}>
            <Typography variant="h6" fontWeight="800" mb={2}>Submission Tracking</Typography>
            <Grid container spacing={2}>
              {[
                { label: 'Waiting for Approval', count: stats.status_distribution?.find(s => s.name === 'Submitted')?.count || 0, color: '#1565c0' },
                { label: 'Visible in System', count: stats.status_distribution?.find(s => s.name === 'Approved')?.count || 0, color: '#2e7d32' },
                { label: 'Requires Revision', count: stats.status_distribution?.find(s => s.name === 'Rejected')?.count || 0, color: '#d32f2f' }
              ].map((item, idx) => (
                <Grid item xs={12} sm={4} key={idx}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'white', border: '1px solid #eee', textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="900" sx={{ color: item.color }}>{item.count}</Typography>
                    <Typography variant="caption" fontWeight="bold" color="textSecondary">{item.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={4}>
        {/* Activity Distribution */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: 400, border: '1px solid #eef2f6' }}>
            <Typography variant="h6" fontWeight="700" mb={3} display="flex" alignItems="center" gap={1}>
              <BarIcon sx={{ color: 'primary.main' }} /> My Research Mix
            </Typography>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={stats.type_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {stats.type_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Progress Chart */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: 400, border: '1px solid #eef2f6' }}>
            <Typography variant="h6" fontWeight="700" mb={3} display="flex" alignItems="center" gap={1}>
              <TrendingUp sx={{ color: 'success.main' }} /> Completion Velocity
            </Typography>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={progressData}
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell fill="#2e7d32" />
                  <Cell fill="#f5f5f5" />
                </Pie>
                <Tooltip />
                <Box sx={{ position: 'relative', top: -50, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="900">
                    {stats.total_projects > 0 ? Math.round((stats.completed_projects / stats.total_projects) * 100) : 0}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary">COMPLETION RATE</Typography>
                </Box>
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'primary.main', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h5" fontWeight="900" mb={1}>Accelerate Your Research</Typography>
          <Typography variant="body1" mb={4} sx={{ opacity: 0.9, maxWidth: 600 }}>Log a new achievement, paper, or hackathon participation to build your verified academic portfolio.</Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth variant="contained" size="large"
                startIcon={<AddCircle />}
                onClick={() => navigate('/add-activity')}
                sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 'bold', py: 1.5, '&:hover': { bgcolor: '#f5f5f5' } }}
              >
                Log New Activity
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth variant="outlined" size="large"
                startIcon={<Campaign />}
                onClick={() => navigate('/all-activities')}
                sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', py: 1.5, '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                Global Activity Feed
              </Button>
            </Grid>
          </Grid>
        </Box>
        <FolderCopy sx={{ position: 'absolute', right: -40, bottom: -40, fontSize: 240, opacity: 0.1, transform: 'rotate(-15deg)' }} />
      </Paper>
    </Box>
  );
};

export default StudentDashboard;