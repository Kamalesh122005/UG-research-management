import React, { useState } from 'react';
import {
    Container, Box, Typography, TextField, Button, Paper,
    Alert, MenuItem, CircularProgress, Link, Grid
} from '@mui/material';
import { School, AppRegistration, MarkEmailRead } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import toast from 'react-hot-toast';

const DEPARTMENTS = [
    'Computer Science', 'Electronics', 'Mechanical', 'Civil',
    'Information Technology', 'Electrical', 'Chemical', 'Biotechnology'
];

const Register = () => {
    const { register, verifyOtp, resendOtp } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    // OTP states
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [otpEmail, setOtpEmail] = useState('');
    const [timer, setTimer] = useState(180); // 3 minutes total
    const [resendTimer, setResendTimer] = useState(90); // 1.30 minutes for resend
    const [canResend, setCanResend] = useState(false);

    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        role: 'student', register_number: '', department: '', year: ''
    });

    React.useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
                if (resendTimer > 0) {
                    setResendTimer((prev) => prev - 1);
                } else {
                    setCanResend(true);
                }
            }, 1000);
        } else if (timer === 0) {
            setError('OTP expired. Please try again.');
        }
        return () => clearInterval(interval);
    }, [step, timer, resendTimer]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        const newFieldErrors = {};

        if (form.password !== form.confirmPassword) {
            newFieldErrors.confirmPassword = 'Passwords do not match';
        }

        // --- Sequential Password Validation ---
        if (form.password.length < 6) {
            newFieldErrors.password = 'min length should be 6';
        } else if (!/[A-Z]/.test(form.password)) {
            newFieldErrors.password = 'password should contain at least 1 uppercase';
        } else if (!/\d/.test(form.password)) {
            newFieldErrors.password = 'should contain atleast 1 number';
        }

        // --- Role based strict validations ---
        if (form.role === 'student' && !newFieldErrors.password) {
            const studentEmailRegex = /^[a-zA-Z.]+[0-9]{7}@ssn\.edu\.in$/;
            if (!studentEmailRegex.test(form.email)) {
                newFieldErrors.email = 'enter proper institution mail id';
            }
            const regNoRegex = /^3122\d{9}$/;
            if (!form.register_number || !regNoRegex.test(form.register_number)) {
                newFieldErrors.register_number = 'enter valid register number';
            }
        } else if (form.role === 'staff' && !newFieldErrors.password) {
            const staffEmailRegex = /^[a-zA-Z._-]+@ssn\.edu\.in$/;
            if (!staffEmailRegex.test(form.email)) {
                newFieldErrors.email = 'enter proper institution mail id';
            }
        }

        if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors);
            return;
        }

        setLoading(true);
        try {
            const res = await register({
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role,
                register_number: form.register_number || undefined,
                department: form.department || undefined,
                year: form.year ? parseInt(form.year) : undefined,
            });
            if (res.requireOtp) {
                setOtpEmail(res.email);
                toast.success('OTP sent to your email. Please check your inbox.');
                setSuccess('OTP sent to your email. Please check your inbox.');
                setStep(2);
                setTimer(180);
                setResendTimer(90);
                setCanResend(false);
            } else {
                toast.success('Registration successful! Redirecting to login...');
                setSuccess('Registration successful! Redirecting to login...');
                setTimeout(() => navigate('/login'), 1800);
            }
        } catch (err) {
            const msg = err.response?.data?.error || 'Registration failed. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        try {
            await resendOtp(otpEmail);
            setSuccess('OTP Resent successfully!');
            setTimer(180);
            setResendTimer(90);
            setCanResend(false);
        } catch (err) {
            setError('Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (!otp || otp.length !== 6) return setError('Please enter a valid 6-digit OTP');

        setLoading(true);
        try {
            await verifyOtp(otpEmail, otp);
            const msg = 'Account created successfully! Please login with your credentials.';
            setSuccess(msg);
            toast.success(msg);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            const msg = err.response?.data?.error || 'Invalid OTP. Please try again.';
            setError(msg);
            toast.error(msg);
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
                            bgcolor: step === 1 ? 'secondary.main' : 'success.main', borderRadius: '50%', p: 1.5, mb: 1.5,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {step === 1 ? <AppRegistration sx={{ color: 'white', fontSize: 36 }} /> : <MarkEmailRead sx={{ color: 'white', fontSize: 36 }} />}
                        </Box>
                        <Typography component="h1" variant="h5" fontWeight="bold">
                            {step === 1 ? 'Create Account' : 'Verify Email'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {step === 1 ? 'Academic Portal Registration' : `We sent a 6-digit OTP to ${otpEmail}`}
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    {step === 1 ? (
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField select fullWidth label="I am a..." name="role" value={form.role} onChange={handleChange} required>
                                        <MenuItem value="student">Student</MenuItem>
                                        <MenuItem value="staff">Staff / Faculty</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Full Name" name="name" required value={form.name} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Institution Email Address"
                                        name="email"
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={handleChange}
                                        error={!!fieldErrors.email}
                                        helperText={fieldErrors.email}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Password"
                                        name="password"
                                        type="password"
                                        required
                                        value={form.password}
                                        onChange={handleChange}
                                        error={!!fieldErrors.password}
                                        helperText={fieldErrors.password}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        error={!!fieldErrors.confirmPassword}
                                        helperText={fieldErrors.confirmPassword}
                                    />
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
                                            <TextField
                                                fullWidth
                                                label="Register Number"
                                                name="register_number"
                                                value={form.register_number}
                                                onChange={handleChange}
                                                error={!!fieldErrors.register_number}
                                                helperText={fieldErrors.register_number || "Must start with 3122 (13 digits total)"}
                                            />
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
                                    <Box display="flex" gap={2}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            size="large"
                                            onClick={() => navigate('/login')}
                                            sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                                        >
                                            Back to Login
                                        </Button>
                                        <Button
                                            type="submit"
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            disabled={loading}
                                            sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                                        >
                                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Enter 6-digit OTP"
                                        name="otp"
                                        type="text"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '24px', letterSpacing: '0.5em' } }}
                                        helperText={timer > 0 ? `OTP expires in ${formatTime(timer)}` : "OTP Expired"}
                                        error={timer === 0}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box display="flex" gap={2}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="error"
                                            size="large"
                                            onClick={() => {
                                                setStep(1);
                                                setOtp('');
                                                setError('');
                                                setSuccess('');
                                            }}
                                            sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold', mt: 1 }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            fullWidth
                                            variant="contained"
                                            color="success"
                                            size="large"
                                            disabled={loading || timer === 0}
                                            sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold', mt: 1 }}
                                        >
                                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Account'}
                                        </Button>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sx={{ textAlign: 'center', mt: 1 }}>
                                    <Button
                                        variant="text"
                                        onClick={handleResend}
                                        disabled={!canResend || loading}
                                        sx={{ textTransform: 'none', fontWeight: 'bold' }}
                                    >
                                        {canResend ? "Resend OTP" : `Resend OTP in ${formatTime(resendTimer)}`}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    )}

                    {step === 1 && (
                        <Box textAlign="center" mt={2}>
                            <Typography variant="body2" color="textSecondary">
                                Already have an account?{' '}
                                <Link component={RouterLink} to="/login" fontWeight="bold">
                                    Sign in
                                </Link>
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default Register;
