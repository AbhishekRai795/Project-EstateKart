import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PropertyProvider } from './contexts/PropertyContext';
import AppRouter from './routes/AppRouter';

function App() {
  // FIXED: useNavigate is now inside the component and wrapped by BrowserRouter
  const navigate = useNavigate();

  // Handle auth-expired custom events
  useEffect(() => {
    const handleAuthExpired = (event: CustomEvent) => {
      navigate(event.detail.redirectTo);
    };

    window.addEventListener('auth-expired', handleAuthExpired as EventListener);
    
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired as EventListener);
    };
  }, [navigate]);

  return (
    <AuthProvider>
      <PropertyProvider>
        <AppRouter />
      </PropertyProvider>
    </AuthProvider>
  );
}

export default App;
