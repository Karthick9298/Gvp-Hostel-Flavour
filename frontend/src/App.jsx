import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContextClean';

// Components
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/student/Dashboard';
import AdminDashboard from './pages/admin/DashboardDaily';
import Profile from './pages/Profile';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  console.log('ProtectedRoute:', { isAuthenticated, isAdmin, loading, adminOnly });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    console.log('Admin required but user is not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// App Routes Component
const AppRoutes = () => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();

  // Debug logging
  console.log('AppRoutes render:', { isAuthenticated, isAdmin, loading, user: user?.name });

  if (loading) {
    console.log('App is loading...');
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Login />
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Register />
        } 
      />
      

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route 
          index 
          element={
            <Navigate to="/dashboard" replace />
          } 
        />
        
        {/* Dashboard - Role-based routing */}
        <Route 
          path="dashboard" 
          element={
            isAdmin ? <AdminDashboard /> : <StudentDashboard />
          } 
        />
        
        {/* Profile */}
        <Route path="profile" element={<Profile />} />
        
        {/* Admin-only routes */}
        <Route 
          path="admin/*" 
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-navy-950">
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
