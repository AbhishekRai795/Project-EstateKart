import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signUp,
  confirmSignUp,
  signIn,
  signOut,
  getCurrentUser,
  fetchUserAttributes,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
} from 'aws-amplify/auth';
import type { SignUpOutput } from 'aws-amplify/auth';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  userType?: 'user' | 'lister';
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<SignUpOutput>;
  loading: boolean; // This is now ONLY for the initial app load
  confirmSignUp: (email: string, code: string) => Promise<void>;
  resendSignUpCode: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  isAuthFlow: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthFlow, setIsAuthFlow] = useState(false);

  const checkAuthState = useCallback(async (): Promise<User | null> => {
    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      const userData: User = {
        id: currentUser.userId,
        email: attributes.email || '',
        name: attributes.name || attributes.given_name || attributes.email?.split('@')[0] || 'User',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${attributes.name || attributes.email}`,
        userType: 'user',
        emailVerified: attributes.email_verified === 'true'
      };

      setUser(userData);
      return userData;
    } catch (error) {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuthState();
      setLoading(false); // This global loading is ONLY for the initial app load.
    };
    initializeAuth();
  }, [checkAuthState]);
  
  // FIX: Removed the global setLoading calls from this function.
  // The local 'isProcessing' state in Auth.tsx will now correctly handle the button's loading state
  // without triggering the full-page loader.
  const login = async (email: string, password: string): Promise<void> => {
    try {
      await signIn({ username: email, password });
      await checkAuthState();
    } catch (error: any) {
      setUser(null);
      if (error.name === 'UserNotConfirmedException') {
        throw new Error('Please verify your email before signing in.');
      }
      // This error will be caught and displayed on the Auth page.
      throw new Error('Incorrect username or password.'); 
    }
  };

  const register = async (email: string, password: string, name: string): Promise<SignUpOutput> => {
    setIsAuthFlow(true);
    try {
        const result = await signUp({
            username: email,
            password,
            options: { userAttributes: { email, name } },
        });
        return result;
    } finally {
        // isAuthFlow remains true until verification
    }
  };

  const confirmSignUpHandler = async (email: string, code: string): Promise<void> => {
    await confirmSignUp({ username: email, confirmationCode: code });
    setIsAuthFlow(false);
  };
  
  const logout = async (): Promise<void> => {
    await signOut();
    setUser(null);
  };
  
  const resendSignUpCodeHandler = async (email: string) => {
      await resendSignUpCode({ username: email });
  };

  const forgotPasswordHandler = async (email: string) => {
      await resetPassword({ username: email });
  };
  
  const resetPasswordHandler = async (email: string, code: string, newPassword: string) => {
      await confirmResetPassword({ username: email, newPassword, confirmationCode: code });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        loading,
        confirmSignUp: confirmSignUpHandler,
        resendSignUpCode: resendSignUpCodeHandler,
        forgotPassword: forgotPasswordHandler,
        resetPassword: resetPasswordHandler,
        isAuthFlow,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
