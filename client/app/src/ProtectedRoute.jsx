import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from './authService';

const ProtectedRoute = ({ component: Component, requiredRole, ...rest }) => {
    const isAuth = isAuthenticated();
    const userRole = getUserRole();

    return (
        <Route
            {...rest}
            element={
                !isAuth ? (
                    <Navigate to="/" replace /> // Redirect to login if not authenticated
                ) : requiredRole && userRole !== requiredRole ? (
                    <Navigate to="/" replace /> // Redirect if role doesn't match
                ) : (
                    <Component {...rest} /> // Render the component if authenticated and role matches
                )
            }
        />
    );
};

export default ProtectedRoute;
