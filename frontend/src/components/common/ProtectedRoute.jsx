import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from './Loader';


const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, role, loading } = useAuth();

  if (loading) {
    return <Loader fullPage />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    
    if (role === 'CUSTOMER') return <Navigate to="/customer/dashboard" replace />;
    if (role === 'WORKER') return <Navigate to="/worker/dashboard" replace />;
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
