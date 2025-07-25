import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/common/Header';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { UserRoutes } from './UserRoutes';
import { ListerRoutes } from './ListerRoutes';
import { Landing } from '../pages/Landing';
import { PropertyDetail } from '../pages/PropertyDetail';

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
          <Route path="/" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Landing />} />
          <Route path="/auth/login" element={!user ? <Login /> : <Navigate to={`/${user.role}/dashboard`} />} />
          <Route path="/auth/register" element={!user ? <Register /> : <Navigate to={`/${user.role}/dashboard`} />} />
          
          {/* Property Detail - accessible to both users and listers */}
          <Route path="/property/:id" element={<PropertyDetail />} />
          
          {/* Protected Routes */}
          <Route path="/user/*" element={
            user && user.role === 'user' ? <UserRoutes /> : <Navigate to="/auth/login?role=user" />
          } />
          <Route path="/lister/*" element={
            user && user.role === 'lister' ? <ListerRoutes /> : <Navigate to="/auth/login?role=lister" />
          } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default AppRouter;