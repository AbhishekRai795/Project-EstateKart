import React, { createContext, useContext, useState, useEffect } from 'react';
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
  register: (email: string, password: string, name: string) => Promise<{ needsVerification: boolean }>;
  loading: boolean;
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

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async (): Promise<void> => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();

      const userData: User = {
        id: currentUser.userId,
        email: attributes.email || '',
        name: attributes.name || attributes.given_name || attributes.email?.split('@')[0] || '',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${attributes.email}`,
        userType: 'user', // You can enhance this later based on user groups or roles
        emailVerified: attributes.email_verified === 'true'
      };

      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      await signIn({ username: email, password });
      // FIX: Await the checkAuthState to ensure the user session is fully updated
      // before the login function resolves. This prevents race conditions.
      await checkAuthState();
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.name === 'UserNotConfirmedException') {
        throw new Error('Please verify your email address before signing in.');
      }
      throw new Error('Invalid email or password. Please try again.');
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ needsVerification: boolean }> => {
    setIsAuthFlow(true);
    try {
      const { nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: { email, name },
        },
      });
      return { needsVerification: nextStep.signUpStep === 'CONFIRM_SIGN_UP' };
    } catch (error: any) {
      setIsAuthFlow(false);
      throw new Error(error.message || 'Registration failed.');
    }
  };

  const confirmSignUpHandler = async (email: string, code: string): Promise<void> => {
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      setIsAuthFlow(false);
    } catch (error: any) {
      throw new Error(error.message || 'Verification failed.');
    }
  };

  const resendSignUpCodeHandler = async (email: string): Promise<void> => {
    try {
      await resendSignUpCode({ username: email });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend code.');
    }
  };

  const logout = async (): Promise<void> => {
    await signOut();
    setUser(null);
    setIsAuthFlow(false);
  };
  
  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await resetPassword({ username: email });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send reset code.');
    }
  };

  const resetPasswordHandler = async (email: string, code: string, newPassword: string): Promise<void> => {
    try {
      await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reset password.');
    }
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
        forgotPassword,
        resetPassword: resetPasswordHandler,
        isAuthFlow,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}