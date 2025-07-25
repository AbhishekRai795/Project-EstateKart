import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/common/Header';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { Landing } from '../pages/Landing';
import { PropertyDetail } from '../pages/PropertyDetail';
import { UserProperties } from '../pages/user/Properties';
import { UserFavorites } from '../pages/user/Favorites';
import { ListerDashboard } from '../pages/lister/Dashboard';
import { ListerProperties } from '../pages/lister/Properties';
import { AddProperty } from '../pages/lister/AddProperty';
import { ListerAnalytics } from '../pages/lister/Analytics';
import { ListerQueries } from '../pages/lister/Queries';

const AppRouter: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/auth/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          
          {/* Public property browsing */}
          <Route path="/properties" element={<UserProperties />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          
          {/* Protected Routes - require authentication */}
          <Route path="/favorites" element={
            user ? <UserFavorites /> : <Navigate to="/auth/login" />
          } />
          <Route path="/dashboard" element={
            user ? <ListerDashboard /> : <Navigate to="/auth/login" />
          } />
          <Route path="/my-properties" element={
            user ? <ListerProperties /> : <Navigate to="/auth/login" />
          } />
          <Route path="/add-property" element={
            user ? <AddProperty /> : <Navigate to="/auth/login" />
          } />
          <Route path="/analytics" element={
            user ? <ListerAnalytics /> : <Navigate to="/auth/login" />
          } />
          <Route path="/queries" element={
            user ? <ListerQueries /> : <Navigate to="/auth/login" />
          } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default AppRouter;