import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CustomThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
import ForgotPassword from './pages/ForgotPassword';
import Layout from './components/Layout';

// Theme configuration moved to src/context/ThemeContext.jsx
// Guard specifically wrapping protected content with the new Layout
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return (
    <PageWrapper>
      <Layout>{children}</Layout>
    </PageWrapper>
  );
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.35, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: '12px', background: '#333', color: '#fff' }
            }}
          />
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
              <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
              <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Protected Routes directly inside Layout */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              <Route path="/submit" element={<ProtectedRoute roles={['student']}><AddActivity /></ProtectedRoute>} />
              <Route path="/edit-activity/:id" element={<ProtectedRoute roles={['student', 'staff', 'admin']}><EditActivity /></ProtectedRoute>} />
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
          </AnimatePresence>
        </Router>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;
