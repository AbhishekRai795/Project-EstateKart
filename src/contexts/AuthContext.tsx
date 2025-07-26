import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  userType?: 'user' | 'lister'; // Add user type for future use
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  loading: boolean;
  // Add these for future Cognito integration
  confirmSignUp?: (email: string, code: string) => Promise<void>;
  resendSignUpCode?: (email: string) => Promise<void>;
  forgotPassword?: (email: string) => Promise<void>;
  resetPassword?: (email: string, code: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call - replace with AWS Cognito integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
        userType: 'user' // Default to user type
      };

      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      // Simulate API call - replace with AWS Cognito integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
        userType: 'user'
      };

      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Future Cognito methods (placeholder implementations)
  const confirmSignUp = async (email: string, code: string) => {
    // Will be implemented with AWS Cognito
    console.log('Confirm sign up:', email, code);
  };

  const resendSignUpCode = async (email: string) => {
    // Will be implemented with AWS Cognito
    console.log('Resend code:', email);
  };

  const forgotPassword = async (email: string) => {
    // Will be implemented with AWS Cognito
    console.log('Forgot password:', email);
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    // Will be implemented with AWS Cognito
    console.log('Reset password:', email, code);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      loading,
      confirmSignUp,
      resendSignUpCode,
      forgotPassword,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};
