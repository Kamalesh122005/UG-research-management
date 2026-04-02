import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardRouter from './pages/DashboardRouter';
import Profile from './pages/Profile';
import AddActivity from './pages/AddActivity';
import EditActivity from './pages/EditActivity';
import MyActivities from './pages/MyActivities';
import ViewAllActivities from './pages/ViewAllActivities';
import StudentList from './pages/StudentList';
import StudentProfile from './pages/StudentProfile';
import ManageUsers from './pages/ManageUsers';
import MyProjects from './pages/MyProjects';
import MentorDashboard from './pages/MentorDashboard';
import AllProjects from './pages/AllProjects';
import ProjectDetail from './pages/ProjectDetail';
import Layout from './components/Layout';

// Global Enterprise Theme
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2', light: '#e3f2fd' },
    background: { default: '#f5f7fa', paper: '#ffffff' },
    text: { primary: '#333333', secondary: '#666666' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { boxShadow: 'none', '&:hover': { boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)' } },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: { boxShadow: '0 2px 12px rgba(0,0,0,0.04)' },
        elevation2: { boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
        elevation3: { boxShadow: '0 8px 24px rgba(0,0,0,0.08)' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#fafafa',
          },
        },
      },
    },
  },
});

// Guard specifically wrapping protected content with the new Layout
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected Routes directly inside Layout */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            <Route path="/submit" element={<ProtectedRoute roles={['student']}><AddActivity /></ProtectedRoute>} />
            <Route path="/edit-activity/:id" element={<ProtectedRoute roles={['student', 'admin']}><EditActivity /></ProtectedRoute>} />
            <Route path="/my-activities" element={<ProtectedRoute roles={['student']}><MyActivities /></ProtectedRoute>} />

            <Route path="/all" element={<ProtectedRoute><ViewAllActivities /></ProtectedRoute>} />

            <Route path="/students" element={<ProtectedRoute roles={['staff', 'admin']}><StudentList /></ProtectedRoute>} />
            <Route path="/student/:id" element={<ProtectedRoute roles={['staff', 'admin']}><StudentProfile /></ProtectedRoute>} />

            <Route path="/manage-users" element={<ProtectedRoute roles={['admin']}><ManageUsers /></ProtectedRoute>} />

            {/* Backwards compatibility & Cleaned Up Routes */}
            <Route path="/add-activity" element={<Navigate to="/submit" replace />} />
            <Route path="/all-activities" element={<Navigate to="/all" replace />} />
            <Route path="/submit-project" element={<Navigate to="/submit" replace />} />
            <Route path="/my-projects" element={<Navigate to="/my-activities" replace />} />

            <Route path="/mentor-dashboard" element={<ProtectedRoute roles={['staff', 'admin']}><MentorDashboard /></ProtectedRoute>} />
            <Route path="/all-projects" element={<Navigate to="/all" replace />} />
            <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
