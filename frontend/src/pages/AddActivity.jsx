import React, { useState } from 'react';
import {
    Typography, Box, Paper, TextField, Button,
    Grid, MenuItem, Alert, CircularProgress, Divider, FormHelperText
} from '@mui/material';
import { CloudUpload, Save, Layers, Subject, Group, UploadFile } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ACTIVITY_TYPES = ['Internally Funded Projects', 'Conferences', 'Hackathons', 'Journal Publication', 'Achievement'];
const STUDENT_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const AddActivity = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [form, setForm] = useState({
        activity_type: '', student_level: '', title: '', description: '', status: 'ongoing', date: '',
        domain: '', problem_statement: '', abstract: '', team_members: '', mentor: '', venue: '',
        budget: '', position: '', journal_name: '', publisher: '', doi: '', issued_by: '',
    });

    const [file, setFile] = useState(null);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.activity_type) {
            setMessage({ text: 'Basic Info (Title & Type) is strictly required.', type: 'error' });
            window.scrollTo(0, 0);
            return;
        }
        setLoading(true);

        const formData = new FormData();
        Object.keys(form).forEach(key => formData.append(key, form[key]));
        if (file) formData.append('file', file);

        try {
            await axios.post('/api/activities/add', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setMessage({ text: 'Activity successfully submitted and logged.', type: 'success' });
            window.scrollTo(0, 0);
            setTimeout(() => navigate('/my-activities'), 1500);
        } catch (err) {
            setMessage({ text: err.response?.data?.error || 'Failed to submit activity.', type: 'error' });
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    const renderAcademicFields = () => {
        const { activity_type: type } = form;

        if (type === 'Hackathons') return (
            <>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Knowledge Domain" name="domain" value={form.domain} onChange={handleChange} placeholder="e.g. AI, Web3" /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Event Venue / Location" name="venue" value={form.venue} onChange={handleChange} /></Grid>
                <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Problem Statement" name="problem_statement" value={form.problem_statement} onChange={handleChange} /></Grid>
            </>
        );

        if (type === 'Conferences') return (
            <>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Research Domain" name="domain" value={form.domain} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Conference Name & Venue" name="venue" value={form.venue} onChange={handleChange} /></Grid>
                <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Research Problem Statement" name="problem_statement" value={form.problem_statement} onChange={handleChange} /></Grid>
            </>
        );

        if (type === 'Internally Funded Projects') return (
            <>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Project Domain" name="domain" value={form.domain} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Approved Budget (₹)" name="budget" value={form.budget} onChange={handleChange} />
                    <FormHelperText>Numerical amount allocated</FormHelperText>
                </Grid>
                <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Project Proposal Abstract" name="problem_statement" value={form.problem_statement} onChange={handleChange} /></Grid>
            </>
        );

        if (type === 'Journal Publication') return (
            <>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Journal Name" name="journal_name" value={form.journal_name} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Publisher" name="publisher" value={form.publisher} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Domain" name="domain" value={form.domain} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="DOI / Web Link" name="doi" value={form.doi} onChange={handleChange} /></Grid>
                <Grid item xs={12}><TextField fullWidth multiline rows={4} label="Abstract" name="abstract" value={form.abstract} onChange={handleChange} /></Grid>
            </>
        );

        if (type === 'Achievement') return (
            <>
                <Grid item xs={12} sm={12}><TextField fullWidth label="Issuing Authority" name="issued_by" value={form.issued_by} onChange={handleChange} /></Grid>
                <Grid item xs={12}><TextField fullWidth multiline rows={4} label="Detailed Description of Achievement" name="description" value={form.description} onChange={handleChange} /></Grid>
            </>
        );
        return null;
    };

    const renderTeamFields = () => {
        const { activity_type: type } = form;

        if (type === 'Hackathons') return (
            <>
                <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Position Secured" name="position" value={form.position} onChange={handleChange} placeholder="e.g. Winner, Participant" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField fullWidth multiline rows={2} label="Team Members" name="team_members" value={form.team_members} onChange={handleChange} />
                    <FormHelperText>Enter comma-separated full names.</FormHelperText>
                </Grid>
            </>
        );

        if (type === 'Conferences') return (
            <>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Mentor / Supervisor Name" name="mentor" value={form.mentor} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth multiline rows={2} label="Co-Authors" name="team_members" value={form.team_members} onChange={handleChange} /></Grid>
            </>
        );

        if (type === 'Internally Funded Projects') return (
            <>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Principal Investigator (Mentor/PI)" name="mentor" value={form.mentor} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth multiline rows={2} label="Project Team Members" name="team_members" value={form.team_members} onChange={handleChange} /></Grid>
            </>
        );

        if (type === 'Journal Publication') return (
            <>
                <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Co-Authors" name="team_members" value={form.team_members} onChange={handleChange} /></Grid>
            </>
        );

        // Achievement doesn't typically have explicit team members in our schema, but we can safely ignore it.
        return null;
    };

    return (
        <Box maxWidth="900px" mx="auto">
            {/* Header */}
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-end">
                <Box>
                    <Typography variant="h4" fontWeight="800" gutterBottom>Add Activity Record</Typography>
                    <Typography variant="body1" color="textSecondary">Log a verified academic event, project, or publication securely to the system.</Typography>
                </Box>
            </Box>

            {message.text && (
                <Alert severity={message.type} sx={{ mb: 4, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    {message.text}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>

                {/* SECTION 1: BASIC INFO */}
                <Paper elevation={1} sx={{ p: 4, borderRadius: 3, mb: 4, border: '1px solid', borderColor: 'grey.200' }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.light', display: 'flex' }}>
                            <Layers sx={{ color: 'primary.main', fontSize: 24 }} />
                        </Box>
                        <Typography variant="h6" fontWeight="800">1. Basic Info</Typography>
                    </Box>
                    <Divider sx={{ mb: 4 }} />

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField select fullWidth required label="Activity Classification" name="activity_type" value={form.activity_type} onChange={handleChange}>
                                <MenuItem value="" disabled>Select Activity Format</MenuItem>
                                {ACTIVITY_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                            </TextField>
                            <FormHelperText>Selection tailors the upcoming fields.</FormHelperText>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField select fullWidth required label="Student Level Focus" name="student_level" value={form.student_level} onChange={handleChange}>
                                {STUDENT_LEVELS.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={8}>
                            <TextField fullWidth required label="Official Title" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Next-Gen IoT Grid System" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField select fullWidth label="Current Status" name="status" value={form.status} onChange={handleChange}>
                                <MenuItem value="ongoing">Ongoing</MenuItem>
                                <MenuItem value="completed">Completed / Final</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Primary Date" name="date" type="date" value={form.date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                        </Grid>
                    </Grid>
                </Paper>

                {/* SECTION 2: ACADEMIC DETAILS */}
                {form.activity_type && (
                    <Paper elevation={1} sx={{ p: 4, borderRadius: 3, mb: 4, border: '1px solid', borderColor: 'grey.200' }}>
                        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'secondary.light', display: 'flex' }}>
                                <Subject sx={{ color: 'secondary.main', fontSize: 24 }} />
                            </Box>
                            <Typography variant="h6" fontWeight="800">2. Academic Details</Typography>
                        </Box>
                        <Divider sx={{ mb: 4 }} />
                        <Grid container spacing={3}>
                            {renderAcademicFields()}
                        </Grid>
                    </Paper>
                )}

                {/* SECTION 3: TEAM DETAILS */}
                {form.activity_type && form.activity_type !== 'Achievement' && (
                    <Paper elevation={1} sx={{ p: 4, borderRadius: 3, mb: 4, border: '1px solid', borderColor: 'grey.200' }}>
                        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'warning.light', display: 'flex' }}>
                                <Group sx={{ color: 'warning.main', fontSize: 24 }} />
                            </Box>
                            <Typography variant="h6" fontWeight="800">3. Team Details</Typography>
                        </Box>
                        <Divider sx={{ mb: 4 }} />
                        <Grid container spacing={3}>
                            {renderTeamFields()}
                        </Grid>
                    </Paper>
                )}

                {/* SECTION 4: UPLOAD SECTION */}
                <Paper elevation={1} sx={{ p: 4, borderRadius: 3, mb: 4, border: '1px solid', borderColor: 'grey.200' }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'success.light', display: 'flex' }}>
                            <UploadFile sx={{ color: 'success.main', fontSize: 24 }} />
                        </Box>
                        <Typography variant="h6" fontWeight="800">4. Upload Section</Typography>
                    </Box>
                    <Divider sx={{ mb: 4 }} />

                    <Box
                        display="flex" flexDirection="column" alignItems="center" justifyContent="center"
                        p={5} border="2px dashed" borderColor="grey.300" borderRadius={3} bgcolor="grey.50"
                        sx={{ transition: 'all 0.2s', cursor: 'pointer', '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.light', opacity: 0.9 } }}
                    >
                        <CloudUpload color="primary" sx={{ fontSize: 56, mb: 2 }} />
                        <Typography variant="subtitle1" fontWeight="bold" color="text.primary" mb={1}>Upload verified certificate or report</Typography>
                        <Typography variant="body2" color="textSecondary" mb={3}>Accepted formats: PDF, JPEG, PNG (Max 5MB)</Typography>

                        <Button variant="contained" component="label" disableElevation sx={{ borderRadius: 2, px: 4, fontWeight: 'bold' }}>
                            Browse Documents
                            <input type="file" hidden accept="image/*,.pdf" onChange={handleFileChange} />
                        </Button>

                        {file && (
                            <Box mt={3} p={2} borderRadius={2} bgcolor="white" border="1px solid" borderColor="grey.200" display="flex" width="100%" maxWidth={400} justifyContent="space-between" alignItems="center" boxShadow="0 2px 8px rgba(0,0,0,0.05)">
                                <Typography variant="body2" fontWeight="bold" noWrap sx={{ maxWidth: '80%' }}>{file.name}</Typography>
                                <Typography variant="caption" color="success.main" fontWeight="bold">Ready</Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>

                {/* Footer Actions */}
                <Box display="flex" justifyContent="flex-end" gap={2} mb={4} p={3} bgcolor="#f8f9fa" borderRadius={3} border="1px solid" borderColor="grey.200">
                    <Button variant="outlined" size="large" onClick={() => navigate(-1)} sx={{ borderRadius: 2, px: 4, bgcolor: 'white' }}>
                        Cancel Entry
                    </Button>
                    <Button
                        type="submit" variant="contained" size="large" disableElevation
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        sx={{ borderRadius: 2, px: 5, fontWeight: 'bold' }}
                    >
                        {loading ? 'Processing Upload...' : 'Save Activity Entry'}
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default AddActivity;
