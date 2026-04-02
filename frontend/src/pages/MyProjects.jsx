import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Chip, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress,
    Button, Tooltip, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions
} from '@mui/material';
import { Add, Delete, OpenInNew, FolderOff, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const STATUS_STYLES = {
    pending: { bg: '#fff3e0', color: '#e65100' },
    approved: { bg: '#e8f5e9', color: '#2e7d32' },
    rejected: { bg: '#ffebee', color: '#c62828' },
};

const MyProjects = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchProjects = () => {
        setLoading(true);
        axios.get('/api/projects/my')
            .then(r => setProjects(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchProjects(); }, []);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await axios.delete(`/api/projects/${deleteId}`);
            setDeleteId(null);
            fetchProjects();
        } catch { /* ignore */ }
        finally { setDeleting(false); }
    };

    return (
        <Box>
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-end">
                <Box>
                    <Typography variant="h4" fontWeight="800" gutterBottom>My Projects</Typography>
                    <Typography variant="body1" color="textSecondary">Track your submitted research projects and their review status.</Typography>
                </Box>
                <Button
                    variant="contained" color="primary" startIcon={<Add />}
                    onClick={() => navigate('/submit-project')}
                    disableElevation sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}
                >
                    New Project
                </Button>
            </Box>

            <Paper elevation={1} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'grey.200' }}>
                <Box p={2.5} bgcolor="white" borderBottom="1px solid" borderColor="grey.200" display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight="bold">Project Portfolio</Typography>
                    <Chip label={`${projects.length} Projects`} size="small" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }} />
                </Box>

                {loading ? (
                    <Box display="flex" justifyContent="center" py={12}><CircularProgress /></Box>
                ) : projects.length === 0 ? (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={12}>
                        <FolderOff sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                        <Typography variant="h6" fontWeight="bold" color="textSecondary">No projects yet</Typography>
                        <Typography variant="body2" color="textSecondary" mb={3}>Submit your first research project to get started.</Typography>
                        <Button variant="outlined" startIcon={<Add />} onClick={() => navigate('/submit-project')} sx={{ borderRadius: 2 }}>
                            Submit a Project
                        </Button>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>PROJECT</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>DOMAIN</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>MENTOR</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>TEAM</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>STATUS</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>DATE</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>ACTIONS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {projects.map(proj => {
                                    const st = STATUS_STYLES[proj.status] || STATUS_STYLES.pending;
                                    return (
                                        <TableRow key={proj.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.01)' } }}>
                                            <TableCell>
                                                <Typography fontWeight="bold" variant="body2">{proj.title}</Typography>
                                                {proj.keywords && (
                                                    <Typography variant="caption" color="text.secondary">{proj.keywords}</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={proj.domain} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem', bgcolor: '#e8f4fd', color: '#1565c0', borderRadius: 1 }} />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>{proj.mentor_display_name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{proj.mentor_display_email}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {proj.team_names || '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={proj.status.toUpperCase()}
                                                    size="small"
                                                    sx={{ fontWeight: 'bold', fontSize: '0.68rem', bgcolor: st.bg, color: st.color, borderRadius: 1.5 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(proj.created_at).toLocaleDateString('en-IN')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box display="flex" gap={0.5} justifyContent="center">
                                                    <Tooltip title="View Details">
                                                        <IconButton size="small" color="primary" onClick={() => navigate(`/projects/${proj.id}`)}>
                                                            <Visibility fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {proj.status === 'pending' && (
                                                        <Tooltip title="Delete Project">
                                                            <IconButton size="small" color="error" onClick={() => setDeleteId(proj.id)}>
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
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

            {/* Delete confirmation dialog */}
            <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Delete Project?</DialogTitle>
                <DialogContent>
                    <Typography color="text.secondary">This will permanently delete the project and all associated documents. This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ pb: 2, px: 3 }}>
                    <Button onClick={() => setDeleteId(null)} disabled={deleting} color="inherit" sx={{ fontWeight: 'bold' }}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained" disableElevation disabled={deleting} sx={{ borderRadius: 2 }}>
                        {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MyProjects;
