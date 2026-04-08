import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:4000';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/auth/me')
            .then(res => setUser(res.data.user))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        const res = await axios.post('/api/auth/login', { email, password });
        setUser(res.data.user);
        return res.data.user;
    };

    const register = async (formData) => {
        const res = await axios.post('/api/auth/register', formData);
        return res.data;
    };

    const verifyOtp = async (email, otp) => {
        const res = await axios.post('/api/auth/verify-otp', { email, otp });
        // setUser(res.data.user); // Removed to force manual login
        return res.data;
    };

    const resendOtp = async (email) => {
        const res = await axios.post('/api/auth/resend-otp', { email });
        return res.data;
    };

    const forgotPassword = async (email) => {
        const res = await axios.post('/api/auth/forgot-password', { email });
        return res.data;
    };

    const resetPassword = async (email, otp, newPassword) => {
        const res = await axios.post('/api/auth/reset-password', { email, otp, newPassword });
        return res.data;
    };

    const logout = async () => {
        await axios.post('/api/auth/logout');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, verifyOtp, resendOtp, forgotPassword, resetPassword, logout, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
