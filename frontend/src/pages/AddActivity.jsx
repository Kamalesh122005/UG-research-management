import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Paper, TextField, Button,
    Grid, MenuItem, Alert, CircularProgress, Divider, FormHelperText
} from '@mui/material';
import { CloudUpload, Save, Layers, Subject, Group, UploadFile } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ACTIVITY_TYPES = ['Internally Funded Project', 'Conference', 'Hackathon', 'Publication', 'Achievement'];
const STUDENT_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const DOMAINS = ['Education', 'Manufacturing', 'Technology', 'Medical', 'Agriculture'];
const PROJECT_TYPE = 'Internally Funded Project';

const sectionHeaderSx = { display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 };
const sectionIconSx = (color) => ({ p: 1, borderRadius: 2, bgcolor: `${color}.light`, display: 'flex' });
const paperSx = { p: 4, borderRadius: 3, mb: 4, border: '1px solid', borderColor: 'grey.200' };

const AddActivity = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
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
        axios.get('/api/projects/mentors')
            .then(r => setMentors(r.data))
            .catch(() => { });
    }, []);

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
        // Mentor enforcement
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
            await axios.post('/api/activities/add', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage({ text: 'Activity submitted successfully! Redirecting...', type: 'success' });
            window.scrollTo(0, 0);
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setMessage({ text: err.response?.data?.error || 'Submission failed.', type: 'error' });
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    const renderAcademicFields = () => {
        const type = form.activity_type;
        if (type === 'Hackathon') return (
            <>
                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Event Venue / Location" name="venue" value={form.venue} onChange={handleChange} placeholder="e.g. Anna University, Chennai" />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Position Secured" name="position" value={form.position} onChange={handleChange} placeholder="e.g. Winner, Runner-Up, Participant" />
                </Grid>
                <Grid item xs={12}>
                    <TextField fullWidth multiline rows={5} label="Problem Statement" name="problem_statement" value={form.problem_statement} onChange={handleChange} placeholder="Describe the problem your team tackled, challenges faced, and approach taken..." />
                </Grid>
            </>
        );
        if (type === 'Conference') return (
            <>
                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Conference Name & Venue" name="venue" value={form.venue} onChange={handleChange} placeholder="e.g. IEEE ICCCSP 2025, Chennai" />
                </Grid>
                <Grid item xs={12}>
                    <TextField fullWidth multiline rows={5} label="Research Abstract / Problem Statement" name="problem_statement" value={form.problem_statement} onChange={handleChange} placeholder="Describe the research gap, findings, and contribution..." />
                </Grid>
            </>
        );
        if (type === PROJECT_TYPE) return (
            <>
                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Approved Budget (₹)" name="budget" value={form.budget} onChange={handleChange} placeholder="e.g. 50000" />
                    <FormHelperText>Enter sanctioned amount in INR.</FormHelperText>
                </Grid>
                <Grid item xs={12}>
                    <TextField fullWidth multiline rows={5} label="Project Proposal / Abstract" name="problem_statement" value={form.problem_statement} onChange={handleChange} placeholder="Summarize objectives, methodology, expected outcomes, and impact..." />
                </Grid>
            </>
        );
        if (type === 'Publication') return (
            <>
                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Journal Name" name="journal_name" value={form.journal_name} onChange={handleChange} placeholder="e.g. IEEE Transactions on Neural Networks" />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Publisher" name="publisher" value={form.publisher} onChange={handleChange} placeholder="e.g. Elsevier, Springer, IEEE" />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="DOI / Web Link" name="doi" value={form.doi} onChange={handleChange} placeholder="https://doi.org/10.xxxx/..." />
                </Grid>
                <Grid item xs={12}>
                    <TextField fullWidth multiline rows={5} label="Abstract" name="abstract" value={form.abstract} onChange={handleChange} placeholder="Paste the paper abstract — objectives, methodology, results, and conclusion..." />
                </Grid>
            </>
        );
        if (type === 'Achievement') return (
            <>
                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Issuing Authority / Organization" name="issued_by" value={form.issued_by} onChange={handleChange} placeholder="e.g. NASSCOM, Government of Tamil Nadu" />
                </Grid>
                <Grid item xs={12}>
                    <TextField fullWidth multiline rows={5} label="Detailed Description" name="description" value={form.description} onChange={handleChange} placeholder="What was accomplished, criteria for selection, and its significance..." />
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

    return (
        <Box maxWidth="900px" mx="auto">
            <Box mb={4}>
                <Typography variant="h4" fontWeight="800" gutterBottom>Submit Activity</Typography>
                <Typography variant="body1" color="textSecondary">Log a verified research event, project, publication, or academic achievement.</Typography>
            </Box>

            {message.text && <Alert severity={message.type} sx={{ mb: 4, borderRadius: 2 }}>{message.text}</Alert>}

            <form onSubmit={handleSubmit}>
                {/* ── SECTION 1: BASIC INFO ── */}
                <Paper elevation={0} sx={paperSx}>
                    <Box sx={sectionHeaderSx}>
                        <Box sx={sectionIconSx('primary')}><Layers sx={{ color: 'primary.main', fontSize: 22 }} /></Box>
                        <Typography variant="h6" fontWeight="800">1. Basic Info</Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField select fullWidth required label="Activity Classification" name="activity_type" value={form.activity_type} onChange={handleChange}>
                                <MenuItem value="" disabled>Select Activity Type</MenuItem>
                                {ACTIVITY_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                            </TextField>
                            <FormHelperText>Selecting a type reveals relevant fields below.</FormHelperText>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField select fullWidth required label="Domain" name="domain" value={form.domain} onChange={handleChange}>
                                <MenuItem value="" disabled>Select Domain</MenuItem>
                                {DOMAINS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                            </TextField>
                        </Grid>

                        {/* Mentor dropdown — required for projects, optional otherwise */}
                        {form.activity_type && (
                            <Grid item xs={12} md={6}>
                                <TextField
                                    select fullWidth
                                    required={isProject}
                                    label={isProject ? 'Assigned Mentor (Required)' : 'Assigned Mentor (Optional)'}
                                    name="mentor_id"
                                    value={form.mentor_id}
                                    onChange={handleChange}
                                    error={isProject && !form.mentor_id && !!message.text}
                                >
                                    <MenuItem value="">— Select Mentor —</MenuItem>
                                    {mentors.map(m => <MenuItem key={m.id} value={m.id}>{m.name} · {m.department}</MenuItem>)}
                                </TextField>
                                <FormHelperText>{isProject ? 'Required for funded projects.' : 'Select if supervised by a staff member.'}</FormHelperText>
                            </Grid>
                        )}

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
                            <TextField fullWidth required label="Official Title" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Smart Grid Monitoring using IoT and AI" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Primary Date" name="date" type="date" value={form.date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField fullWidth label="Keywords" name="keywords" value={form.keywords} onChange={handleChange} placeholder="e.g. Machine Learning, IoT, CNN, Agriculture" />
                            <FormHelperText>Optional — comma-separated. Helps with searchability.</FormHelperText>
                        </Grid>
                    </Grid>
                </Paper>

                {/* ── SECTION 2: ACADEMIC DETAILS ── */}
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

                {/* ── SECTION 4: UPLOAD ── */}
                <Paper elevation={0} sx={paperSx}>
                    <Box sx={sectionHeaderSx}>
                        <Box sx={sectionIconSx('success')}><UploadFile sx={{ color: 'success.main', fontSize: 22 }} /></Box>
                        <Typography variant="h6" fontWeight="800">4. Upload Certificate / Report</Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={5} border="2px dashed" borderColor="grey.300" borderRadius={3} bgcolor="grey.50"
                        sx={{ transition: 'all 0.2s', cursor: 'pointer', '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.light', opacity: 0.9 } }}>
                        <CloudUpload color="primary" sx={{ fontSize: 52, mb: 2 }} />
                        <Typography variant="subtitle1" fontWeight="bold" mb={0.5}>Upload Verified Document</Typography>
                        <Typography variant="body2" color="textSecondary" mb={3}>PDF, JPEG, PNG — Max 5 MB</Typography>
                        <Button variant="contained" component="label" disableElevation sx={{ borderRadius: 2, px: 4, fontWeight: 'bold' }}>
                            Browse Files
                            <input type="file" hidden accept="image/*,.pdf" onChange={handleFileChange} />
                        </Button>
                        {file && (
                            <Box mt={3} p={2} borderRadius={2} bgcolor="white" border="1px solid" borderColor="grey.200"
                                display="flex" width="100%" maxWidth={420} justifyContent="space-between" alignItems="center" boxShadow="0 2px 8px rgba(0,0,0,0.05)">
                                <Typography variant="body2" fontWeight="bold" noWrap sx={{ maxWidth: '80%' }}>{file.name}</Typography>
                                <Typography variant="caption" color="success.main" fontWeight="bold">Ready</Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>

                {/* ── FOOTER ── */}
                <Box display="flex" justifyContent="flex-end" gap={2} mb={4} p={3} bgcolor="#f8f9fa" borderRadius={3} border="1px solid" borderColor="grey.200">
                    <Button variant="outlined" size="large" onClick={() => navigate(-1)} sx={{ borderRadius: 2, px: 4, bgcolor: 'white' }}>Cancel</Button>
                    <Button type="submit" variant="contained" size="large" disableElevation disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        sx={{ borderRadius: 2, px: 5, fontWeight: 'bold' }}>
                        {loading ? 'Submitting...' : 'Save Activity'}
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default AddActivity;
