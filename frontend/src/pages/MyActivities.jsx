import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Chip, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress,
    Button, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Add, Delete, OpenInNew, FolderOff, Edit, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProjectDetailModal from '../components/ProjectDetailModal';

const TYPE_COLORS = {
    'Internally Funded Project': { bg: '#e3f2fd', color: '#1565c0' },
    'Conference': { bg: '#e8f5e9', color: '#2e7d32' },
    'Hackathon': { bg: '#fff3e0', color: '#e65100' },
    'Publication': { bg: '#f3e5f5', color: '#6a1b9a' },
    'Achievement': { bg: '#ffebee', color: '#c62828' },
};

const STATUS_COLORS = {
    Submitted: { bg: '#e3f2fd', color: '#1565c0' },
    Approved: { bg: '#e8f5e9', color: '#2e7d32' },
    Rejected: { bg: '#ffebee', color: '#c62828' },
};

const MyActivities = () => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Requirement 10
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [selectedAct, setSelectedAct] = useState(null);

    const fetchActivities = () => {
        setLoading(true);
        setError(null);
        axios.get('/api/activities/my')
            .then(res => {
                // Requirement 1: Ensure it's an array
                setActivities(Array.isArray(res.data) ? res.data : []);
            })
            .catch(err => {
                console.error("Fetch error:", err);
                setError("Failed to load your activities. Please try again later.");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchActivities(); }, []);

    const handleDelete = async (id) => {
        const targetId = id || deleteId;
        setDeleting(true);
        try {
            await axios.delete(`/api/activities/${targetId}`);
            setDeleteId(null);
            setSelectedAct(null);
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
                    <Typography variant="h4" fontWeight="800" gutterBottom>My Research Activities</Typography>
                    <Typography variant="body1" color="textSecondary">Track and manage your research portfolio and submission status.</Typography>
                </Box>
                <Button
                    variant="contained" color="primary"
                    startIcon={<Add />} onClick={() => navigate('/submit')}
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
                ) : error ? (
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px solid #ffcdd2', bgcolor: '#fff5f5' }}>
                        <Typography color="error" variant="h6" fontWeight="bold">{error}</Typography>
                        <Button onClick={fetchActivities} sx={{ mt: 2 }}>Retry</Button>
                    </Paper>
                ) : !activities || activities.length === 0 ? (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={12}>
                        <FolderOff sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                        <Typography variant="h6" fontWeight="bold" color="textSecondary">No activities found</Typography>
                        <Typography variant="body2" color="textSecondary" mb={3}>You haven't logged any research activities yet.</Typography>
                        <Button variant="outlined" startIcon={<Add />} onClick={() => navigate('/submit')} sx={{ borderRadius: 2 }}>
                            Submit First Activity
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
                                        <TableRow
                                            key={act.id}
                                            hover
                                            sx={{ cursor: 'pointer', '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.01)' } }}
                                            onClick={() => setSelectedAct(act)}
                                        >
                                            <TableCell>
                                                <Typography fontWeight="bold" variant="body2" color="text.primary">{act.title}</Typography>
                                                <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                                                    {act.domain && (
                                                        <Chip
                                                            label={act.domain}
                                                            size="small"
                                                            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 'bold', borderRadius: 1, bgcolor: '#e8f4fd', color: '#1565c0' }}
                                                        />
                                                    )}
                                                    {act.mentor_name && (
                                                        <Chip
                                                            label={`Mentor: ${act.mentor_display_name}`}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 'bold', borderRadius: 1 }}
                                                        />
                                                    )}
                                                </Box>
                                                {act.keywords && (
                                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                                        Keywords: {act.keywords}
                                                    </Typography>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <Chip label={act.activity_type} size="small" sx={{ bgcolor: typeStyle.bg, color: typeStyle.color, fontWeight: 'bold', fontSize: '0.75rem', borderRadius: 1.5 }} />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{act.student_level || 'General Entry'}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={act.status}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: STATUS_COLORS[act.status]?.bg || '#f5f5f5',
                                                        color: STATUS_COLORS[act.status]?.color || '#757575',
                                                        fontWeight: 'bold', fontSize: '0.7rem', textTransform: 'uppercase'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {act.date ? new Date(act.date).toLocaleDateString('en-IN') : '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                {act.certificate_path ? (
                                                    <Tooltip title="View Certificate Document">
                                                        <IconButton size="small" color="primary" href={`http://localhost:5050${act.certificate_path}`} target="_blank" onClick={(e) => e.stopPropagation()}>
                                                            <OpenInNew fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">—</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                                                <Box display="flex" justifyContent="center" gap={1}>
                                                    {act.status === 'Submitted' ? (
                                                        <>
                                                            <Tooltip title="Edit Submission">
                                                                <IconButton color="primary" size="small" onClick={() => navigate(`/edit-activity/${act.id}`)}>
                                                                    <Edit fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete Entry permanently">
                                                                <IconButton color="error" size="small" onClick={() => setDeleteId(act.id)}>
                                                                    <Delete fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </>
                                                    ) : (
                                                        <Typography variant="caption" color="text.secondary">Locked</Typography>
                                                    )}
                                                </Box>
                                            </TableCell>

                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            <ProjectDetailModal
                open={Boolean(selectedAct)}
                onClose={() => setSelectedAct(null)}
                project={selectedAct}
                onDelete={(id) => setDeleteId(id)}
            />

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
                    <Button onClick={() => handleDelete()} color="error" variant="contained" disableElevation disabled={deleting} sx={{ borderRadius: 2 }}>
                        {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete Permanently'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MyActivities;
