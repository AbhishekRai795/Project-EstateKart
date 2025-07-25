import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ListerDashboard } from '../pages/lister/Dashboard';
import { ListerAnalytics } from '../pages/lister/Analytics';
import { ListerProperties } from '../pages/lister/Properties';
import { AddProperty } from '../pages/lister/AddProperty';
import { ListerQueries } from '../pages/lister/Queries';

export const ListerRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<ListerDashboard />} />
      <Route path="/properties" element={<ListerProperties />} />
      <Route path="/add-property" element={<AddProperty />} />
      <Route path="/analytics" element={<ListerAnalytics />} />
      <Route path="/queries" element={<ListerQueries />} />
      <Route path="*" element={<ListerDashboard />} />
    </Routes>
  );
};