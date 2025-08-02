import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- FIX: Manually added the OAuth configuration for Google Sign-In ---
// This is necessary because the backend was configured via the AWS Console,
// so the amplify_outputs.json file is missing this information.
Amplify.configure({
    ...outputs,
    auth: {
        ...outputs.auth,
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
