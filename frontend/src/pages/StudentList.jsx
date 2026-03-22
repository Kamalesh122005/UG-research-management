import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress,
    TextField, Chip, Tooltip, IconButton, Grid, Collapse, Button
} from '@mui/material';
import { Visibility, Search, FilterList } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DEPARTMENTS = ['All', 'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology', 'Electrical', 'Chemical', 'Biotechnology'];
const YEARS = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];

const StudentList = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({ name: '', department: 'All', year: 'All' });

    useEffect(() => {
        setLoading(true);
        axios.get('/api/users/students')
            .then(res => setStudents(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

    const filteredStudents = students.filter(s => {
        let match = true;
        if (filters.name && !s.name.toLowerCase().includes(filters.name.toLowerCase()) &&
            !(s.register_number && s.register_number.toLowerCase().includes(filters.name.toLowerCase()))) {
            match = false;
        }
        if (filters.department !== 'All' && s.department !== filters.department) match = false;
        if (filters.year !== 'All' && s.year !== filters.year) match = false;
        return match;
    });

    return (
        <Box>
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-end">
                <Box>
                    <Typography variant="h4" fontWeight="800" gutterBottom>Student Directory</Typography>
                    <Typography variant="body1" color="textSecondary">Browse and track student profiles and their respective activity metrics.</Typography>
                </Box>
                <Button
                    variant={showFilters ? "outlined" : "contained"}
                    startIcon={showFilters ? <Search /> : <FilterList />}
                    onClick={() => setShowFilters(!showFilters)}
                    disableElevation sx={{ borderRadius: 2 }}
                >
                    {showFilters ? 'Hide Search' : 'Search Directory'}
                </Button>
            </Box>

            <Collapse in={showFilters}>
                <Paper elevation={1} sx={{ p: 4, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Search Name or Reg No." name="name" value={filters.name} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField select fullWidth label="Department Filter" name="department" value={filters.department} onChange={handleChange} SelectProps={{ native: true }}>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField select fullWidth label="Year / Level Filter" name="year" value={filters.year} onChange={handleChange} SelectProps={{ native: true }}>
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </TextField>
                        </Grid>
                    </Grid>
                </Paper>
            </Collapse>

            <Paper elevation={1} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'grey.200' }}>
                <Box p={2.5} bgcolor="white" borderBottom="1px solid" borderColor="grey.200" display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight="bold">Enrolled Candidates</Typography>
                    <Chip label={`${filteredStudents.length} Found`} size="small" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }} />
                </Box>

                {loading ? (
                    <Box display="flex" justifyContent="center" py={12}><CircularProgress /></Box>
                ) : filteredStudents.length === 0 ? (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={12}>
                        <Search sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                        <Typography variant="h6" fontWeight="bold" color="textSecondary">No candidates found.</Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>CANDIDATE NAME</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>REG. NUMBER</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>DEPARTMENT</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>LEVEL / YEAR</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary', textAlign: 'center' }}>RECORDED ACTIVITIES</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#fafafa', color: 'text.secondary' }}>PROFILE</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredStudents.map((s) => (
                                    <TableRow key={s.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.01)' } }}>
                                        <TableCell><Typography fontWeight="bold" variant="body2">{s.name}</Typography></TableCell>
                                        <TableCell><Typography variant="body2" color="textSecondary">{s.register_number || '—'}</Typography></TableCell>
                                        <TableCell><Typography variant="body2">{s.department || '—'}</Typography></TableCell>
                                        <TableCell><Chip label={s.year || '—'} size="small" sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 'bold', fontSize: '0.7rem' }} /></TableCell>
                                        <TableCell align="center">
                                            <Typography variant="h6" fontWeight="bold" color="primary.main">{s.activity_count || 0}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="View Deep Profile">
                                                <IconButton size="small" color="primary" onClick={() => navigate(`/student/${s.id}`)}>
                                                    <Visibility fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Box>
    );
};

export default StudentList;
