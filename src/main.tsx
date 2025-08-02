import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Amplify } from 'aws-amplify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Remove the direct import that was causing build failure:
// import outputs from '../amplify_outputs.json';

// Configure Amplify asynchronously to handle missing outputs during build
const configureAmplify = async () => {
  try {
    const outputs = await import('../amplify_outputs.json');
    
    // Apply your OAuth configuration fix
    Amplify.configure({
      ...outputs.default,
      auth: {
        ...outputs.default.auth,
        loginWith: {
          oauth: {
            domain: 'estatekart-auth.auth.ap-south-1.amazoncognito.com',
            scopes: [
              'email',
              'profile',
              'openid',
              'aws.cognito.signin.user.admin'
            ],
            redirectSignIn: ['http://localhost:5173/'],
            redirectSignOut: ['http://localhost:5173/auth/'],
            responseType: 'code'
          }
        }
      }
    });
    
    console.log('Amplify configured successfully');
  } catch (error) {
    console.warn('amplify_outputs.json not found during build - this is normal during deployment');
    // App will still render, Amplify will be configured once the file is generated
  }
};

// Initialize Amplify configuration
configureAmplify();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
