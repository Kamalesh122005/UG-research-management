import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Chip, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress,
    Button, Tooltip, IconButton, TextField, Grid, MenuItem,
    Collapse, Alert
} from '@mui/material';
import { Visibility, FilterList, FolderOff, Refresh, CheckCircle, Cancel } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DOMAINS = ['All', 'Education', 'Manufacturing', 'Technology', 'Medical', 'Agriculture'];
const STATUSES = ['All', 'pending', 'approved', 'rejected'];

const STATUS_STYLES = {
    pending: { bg: '#fff3e0', color: '#e65100' },
    approved: { bg: '#e8f5e9', color: '#2e7d32' },
    rejected: { bg: '#ffebee', color: '#c62828' },
};

const AllProjects = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mentors, setMentors] = useState([]);
    const [actionMsg, setActionMsg] = useState({ text: '', type: '' });
    const [showFilters, setShowFilters] = useState(true);
    const [filters, setFilters] = useState({ domain: 'All', status: 'All', mentor_id: 'All', keyword: '' });

    const fetchProjects = () => {
        setLoading(true);
        const params = {};
        if (filters.domain !== 'All') params.domain = filters.domain;
        if (filters.status !== 'All') params.status = filters.status;
        if (filters.mentor_id !== 'All') params.mentor_id = filters.mentor_id;
        if (filters.keyword.trim()) params.keyword = filters.keyword.trim();
        axios.get('/api/projects/all', { params })
            .then(r => setProjects(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchProjects();
        axios.get('/api/projects/mentors').then(r => setMentors(r.data)).catch(() => { });
    }, []);

    const handleStatus = async (id, status) => {
        try {
            await axios.patch(`/api/projects/${id}/status`, { status });
            setActionMsg({ text: `Project ${status} successfully.`, type: status === 'approved' ? 'success' : 'warning' });
            fetchProjects();
            setTimeout(() => setActionMsg({ text: '', type: '' }), 3000);
        } catch (err) {
            setActionMsg({ text: err.response?.data?.error || 'Action failed.', type: 'error' });
        }
    };

    const handleChange = e => setFilters({ ...filters, [e.target.name]: e.target.value });
    const handleApply = e => { e.preventDefault(); fetchProjects(); };
    const handleReset = () => { setFilters({ domain: 'All', status: 'All', mentor_id: 'All', keyword: '' }); setTimeout(fetchProjects, 0); };

    return (
        <Box>
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="h4" fontWeight="800" gutterBottom>All Projects</Typography>
                    <Typography variant="body1" color="textSecondary">Central repository of all submitted research projects.</Typography>
                </Box>
                <Box display="flex" gap={2}>
                    <Button variant="outlined" startIcon={<Refresh />} onClick={fetchProjects} sx={{ borderRadius: 2, bgcolor: 'white' }}>Refresh</Button>
                    <Button variant={showFilters ? 'contained' : 'outlined'} startIcon={<FilterList />} onClick={() => setShowFilters(!showFilters)} disableElevation sx={{ borderRadius: 2 }}>
                        {showFilters ? 'Hide Filters' : 'Filters'}
                    </Button>
                </Box>
            </Box>

            {actionMsg.text && <Alert severity={actionMsg.type} sx={{ mb: 3, borderRadius: 2 }}>{actionMsg.text}</Alert>}

            {/* Filter Panel */}
            <Collapse in={showFilters}>
                <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                    <form onSubmit={handleApply}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={0.5} display="block">DOMAIN</Typography>
                                <TextField select fullWidth size="small" name="domain" value={filters.domain} onChange={handleChange}>
                                    {DOMAINS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={0.5} display="block">STATUS</Typography>
                                <TextField select fullWidth size="small" name="status" value={filters.status} onChange={handleChange}>
                                    {STATUSES.map(s => <MenuItem key={s} value={s}>{s === 'All' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={0.5} display="block">MENTOR</Typography>
                                <TextField select fullWidth size="small" name="mentor_id" value={filters.mentor_id} onChange={handleChange}>
                                    <MenuItem value="All">All Mentors</MenuItem>
                                    {mentors.map(m => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={0.5} display="block">KEYWORD</Typography>
                                <TextField fullWidth size="small" name="keyword" value={filters.keyword} onChange={handleChange} placeholder="Search title or keywords..." />
                            </Grid>
                            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
                                <Button variant="outlined" color="inherit" onClick={handleReset} sx={{ borderRadius: 2, minWidth: 100 }}>Reset</Button>
                                <Button type="submit" variant="contained" disableElevation sx={{ borderRadius: 2, px: 4, fontWeight: 'bold' }}>Apply Filters</Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Collapse>

            {/* Project Table */}
            <Paper elevation={1} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'grey.200' }}>
                <Box p={2.5} bgcolor="white" borderBottom="1px solid" borderColor="grey.200" display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="bold">Project Ledger</Typography>
                    <Chip label={`${projects.length} Matching Records`} size="small" color="primary" sx={{ fontWeight: 'bold', borderRadius: 1.5 }} />
                </Box>

                {loading ? (
                    <Box display="flex" justifyContent="center" py={12}><CircularProgress /></Box>
                ) : projects.length === 0 ? (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={12}>
                        <FolderOff sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" fontWeight="bold" color="textSecondary">No projects found</Typography>
                        <Typography variant="body2" color="textSecondary">Adjust filter parameters or refresh the query.</Typography>
                    </Box>
                ) : (
                    <TableContainer sx={{ maxHeight: 600 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', color: 'text.secondary' }}>TITLE</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', color: 'text.secondary' }}>DOMAIN</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', color: 'text.secondary' }}>MENTOR</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', color: 'text.secondary' }}>TEAM</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', color: 'text.secondary' }}>STATUS</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', color: 'text.secondary' }}>DATE</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', color: 'text.secondary' }}>ACTIONS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {projects.map(proj => {
                                    const st = STATUS_STYLES[proj.status] || STATUS_STYLES.pending;
                                    return (
                                        <TableRow key={proj.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.015)' }, '&:hover': { bgcolor: 'rgba(25,118,210,0.04)' } }}>
                                            <TableCell sx={{ py: 2 }}>
                                                <Typography fontWeight="bold" variant="body2">{proj.title}</Typography>
                                                <Typography variant="caption" color="text.secondary">{proj.keywords || '—'}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={proj.domain} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem', bgcolor: '#e8f4fd', color: '#1565c0', borderRadius: 1 }} />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>{proj.mentor_display_name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{proj.mentor_email}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {proj.team_names || '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={proj.status.toUpperCase()} size="small"
                                                    sx={{ fontWeight: 'bold', fontSize: '0.68rem', bgcolor: st.bg, color: st.color, borderRadius: 1.5 }} />
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
                                                    {(user?.role === 'admin' || user?.role === 'staff') && proj.status === 'pending' && (
                                                        <>
                                                            <Tooltip title="Approve">
                                                                <IconButton size="small" color="success" onClick={() => handleStatus(proj.id, 'approved')}>
                                                                    <CheckCircle fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Reject">
                                                                <IconButton size="small" color="error" onClick={() => handleStatus(proj.id, 'rejected')}>
                                                                    <Cancel fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </>
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
        </Box>
    );
};

export default AllProjects;
