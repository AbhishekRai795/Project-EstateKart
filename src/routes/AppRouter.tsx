import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // NO BrowserRouter import
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

// FIXED: Enhanced route protection
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAuthFlow } = useAuth();
  
  if (loading && !isAuthFlow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <div className="mt-4 text-lg text-gray-600">Loading EstateKart...</div>
        </div>
      </div>
    );
  }
  
  if (!user && !isAuthFlow) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// FIXED: Auth route protection - redirect logged-in users
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <div className="mt-4 text-lg text-gray-600">Loading EstateKart...</div>
        </div>
      </div>
    );
  }
  
  // FIXED: Redirect authenticated users to prevent loops
  if (user) {
    return <Navigate to="/user-dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRouter: React.FC = () => {
  const { loading, isAuthFlow } = useAuth();

  if (loading && !isAuthFlow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <div className="mt-4 text-lg text-gray-600">Loading EstateKart...</div>
        </div>
      </div>
    );
  }

  return (
    // FIXED: NO Router wrapper - it's provided by main.tsx
    <div className="flex flex-col min-h-screen">
      <Routes>
        {/* Public Routes - No authentication required */}
        <Route path="/" element={<Landing />} />
        
        {/* FIXED: Auth route with protection against logged-in users */}
        <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
        
        {/* FIXED: Public Property Browsing - Header included for navigation */}
        <Route path="/property" element={
          <>
            <Header />
            <UserProperties />
          </>
        } />
        <Route path="/property/:id" element={
          <>
            <Header />
            <PropertyDetail />
          </>
        } />
        
        {/* Protected Routes - Require authentication */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Header />
            <UserDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/user-dashboard" element={
          <ProtectedRoute>
            <Header />
            <UserDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/catalogue" element={
          <ProtectedRoute>
            <Header />
            <UserCatalogue />
          </ProtectedRoute>
        } />
        
        <Route path="/recommendations" element={
          <ProtectedRoute>
            <Header />
            <UserRecommendations />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Header />
            <Profile />
          </ProtectedRoute>
        } />
        
        <Route path="/properties" element={
          <ProtectedRoute>
            <Header />
            <UserProperties />
          </ProtectedRoute>
        } />
        
        <Route path="/add-property" element={
          <ProtectedRoute>
            <Header />
            <AddProperty />
          </ProtectedRoute>
        } />
        
        {/* Lister Routes */}
        <Route path="/lister/dashboard" element={
          <ProtectedRoute>
            <Header />
            <ListerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/lister/properties" element={
          <ProtectedRoute>
            <Header />
            <ListerProperties />
          </ProtectedRoute>
        } />
        
        <Route path="/lister/analytics" element={
          <ProtectedRoute>
            <Header />
            <ListerAnalytics />
          </ProtectedRoute>
        } />
        
        <Route path="/lister/queries" element={
          <ProtectedRoute>
            <Header />
            <ListerQueries />
          </ProtectedRoute>
        } />
        
        <Route path="/lister/clients" element={
          <ProtectedRoute>
            <Header />
            <ClientManagement />
          </ProtectedRoute>
        } />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default AppRouter;
