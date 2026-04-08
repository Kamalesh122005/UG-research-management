import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Paper, Chip, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress,
    MenuItem, TextField, Grid, Button, Collapse, Tooltip, IconButton,
    Avatar, Divider, useTheme
} from '@mui/material';
import {
    FilterList, FolderOff, OpenInNew,
    FolderShared, TrendingUp, CheckCircle, School,
    DataUsage, Refresh, Assignment
} from '@mui/icons-material';
import axios from 'axios';
import ProjectDetailModal from '../components/ProjectDetailModal';

const ACTIVITY_TYPES = ['All', 'Internally Funded Projects', 'Conferences', 'Hackathons', 'Journal Publication', 'Achievement'];
const STUDENT_LEVELS = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];
const DEPARTMENTS = ['All', 'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology', 'Electrical', 'Chemical', 'Biotechnology'];
const DOMAINS = ['All', 'Education', 'Manufacturing', 'Technology', 'Medical', 'Agriculture'];

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
};

const getC = (map, key, isDark) => {
    const t = map[key];
    if (!t) return isDark ? { bg: 'rgba(100,116,139,0.15)', color: '#94A3B8' } : { bg: '#F1F5F9', color: '#64748B' };
    return isDark ? { bg: t.darkBg, color: t.darkColor } : { bg: t.bg, color: t.color };
};
const CBADGE = (c) => ({ bgcolor: c.bg, color: c.color, fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderRadius: '8px', border: 'none' });


const STATS_CARDS = [
    { title: 'Total Activities', key: 'total', icon: <FolderShared />, gradient: 'linear-gradient(135deg, #2563EB, #1D4ED8)' },
    { title: 'In Progress', key: 'inProgress', icon: <TrendingUp />, gradient: 'linear-gradient(135deg, #D97706, #B45309)' },
    { title: 'Accomplished', key: 'completed', icon: <CheckCircle />, gradient: 'linear-gradient(135deg, #059669, #047857)' },
    { title: 'New Submissions', key: 'submitted', icon: <School />, gradient: 'linear-gradient(135deg, #7C3AED, #6D28D9)' },
];

const StatCard = ({ title, count, icon, gradient }) => (
    <Paper elevation={1} sx={{ p: 2.5, borderRadius: '14px', border: 'none', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
        <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {React.cloneElement(icon, { sx: { color: '#fff', fontSize: 20 } })}
            </Box>
            <Box>
                <Typography variant="h5" fontWeight={800} color="text.primary">{count}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>{title}</Typography>
            </Box>
        </Box>
    </Paper>
);

const ViewAllActivities = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
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
                    <Grid container spacing={2} mb={3}>
                        {STATS_CARDS.map(card => (
                            <Grid item xs={12} sm={6} md={3} key={card.key}>
                                <StatCard title={card.title} count={metrics[card.key]} icon={card.icon} gradient={card.gradient} />
                            </Grid>
                        ))}
                    </Grid>

                    <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', mb: 4 }}>
                        <Box px={3} py={2} borderBottom="1px solid" borderColor="divider" display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontWeight={700}>Activity Ledger</Typography>
                            <Chip label={`${metrics.total} records`} size="small" color="primary" sx={{ fontWeight: 700, borderRadius: '8px', fontSize: '0.72rem' }} />
                        </Box>

                        {loading ? (
                            <Box display="flex" justifyContent="center" py={12}><CircularProgress /></Box>
                        ) : activities.length === 0 ? (
                            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={14} px={2}>
                                <Box sx={{ width: 72, height: 72, borderRadius: '20px', bgcolor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                    <FolderOff sx={{ fontSize: 36, color: 'primary.main' }} />
                                </Box>
                                <Typography variant="h6" fontWeight={700} color="text.primary" mb={0.5}>No activities found</Typography>
                                <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={320}>
                                    Try adjusting your filters or check back later when new activities are submitted.
                                </Typography>
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
                                                    <Typography fontWeight={700} variant="body2" color="text.primary">{act.title}</Typography>
                                                    <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                                                        {act.domain && <Chip label={act.domain} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, borderRadius: '8px', bgcolor: isDark ? 'rgba(96,165,250,0.15)' : '#EFF6FF', color: isDark ? '#60A5FA' : '#2563EB' }} />}
                                                        {act.mentor_display_name && <Chip label={`Mentor: ${act.mentor_display_name}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600, borderRadius: '8px' }} />}
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }}>
                                                    <Chip label={act.activity_type} size="small" sx={CBADGE(getC(TYPE_COLORS, act.activity_type, isDark))} />
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }}>
                                                    <Typography variant="body2" fontWeight={600} color="text.primary">{act.student_name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{act.register_number || 'N/A'}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">{act.department || 'N/A'}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {act.date ? new Date(act.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }}>
                                                    <Chip label={act.status} size="small" sx={CBADGE(getC(STATUS_COLORS, act.status, isDark))} />
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
                                                                <IconButton size="small" color="secondary" href={`http://localhost:4000${act.certificate_path}`} target="_blank">
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
                        <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', mb: 3 }}>
                            <Typography variant="h6" fontWeight={700} mb={0.5}>Top Domains</Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>Most active research areas</Typography>
                            {metrics.topDomains.map(([domain, count], i) => (
                                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, p: 1.5, borderRadius: '10px', bgcolor: i === 0 ? 'primary.light' : 'transparent', transition: 'all 0.15s', '&:hover': { bgcolor: 'action.hover' } }}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: i === 0 ? 'primary.main' : 'text.secondary', opacity: i === 0 ? 1 : 0.4 }} />
                                        <Typography variant="body2" fontWeight={600}>{domain}</Typography>
                                    </Box>
                                    <Chip label={count} size="small" sx={{ fontWeight: 700, fontSize: '0.68rem', borderRadius: '8px', bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }} />
                                </Box>
                            ))}
                        </Paper>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: '16px' }}>
                            <Typography variant="h6" fontWeight={700} mb={0.5}>Recent Submissions</Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>Latest activity in the system</Typography>
                            {metrics.recent.map((act, i) => (
                                <Box key={i} sx={{ mb: 2, p: 1.5, borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => setSelectedAct(act)}>
                                    <Typography variant="body2" fontWeight={700} noWrap color="text.primary">{act.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">{act.student_name} · {act.activity_type}</Typography>
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
