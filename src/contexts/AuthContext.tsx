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

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthFlow, setIsAuthFlow] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async (): Promise<void> => {
    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();

      const userData: User = {
        id: currentUser.userId,
        email: attributes.email || '',
        name: attributes.name || attributes.given_name || attributes.email?.split('@')[0] || '',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${attributes.email}`,
        userType: 'user',
        emailVerified: attributes.email_verified === 'true'
      };

      setUser(userData);
      setIsAuthFlow(false);
    } catch (error) {
      console.log('No authenticated user found');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    // Don't set loading to true here - let the UI handle it
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password,
      });

      if (isSignedIn) {
        await checkAuthState();
      } else if (nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        setIsAuthFlow(true);
        throw new Error('Please verify your email address before signing in');
      } else {
        throw new Error('Sign in failed - unexpected step');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Enhanced error handling
      if (error.message?.includes('User is not confirmed') || error.message?.includes('verify your email')) {
        setIsAuthFlow(true);
        throw new Error('Please verify your email address before signing in');
      } else if (error.message?.includes('NotAuthorizedException') || error.message?.includes('Incorrect username or password')) {
        throw new Error('Invalid email or password. Please check your credentials.');
      } else if (error.message?.includes('UserNotFoundException')) {
        throw new Error('No account found with this email address. Please sign up first.');
      } else if (error.message?.includes('TooManyRequestsException')) {
        throw new Error('Too many failed login attempts. Please wait a few minutes before trying again.');
      } else {
        throw new Error(error.message || 'Login failed. Please try again.');
      }
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ needsVerification: boolean }> => {
    setIsAuthFlow(true);
    
    try {
      const { isSignUpComplete, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            given_name: name.trim(),
            name: name.trim()
          },
        },
      });

      if (isSignUpComplete) {
        setIsAuthFlow(false);
        return { needsVerification: false };
      } else if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        return { needsVerification: true };
      } else {
        throw new Error('Unexpected signup flow');
      }
    } catch (error: any) {
      setIsAuthFlow(false);
      console.error('Registration error:', error);
      
      // Enhanced registration error handling
      if (error.message?.includes('UsernameExistsException') || error.message?.includes('User already exists')) {
        throw new Error('An account with this email already exists. Please try signing in instead.');
      } else if (error.message?.includes('InvalidParameterException') && error.message?.includes('email')) {
        throw new Error('Please enter a valid email address.');
      } else if (error.message?.includes('InvalidPasswordException') || error.message?.includes('Password policy')) {
        throw new Error('Password does not meet security requirements. Please check the requirements below.');
      } else {
        throw new Error(error.message || 'Registration failed. Please try again.');
      }
    }
  };

  const confirmSignUpHandler = async (email: string, code: string): Promise<void> => {
    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode: code,
      });

      if (!isSignUpComplete) {
        throw new Error('Sign up confirmation failed');
      }

      setIsAuthFlow(false);
    } catch (error: any) {
      console.error('Verification error:', error);
      
      // Enhanced verification error handling
      if (error.message?.includes('CodeMismatchException')) {
        throw new Error('Invalid verification code. Please check the code and try again.');
      } else if (error.message?.includes('ExpiredCodeException')) {
        throw new Error('Verification code has expired. Please request a new code.');
      } else if (error.message?.includes('LimitExceededException')) {
        throw new Error('Too many verification attempts. Please wait before trying again.');
      } else {
        throw new Error(error.message || 'Email verification failed. Please try again.');
      }
    }
  };

  const resendSignUpCodeHandler = async (email: string): Promise<void> => {
    try {
      await resendSignUpCode({
        username: email,
      });
    } catch (error: any) {
      console.error('Resend code error:', error);
      if (error.message?.includes('LimitExceededException')) {
        throw new Error('Too many requests. Please wait before requesting another code.');
      } else {
        throw new Error(error.message || 'Failed to resend verification code');
      }
    }
  };

  const logout = (): void => {
    signOut();
    setUser(null);
    setIsAuthFlow(false);
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await resetPassword({
        username: email,
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      if (error.message?.includes('UserNotFoundException')) {
        throw new Error('No account found with this email address.');
      } else if (error.message?.includes('LimitExceededException')) {
        throw new Error('Too many requests. Please wait before trying again.');
      } else {
        throw new Error(error.message || 'Failed to send reset code');
      }
    }
  };

  const resetPasswordHandler = async (email: string, code: string, newPassword: string): Promise<void> => {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      if (error.message?.includes('CodeMismatchException')) {
        throw new Error('Invalid reset code. Please check the code and try again.');
      } else if (error.message?.includes('ExpiredCodeException')) {
        throw new Error('Reset code has expired. Please request a new one.');
      } else if (error.message?.includes('InvalidPasswordException')) {
        throw new Error('New password does not meet security requirements.');
      } else {
        throw new Error(error.message || 'Failed to reset password');
      }
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

export { useAuth, AuthProvider };
export default AuthProvider;
