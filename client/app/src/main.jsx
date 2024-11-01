import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './LoginForm';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import ApplicationForm from './ApplicationForm';
import PendingForm from "./PendingForm";
import ProtectedRoute from './ProtectedRoute';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route element={<ProtectedRoute requiredRole="member" />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>
        
        <Route path="/application-form" element={<ApplicationForm />} />
        <Route path="/application-form/:applicationId" element={<ApplicationForm />} />
        <Route path="/Pending-Form" element={<PendingForm />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
