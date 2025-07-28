import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://your-api-gateway-url',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor with proper TypeScript handling
api.interceptors.request.use(
  async (config: any) => {
    try {
      const now = Date.now() / 1000;
      if (!cachedToken || now >= tokenExpiry - 300) {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken;
        
        if (token) {
          cachedToken = token.toString();
          tokenExpiry = token.payload.exp as number;
        }
      }
      
      if (cachedToken) {
        if (!config.headers) {
          config.headers = {};
        }
        config.headers.Authorization = `Bearer ${cachedToken}`;
      }
    } catch (error: any) {
      console.warn('Authentication failed:', error);
      cachedToken = null;
      tokenExpiry = 0;
    }
    
    return config;
  },
  (error: any) => Promise.reject(error)
);

// FIXED: Response interceptor - avoid forced page reload
api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    if (error.response?.status === 401) {
      // Clear cached token
      cachedToken = null;
      tokenExpiry = 0;
      
      // FIXED: Don't force page reload during auth flow
      // Instead, use custom event for React Router navigation
      if (window.location.pathname !== '/auth') {
        const event = new CustomEvent('auth-expired', { 
          detail: { redirectTo: '/auth' }
        });
        window.dispatchEvent(event);
      }
    }
    return Promise.reject(error);
  }
);

export { api };

// Helper function to get current user's ID token
export const getCurrentUserToken = async (): Promise<string | null> => {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() || null;
  } catch (error: any) {
    console.error('Error getting user token:', error);
    return null;
  }
};

// Helper function to get user's sub (unique identifier)
export const getCurrentUserSub = async (): Promise<string | null> => {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.payload?.sub as string || null;
  } catch (error: any) {
    console.error('Error getting user sub:', error);
    return null;
  }
};
