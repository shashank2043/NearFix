import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from './Loader';

/**
 * Route protection middleware component based on login status and role authorizations.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {Array<string>} props.allowedRoles - list of roles allowed to access this route
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, role, loading } = useAuth();

  if (loading) {
    return <Loader fullPage />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Unauthorized access: redirect to their corresponding profile dashboards
    if (role === 'CUSTOMER') return <Navigate to="/customer/dashboard" replace />;
    if (role === 'WORKER') return <Navigate to="/worker/dashboard" replace />;
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
