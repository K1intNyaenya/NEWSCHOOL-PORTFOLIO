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
  const hasRequiredRole = requiredRole
    ? Array.isArray(requiredRole)
      ? requiredRole.includes(userRole)
      : userRole === requiredRole
    : true; // If no requiredRole is specified, allow access

  if (!hasRequiredRole) {
    console.warn(
      `[ProtectedRoute] Access denied: User role '${userRole}' does not match required role(s) ${requiredRole}`
    );

    // Redirect to an unauthorized page or show a message
    return <Navigate to="/unauthorized" replace />;
  }

  // Render the component if the user is authenticated and has the correct role
  return <Outlet />;
}

export default ProtectedRoute;
