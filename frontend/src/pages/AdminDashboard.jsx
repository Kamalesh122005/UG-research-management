import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Avatar, Button, Divider } from '@mui/material';
import { Group, FolderCopy, Analytics, PersonAdd, Timeline, ArrowForward } from '@mui/icons-material';
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

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_students: 0, total_activities: 0, by_type: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/activities/stats')
      .then(res => setStats(res.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="800" gutterBottom>System Administration</Typography>
        <Typography variant="body1" color="textSecondary">Welcome back, {user?.name}. Total system health and metrics overview.</Typography>
      </Box>

      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} sm={4}>
          <StatCard title="Total Students" count={stats.total_students} icon={<Group fontSize="large" />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Platform Activities" count={stats.total_activities} icon={<Timeline fontSize="large" />} color="success" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Active Departments" count="9" icon={<Analytics fontSize="large" />} color="secondary" />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" mb={3}>Global Activity Breakdown</Typography>
            <Grid container spacing={2}>
              {Object.keys(stats.by_type || {}).map(type => (
                <Grid item xs={12} sm={6} key={type}>
                  <Box p={2.5} bgcolor="#f8f9fa" borderRadius={2} border="1px solid #eee" display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="textSecondary" fontWeight="bold" sx={{ width: '70%', textTransform: 'uppercase' }}>{type}</Typography>
                    <Typography variant="h5" fontWeight="bold" color="text.primary">{stats.by_type[type]}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="bold" mb={3}>Quick Control Panel</Typography>

            <Button
              variant="outlined" color="primary" size="large"
              startIcon={<PersonAdd />} endIcon={<ArrowForward />}
              onClick={() => navigate('/manage-users')}
              sx={{ justifyContent: 'space-between', py: 2, mb: 2, borderRadius: 2 }}
            >
              User Management
            </Button>

            <Button
              variant="contained" color="secondary" size="large" disableElevation
              startIcon={<FolderCopy />} endIcon={<ArrowForward />}
              onClick={() => navigate('/all-activities')}
              sx={{ justifyContent: 'space-between', py: 2, mb: 2, borderRadius: 2 }}
            >
              Enterprise Activity Feed
            </Button>

            <Divider sx={{ my: 1 }} />
            <Button
              variant="text" color="inherit" size="large"
              endIcon={<ArrowForward />} onClick={() => navigate('/students')}
              sx={{ justifyContent: 'space-between', py: 2, borderRadius: 2 }}
            >
              Student Directory
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;