import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, TextField, Button,
    Grid, MenuItem, Alert, AppBar, Toolbar, IconButton, CircularProgress
} from '@mui/material';
import { ArrowBack, Edit } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const ACTIVITY_TYPES = [
    'Internally Funded Projects',
    'Conferences',
    'Hackathons',
    'Publications',
    'Achievements',
];

const EditActivity = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [form, setForm] = useState({
        title: '', description: '', activity_type: '', status: 'ongoing', date: ''
    });

    useEffect(() => {
        // Fetch from my activities list to prefill
        axios.get('/api/activities/my')
            .then(res => {
                const act = res.data.find(a => String(a.id) === String(id));
                if (act) {
                    setForm({
                        title: act.title || '',
                        description: act.description || '',
                        activity_type: act.activity_type || '',
                        status: act.status || 'ongoing',
                        date: act.date ? act.date.split('T')[0] : '',
                    });
                }
            })
            .catch(() => { })
            .finally(() => setFetching(false));
    }, [id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`/api/activities/${id}`, form);
            setMessage({ text: 'Activity updated successfully!', type: 'success' });
            setTimeout(() => navigate('/my-activities'), 1500);
        } catch (err) {
            setMessage({ text: err.response?.data?.error || 'Failed to update activity.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <CircularProgress />
        </Box>
    );

    return (
        <Box sx={{ backgroundColor: '#f0f4ff', minHeight: '100vh' }}>
            <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #1a237e, #3949ab)' }}>
                <Toolbar>
                    <IconButton color="inherit" onClick={() => navigate(-1)} sx={{ mr: 1 }}><ArrowBack /></IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Edit Activity</Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={3}>
                        <Edit color="primary" />
                        <Typography variant="h5" fontWeight="bold">Edit Research Activity</Typography>
                    </Box>

                    {message.text && (
                        <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField fullWidth required label="Activity Title" name="title" value={form.title} onChange={handleChange} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField select fullWidth required label="Activity Type" name="activity_type" value={form.activity_type} onChange={handleChange}>
                                    {ACTIVITY_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField select fullWidth label="Status" name="status" value={form.status} onChange={handleChange}>
                                    <MenuItem value="ongoing">Ongoing</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth label="Date" name="date" type="date"
                                    value={form.date} onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth multiline rows={4}
                                    label="Description" name="description"
                                    value={form.description} onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box display="flex" gap={2}>
                                    <Button
                                        type="submit" variant="contained" size="large"
                                        disabled={loading}
                                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Edit />}
                                        sx={{ borderRadius: 2, px: 4 }}
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button variant="outlined" size="large" onClick={() => navigate(-1)} sx={{ borderRadius: 2 }}>
                                        Cancel
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default EditActivity;
