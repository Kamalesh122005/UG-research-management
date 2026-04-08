import React, { useState } from 'react';
import {
    Box, Typography, TextField, Button, Grid,
    Alert, InputAdornment, IconButton, CircularProgress, Link, keyframes
} from '@mui/material';
import { Visibility, VisibilityOff, School, LockOutlined, EmailOutlined } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import toast from 'react-hot-toast';

// Modern CSS Keyframe Animations
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg) scale(1); opacity: 0.1; }
  50% { transform: translateY(-30px) rotate(10deg) scale(1.05); opacity: 0.15; }
  100% { transform: translateY(0px) rotate(0deg) scale(1); opacity: 0.1; }
`;

const floatReverse = keyframes`
  0% { transform: translateY(0px) rotate(0deg) scale(1); opacity: 0.05; }
  50% { transform: translateY(20px) rotate(-10deg) scale(0.95); opacity: 0.1; }
  100% { transform: translateY(0px) rotate(0deg) scale(1); opacity: 0.05; }
`;

const slideUpFade = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeInContent = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        if (!email.toLowerCase().endsWith('@ssn.edu.in')) {
            setFieldErrors({ email: 'invalid email id' });
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            toast.success('Login successful! Welcome back.');
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.error || 'Invalid credentials.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid container sx={{ minHeight: '100vh', bgcolor: '#ffffff' }}>
            {/* L E F T     S I D E   (Branding & Presentation - 50%) */}
            <Grid item xs={0} md={6} sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(145deg, #0a192f 0%, #112240 50%, #1976d2 100%)',
                p: { md: 6, lg: 8 },
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'inset -15px 0 50px rgba(0,0,0,0.1)'
            }}>
                {/* Animated Decorators */}
                <Box sx={{
                    position: 'absolute', top: '-10%', left: '-15%', width: 600, height: 600,
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
                    animation: `${float} 18s ease-in-out infinite`, filter: 'blur(60px)'
                }} />
                <Box sx={{
                    position: 'absolute', bottom: '-15%', right: '-5%', width: 500, height: 500,
                    borderRadius: '50%', background: 'radial-gradient(circle, #64ffda 0%, rgba(100,255,218,0) 70%)',
                    animation: `${floatReverse} 22s ease-in-out infinite`, filter: 'blur(80px)'
                }} />

                {/* Content Container (Center Aligned Vertically & Horizontally inside the Left Grid) */}
                <Box position="relative" zIndex={1} maxWidth={600} sx={{ animation: `${fadeInContent} 1.5s ease-out` }}>

                    <Box display="flex" alignItems="center" gap={2} mb={4} sx={{ opacity: 0.9 }}>
                        <School sx={{ fontSize: 40, color: '#64ffda' }} />
                        <Typography variant="h6" fontWeight="700" sx={{ letterSpacing: 1.5, textTransform: 'uppercase', color: '#e6f1ff' }}>
                            Academic Portal
                        </Typography>
                    </Box>

                    <Typography variant="h3" fontWeight="800" gutterBottom sx={{
                        lineHeight: 1.2, color: '#e6f1ff',
                        fontSize: { md: '2.5rem', lg: '3.2rem' },
                        textShadow: '0px 4px 20px rgba(0,0,0,0.3)'
                    }}>
                        Empowering <br />
                        <span style={{ color: '#64ffda' }}>Academic Research</span>
                    </Typography>

                    <Typography variant="h6" sx={{ mt: 3, color: '#8892b0', fontWeight: 400, lineHeight: 1.7, maxWidth: 480 }}>
                        Designed for the IT department to manage undergraduate research projects and academic activities efficiently.
                    </Typography>
                </Box>
            </Grid>

            {/* R I G H T     S I D E   (Interactive Form - 50%) */}
            <Grid item xs={12} md={6} sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center', // Perfect horizontal and vertical centering
                p: { xs: 4, sm: 6, md: 8 },
                bgcolor: '#ffffff',
                zIndex: 2
            }}>
                <Box sx={{
                    width: '100%', maxWidth: 400, // Strict Max Width for form tightness
                    animation: `${slideUpFade} 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`
                }}>
                    {/* Header */}
                    <Box mb={5} textAlign="center">
                        <Box display="inline-flex" alignItems="center" justifyContent="center" mb={2}
                            sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: '#e3f2fd', color: '#1976d2', boxShadow: '0 8px 16px rgba(25,118,210,0.15)' }}>
                            <LockOutlined sx={{ fontSize: 28 }} />
                        </Box>
                        <Typography variant="h4" fontWeight="800" color="text.primary" gutterBottom>Log In</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Please enter your credentials.</Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 4, borderRadius: 2, fontWeight: 500, boxShadow: '0 4px 12px rgba(211,47,47,0.1)' }}>
                            {error}
                        </Alert>
                    )}

                    {/* Form Structure */}
                    <form onSubmit={handleSubmit}>
                        <Box display="flex" flexDirection="column" gap={2.5}>
                            <Box>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" mb={1} display="block" sx={{ letterSpacing: 0.5 }}>EMAIL</Typography>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    placeholder="yourname@ssn.edu.in"
                                    type="email"
                                    autoFocus
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    error={!!fieldErrors.email}
                                    helperText={fieldErrors.email}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailOutlined sx={{ color: 'text.secondary' }} />
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: 2, bgcolor: '#f8f9fa', transition: 'all 0.2s',
                                            '&:hover': { bgcolor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
                                            '&.Mui-focused': { bgcolor: '#ffffff', boxShadow: '0 4px 20px rgba(25,118,210,0.15)' }
                                        }
                                    }}
                                />
                            </Box>

                            <Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: 0.5 }}>PASSWORD</Typography>
                                    <Link component={RouterLink} to="/forgot-password" underline="none" color="primary" variant="caption" fontWeight="bold" sx={{ '&:hover': { color: 'primary.dark' } }}>
                                        Forgot?
                                    </Link>
                                </Box>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    placeholder="••••••••"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockOutlined sx={{ color: 'text.secondary' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" sx={{ color: 'text.secondary' }}>
                                                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: 2, bgcolor: '#f8f9fa', transition: 'all 0.2s',
                                            '&:hover': { bgcolor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
                                            '&.Mui-focused': { bgcolor: '#ffffff', boxShadow: '0 4px 20px rgba(25,118,210,0.15)' }
                                        }
                                    }}
                                />
                            </Box>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    mt: 1, py: 1.5, borderRadius: 2, fontWeight: '800', fontSize: '0.95rem',
                                    textTransform: 'none', letterSpacing: 0.5,
                                    bgcolor: '#1976d2', color: 'white',
                                    boxShadow: '0 8px 16px rgba(25, 118, 210, 0.25)',
                                    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                    '&:hover': {
                                        bgcolor: '#1565c0',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 12px 24px rgba(25, 118, 210, 0.35)',
                                    },
                                    '&:active': { transform: 'translateY(0)' }
                                }}
                            >
                                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Log In'}
                            </Button>
                        </Box>
                    </form>

                    <Box mt={4} textAlign="center">
                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                            First time here?{' '}
                            <Link component={RouterLink} to="/register" fontWeight="700" color="primary" underline="hover">
                                Create an account
                            </Link>
                        </Typography>
                    </Box>

                </Box>
            </Grid>
        </Grid>
    );
};

export default Login;
