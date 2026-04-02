import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Chip, Tab, Tabs, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Button,
    Tooltip, IconButton, TextField, Grid, MenuItem, Collapse, Alert
} from '@mui/material';
import {
    CheckCircle, Cancel, Visibility, FilterList, FolderOff, Refresh
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DOMAINS = ['All', 'Education', 'Manufacturing', 'Technology', 'Medical', 'Agriculture'];
const STATUSES = ['All', 'Submitted', 'In Progress', 'Completed'];

const STATUS_STYLES = {
    Submitted: { bg: '#e3f2fd', color: '#1565c0' },
    'In Progress': { bg: '#fff3e0', color: '#e65100' },
    Completed: { bg: '#e8f5e9', color: '#2e7d32' },
    Approved: { bg: '#e8f5e9', color: '#2e7d32' },
    Rejected: { bg: '#ffebee', color: '#c62828' },
};

const ProjectTable = ({ projects, loading, showActions, onApprove, onReject, navigate }) => {
    if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
    if (projects.length === 0) return (
        <Box display="flex" flexDirection="column" alignItems="center" py={10}>
            <FolderOff sx={{ fontSize: 56, color: 'grey.300', mb: 2 }} />
            <Typography color="textSecondary">No projects found.</Typography>
        </Box>
    );
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', color: 'text.secondary' }}>PROJECT</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', color: 'text.secondary' }}>DOMAIN</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', color: 'text.secondary' }}>TEAM</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', color: 'text.secondary' }}>MENTOR</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', color: 'text.secondary' }}>STATUS</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', color: 'text.secondary' }}>SUBMITTED</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', color: 'text.secondary' }}>ACTIONS</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {projects.map(proj => {
                        const st = STATUS_STYLES[proj.status] || STATUS_STYLES.pending;
                        return (
                            <TableRow key={proj.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.01)' } }}>
                                <TableCell>
                                    <Typography fontWeight="bold" variant="body2">{proj.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">{proj.keywords || '—'}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip label={proj.domain} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem', bgcolor: '#e8f4fd', color: '#1565c0', borderRadius: 1 }} />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {proj.team_names || '—'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={600}>{proj.mentor_display_name}</Typography>
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
                                        {showActions && proj.status === 'Submitted' && (
                                            <>
                                                <Tooltip title="Approve Project">
                                                    <IconButton size="small" color="success" onClick={() => onApprove(proj.id)}>
                                                        <CheckCircle fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Reject Project">
                                                    <IconButton size="small" color="error" onClick={() => onReject(proj.id)}>
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
    );
};

const MentorDashboard = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState(0);
    const [subTab, setSubTab] = useState(0); // 0: Pending, 1: Approved, 2: Rejected
    const [menteeProjects, setMenteeProjects] = useState([]);
    const [allProjects, setAllProjects] = useState([]);
    const [loadingMentee, setLoadingMentee] = useState(true);
    const [loadingAll, setLoadingAll] = useState(true);
    const [actionMsg, setActionMsg] = useState({ text: '', type: '' });
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ domain: 'All', status: 'All', keyword: '' });

    const fetchMentee = () => {
        setLoadingMentee(true);
        axios.get('/api/activities/mentor')
            .then(r => setMenteeProjects(r.data))
            .catch(() => { })
            .finally(() => setLoadingMentee(false));
    };

    const fetchAll = () => {
        setLoadingAll(true);
        const params = {};
        if (filters.domain !== 'All') params.domain = filters.domain;
        if (filters.status !== 'All') params.status = filters.status;
        if (filters.keyword.trim()) params.keyword = filters.keyword.trim();
        axios.get('/api/activities/all', { params })
            .then(r => setAllProjects(r.data))
            .catch(() => { })
            .finally(() => setLoadingAll(false));
    };

    useEffect(() => { fetchMentee(); fetchAll(); }, []);

    const handleStatusUpdate = async (id, status, reason = "") => {
        try {
            // Requirement 5: Use specific endpoints
            const endpoint = status === 'Approved' ? 'approve' : 'reject';
            await axios.put(`/api/activities/${id}/${endpoint}`, { reason });

            setActionMsg({ text: `Project ${status.toLowerCase()} successfully.`, type: 'success' });
            fetchMentee();
            fetchAll();
            setTimeout(() => setActionMsg({ text: '', type: '' }), 5000);
        } catch (err) {
            setActionMsg({ text: err.response?.data?.error || 'Action failed.', type: 'error' });
        }
    };

    const getFilteredMentees = () => {
        const statuses = ['Submitted', 'Approved', 'Rejected'];
        const targetStatus = statuses[subTab];
        return menteeProjects.filter(p => p.status === targetStatus);
    };

    const handleFilterChange = e => setFilters({ ...filters, [e.target.name]: e.target.value });
    const handleApplyFilters = e => { e.preventDefault(); fetchAll(); };
    const handleResetFilters = () => { setFilters({ domain: 'All', status: 'All', keyword: '' }); setTimeout(fetchAll, 0); };

    return (
        <Box>
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="h4" fontWeight="800" gutterBottom>Mentor Dashboard</Typography>
                    <Typography variant="body1" color="textSecondary">Review and manage your mentees' research projects.</Typography>
                </Box>
                <Button variant="outlined" startIcon={<Refresh />} onClick={() => { fetchMentee(); fetchAll(); }} sx={{ borderRadius: 2 }}>
                    Refresh
                </Button>
            </Box>

            {actionMsg.text && (
                <Alert severity={actionMsg.type} sx={{ mb: 3, borderRadius: 2 }}>{actionMsg.text}</Alert>
            )}

            <Paper elevation={1} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'grey.200', overflow: 'hidden' }}>
                <Tabs
                    value={tab} onChange={(_, v) => setTab(v)}
                    sx={{ borderBottom: '1px solid', borderColor: 'grey.200', bgcolor: '#fafafa', px: 2 }}
                    TabIndicatorProps={{ style: { height: 3, borderRadius: 3 } }}
                >
                    <Tab
                        label={
                            <Box display="flex" alignItems="center" gap={1}>
                                My Mentees' Projects
                                <Chip label={menteeProjects.length} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
                            </Box>
                        }
                        sx={{ fontWeight: 600, textTransform: 'none', fontSize: '0.9rem' }}
                    />
                    <Tab
                        label={
                            <Box display="flex" alignItems="center" gap={1}>
                                All Projects
                                <Chip label={allProjects.length} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
                            </Box>
                        }
                        sx={{ fontWeight: 600, textTransform: 'none', fontSize: '0.9rem' }}
                    />
                </Tabs>

                {/* Tab 0: My Mentees */}
                {tab === 0 && (
                    <Box>
                        <Box borderBottom="1px solid" borderColor="grey.200">
                            <Tabs value={subTab} onChange={(_, v) => setSubTab(v)} sx={{ px: 2 }}>
                                <Tab label={`Pending (${menteeProjects.filter(p => p.status === 'Submitted').length})`} sx={{ fontWeight: 600, textTransform: 'none' }} />
                                <Tab label={`Approved (${menteeProjects.filter(p => p.status === 'Approved').length})`} sx={{ fontWeight: 600, textTransform: 'none' }} />
                                <Tab label={`Rejected (${menteeProjects.filter(p => p.status === 'Rejected').length})`} sx={{ fontWeight: 600, textTransform: 'none' }} />
                            </Tabs>
                        </Box>
                        <Box p={2} bgcolor="#fffde7" borderBottom="1px solid" borderColor="grey.200">
                            <Typography variant="body2" color="warning.dark" fontWeight="600">
                                {subTab === 0 ? "Review pending submissions from your mentees." :
                                    subTab === 1 ? "Research projects you have approved." :
                                        "Historically rejected or revision-required projects."}
                            </Typography>
                        </Box>
                        <ProjectTable
                            projects={getFilteredMentees()}
                            loading={loadingMentee}
                            showActions={subTab === 0}
                            onApprove={id => handleStatusUpdate(id, 'Approved')}
                            onReject={id => {
                                const reason = prompt("Enter rejection reason:");
                                if (reason !== null) handleStatusUpdate(id, 'Rejected', reason);
                            }}
                            navigate={navigate}
                        />
                    </Box>
                )}

                {/* Tab 1: All Projects */}
                {tab === 1 && (
                    <Box>
                        <Box p={2.5} bgcolor="white" borderBottom="1px solid" borderColor="grey.200" display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2" color="text.secondary">
                                Read-only view of all projects in the system for evaluation purposes.
                            </Typography>
                            <Button size="small" startIcon={<FilterList />} onClick={() => setShowFilters(!showFilters)} variant={showFilters ? 'contained' : 'outlined'} disableElevation sx={{ borderRadius: 2 }}>
                                Filters
                            </Button>
                        </Box>

                        <Collapse in={showFilters}>
                            <Box p={3} bgcolor="#f8f9fa" borderBottom="1px solid" borderColor="grey.200">
                                <form onSubmit={handleApplyFilters}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={12} sm={3}>
                                            <TextField select fullWidth size="small" label="Domain" name="domain" value={filters.domain} onChange={handleFilterChange}>
                                                {DOMAINS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <TextField select fullWidth size="small" label="Status" name="status" value={filters.status} onChange={handleFilterChange}>
                                                {STATUSES.map(s => <MenuItem key={s} value={s}>{s === 'All' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField fullWidth size="small" label="Keyword" name="keyword" value={filters.keyword} onChange={handleFilterChange} placeholder="Search title, keywords..." />
                                        </Grid>
                                        <Grid item xs={12} sm={2} display="flex" gap={1}>
                                            <Button type="submit" variant="contained" disableElevation size="small" sx={{ borderRadius: 2, flex: 1 }}>Apply</Button>
                                            <Button variant="outlined" size="small" onClick={handleResetFilters} sx={{ borderRadius: 2, flex: 1 }}>Reset</Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            </Box>
                        </Collapse>

                        <ProjectTable
                            projects={allProjects}
                            loading={loadingAll}
                            showActions={false}
                            navigate={navigate}
                        />
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default MentorDashboard;
