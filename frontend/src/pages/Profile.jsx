import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Grid, CircularProgress,
  AppBar, Toolbar, IconButton, Button, Avatar, Chip
} from '@mui/material';
import { ArrowBack, Person, School } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/users/profile')
      .then(res => setProfile(res.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const roleColor = {
    student: '#1a237e',
    staff: '#1b5e20',
    admin: '#263238',
  };

  return (
    <Box sx={{ backgroundColor: '#f0f4ff', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #1a237e, #3949ab)' }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <School sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>My Profile</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : profile ? (
          <>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 3 }}>
              <Box display="flex" alignItems="center" gap={3} mb={3}>
                <Avatar sx={{
                  width: 80, height: 80, fontSize: 32,
                  bgcolor: roleColor[profile.role] || '#1a237e'
                }}>
                  {profile.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{profile.name}</Typography>
                  <Chip
                    label={profile.role?.toUpperCase()}
                    size="small"
                    sx={{ bgcolor: roleColor[profile.role], color: 'white', fontWeight: 'bold', mt: 0.5 }}
                  />
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box p={2} bgcolor="#f5f5f5" borderRadius={2}>
                    <Typography variant="caption" color="textSecondary" fontWeight="bold">EMAIL</Typography>
                    <Typography variant="body1" mt={0.5}>{profile.email}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box p={2} bgcolor="#f5f5f5" borderRadius={2}>
                    <Typography variant="caption" color="textSecondary" fontWeight="bold">DEPARTMENT</Typography>
                    <Typography variant="body1" mt={0.5}>{profile.department || 'Not specified'}</Typography>
                  </Box>
                </Grid>
                {profile.role === 'student' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Box p={2} bgcolor="#f5f5f5" borderRadius={2}>
                        <Typography variant="caption" color="textSecondary" fontWeight="bold">REGISTER NUMBER</Typography>
                        <Typography variant="body1" mt={0.5}>{profile.register_number || 'Not specified'}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box p={2} bgcolor="#f5f5f5" borderRadius={2}>
                        <Typography variant="caption" color="textSecondary" fontWeight="bold">YEAR OF STUDY</Typography>
                        <Typography variant="body1" mt={0.5}>{profile.year ? `Year ${profile.year}` : 'Not specified'}</Typography>
                      </Box>
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <Box p={2} bgcolor="#f5f5f5" borderRadius={2}>
                    <Typography variant="caption" color="textSecondary" fontWeight="bold">MEMBER SINCE</Typography>
                    <Typography variant="body1" mt={0.5}>
                      {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Box display="flex" gap={2}>
              <Button variant="contained" onClick={() => navigate(-1)} sx={{ borderRadius: 2 }}>
                Back to Dashboard
              </Button>
              {user?.role === 'student' && (
                <Button variant="outlined" onClick={() => navigate('/my-activities')} sx={{ borderRadius: 2 }}>
                  My Activities
                </Button>
              )}
            </Box>
          </>
        ) : (
          <Typography color="error">Failed to load profile.</Typography>
        )}
      </Container>
    </Box>
  );
};

export default Profile;