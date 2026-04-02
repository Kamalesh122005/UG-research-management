import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Paper, TextField, Button,
    Grid, MenuItem, Alert, CircularProgress, Divider, FormHelperText, Container, AppBar, Toolbar, IconButton
} from '@mui/material';
import { CloudUpload, Save, Layers, Subject, Group, UploadFile, ArrowBack, Edit } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const ACTIVITY_TYPES = ['Internally Funded Projects', 'Conferences', 'Hackathons', 'Journal Publication', 'Achievement'];
const STUDENT_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const DOMAINS = ['Education', 'Manufacturing', 'Technology', 'Medical', 'Agriculture'];
const PROJECT_TYPE = 'Internally Funded Projects';

const sectionHeaderSx = { display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 };
const sectionIconSx = (color) => ({ p: 1, borderRadius: 2, bgcolor: `${color}.light`, display: 'flex' });
const paperSx = { p: 4, borderRadius: 3, mb: 4, border: '1px solid', borderColor: 'grey.200' };

const EditActivity = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [mentors, setMentors] = useState([]);
    const [file, setFile] = useState(null);

    const [form, setForm] = useState({
        activity_type: '', student_level: '', title: '', description: '',
        status: 'Submitted', date: '', domain: '', keywords: '',
        mentor_id: '', mentor_name: '', mentor_email: '', mentor_type: 'internal',
        problem_statement: '', abstract: '', team_members: '',
        venue: '', budget: '', position: '',
        journal_name: '', publisher: '', doi: '', issued_by: '',
    });

    useEffect(() => {
        // Fetch staff list for mentor dropdown
        axios.get('/api/projects/mentors')
            .then(r => setMentors(r.data))
            .catch(() => { });

        // Fetch activity data
        axios.get('/api/activities/my')
            .then(res => {
                const act = res.data.find(a => String(a.id) === String(id));
                if (act) {
                    setForm({
                        activity_type: act.activity_type || '',
                        student_level: act.student_level || '',
                        title: act.title || '',
                        description: act.description || '',
                        status: act.status || 'Submitted',
                        date: act.date ? act.date.split('T')[0] : '',
                        domain: act.domain || '',
                        keywords: act.keywords || '',
                        mentor_id: act.mentor_id || '',
                        mentor_name: act.mentor_name || '',
                        mentor_email: act.mentor_email || '',
                        mentor_type: act.mentor_type || 'internal',
                        problem_statement: act.problem_statement || '',
                        abstract: act.abstract || '',
                        team_members: act.team_members || '',
                        venue: act.venue || '',
                        budget: act.budget || '',
                        position: act.position || '',
                        journal_name: act.journal_name || '',
                        publisher: act.publisher || '',
                        doi: act.doi || '',
                        issued_by: act.issued_by || '',
                    });
                } else {
                    setMessage({ text: 'Activity not found.', type: 'error' });
                }
            })
            .catch(() => setMessage({ text: 'Error fetching activity.', type: 'error' }))
            .finally(() => setFetching(false));
    }, [id]);

    const isProject = form.activity_type === PROJECT_TYPE;

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.activity_type) {
            setMessage({ text: 'Title & Activity Type are required.', type: 'error' });
            window.scrollTo(0, 0); return;
        }
        if (!form.domain) {
            setMessage({ text: 'Domain is required.', type: 'error' });
            window.scrollTo(0, 0); return;
        }
        if (form.mentor_type === 'internal' && !form.mentor_id) {
            setMessage({ text: 'Please select an internal staff mentor.', type: 'error' });
            window.scrollTo(0, 0); return;
        }
        if (form.mentor_type === 'external' && !form.mentor_name) {
            setMessage({ text: 'Please enter the external mentor name.', type: 'error' });
            window.scrollTo(0, 0); return;
        }
        setLoading(true);
        const formData = new FormData();
        Object.keys(form).forEach(key => formData.append(key, form[key]));
        if (file) formData.append('file', file);
        try {
            await axios.put(`/api/activities/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage({ text: 'Activity updated successfully! Redirecting...', type: 'success' });
            window.scrollTo(0, 0);
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setMessage({ text: err.response?.data?.error || 'Failed to update.', type: 'error' });
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    const renderAcademicFields = () => {
        const type = form.activity_type;
        if (type === 'Hackathons') return (
            <>
                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Event Venue / Location" name="venue" value={form.venue} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Position Secured" name="position" value={form.position} onChange={handleChange} />
                </Grid>
                <Grid item xs={12}>
                    <TextField fullWidth multiline rows={5} label="Problem Statement" name="problem_statement" value={form.problem_statement} onChange={handleChange} />
                </Grid>
            </>
        );
        if (type === 'Conferences') return (
            <>
                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Conference Name & Venue" name="venue" value={form.venue} onChange={handleChange} />
                </Grid>
                <Grid item xs={12}>
                    <TextField fullWidth multiline rows={5} label="Research Abstract / Problem Statement" name="problem_statement" value={form.problem_statement} onChange={handleChange} />
                </Grid>
            </>
        );
        if (type === PROJECT_TYPE) return (
            <>
                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Approved Budget (₹)" name="budget" value={form.budget} onChange={handleChange} />
                </Grid>
                <Grid item xs={12}>
                    <TextField fullWidth multiline rows={5} label="Project Proposal / Abstract" name="problem_statement" value={form.problem_statement} onChange={handleChange} />
                </Grid>
            </>
        );
        if (type === 'Journal Publication') return (
            <>
                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Journal Name" name="journal_name" value={form.journal_name} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Publisher" name="publisher" value={form.publisher} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="DOI / Web Link" name="doi" value={form.doi} onChange={handleChange} />
                </Grid>
                <Grid item xs={12}>
                    <TextField fullWidth multiline rows={5} label="Abstract" name="abstract" value={form.abstract} onChange={handleChange} />
                </Grid>
            </>
        );
        if (type === 'Achievement') return (
            <>
                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Issuing Authority / Organization" name="issued_by" value={form.issued_by} onChange={handleChange} />
                </Grid>
                <Grid item xs={12}>
                    <TextField fullWidth multiline rows={5} label="Detailed Description" name="description" value={form.description} onChange={handleChange} />
                </Grid>
            </>
        );
        return null;
    };

    const renderMentorSection = () => {
        return (
            <Paper elevation={0} sx={paperSx}>
                <Box sx={sectionHeaderSx}>
                    <Box sx={sectionIconSx('warning')}><Group sx={{ color: 'warning.main', fontSize: 22 }} /></Box>
                    <Typography variant="h6" fontWeight="800">3. Mentor & Supervision</Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" fontWeight="700" mb={1.5} color="text.secondary">MENTOR SOURCE</Typography>
                        <Box display="flex" gap={1}>
                            <Button
                                variant={form.mentor_type === 'internal' ? 'contained' : 'outlined'}
                                onClick={() => setForm({ ...form, mentor_type: 'internal' })}
                                sx={{ borderRadius: 2, fontWeight: 'bold' }} disableElevation
                            >
                                Internal Staff
                            </Button>
                            <Button
                                variant={form.mentor_type === 'external' ? 'contained' : 'outlined'}
                                onClick={() => setForm({ ...form, mentor_type: 'external' })}
                                sx={{ borderRadius: 2, fontWeight: 'bold' }} disableElevation
                            >
                                External Mentor
                            </Button>
                        </Box>
                    </Grid>

                    {form.mentor_type === 'internal' ? (
                        <Grid item xs={12} md={6}>
                            <TextField
                                select fullWidth required label="Select Internal Mentor"
                                name="mentor_id" value={form.mentor_id} onChange={handleChange}
                            >
                                <MenuItem value="" disabled>— Select Staff Member —</MenuItem>
                                {mentors.map(m => <MenuItem key={m.id} value={m.id}>{m.name} · {m.department}</MenuItem>)}
                            </TextField>
                            <FormHelperText>Assigned staff member from the system.</FormHelperText>
                        </Grid>
                    ) : (
                        <>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth required label="External Mentor Name"
                                    name="mentor_name" value={form.mentor_name} onChange={handleChange}
                                    placeholder="e.g. Dr. Ramesh, IIT Madras"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth label="External Mentor Email (Optional)"
                                    name="mentor_email" value={form.mentor_email} onChange={handleChange}
                                    placeholder="mentor@example.com"
                                />
                            </Grid>
                        </>
                    )}

                    <Grid item xs={12}>
                        <TextField
                            fullWidth multiline rows={3}
                            label="Team Members (if any)"
                            name="team_members" value={form.team_members} onChange={handleChange}
                            placeholder="e.g. Ravi Kumar, Priya S, Arun M (comma separated)"
                        />
                    </Grid>
                </Grid>
            </Paper>
        );
    };

    if (fetching) return (
        <Box display="flex" justifyContent="center" py={12}><CircularProgress /></Box>
    );

    return (
        <Box sx={{ backgroundColor: '#f0f4ff', minHeight: '100vh' }}>
            <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #1a237e, #3949ab)', mb: 4 }}>
                <Toolbar>
                    <IconButton color="inherit" onClick={() => navigate(-1)} sx={{ mr: 1 }}><ArrowBack /></IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Edit Activity</Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg">
                {message.text && <Alert severity={message.type} sx={{ mb: 4, borderRadius: 2 }}>{message.text}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Paper elevation={0} sx={paperSx}>
                        <Box sx={sectionHeaderSx}>
                            <Box sx={sectionIconSx('primary')}><Layers sx={{ color: 'primary.main', fontSize: 22 }} /></Box>
                            <Typography variant="h6" fontWeight="800">1. Basic Info</Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField select fullWidth required label="Activity Classification" name="activity_type" value={form.activity_type} onChange={handleChange}>
                                    {ACTIVITY_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField select fullWidth required label="Domain" name="domain" value={form.domain} onChange={handleChange}>
                                    {DOMAINS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField select fullWidth required label="Student Level" name="student_level" value={form.student_level} onChange={handleChange}>
                                    {STUDENT_LEVELS.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField select fullWidth label="Current Status" name="status" value={form.status} onChange={handleChange}>
                                    <MenuItem value="Submitted">Submitted</MenuItem>
                                    <MenuItem value="In Progress">In Progress</MenuItem>
                                    <MenuItem value="Completed">Completed</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <TextField fullWidth required label="Official Title" name="title" value={form.title} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField fullWidth label="Primary Date" name="date" type="date" value={form.date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Keywords" name="keywords" value={form.keywords} onChange={handleChange} />
                            </Grid>
                        </Grid>
                    </Paper>

                    {form.activity_type && (
                        <Paper elevation={0} sx={paperSx}>
                            <Box sx={sectionHeaderSx}>
                                <Box sx={sectionIconSx('secondary')}><Subject sx={{ color: 'secondary.main', fontSize: 22 }} /></Box>
                                <Typography variant="h6" fontWeight="800">2. Academic Details</Typography>
                            </Box>
                            <Divider sx={{ mb: 3 }} />
                            <Grid container spacing={3}>{renderAcademicFields()}</Grid>
                        </Paper>
                    )}

                    {/* ── SECTION 3: TEAM / MENTOR ── */}
                    {form.activity_type && renderMentorSection()}

                    <Paper elevation={0} sx={paperSx}>
                        <Box sx={sectionHeaderSx}>
                            <Box sx={sectionIconSx('success')}><UploadFile sx={{ color: 'success.main', fontSize: 22 }} /></Box>
                            <Typography variant="h6" fontWeight="800">4. Update Document (Optional)</Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />

                        {(user?.role === 'student' && form.status === 'Submitted') ? (
                            <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
                                <strong>Documents Locked:</strong> You cannot modify or delete certificates after submission. Please contact a mentor or admin for corrections.
                            </Alert>
                        ) : (
                            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={5} border="2px dashed" borderColor="grey.300" borderRadius={3} bgcolor="grey.50"
                                sx={{ transition: 'all 0.2s', cursor: 'pointer', '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.light', opacity: 0.9 } }}>
                                <CloudUpload color="primary" sx={{ fontSize: 52, mb: 2 }} />
                                <Typography variant="subtitle1" fontWeight="bold" mb={0.5}>Upload New Document</Typography>
                                <Typography variant="body2" color="textSecondary" mb={3}>Leave blank to keep existing document</Typography>
                                <Button variant="contained" component="label" disableElevation sx={{ borderRadius: 2, px: 4, fontWeight: 'bold' }}>
                                    Browse Files
                                    <input type="file" hidden accept="image/*,.pdf" onChange={handleFileChange} />
                                </Button>
                                {file && <Typography mt={2} variant="body2" fontWeight="bold">{file.name} ready</Typography>}
                            </Box>
                        )}
                    </Paper>

                    <Box display="flex" justifyContent="flex-end" gap={2} mb={8} p={3} bgcolor="white" borderRadius={3} border="1px solid" borderColor="grey.200">
                        <Button variant="outlined" size="large" onClick={() => navigate(-1)} sx={{ borderRadius: 2, px: 4 }}>Cancel</Button>
                        <Button type="submit" variant="contained" size="large" disableElevation disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                            sx={{ borderRadius: 2, px: 5, fontWeight: 'bold' }}>
                            {loading ? 'Saving...' : 'Update Activity'}
                        </Button>
                    </Box>
                </form>
            </Container>
        </Box>
    );
};

export default EditActivity;
