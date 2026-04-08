import React, { useState, useEffect } from 'react';
import {
    Container, Box, Typography, TextField, Button, Paper,
    Alert, CircularProgress, Link, Grid, IconButton
} from '@mui/material';
import { LockReset, MarkEmailRead, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const { forgotPassword, resetPassword, resendOtp } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const [form, setForm] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [timer, setTimer] = useState(180);
    const [resendTimer, setResendTimer] = useState(90);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
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

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await forgotPassword(form.email);
            const msg = 'OTP sent to your email.';
            setSuccess(msg);
            toast.success(msg);
            setStep(2);
            setTimer(180);
            setResendTimer(90);
            setCanResend(false);
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to send OTP';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndReset = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        const newFieldErrors = {};

        if (form.newPassword !== form.confirmPassword) {
            newFieldErrors.confirmPassword = 'Passwords do not match';
        }

        // Sequential validation
        if (form.newPassword.length < 6) {
            newFieldErrors.newPassword = 'min length should be 6';
        } else if (!/[A-Z]/.test(form.newPassword)) {
            newFieldErrors.newPassword = 'password should contain at least 1 uppercase';
        } else if (!/\d/.test(form.newPassword)) {
            newFieldErrors.newPassword = 'should contain atleast 1 number';
        }

        if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors);
            return;
        }

        if (timer === 0) return setError('OTP expired. Please start over.');

        setLoading(true);
        try {
            await resetPassword(form.email, form.otp, form.newPassword);
            const msg = 'Password updated successfully! Redirecting to login...';
            setSuccess(msg);
            toast.success(msg);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            const msg = err.response?.data?.error || 'Verification failed';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        try {
            await resendOtp(form.email);
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

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a192f 0%, #112240 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4,
        }}>
            <Container maxWidth="sm">
                <Paper elevation={12} sx={{ p: 4, borderRadius: 3 }}>
                    <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                        <Box sx={{
                            bgcolor: step === 1 ? 'primary.main' : 'success.main', borderRadius: '50%', p: 1.5, mb: 1.5,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {step === 1 ? <LockReset sx={{ color: 'white', fontSize: 36 }} /> : <MarkEmailRead sx={{ color: 'white', fontSize: 36 }} />}
                        </Box>
                        <Typography component="h1" variant="h5" fontWeight="bold">
                            {step === 1 ? 'Forgot Password' : 'Reset Password'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" align="center">
                            {step === 1 ? 'Enter your institutional email to receive an OTP' : `Enter the 6-digit OTP sent to ${form.email} and your new password`}
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Institution Email Address"
                                        name="email"
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box display="flex" gap={2}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={() => navigate('/login')}
                                            sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            type="submit"
                                            fullWidth
                                            variant="contained"
                                            disabled={loading}
                                            sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                                        >
                                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyAndReset}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Enter 6-digit OTP"
                                        name="otp"
                                        required
                                        value={form.otp}
                                        onChange={handleChange}
                                        inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '20px', letterSpacing: '0.3em' } }}
                                        helperText={timer > 0 ? `Expires in ${formatTime(timer)}` : 'OTP Expired'}
                                        error={timer === 0}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="New Password"
                                        name="newPassword"
                                        type="password"
                                        required
                                        value={form.newPassword}
                                        onChange={handleChange}
                                        error={!!fieldErrors.newPassword}
                                        helperText={fieldErrors.newPassword}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Confirm New Password"
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
                                    <Box display="flex" gap={2}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="error"
                                            onClick={() => setStep(1)}
                                            sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            fullWidth
                                            variant="contained"
                                            color="success"
                                            disabled={loading || timer === 0}
                                            sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                                        >
                                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
                                        </Button>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sx={{ textAlign: 'center' }}>
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
                </Paper>
            </Container>
        </Box>
    );
};

export default ForgotPassword;
