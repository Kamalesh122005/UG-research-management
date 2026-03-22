import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Paper, Chip, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress,
    MenuItem, TextField, Grid, Button, Collapse, Tooltip, IconButton,
    Avatar, Divider, List, ListItem, ListItemText, ListItemAvatar
} from '@mui/material';
import {
    FilterList, CleaningServices, FolderOff, OpenInNew,
    FolderShared, TrendingUp, CheckCircle, School,
    DataUsage, Refresh, Download, Assessment, Assignment
} from '@mui/icons-material';
import axios from 'axios';

const ACTIVITY_TYPES = ['All', 'Internally Funded Projects', 'Conferences', 'Hackathons', 'Journal Publication', 'Achievement'];
const STUDENT_LEVELS = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];
const DEPARTMENTS = ['All', 'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology', 'Electrical', 'Chemical', 'Biotechnology'];

const TYPE_COLORS = {
    'Internally Funded Projects': { bg: '#e3f2fd', color: '#1565c0' },
    'Conferences': { bg: '#e8f5e9', color: '#2e7d32' },
    'Hackathons': { bg: '#fff3e0', color: '#e65100' },
    'Journal Publication': { bg: '#f3e5f5', color: '#6a1b9a' },
    'Achievement': { bg: '#ffebee', color: '#c62828' },
};

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
        type: 'All', year: 'All', department: 'All', domain: '', name: '', register_number: '', date_from: '', date_to: ''
    });

    const [showFilters, setShowFilters] = useState(true);

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

    useEffect(() => { fetchActivities(); }, []); // eslint-disable-next-line

    const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
    const handleApplyFilters = (e) => { e.preventDefault(); fetchActivities(); };
    const handleResetFilters = () => {
        setFilters({ type: 'All', year: 'All', department: 'All', domain: '', name: '', register_number: '', date_from: '', date_to: '' });
        setTimeout(() => {
            setLoading(true);
            axios.get('/api/activities/all').then(res => setActivities(res.data)).finally(() => setLoading(false));
        }, 0);
    };

    // Derived Metrics
    const metrics = useMemo(() => {
        const total = activities.length;
        const ongoing = activities.filter(a => a.status === 'ongoing').length;
        const completed = activities.filter(a => a.status === 'completed').length;
        const uniqueStudents = new Set(activities.map(a => a.register_number || a.student_name)).size;

        const domainMap = {};
        const typeMap = {};
        activities.forEach(a => {
            // Count Domains
            const dom = a.domain || 'Uncategorized';
            domainMap[dom] = (domainMap[dom] || 0) + 1;
            // Count Types
            typeMap[a.activity_type] = (typeMap[a.activity_type] || 0) + 1;
        });

        const topDomains = Object.entries(domainMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const recent = [...activities].sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date)).slice(0, 5);

        return { total, ongoing, completed, uniqueStudents, topDomains, recent, typeMap };
    }, [activities]);

    return (
        <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
            {/* TOP: Page Title & Actions */}
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="h4" fontWeight="800" gutterBottom>Central Repository</Typography>
                    <Typography variant="body1" color="textSecondary">Enterprise-grade view of all academic projections and metrics.</Typography>
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

            {/* MIDDLE: Filter Panel */}
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
                                <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={1} display="block">KNOWLEDGE DOMAIN</Typography>
                                <TextField fullWidth size="small" name="domain" value={filters.domain} onChange={handleChange} placeholder="e.g. AI, Cyber" />
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

            {/* BOTTOM: Data Layout (Cards + Side Panel + Table) */}
            <Grid container spacing={4}>
                {/* Left Content (Cards & Table) */}
                <Grid item xs={12} lg={9}>
                    {/* Summary Cards */}
                    <Grid container spacing={3} mb={4}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Total Activities" count={metrics.total} icon={<FolderShared />} color="primary" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Ongoing Work" count={metrics.ongoing} icon={<TrendingUp />} color="warning" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Accomplished" count={metrics.completed} icon={<CheckCircle />} color="success" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Total Members" count={metrics.uniqueStudents} icon={<School />} color="secondary" />
                        </Grid>
                    </Grid>

                    {/* Main Table Paper */}
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
                                <Typography variant="body2" color="textSecondary">Adjust filter parameters or refresh the query.</Typography>
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
                                        {activities.map((act) => {
                                            const typeStyle = TYPE_COLORS[act.activity_type] || { bg: '#eeeeee', color: '#555555' };
                                            return (
                                                <TableRow key={act.id} hover sx={{
                                                    transition: 'all 0.2s',
                                                    '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.02)' },
                                                    '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04)' }
                                                }}>
                                                    <TableCell sx={{ py: 2 }}>
                                                        <Typography fontWeight="bold" variant="body2" color="text.primary">{act.title}</Typography>
                                                        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                                                            {act.domain || 'Uncategorized'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ py: 2 }}>
                                                        <Chip label={act.activity_type} size="small" sx={{ bgcolor: typeStyle.bg, color: typeStyle.color, fontWeight: 'bold', fontSize: '0.7rem', borderRadius: 1.5 }} />
                                                    </TableCell>
                                                    <TableCell sx={{ py: 2 }}>
                                                        <Typography variant="body2" fontWeight="600">{act.student_name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{act.register_number || 'N/A'}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ py: 2 }}>
                                                        <Typography variant="body2">{act.department || 'N/A'}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{act.student_level || `Year ${act.user_year}`}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ py: 2 }}>
                                                        <Typography variant="body2" fontWeight="500">{act.date ? new Date(act.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ py: 2 }}>
                                                        <Chip label={act.status} size="small" sx={{
                                                            bgcolor: act.status === 'completed' ? '#e8f5e9' : '#fff3e0',
                                                            color: act.status === 'completed' ? '#2e7d32' : '#e65100',
                                                            fontWeight: 'bold', fontSize: '0.7rem', textTransform: 'uppercase', borderRadius: 1.5
                                                        }} />
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ py: 2 }}>
                                                        {act.certificate_path ? (
                                                            <Tooltip title="View Attachment">
                                                                <IconButton size="small" color="primary" href={`http://localhost:5050${act.certificate_path}`} target="_blank">
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
                </Grid>

                {/* Right Analytics Sidebar */}
                <Grid item xs={12} lg={3}>
                    <Box sx={{ position: 'sticky', top: 90 }}>
                        {/* Domain Distribution */}
                        <Paper elevation={1} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', mb: 3 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <DataUsage color="primary" />
                                <Typography variant="h6" fontWeight="bold">Top Domains</Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            {metrics.topDomains.length === 0 ? (
                                <Typography variant="body2" color="textSecondary">No data available.</Typography>
                            ) : (
                                <List disablePadding>
                                    {metrics.topDomains.map(([domain, count], index) => (
                                        <ListItem key={index} disableGutters sx={{ py: 1 }}>
                                            <ListItemText
                                                primary={<Typography variant="body2" fontWeight="600">{domain}</Typography>}
                                            />
                                            <Chip label={count} size="small" color="default" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }} />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Paper>

                        {/* Recent Activity Mini-Feed */}
                        <Paper elevation={1} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <Assessment color="secondary" />
                                <Typography variant="h6" fontWeight="bold">Recent Submissions</Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            {metrics.recent.length === 0 ? (
                                <Typography variant="body2" color="textSecondary">No recent activity.</Typography>
                            ) : (
                                <List disablePadding>
                                    {metrics.recent.map((act, index) => (
                                        <ListItem key={index} disableGutters sx={{ alignItems: 'flex-start', py: 1.5 }}>
                                            <ListItemAvatar sx={{ minWidth: 40 }}>
                                                <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.light', color: 'primary.main' }}>
                                                    <Assignment fontSize="small" />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={<Typography variant="body2" fontWeight="bold" noWrap>{act.title}</Typography>}
                                                secondary={
                                                    <Typography variant="caption" color="textSecondary" display="block" noWrap>
                                                        {act.student_name} • {act.activity_type}
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ViewAllActivities;
