import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AdminDashboard from './components/admin/AdminDashboard';
import SeekerDashboard from './components/seeker/SeekerDashboard';
import LoadingSpinner from './components/ui/LoadingSpinner';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected Admin Routes */}
      <Route 
        path="/admin/*" 
        element={
          user && user.role === 'admin' ? 
            <AdminDashboard /> : 
            <Navigate to="/login" replace />
        } 
      />
      
      {/* Protected Seeker Routes */}
      <Route 
        path="/seeker/*" 
        element={
          user && user.role === 'seeker' ? 
            <SeekerDashboard /> : 
            <Navigate to="/login" replace />
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;