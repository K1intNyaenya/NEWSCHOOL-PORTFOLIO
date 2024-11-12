// ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, getUserRole } from './authService';

function ProtectedRoute({ requiredRole }) {
  const isAuth = isAuthenticated();
  const userRole = getUserRole();

  // Redirect to login if not authenticated
  if (!isAuth) {
    console.warn('[ProtectedRoute] Access denied: User not authenticated');
    return <Navigate to="/" replace />;
  }

  // Check if requiredRole is an array and if user role is within allowed roles
  const hasRequiredRole = Array.isArray(requiredRole)
    ? requiredRole.includes(userRole)
    : userRole === requiredRole;

  if (requiredRole && !hasRequiredRole) {
    console.warn(`[ProtectedRoute] Access denied: User does not have required role(s) ${requiredRole}`);

    // Redirect admin users to admin dashboard, other users to dashboard
    return userRole === 'admin' ? (
      <Navigate to="/admin-dashboard" replace />
    ) : (
      <Navigate to="/dashboard" replace />
    );
  }

  // Render the component if the user is authenticated and has the correct role
  return <Outlet />;
}

export default ProtectedRoute;
