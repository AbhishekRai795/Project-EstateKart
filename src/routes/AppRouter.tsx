import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/common/Header';
import { Auth } from '../pages/auth/Auth';
import { Landing } from '../pages/Landing';
import { PropertyDetail } from '../pages/PropertyDetail';
import { UserProperties } from '../pages/user/Properties';
import { UserCatalogue } from '../pages/user/Catalogue';
import { UserRecommendations } from '../pages/user/Recommendations';
import { ListerDashboard } from '../pages/lister/Dashboard';
import { ListerProperties } from '../pages/lister/Properties';
import { AddProperty } from '../pages/lister/AddProperty';
import { ListerAnalytics } from '../pages/lister/Analytics';
import { ListerQueries } from '../pages/lister/Queries';
import { UserDashboard } from '../pages/user/Dashboard';
import { ClientManagement } from '../pages/lister/ClientManagement';
import { Profile } from '../pages/user/Profile';


const AppRouter: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-primary-600 font-semibold">Loading EstateKart...</p>
        </div>
      </div>
    );
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          
          {/* Unified Auth Routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/login" element={<Navigate to="/auth?mode=signin" replace />} />
          <Route path="/auth/register" element={<Navigate to="/auth?mode=signup" replace />} />
          
          {/* Property Routes */}
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/properties" element={<UserProperties />} />

          {/* User Routes */}
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/dashboard" element={user ? <UserDashboard /> : <Navigate to="/auth" />} />
          <Route path="/catalogue" element={<UserCatalogue />} />
          <Route path="/recommendations" element={<UserRecommendations />} />
          <Route path="/profile" element={<Profile />} />


          {/* Lister Routes - FIXED PATHS */}
          <Route path="/lister/dashboard" element={<ListerDashboard />} />
          <Route path="/lister/properties" element={<ListerProperties />} />
          <Route path="/lister/analytics" element={<ListerAnalytics />} />
          <Route path="/lister/queries" element={<ListerQueries />} />
          <Route path="/lister/clients" element={<ClientManagement />} />
          
          {/* Add Property Route - ACCESSIBLE FROM BOTH PATHS */}
          <Route path="/add-property" element={<AddProperty />} />
          <Route path="/lister/add-property" element={<AddProperty />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default AppRouter;
