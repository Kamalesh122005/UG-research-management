import React, { useState } from 'react';
import {
    Container, Box, Typography, TextField, Button, Paper,
    Alert, MenuItem, CircularProgress, Link, Grid
} from '@mui/material';
import { School, AppRegistration } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const DEPARTMENTS = [
    'Computer Science', 'Electronics', 'Mechanical', 'Civil',
    'Information Technology', 'Electrical', 'Chemical', 'Biotechnology'
];

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        role: 'student', register_number: '', department: '', year: ''
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword) {
            return setError('Passwords do not match');
        }
        if (form.password.length < 6) {
            return setError('Password must be at least 6 characters');
        }
        setLoading(true);
        try {
            await register({
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role,
                register_number: form.register_number || undefined,
                department: form.department || undefined,
                year: form.year ? parseInt(form.year) : undefined,
            });
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 1800);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a237e 0%, #283593 40%, #3949ab 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
        }}>
            <Container maxWidth="sm">
                <Paper elevation={12} sx={{ p: 4, borderRadius: 3 }}>
                    <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                        <Box sx={{
                            bgcolor: 'secondary.main', borderRadius: '50%', p: 1.5, mb: 1.5,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <AppRegistration sx={{ color: 'white', fontSize: 36 }} />
                        </Box>
                        <Typography component="h1" variant="h5" fontWeight="bold">
                            Create Account
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Academic Portal Registration
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Full Name" name="name" required value={form.name} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Email Address" name="email" type="email" required value={form.email} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Password" name="password" type="password" required value={form.password} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Confirm Password" name="confirmPassword" type="password" required value={form.confirmPassword} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField select fullWidth label="Role" name="role" value={form.role} onChange={handleChange} required>
                                    <MenuItem value="student">Student</MenuItem>
                                    <MenuItem value="staff">Staff / Faculty</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField select fullWidth label="Department" name="department" value={form.department} onChange={handleChange}>
                                    <MenuItem value=""><em>Select Department</em></MenuItem>
                                    {DEPARTMENTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                </TextField>
                            </Grid>

                            {form.role === 'student' && (
                                <>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Register Number" name="register_number" value={form.register_number} onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField select fullWidth label="Year of Study" name="year" value={form.year} onChange={handleChange}>
                                            <MenuItem value=""><em>Select Year</em></MenuItem>
                                            {[1, 2, 3, 4].map(y => <MenuItem key={y} value={y}>Year {y}</MenuItem>)}
                                        </TextField>
                                    </Grid>
                                </>
                            )}

                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold', mt: 1 }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>

                    <Box textAlign="center" mt={2}>
                        <Typography variant="body2" color="textSecondary">
                            Already have an account?{' '}
                            <Link component={RouterLink} to="/login" fontWeight="bold">
                                Sign in
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Register;
