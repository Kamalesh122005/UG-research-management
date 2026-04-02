import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Paper, Chip, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress,
    MenuItem, TextField, Grid, Button, Collapse, Tooltip, IconButton,
    Avatar, Divider
} from '@mui/material';
import {
    FilterList, FolderOff, OpenInNew,
    FolderShared, TrendingUp, CheckCircle, School,
    DataUsage, Refresh, Assignment
} from '@mui/icons-material';
import axios from 'axios';
import ProjectDetailModal from '../components/ProjectDetailModal';

const ACTIVITY_TYPES = ['All', 'Internally Funded Project', 'Conference', 'Hackathon', 'Publication', 'Achievement'];
const STUDENT_LEVELS = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];
const DEPARTMENTS = ['All', 'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology', 'Electrical', 'Chemical', 'Biotechnology'];
const DOMAINS = ['All', 'Education', 'Manufacturing', 'Technology', 'Medical', 'Agriculture'];

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

const STATS_CARDS = [
    { title: 'Total Activities', key: 'total', icon: <FolderShared />, color: 'primary' },
    { title: 'In Progress', key: 'inProgress', icon: <TrendingUp />, color: 'warning' },
    { title: 'Accomplished', key: 'completed', icon: <CheckCircle />, color: 'success' },
    { title: 'New Submissions', key: 'submitted', icon: <School />, color: 'secondary' },
];

const StatCard = ({ title, count, icon, color }) => (
    <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, height: '100%', border: '1px solid', borderColor: 'grey.100' }}>
        <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 48, height: 48 }}>
            {icon}
        </Avatar>
        <Box>
            <Typography variant="h5" fontWeight="800">{count}</Typography>
            <Typography variant="caption" color="textSecondary" fontWeight="600" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</Typography>
        </Box>
    </Paper>
);

