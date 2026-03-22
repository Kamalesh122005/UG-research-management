import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Chip, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress,
    Button, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Add, Delete, OpenInNew, FolderOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TYPE_COLORS = {
    'Internally Funded Projects': { bg: '#e3f2fd', color: '#1565c0' },
    'Conferences': { bg: '#e8f5e9', color: '#2e7d32' },
    'Hackathons': { bg: '#fff3e0', color: '#e65100' },
    'Journal Publication': { bg: '#f3e5f5', color: '#6a1b9a' },
    'Achievement': { bg: '#ffebee', color: '#c62828' },
};

const MyActivities = () => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchActivities = () => {
        setLoading(true);
        axios.get('/api/activities/my')
            .then(res => setActivities(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchActivities(); }, []);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await axios.delete(`/api/activities/${deleteId}`);
            setDeleteId(null);
            fetchActivities();
        } catch {
            // ignore
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Box>
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-end">
                <Box>
                    <Typography variant="h4" fontWeight="800" gutterBottom>My Submissions</Typography>
                    <Typography variant="body1" color="textSecondary">Manage your registered academic and extracurricular profile.</Typography>
                </Box>
                <Button
                    variant="contained" color="primary"
                    startIcon={<Add />} onClick={() => navigate('/add-activity')}
                    disableElevation sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}
                >
                    Add Submission
                </Button>
            </Box>

            <Paper elevation={1} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'grey.200' }}>
                <Box p={2.5} bgcolor="white" borderBottom="1px solid" borderColor="grey.200" display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight="bold">Activity History Overview</Typography>
                    <Chip label={`${activities.length} Recorded`} size="small" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }} />
                </Box>

                {loading ? (
                    <Box display="flex" justifyContent="center" py={12}><CircularProgress /></Box>
                ) : activities.length === 0 ? (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={12}>
                        <FolderOff sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                        <Typography variant="h6" fontWeight="bold" color="textSecondary">No submissions found</Typography>
                        <Typography variant="body2" color="textSecondary" mb={3}>You haven't logged any activities onto the platform yet.</Typography>
                        <Button variant="outlined" startIcon={<Add />} onClick={() => navigate('/add-activity')} sx={{ borderRadius: 2 }}>
                            Make your First Entry
                        </Button>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>IDENTIFIER</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>CLASSIFICATION</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>STUDENT RANK</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>STATUS</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>DATE RECORDED</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>DOCS</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>ACTIONS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {activities.map((act) => {
                                    const typeStyle = TYPE_COLORS[act.activity_type] || { bg: '#eeeeee', color: '#555555' };
                                    return (
                                        <TableRow key={act.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.01)' } }}>
                                            <TableCell>
                                                <Typography fontWeight="bold" variant="body2" color="text.primary">{act.title}</Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {act.domain ? `Domain: ${act.domain}` : 'No Attached Domain'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={act.activity_type} size="small" sx={{ bgcolor: typeStyle.bg, color: typeStyle.color, fontWeight: 'bold', fontSize: '0.75rem', borderRadius: 1.5 }} />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{act.student_level || 'General Entry'}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={act.status} size="small" sx={{
                                                    bgcolor: act.status === 'completed' ? '#e8f5e9' : '#fff3e0',
                                                    color: act.status === 'completed' ? '#2e7d32' : '#e65100',
                                                    fontWeight: 'bold', fontSize: '0.7rem', textTransform: 'uppercase'
                                                }} />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {act.date ? new Date(act.date).toLocaleDateString('en-IN') : '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                {act.certificate_path ? (
                                                    <Tooltip title="View Certificate Document">
                                                        <IconButton size="small" color="primary" href={`http://localhost:5050${act.certificate_path}`} target="_blank">
                                                            <OpenInNew fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">—</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Delete Entry permanently">
                                                    <IconButton color="error" size="small" onClick={() => setDeleteId(act.id)}>
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Modern Dialog Wrapper */}
            <Dialog
                open={Boolean(deleteId)} onClose={() => setDeleteId(null)}
                maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>Delete Activity Record</DialogTitle>
                <DialogContent>
                    <Typography color="text.secondary">Are you sure you want to delete this repository entry permanently? This action removes all tied documentation and cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ pb: 2, px: 3 }}>
                    <Button onClick={() => setDeleteId(null)} disabled={deleting} color="inherit" sx={{ fontWeight: 'bold' }}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained" disableElevation disabled={deleting} sx={{ borderRadius: 2 }}>
                        {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete Permanently'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MyActivities;
