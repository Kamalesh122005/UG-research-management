import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Avatar, Button } from '@mui/material';
import { Group, FolderCopy, EmojiEvents, ArrowForward } from '@mui/icons-material';
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

const StaffDashboard = () => {
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
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Typography variant="h4" fontWeight="800" gutterBottom>Staff Portal Overview</Typography>
          <Typography variant="body1" color="textSecondary">Welcome back, {user?.name}. Monitor academic repository metrics.</Typography>
        </Box>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6}>
          <StatCard title="Registered Students" count={stats.total_students} icon={<Group fontSize="large" />} color="info" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard title="Total Activities" count={stats.total_activities} icon={<FolderCopy fontSize="large" />} color="primary" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                <EmojiEvents color="warning" /> Network Contributions by Category
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {Object.keys(stats.by_type || {}).map((type) => (
                <Grid item xs={12} sm={4} key={type}>
                  <Box p={2} bgcolor="#fafafa" borderRadius={2} border="1px solid #eee">
                    <Typography variant="caption" color="textSecondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>{type}</Typography>
                    <Typography variant="h5" fontWeight="bold" mt={0.5} color="text.primary">{stats.by_type[type]}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" fontWeight="bold">Direct Navigation</Typography>
            <Button
              variant="outlined" color="primary" size="large"
              endIcon={<ArrowForward />} onClick={() => navigate('/students')}
              sx={{ justifyContent: 'space-between', py: 1.5 }}
            >
              Browse Student Directory
            </Button>
            <Button
              variant="contained" color="primary" size="large" disableElevation
              endIcon={<ArrowForward />} onClick={() => navigate('/all-activities')}
              sx={{ justifyContent: 'space-between', py: 1.5 }}
            >
              View Global Activity Feed
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StaffDashboard;