const ViewAllActivities = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: 'All', year: 'All', department: 'All', domain: 'All',
        name: '', register_number: '', date_from: '', date_to: '',
        keyword: '', mentor_id: 'All', status: 'Approved'
    });
    const [mentors, setMentors] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedAct, setSelectedAct] = useState(null);

    const fetchActivities = () => {
        setLoading(true);
        const params = {};
        Object.keys(filters).forEach(k => {
            if (filters[k] && filters[k] !== 'All') params[k] = filters[k];
        });

        axios.get('/api/activities/all', { params })
            .then(res => setActivities(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchActivities();
        axios.get('/api/projects/mentors').then(r => setMentors(r.data)).catch(() => { });
    }, []);

    const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
    const handleApplyFilters = (e) => { e.preventDefault(); fetchActivities(); };
    const handleResetFilters = () => {
        setFilters({ type: 'All', year: 'All', department: 'All', domain: 'All', name: '', register_number: '', date_from: '', date_to: '', keyword: '', mentor_id: 'All', status: 'Approved' });
        setTimeout(() => fetchActivities(), 0);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/activities/${id}`);
            fetchActivities();
            setSelectedAct(null);
        } catch { }
    };

    const metrics = useMemo(() => {
        const total = activities.length;
        const inProgress = activities.filter(a => a.status === 'In Progress').length;
        const completed = activities.filter(a => a.status === 'Completed').length;
        const submitted = activities.filter(a => a.status === 'Submitted').length;

        const domainMap = {};
        activities.forEach(a => {
            const dom = a.domain || 'Uncategorized';
            domainMap[dom] = (domainMap[dom] || 0) + 1;
        });

        const topDomains = Object.entries(domainMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const recent = [...activities].sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date)).slice(0, 5);

        return { total, inProgress, completed, submitted, topDomains, recent };
    }, [activities]);

    return (
        <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="h4" fontWeight="800" gutterBottom>Global Research Repository</Typography>
                    <Typography variant="body1" color="textSecondary">Peer-reviewed and approved academic research contributions.</Typography>
                </Box>
                <Box display="flex" gap={2}>
                    <Button variant="outlined" color="inherit" startIcon={<Refresh />} onClick={fetchActivities} sx={{ borderRadius: 2, bgcolor: 'white' }}>
                        Refresh
                    </Button>
                    <Button
                        variant={showFilters ? "contained" : "outlined"}
                        color="primary"
                        startIcon={<FilterList />}
                        onClick={() => setShowFilters(!showFilters)}
                        disableElevation
                        sx={{ borderRadius: 2 }}
                    >
                        {showFilters ? 'Hide Filters' : 'Filters'}
                    </Button>
                </Box>
            </Box>

            <Collapse in={showFilters}>
                <Paper elevation={1} sx={{ p: 4, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                    <form onSubmit={handleApplyFilters}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={1} display="block">CLASSIFICATION</Typography>
                                <TextField select fullWidth size="small" name="type" value={filters.type} onChange={handleChange}>
                                    {ACTIVITY_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={1} display="block">ACADEMIC YEAR</Typography>
                                <TextField select fullWidth size="small" name="year" value={filters.year} onChange={handleChange}>
                                    {STUDENT_LEVELS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={1} display="block">DEPARTMENT</Typography>
                                <TextField select fullWidth size="small" name="department" value={filters.department} onChange={handleChange}>
                                    {DEPARTMENTS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={1} display="block">DOMAIN</Typography>
                                <TextField select fullWidth size="small" name="domain" value={filters.domain} onChange={handleChange}>
                                    {DOMAINS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={1} display="block">STUDENT NAME</Typography>
                                <TextField fullWidth size="small" name="name" value={filters.name} onChange={handleChange} placeholder="Search by name" />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={1} display="block">REGISTER NUMBER</Typography>
                                <TextField fullWidth size="small" name="register_number" value={filters.register_number} onChange={handleChange} placeholder="Exact match" />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={1} display="block">START DATE</Typography>
                                <TextField fullWidth size="small" name="date_from" type="date" value={filters.date_from} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={1} display="block">END DATE</Typography>
                                <TextField fullWidth size="small" name="date_to" type="date" value={filters.date_to} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={1} display="block">KEYWORD</Typography>
                                <TextField fullWidth size="small" name="keyword" value={filters.keyword} onChange={handleChange} placeholder="Title, keywords, description" />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={1} display="block">MENTOR</Typography>
                                <TextField select fullWidth size="small" name="mentor_id" value={filters.mentor_id} onChange={handleChange}>
                                    <MenuItem value="All">All Mentors</MenuItem>
                                    {mentors.map(m => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2} mt={1}>
                                <Button variant="outlined" color="inherit" size="large" onClick={handleResetFilters} sx={{ borderRadius: 2, minWidth: 120 }}>
                                    Reset
                                </Button>
                                <Button type="submit" variant="contained" color="primary" size="large" disableElevation sx={{ borderRadius: 2, px: 4, fontWeight: 'bold' }}>
                                    Apply Filters
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Collapse>

            <Grid container spacing={4}>
                <Grid item xs={12} lg={9}>
                    <Grid container spacing={3} mb={4}>
                        {STATS_CARDS.map(card => (
                            <Grid item xs={12} sm={6} md={3} key={card.key}>
                                <StatCard title={card.title} count={metrics[card.key]} icon={card.icon} color={card.color} />
                            </Grid>
                        ))}
                    </Grid>

                    <Paper elevation={1} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'grey.200', mb: 4 }}>
                        <Box p={3} bgcolor="white" borderBottom="1px solid" borderColor="grey.200" display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontWeight="bold">Activity Ledger</Typography>
                            <Chip label={`${metrics.total} Matching Records`} size="small" color="primary" sx={{ fontWeight: 'bold', borderRadius: 1.5 }} />
                        </Box>

                        {loading ? (
                            <Box display="flex" justifyContent="center" py={12}><CircularProgress /></Box>
                        ) : activities.length === 0 ? (
                            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={12} bgcolor="#fafafa">
                                <FolderOff sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                                <Typography variant="h6" fontWeight="bold" color="textSecondary">No data points found.</Typography>
                            </Box>
                        ) : (
                            <TableContainer sx={{ maxHeight: 650 }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', color: 'text.secondary', py: 2 }}>TITLE / DOMAIN</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', color: 'text.secondary', py: 2 }}>TYPE</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', color: 'text.secondary', py: 2 }}>SCHOLAR</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', color: 'text.secondary', py: 2 }}>DEPARTMENT</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', color: 'text.secondary', py: 2 }}>DATE</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', color: 'text.secondary', py: 2 }}>STATUS</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', color: 'text.secondary', py: 2 }}>REF</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {activities.map((act) => (
                                            <TableRow
                                                key={act.id}
                                                hover
                                                sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.02)' }, '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04)' } }}
                                                onClick={() => setSelectedAct(act)}
                                            >
                                                <TableCell sx={{ py: 2 }}>
                                                    <Typography fontWeight="bold" variant="body2" color="text.primary">{act.title}</Typography>
                                                    <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                                                        {act.domain && <Chip label={act.domain} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 'bold', borderRadius: 1, bgcolor: '#e8f4fd', color: '#1565c0' }} />}
                                                        {act.mentor_name && <Chip label={`Mentor: ${act.mentor_display_name}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 'bold', borderRadius: 1 }} />}
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }}>
                                                    <Chip label={act.activity_type} size="small" sx={{ bgcolor: TYPE_COLORS[act.activity_type]?.bg, color: TYPE_COLORS[act.activity_type]?.color, fontWeight: 'bold', fontSize: '0.7rem', borderRadius: 1.5 }} />
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }}>
                                                    <Typography variant="body2" fontWeight="600">{act.student_name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{act.register_number || 'N/A'}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }}>
                                                    <Typography variant="body2">{act.department || 'N/A'}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }}>
                                                    <Typography variant="body2" fontWeight="500">{act.date ? new Date(act.date).toLocaleDateString('en-GB') : '—'}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }}>
                                                    <Chip label={act.status} size="small" sx={{ bgcolor: STATUS_COLORS[act.status]?.bg, color: STATUS_COLORS[act.status]?.color, fontWeight: 'bold', fontSize: '0.7rem', textTransform: 'uppercase', borderRadius: 1.5 }} />
                                                </TableCell>
                                                <TableCell align="center" sx={{ py: 2 }} onClick={(e) => e.stopPropagation()}>
                                                    <Box display="flex" justifyContent="center" gap={1}>
                                                        <Tooltip title="View Details">
                                                            <IconButton size="small" color="primary" onClick={() => setSelectedAct(act)}>
                                                                <Assignment fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {act.certificate_path && (
                                                            <Tooltip title="View Attachment">
                                                                <IconButton size="small" color="secondary" href={`http://localhost:5050${act.certificate_path}`} target="_blank">
                                                                    <OpenInNew fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={3}>
                    <Box sx={{ position: 'sticky', top: 90 }}>
                        <Paper elevation={1} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', mb: 3 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={2}><DataUsage color="primary" /><Typography variant="h6" fontWeight="bold">Top Domains</Typography></Box>
                            <Divider sx={{ mb: 2 }} />
                            {metrics.topDomains.map(([domain, count], i) => (
                                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" fontWeight="600">{domain}</Typography>
                                    <Chip label={count} size="small" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }} />
                                </Box>
                            ))}
                        </Paper>
                        <Paper elevation={1} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                            <Box display="flex" alignItems="center" gap={1} mb={2}><Assignment color="secondary" /><Typography variant="h6" fontWeight="bold">Recent Submissions</Typography></Box>
                            <Divider sx={{ mb: 2 }} />
                            {metrics.recent.map((act, i) => (
                                <Box key={i} sx={{ mb: 2, cursor: 'pointer' }} onClick={() => setSelectedAct(act)}>
                                    <Typography variant="body2" fontWeight="bold" noWrap>{act.title}</Typography>
                                    <Typography variant="caption" color="textSecondary">{act.student_name} • {act.activity_type}</Typography>
                                </Box>
                            ))}
                        </Paper>
                    </Box>
                </Grid>
            </Grid>

            <ProjectDetailModal
                open={Boolean(selectedAct)}
                onClose={() => setSelectedAct(null)}
                project={selectedAct}
                onDelete={handleDelete}
            />
        </Box>
    );
};

export default ViewAllActivities;
