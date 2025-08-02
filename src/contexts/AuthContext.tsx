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
  signInWithRedirect,
} from 'aws-amplify/auth';
import type { SignUpOutput } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  userType?: 'user' | 'lister';
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<SignUpOutput>;
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

  const checkAuthState = useCallback(async (): Promise<User | null> => {
    try {
      const cognitoUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      const { data: existingUser } = await client.models.User.get({ id: cognitoUser.userId });

      let userProfile: Schema['User']['type'];
      
      const nameFromProvider = attributes.name || 
                               [attributes.given_name, attributes.family_name].filter(Boolean).join(' ') || 
                               'New User';
      const pictureFromProvider = attributes.picture;

      if (!existingUser) {
        console.log("User profile not found in DB. Attempting to create...");
        const newUserInput = {
          id: cognitoUser.userId,
          username: attributes.email || 'default_username',
          name: nameFromProvider,
          email: attributes.email || '',
          phone: attributes.phone_number || '',
          avatarUrl: pictureFromProvider || '',
        };
        
        try {
          const { data: newProfile, errors } = await client.models.User.create(newUserInput);
          if (errors || !newProfile) {
            throw new Error(errors?.[0].message || "Could not create user profile in the database.");
          }
          userProfile = newProfile;
          console.log("Successfully created new user profile in DB.");
        } catch (creationError) {
          // --- FIX: Handle race condition caused by React Strict Mode ---
          console.warn("Creation failed, possibly due to a race condition. Re-fetching profile...");
          const { data: refetchedUser } = await client.models.User.get({ id: cognitoUser.userId });
          if (refetchedUser) {
            console.log("Successfully fetched profile on second attempt.");
            userProfile = refetchedUser;
          } else {
            // If it still doesn't exist, then it's a genuine error.
            throw new Error("Could not create or find user profile after creation attempt.");
          }
        }
      } else {
        console.log("User profile found in DB. Checking for updates...");
        userProfile = existingUser;
        
        const updates: { name?: string; avatarUrl?: string } = {};
        
        if (nameFromProvider && nameFromProvider !== 'New User' && nameFromProvider !== userProfile.name) {
          updates.name = nameFromProvider;
        }
        if (pictureFromProvider && pictureFromProvider !== userProfile.avatarUrl) {
          updates.avatarUrl = pictureFromProvider;
        }

        if (Object.keys(updates).length > 0) {
          console.log(`Updating user profile with:`, updates);
          const { data: updatedProfile } = await client.models.User.update({
            id: userProfile.id,
            ...updates,
          });
          if (updatedProfile) {
            userProfile = updatedProfile;
          }
        }
      }

      const userData: User = {
        id: userProfile.id,
        email: userProfile.email || '',
        name: userProfile.name || 'User',
        phone: userProfile.phone || '',
        avatar: userProfile.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${userProfile.name || userProfile.email}`,
        userType: 'user',
        emailVerified: attributes.email_verified === 'true',
      };

      setUser(userData);
      return userData;
    } catch (error) {
      if ((error as Error).name !== 'UserUnAuthenticatedException') {
          console.error("Auth state check/profile sync failed:", error);
      }
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuthState();
      setLoading(false);
    };
    initializeAuth();
  }, [checkAuthState]);
  
  const login = async (email: string, password: string): Promise<void> => {
    try {
      await signIn({ username: email, password });
      await checkAuthState();
    } catch (error: any) {
      setUser(null);
      if (error.name === 'UserNotConfirmedException') {
        throw new Error('Please verify your email before signing in.');
      }
      throw new Error('Incorrect username or password.'); 
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      await signOut();
    } catch (signOutError) {
      console.log("No active user to sign out, proceeding with Google sign-in.");
    }
    try {
      await signInWithRedirect({ provider: 'Google' });
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<SignUpOutput> => {
    setIsAuthFlow(true);
    try {
        const result = await signUp({
            username: email,
            password,
            options: { userAttributes: { email, name, phone_number: '' } },
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
        signInWithGoogle,
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
