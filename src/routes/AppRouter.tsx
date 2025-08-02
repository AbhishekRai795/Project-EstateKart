import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/common/Header';
import { Auth } from '../pages/auth/Auth';
import { Landing } from '../pages/Landing';
import PropertyDetail from '../pages/PropertyDetail';
import { UserProperties } from '../pages/user/Properties';
import { UserCatalogue } from '../pages/user/Catalogue';
import { UserRecommendations } from '../pages/user/Recommendations';
import { ListerDashboard } from '../pages/lister/Dashboard';
import { ListerProperties } from '../pages/lister/Properties';
import { AddProperty } from '../pages/lister/AddProperty';
import { ListerAnalytics } from '../pages/lister/Analytics';
import { ListerQueries } from '../pages/lister/Queries';
import { UserDashboard } from '../pages/user/Dashboard';
import {ClientManagement}   from '../pages/lister/ClientManagement';
import { Profile } from '../pages/user/Profile';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 mx-auto animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Authenticating...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth?mode=signin" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    if(loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
              <Loader2 className="h-12 w-12 text-primary-600 mx-auto animate-spin" />
            </div>
        );
    }
    if(user) {
        return <Navigate to="/user/dashboard" replace />;
    }
    return <>{children}</>
}

// Layout component to conditionally render the header
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const showHeader = location.pathname !== '/auth';

  return (
    <div className="min-h-screen bg-gray-50">
      {showHeader && <Header />}
      <main className={showHeader ? "pt-16" : ""}>
        {children}
      </main>
    </div>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <MainLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
        
        {/* This route is accessible to everyone */}
        <Route path="/property/:id" element={<PropertyDetail />} />

        {/* User Protected Routes */}
        <Route path="/user/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/user/properties" element={<ProtectedRoute><UserProperties /></ProtectedRoute>} />
        <Route path="/user/catalogue" element={<ProtectedRoute><UserCatalogue /></ProtectedRoute>} />
        <Route path="/user/recommendations" element={<ProtectedRoute><UserRecommendations /></ProtectedRoute>} />
        <Route path="/user/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Lister Protected Routes */}
        <Route path="/lister/dashboard" element={<ProtectedRoute><ListerDashboard /></ProtectedRoute>} />
        <Route path="/lister/properties" element={<ProtectedRoute><ListerProperties /></ProtectedRoute>} />
        <Route path="/lister/add-property" element={<ProtectedRoute><AddProperty /></ProtectedRoute>} />
        <Route path="/lister/analytics" element={<ProtectedRoute><ListerAnalytics /></ProtectedRoute>} />
        <Route path="/lister/queries" element={<ProtectedRoute><ListerQueries /></ProtectedRoute>} />
        <Route path="/lister/clients" element={<ProtectedRoute><ClientManagement /></ProtectedRoute>} />

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
};

export default AppRouter;
