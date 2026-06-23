import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import LandingPage from '../pages/LandingPage';
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import ServiceSelection from '../pages/customer/ServiceSelection';
import EmergencyRequest from '../pages/customer/EmergencyRequest';
import TrackingPage from '../pages/customer/TrackingPage';
import PaymentPage from '../pages/customer/PaymentPage';
import ReviewPage from '../pages/customer/ReviewPage';
import WorkerDashboard from '../pages/worker/WorkerDashboard';
import JobRequestsPage from '../pages/worker/JobRequestsPage';
import ActiveJobPage from '../pages/worker/ActiveJobPage';
import EarningsPage from '../pages/worker/EarningsPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import WorkerVerificationPage from '../pages/admin/WorkerVerificationPage';
import AnalyticsPage from '../pages/admin/AnalyticsPage';
import ComplaintsPage from '../pages/admin/ComplaintsPage';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminLayout from '../components/common/AdminLayout';
import { useAuth } from '../hooks/useAuth';

/**
 * Custom component to automatically redirect users navigating to '/' 
 * directly to their respective portals or to the login page.
 */
const HomeRedirect = () => {
  const { token, role } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'CUSTOMER') return <Navigate to="/customer/dashboard" replace />;
  if (role === 'WORKER') return <Navigate to="/worker/dashboard" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  
  return <Navigate to="/login" replace />;
};

/**
 * Prevents authenticated users from visiting registration or login panels.
 */
const AuthRoute = ({ children }) => {
  const { token, role } = useAuth();
  
  if (token) {
    if (role === 'CUSTOMER') return <Navigate to="/customer/dashboard" replace />;
    if (role === 'WORKER') return <Navigate to="/worker/dashboard" replace />;
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Index Path Redirect */}
      <Route path="/" element={<LandingPage />} />

      {/* Authentication Pages */}
      <Route 
        path="/login" 
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <AuthRoute>
            <Register />
          </AuthRoute>
        } 
      />
      
      {/* Protected Customer Space */}
      <Route 
        path="/customer/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/services" 
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <ServiceSelection />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/request" 
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <EmergencyRequest />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/track/:id" 
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <TrackingPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/pay/:id" 
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <PaymentPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/review/:id" 
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <ReviewPage />
          </ProtectedRoute>
        } 
      />

      {/* Protected Worker Space */}
      <Route 
        path="/worker/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['WORKER']}>
            <WorkerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/worker/requests" 
        element={
          <ProtectedRoute allowedRoles={['WORKER']}>
            <JobRequestsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/worker/active-job" 
        element={
          <ProtectedRoute allowedRoles={['WORKER']}>
            <ActiveJobPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/worker/earnings" 
        element={
          <ProtectedRoute allowedRoles={['WORKER']}>
            <EarningsPage />
          </ProtectedRoute>
        } 
      />

      {/* Protected Admin Space */}
      <Route 
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/verifications" element={<WorkerVerificationPage />} />
        <Route path="/admin/analytics" element={<AnalyticsPage />} />
        <Route path="/admin/complaints" element={<ComplaintsPage />} />
      </Route>

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
