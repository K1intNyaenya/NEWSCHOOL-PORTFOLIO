// ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, getUserRole } from './authService';

function ProtectedRoute({ requiredRole }) {
  const isAuth = isAuthenticated();
  const userRole = getUserRole();

  // Redirect to login if not authenticated
  if (!isAuth) {
    console.warn('Access denied: User not authenticated');
    return <Navigate to="/" replace />;
  }

  // Role-based redirection
  if (requiredRole && userRole !== requiredRole) {
    console.warn(`Access denied: User does not have required role (${requiredRole})`);

    // Redirect admin users to admin dashboard, other users to dashboard
    if (userRole === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Render the component if the user has the correct role
  return <Outlet />;
}

export default ProtectedRoute;
