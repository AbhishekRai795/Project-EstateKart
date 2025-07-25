import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { PropertyProvider } from './contexts/PropertyContext';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <AuthProvider>
      <PropertyProvider>
        <AppRouter />
      </PropertyProvider>
    </AuthProvider>
  );
}

export default App;