import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, getUserRole } from './authService';

const ProtectedRoute = ({ requiredRole }) => {
    const isAuth = isAuthenticated();
    const userRole = getUserRole();

    if (!isAuth) {
        return <Navigate to="/" replace />; // Redirect to login if not authenticated
    }

    if (requiredRole && userRole !== requiredRole) {
        return <Navigate to="/" replace />; // Redirect if role doesn't match
    }

    return <Outlet />; // Render nested routes if authenticated and role matches
};

export default ProtectedRoute;
