import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, CircularProgress, Alert, Avatar, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Tooltip
} from '@mui/material';
import { ArrowBack, FolderOff, OpenInNew } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const TYPE_COLORS = {
  'Internally Funded Projects': { bg: '#e3f2fd', color: '#1565c0' },
  'Conferences': { bg: '#e8f5e9', color: '#2e7d32' },
  'Hackathons': { bg: '#fff3e0', color: '#e65100' },
  'Journal Publication': { bg: '#f3e5f5', color: '#6a1b9a' },
  'Achievement': { bg: '#ffebee', color: '#c62828' },
};

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      axios.get(`/api/users/students/${id}`),
      axios.get(`/api/activities/student/${id}`)
    ])
      .then(([sRes, aRes]) => {
        setStudent(sRes.data);
        setActivities(aRes.data);
      })
      .catch(() => setError('Failed to load student data.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box display="flex" justifyContent="center" py={12}><CircularProgress /></Box>;
  if (error) return <Box mt={4}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box>
      <Box mb={4} display="flex" alignItems="center" gap={2}>
        <Button variant="outlined" color="inherit" onClick={() => navigate(-1)} startIcon={<ArrowBack />} sx={{ borderRadius: 2 }}>
          Back to Directory
        </Button>
      </Box>

      {/* Profile Header Card */}
      <Paper elevation={1} sx={{ p: 4, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
        <Box display="flex" alignItems="center" gap={3} mb={4}>
          <Avatar sx={{ width: 80, height: 80, fontSize: 32, bgcolor: 'primary.main', fontWeight: 'bold' }}>
            {student?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="800" color="textPrimary">{student?.name}</Typography>
            <Typography variant="body1" color="textSecondary">{student?.email}</Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box p={2.5} bgcolor="#f8f9fa" borderRadius={2} border="1px solid #eee">
              <Typography variant="caption" color="textSecondary" fontWeight="bold">REGISTER HASH</Typography>
              <Typography variant="h6" fontWeight="bold">{student?.register_number || 'N/A'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box p={2.5} bgcolor="#f8f9fa" borderRadius={2} border="1px solid #eee">
              <Typography variant="caption" color="textSecondary" fontWeight="bold">DEPARTMENT</Typography>
              <Typography variant="h6" fontWeight="bold">{student?.department || 'N/A'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box p={2.5} bgcolor="#f8f9fa" borderRadius={2} border="1px solid #eee">
              <Typography variant="caption" color="textSecondary" fontWeight="bold">LEVEL</Typography>
              <Typography variant="h6" fontWeight="bold">{student?.year ? 'Year ' + student.year : 'N/A'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box p={2.5} bgcolor="#e3f2fd" borderRadius={2} border="1px solid" borderColor="primary.light">
              <Typography variant="caption" color="primary.main" fontWeight="bold">TOTAL ACTIVITIES</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">{activities.length}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Activity Log */}
      <Paper elevation={1} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'grey.200' }}>
        <Box p={2.5} bgcolor="white" borderBottom="1px solid" borderColor="grey.200" display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight="bold">Repository Submissions</Typography>
          <Chip label={activities.length + ' Recorded'} size="small" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }} />
        </Box>

        {activities.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={10}>
            <FolderOff sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" color="textSecondary">No submissions found</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>IDENTIFIER</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>CLASSIFICATION</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>TIMESTAMP</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>DOCS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activities.map((act) => {
                  const typeStyle = TYPE_COLORS[act.activity_type] || { bg: '#eeeeee', color: '#555555' };
                  return (
                    <TableRow key={act.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.01)' } }}>
                      <TableCell>
                        <Typography fontWeight="bold" variant="body2">{act.title}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {act.domain ? 'Domain: ' + act.domain : 'No Domain'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={act.activity_type} size="small" sx={{ bgcolor: typeStyle.bg, color: typeStyle.color, fontWeight: 'bold', fontSize: '0.75rem', borderRadius: 1.5 }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={act.status} size="small" sx={{
                          bgcolor: act.status === 'completed' ? '#e8f5e9' : '#fff3e0',
                          color: act.status === 'completed' ? '#2e7d32' : '#e65100',
                          fontWeight: 'bold', fontSize: '0.7rem', textTransform: 'uppercase'
                        }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{act.date ? new Date(act.date).toLocaleDateString('en-IN') : '—'}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        {act.certificate_path ? (
                          <Tooltip title="View Attachment">
                            <IconButton size="small" color="primary" href={'http://localhost:4000' + act.certificate_path} target="_blank">
                              <OpenInNew fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" color="text.secondary">—</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default StudentProfile;
