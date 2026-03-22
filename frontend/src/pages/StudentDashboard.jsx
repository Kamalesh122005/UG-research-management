import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, CircularProgress, Avatar } from '@mui/material';
import { FolderCopy, CheckCircle, AddCircle, Campaign, TrendingUp } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StatCard = ({ title, count, icon, color }) => (
  <Paper elevation={2} sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
    <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 56, height: 56 }}>
      {icon}
    </Avatar>
    <Box>
      <Typography variant="h4" fontWeight="bold">{count}</Typography>
      <Typography variant="body2" color="textSecondary" fontWeight="500">{title}</Typography>
    </Box>
  </Paper >
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, ongoing: 0, completed: 0, byType: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/activities/my')
      .then(res => {
        const activities = res.data;
        const total = activities.length;
        const ongoing = activities.filter(a => a.status === 'ongoing').length;
        const completed = activities.filter(a => a.status === 'completed').length;

        const byType = {};
        activities.forEach(a => {
          byType[a.activity_type] = (byType[a.activity_type] || 0) + 1;
        });

        setStats({ total, ongoing, completed, byType });
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="800" gutterBottom>Welcome back, {user?.name?.split(' ')[0]} 👋</Typography>
        <Typography variant="body1" color="textSecondary">Here's a quick overview of your academic research and activities.</Typography>
      </Box>

      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} sm={4}>
          <StatCard title="Total Activities" count={stats.total} icon={<FolderCopy fontSize="large" />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Ongoing Projects" count={stats.ongoing} icon={<TrendingUp fontSize="large" />} color="warning" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Completed" count={stats.completed} icon={<CheckCircle fontSize="large" />} color="success" />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" mb={3}>Activity Breakdown</Typography>
            {Object.keys(stats.byType).length === 0 ? (
              <Typography color="textSecondary">No activities recorded yet.</Typography>
            ) : (
              <Grid container spacing={2}>
                {Object.keys(stats.byType).map(type => (
                  <Grid item xs={12} sm={6} key={type}>
                    <Box p={2} bgcolor="#f8f9fa" borderRadius={2} border="1px solid #eee">
                      <Typography variant="caption" color="textSecondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>{type}</Typography>
                      <Typography variant="h5" fontWeight="bold" mt={0.5} color="primary.main">{stats.byType[type]}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3, height: '100%', bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6" fontWeight="bold" mb={1}>Quick Actions</Typography>
            <Typography variant="body2" mb={4} sx={{ opacity: 0.8 }}>Log a new research project, certificate, or publication instantly.</Typography>

            <Button
              fullWidth variant="contained" size="large"
              startIcon={<AddCircle />}
              onClick={() => navigate('/add-activity')}
              sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 'bold', mb: 2, '&:hover': { bgcolor: '#f5f5f5' } }}
            >
              Add New Activity
            </Button>
            <Button
              fullWidth variant="outlined" size="large"
              startIcon={<Campaign />}
              onClick={() => navigate('/all-activities')}
              sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              View Global feed
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;