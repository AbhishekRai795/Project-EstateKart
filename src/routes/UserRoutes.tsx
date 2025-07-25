import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserDashboard } from '../pages/user/Dashboard';
import { UserProperties } from '../pages/user/Properties';
import { UserFavorites } from '../pages/user/Favorites';
import { PropertyDetail } from '../pages/PropertyDetail';

export const UserRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/properties" element={<UserProperties />} />
      <Route path="/favorites" element={<UserFavorites />} />
      <Route path="/property/:id" element={<PropertyDetail />} />
      <Route path="*" element={<UserDashboard />} />
    </Routes>
  );
};