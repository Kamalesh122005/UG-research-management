import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import StudentDashboard from './StudentDashboard';
import StaffDashboard from './StaffDashboard';
import AdminDashboard from './AdminDashboard';

const DashboardRouter = () => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    switch (user.role) {
        case 'student':
            return <StudentDashboard />;
        case 'staff':
            return <StaffDashboard />;
        case 'admin':
            return <AdminDashboard />;
        default:
            return <div>Unauthorized role</div>;
    }
};

export default DashboardRouter;
