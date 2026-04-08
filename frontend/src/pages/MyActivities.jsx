import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Chip, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress,
    Button, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, useTheme
} from '@mui/material';
import { Add, Delete, OpenInNew, FolderOff, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProjectDetailModal from '../components/ProjectDetailModal';

const TYPE_COLORS = {
    'Internally Funded Projects': { bg: '#EFF6FF', color: '#2563EB', darkBg: 'rgba(37,99,235,0.15)', darkColor: '#60A5FA' },
    'Conferences': { bg: '#ECFDF5', color: '#059669', darkBg: 'rgba(5,150,105,0.15)', darkColor: '#34D399' },
    'Hackathons': { bg: '#FFFBEB', color: '#D97706', darkBg: 'rgba(217,119,6,0.15)', darkColor: '#FBBF24' },
    'Journal Publication': { bg: '#F5F3FF', color: '#7C3AED', darkBg: 'rgba(124,58,237,0.15)', darkColor: '#A78BFA' },
    'Achievement': { bg: '#FEF2F2', color: '#DC2626', darkBg: 'rgba(220,38,38,0.15)', darkColor: '#F87171' },
};

const STATUS_COLORS = {
    Submitted: { bg: '#FFFBEB', color: '#D97706', darkBg: 'rgba(217,119,6,0.15)', darkColor: '#FBBF24' },
    Approved: { bg: '#ECFDF5', color: '#059669', darkBg: 'rgba(5,150,105,0.15)', darkColor: '#34D399' },
    Rejected: { bg: '#FEF2F2', color: '#DC2626', darkBg: 'rgba(220,38,38,0.15)', darkColor: '#F87171' },
    'In Progress': { bg: '#EFF6FF', color: '#2563EB', darkBg: 'rgba(37,99,235,0.15)', darkColor: '#60A5FA' },
    Completed: { bg: '#F0FDF4', color: '#16A34A', darkBg: 'rgba(22,163,74,0.15)', darkColor: '#4ADE80' },
    Pending: { bg: '#FFFBEB', color: '#D97706', darkBg: 'rgba(217,119,6,0.15)', darkColor: '#FBBF24' },
};

const getColors = (map, key, isDark) => {
    const t = map[key];
    if (!t) return isDark ? { bg: 'rgba(100,116,139,0.15)', color: '#94A3B8' } : { bg: '#F1F5F9', color: '#64748B' };
    return isDark ? { bg: t.darkBg, color: t.darkColor } : { bg: t.bg, color: t.color };
};

const CHIP_SX = (c) => ({
    bgcolor: c.bg, color: c.color,
    fontWeight: 700, fontSize: '0.68rem',
    textTransform: 'uppercase', letterSpacing: '0.04em',
    borderRadius: '8px', border: 'none',
});

const MyActivities = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [activities, setActivities] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [selectedAct, setSelectedAct] = useState(null);

    const fetchInvitations = () => {
        axios.get('/api/activities/invitations')
            .then(res => setInvitations(res.data))
            .catch(err => console.error("Invite fetch error:", err));
    };

    const handleInviteRespond = async (invite_id, response) => {
        try {
            await axios.put('/api/activities/invite/respond', { invite_id, response });
            fetchInvitations();
            fetchActivities();
        } catch (err) {
            console.error(err);
        }
    };

    const fetchActivities = () => {
        setLoading(true);
        setError(null);
        axios.get('/api/activities/my')
            .then(res => {
                setActivities(Array.isArray(res.data) ? res.data : []);
            })
            .catch(err => {
                console.error("Fetch error:", err);
                setError("Failed to load your activities. Please try again later.");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchActivities(); fetchInvitations(); }, []);

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
            {/* Header */}
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
                        My Research Activities
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Track and manage your research portfolio and submission status.
                    </Typography>
                </Box>
                <Button
                    variant="contained" color="primary"
                    startIcon={<Add />} onClick={() => navigate('/submit')}
                    sx={{ borderRadius: '10px', px: 3, py: 1.2, fontWeight: 700 }}
                >
                    Add Submission
                </Button>
            </Box>

            {/* Pending Invitations */}
            {invitations.length > 0 && (
                <Paper elevation={0} sx={{
                    borderRadius: '14px', mb: 3, p: 3, border: '1px solid',
                    borderColor: isDark ? 'rgba(251,191,36,0.3)' : 'rgba(217,119,6,0.25)',
                    bgcolor: isDark ? 'rgba(217,119,6,0.08)' : '#FFFBEB',
                }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: isDark ? '#FBBF24' : '#D97706', mb: 2 }}>
                        Pending Invitations
                    </Typography>
                    {invitations.map(inv => (
                        <Box
                            key={inv.invite_id}
                            display="flex" justifyContent="space-between" alignItems="center"
                            p={2} mb={1}
                            sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'white', borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}
                        >
                            <Box>
                                <Typography fontWeight={700} color="text.primary">{inv.project_title}</Typography>
                                <Typography variant="body2" color="text.secondary">Invited by: {inv.owner_name}</Typography>
                            </Box>
                            <Box display="flex" gap={1}>
                                <Button variant="contained" color="success" size="small" onClick={() => handleInviteRespond(inv.invite_id, 'accepted')} disableElevation sx={{ borderRadius: '8px', fontWeight: 700 }}>Accept</Button>
                                <Button variant="outlined" color="error" size="small" onClick={() => handleInviteRespond(inv.invite_id, 'rejected')} sx={{ borderRadius: '8px', fontWeight: 700 }}>Reject</Button>
                            </Box>
                        </Box>
                    ))}
                </Paper>
            )}

            {/* Activity Table */}
            <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
                <Box px={3} py={2} borderBottom="1px solid" borderColor="divider" display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight={700} color="text.primary">Activity History</Typography>
                    <Chip label={`${activities.length} recorded`} size="small" color="primary" sx={{ fontWeight: 700, fontSize: '0.72rem', borderRadius: '8px' }} />
                </Box>

                {loading ? (
                    <Box display="flex" justifyContent="center" py={12}><CircularProgress /></Box>
                ) : error ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="error" variant="h6" fontWeight={700} mb={2}>{error}</Typography>
                        <Button onClick={fetchActivities} variant="outlined">Retry</Button>
                    </Box>
                ) : !activities || activities.length === 0 ? (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={12}>
                        <Box sx={{ width: 72, height: 72, borderRadius: '20px', bgcolor: isDark ? 'rgba(37,99,235,0.15)' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                            <FolderOff sx={{ fontSize: 36, color: 'primary.main' }} />
                        </Box>
                        <Typography variant="h6" fontWeight={700} color="text.primary" mb={0.5}>No activities yet</Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>Get started by submitting your first research activity.</Typography>
                        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/submit')} sx={{ borderRadius: '10px', fontWeight: 700 }}>
                            Submit First Activity
                        </Button>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Title / Domain</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Year</TableCell>
                                    <TableCell>Activity Status</TableCell>
                                    <TableCell>Approval Status</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="center">Docs</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {activities.map((act) => {
                                    const typeC = getColors(TYPE_COLORS, act.activity_type, isDark);
                                    const statusC = getColors(STATUS_COLORS, act.status, isDark);
                                    const approvalC = getColors(STATUS_COLORS, act.approval_status || 'Pending', isDark);
                                    return (
                                        <TableRow
                                            key={act.id}
                                            hover
                                            sx={{ cursor: 'pointer' }}
                                            onClick={() => setSelectedAct(act)}
                                        >
                                            <TableCell>
                                                <Typography fontWeight={700} variant="body2" color="text.primary">{act.title}</Typography>
                                                <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                                                    {act.domain && (
                                                        <Chip label={act.domain} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, borderRadius: '8px', bgcolor: isDark ? 'rgba(96,165,250,0.15)' : '#EFF6FF', color: isDark ? '#60A5FA' : '#2563EB' }} />
                                                    )}
                                                    {act.mentor_display_name && (
                                                        <Chip label={`Mentor: ${act.mentor_display_name}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600, borderRadius: '8px' }} />
                                                    )}
                                                </Box>
                                                {act.keywords && (
                                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                                        {act.keywords}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={act.activity_type} size="small" sx={CHIP_SX(typeC)} />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">{act.student_level || '—'}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={act.status} size="small" sx={CHIP_SX(statusC)} />
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={act.approval_status || 'Pending'} size="small" sx={CHIP_SX(approvalC)} />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {act.date ? new Date(act.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                {act.certificate_path ? (
                                                    <Tooltip title="View Document">
                                                        <IconButton size="small" color="primary" href={`http://localhost:4000${act.certificate_path}`} target="_blank" onClick={(e) => e.stopPropagation()}>
                                                            <OpenInNew fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">—</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                                                <Box display="flex" justifyContent="center" gap={1}>
                                                    {(act.approval_status === 'Pending' || act.approval_status === null) ? (
                                                        <>
                                                            <Tooltip title="Edit Submission">
                                                                <IconButton color="primary" size="small" onClick={() => navigate(`/edit-activity/${act.id}`)}>
                                                                    <Edit fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete Entry">
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

            <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Delete Activity Record</DialogTitle>
                <DialogContent>
                    <Typography color="text.secondary">Are you sure you want to permanently delete this activity? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ pb: 2, px: 3 }}>
                    <Button onClick={() => setDeleteId(null)} disabled={deleting} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
                    <Button onClick={() => handleDelete()} color="error" variant="contained" disableElevation disabled={deleting} sx={{ borderRadius: '10px', fontWeight: 700 }}>
                        {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete Permanently'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MyActivities;
