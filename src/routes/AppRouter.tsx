import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

// Enhanced route protection
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAuthFlow } = useAuth();

  if (loading && !isAuthFlow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user && !isAuthFlow) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/user/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          }
        />
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />

        {/* Property Detail - accessible to both authenticated and unauthenticated users */}
        <Route path="/property/:id" element={<PropertyDetail />} />

        {/* User Protected Routes with proper paths */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/properties"
          element={
            <ProtectedRoute>
              <UserProperties />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/catalogue"
          element={
            <ProtectedRoute>
              <UserCatalogue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/recommendations"
          element={
            <ProtectedRoute>
              <UserRecommendations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Lister Protected Routes with proper paths */}
        <Route
          path="/lister/dashboard"
          element={
            <ProtectedRoute>
              <ListerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lister/properties"
          element={
            <ProtectedRoute>
              <ListerProperties />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lister/add-property"
          element={
            <ProtectedRoute>
              <AddProperty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lister/analytics"
          element={
            <ProtectedRoute>
              <ListerAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lister/queries"
          element={
            <ProtectedRoute>
              <ListerQueries />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lister/clients"
          element={
            <ProtectedRoute>
              <ClientManagement />
            </ProtectedRoute>
          }
        />

        {/* Redirect authenticated users from root */}
        <Route
          path="*"
          element={
            user ? (
              <Navigate to="/user/dashboard" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </div>
  );
};


export default AppRouter;
