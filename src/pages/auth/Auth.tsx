import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  CheckCircle,
  AlertCircle,
  Loader,
  Shield,
  Check,
  X,
  Home
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { SignUpOutput } from 'aws-amplify/auth';

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);


type AuthMode = 'signin' | 'signup' | 'verify-email';

interface ValidationError {
  field: string;
  message: string;
}

export const Auth: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, confirmSignUp, resendSignUpCode, signInWithGoogle, user, loading } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  // --- FIX: Added a new state for Google Sign-In loading ---
  const [isGoogleProcessing, setIsGoogleProcessing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setAuthMode('signup');
    } else {
      setAuthMode('signin');
    }
  }, [searchParams]);

  // --- FIX: This useEffect now correctly handles the redirect after Google Sign-In ---
  useEffect(() => {
    // When the component mounts, if the `loading` state from your AuthContext is true,
    // it likely means Amplify is processing a sign-in (e.g., after a Google redirect).
    // We set the `isGoogleProcessing` state to true to show the loading indicator
    // on the Google button.
    if (loading) {
      setIsGoogleProcessing(true);
    }

    // If we have a user and the loading process has finished, we can safely redirect.
    if (user && !loading) {
      navigate('/user/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (formData.password) {
      setPasswordStrength({
        minLength: formData.password.length >= 8,
        hasUppercase: /[A-Z]/.test(formData.password),
        hasLowercase: /[a-z]/.test(formData.password),
        hasNumber: /\d/.test(formData.password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
      });
    }
  }, [formData.password]);

  const validateForm = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    if (authMode === 'signup' && !formData.name) {
      errors.push({ field: 'name', message: 'Full name is required.' });
    }
    if (!formData.email) {
      errors.push({ field: 'email', message: 'Email is required.' });
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push({ field: 'email', message: 'Email is invalid.' });
    }
    if (!formData.password) {
      errors.push({ field: 'password', message: 'Password is required.' });
    }
    if (authMode === 'signup' && formData.password !== formData.confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Passwords do not match.' });
    }
    return errors;
  };

  const handleAuthentication = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError('');
    setSuccessMessage('');
    setValidationErrors([]);

    const formErrors = validateForm();
    if (formErrors.length > 0) {
      setValidationErrors(formErrors);
      setError(formErrors[0].message);
      setIsProcessing(false);
      return;
    }

    try {
      if (authMode === 'signin') {
        await login(formData.email, formData.password);
        navigate('/user/dashboard', { replace: true });
      } else if (authMode === 'signup') {
        const result: SignUpOutput = await register(formData.email, formData.password, formData.name);
        if (result.nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
          setAuthMode('verify-email');
          setSuccessMessage(`We've sent a verification code to ${formData.email}.`);
        } else {
          await login(formData.email, formData.password);
          navigate('/user/dashboard', { replace: true });
        }
      } else if (authMode === 'verify-email') {
        await confirmSignUp(formData.email, formData.verificationCode);
        setSuccessMessage('Email verified successfully! Signing you in...');
        await login(formData.email, formData.password);
        navigate('/user/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      if (err.message.includes('User is not confirmed')) {
        setAuthMode('verify-email');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleAuthentication();
  };
  
  // --- FIX: This function now manages the Google-specific loading state ---
  const handleGoogleSignIn = async () => {
    if (isGoogleProcessing) return;
    setIsGoogleProcessing(true);
    setError('');
    try {
      await signInWithGoogle();
      // After this call, the user is redirected to Google.
      // The useEffect hook above will handle the logic when they are redirected back.
    } catch (error: any) {
      console.error('Google sign-in failed:', error);
      setError(error.message || 'Google sign-in failed. Please try again.');
      setIsGoogleProcessing(false);
    }
  };

  const handleResendCode = async () => {
    if (!formData.email) {
      setError('Email is required to resend the code.');
      return;
    }
    try {
      await resendSignUpCode(formData.email);
      setSuccessMessage('A new verification code has been sent.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
    setValidationErrors(prev => prev.filter(err => err.field !== field));
  };

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setError('');
    setSuccessMessage('');
    setValidationErrors([]);
    setIsProcessing(false);
    setFormData(prev => ({
      ...prev,
      name: mode === 'signin' ? '' : prev.name,
      confirmPassword: '',
      verificationCode: '',
    }));
  };

  const getFieldError = (field: string) => {
    return validationErrors.find(err => err.field === field)?.message;
  };

  const PasswordStrengthIndicator = () => (
    <>
      <p className="text-xs text-gray-600 mb-2">Password must contain:</p>
      {Object.entries({
        'At least 8 characters': passwordStrength.minLength,
        'One uppercase letter': passwordStrength.hasUppercase,
        'One lowercase letter': passwordStrength.hasLowercase,
        'One number': passwordStrength.hasNumber,
        'One special character': passwordStrength.hasSpecialChar,
      }).map(([label, isValid]) => (
        <div key={label} className={`flex items-center space-x-1 text-xs ${isValid ? 'text-green-600' : 'text-gray-400'}`}>
          {isValid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          <span>{label}</span>
        </div>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-white">
      <Link to="/" className="fixed top-6 left-6 z-20 flex items-center space-x-2 group">
        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
          <Home className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-black text-gray-900 group-hover:text-primary-600 transition-colors">
          EstateKart
        </span>
      </Link>

      <div className={`flex flex-wrap min-h-screen ${authMode === 'signup' ? 'flex-row-reverse' : ''}`}>
        <motion.div layout transition={{ duration: 0.5, type: 'spring' }} className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={authMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {authMode === 'signin' ? 'Welcome back!' : authMode === 'signup' ? 'Create your Account' : 'Verify Your Email'}
                </h1>
                <p className="text-gray-600 mb-8">
                  {authMode === 'signin' ? 'Please enter your details to sign in.' : authMode === 'signup' ? 'Let\'s get started with a free account.' : `We've sent a code to ${formData.email}`}
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                    <span className="text-red-700 text-sm font-medium">{error}</span>
                  </div>
                )}
                {successMessage && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-green-700 text-sm">{successMessage}</span>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {authMode === 'signup' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input type="text" required value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="pl-10 block w-full px-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" placeholder="Enter your full name" autoComplete="name" />
                        </div>
                        {getFieldError('name') && <p className="text-xs text-red-600 mt-1">{getFieldError('name')}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input type="email" required value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="pl-10 block w-full px-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" placeholder="Enter your email" autoComplete="email" />
                        </div>
                        {getFieldError('email') && <p className="text-xs text-red-600 mt-1">{getFieldError('email')}</p>}
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input 
                            type={showPassword ? 'text' : 'password'} 
                            required 
                            value={formData.password} 
                            onChange={(e) => handleInputChange('password', e.target.value)} 
                            onFocus={() => setIsPasswordFocused(true)}
                            onBlur={() => setIsPasswordFocused(false)}
                            className="pl-10 pr-10 block w-full px-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" 
                            placeholder="Create a password" 
                            autoComplete="new-password" 
                          />
                          <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        <AnimatePresence>
                          {isPasswordFocused && formData.password && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: 'auto' }}
                              exit={{ opacity: 0, y: -10, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="absolute z-10 w-full p-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg"
                            >
                              <PasswordStrengthIndicator />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {getFieldError('password') && <p className="text-xs text-red-600 mt-1">{getFieldError('password')}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input type={showConfirmPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} className="pl-10 pr-10 block w-full px-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" placeholder="Confirm your password" autoComplete="new-password" />
                          <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {getFieldError('confirmPassword') && <p className="text-xs text-red-600 mt-1">{getFieldError('confirmPassword')}</p>}
                      </div>
                    </>
                  )}
                  {authMode === 'signin' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input type="email" required value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="pl-10 block w-full px-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" placeholder="Enter your email" autoComplete="email" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} className="pl-10 pr-10 block w-full px-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" placeholder="Enter your password" autoComplete="current-password" />
                          <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  {authMode === 'verify-email' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="text" required value={formData.verificationCode} onChange={(e) => handleInputChange('verificationCode', e.target.value)} className="pl-10 block w-full px-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" placeholder="Enter 6-digit code" autoComplete="one-time-code" />
                      </div>
                      <div className="text-right mt-2">
                        <button type="button" onClick={handleResendCode} className="text-sm text-primary-600 hover:text-primary-700">
                          Resend code
                        </button>
                      </div>
                    </div>
                  )}

                  {authMode === 'signin' && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" /><span className="ml-2 text-sm text-gray-600">Remember me</span></label>
                      <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">Forgot password?</Link>
                    </div>
                  )}

                  <button type="submit" disabled={isProcessing} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
                    {isProcessing ? <Loader className="animate-spin h-5 w-5" /> : (authMode === 'signin' ? 'Sign In' : authMode === 'signup' ? 'Create Account' : 'Verify & Sign In')}
                  </button>
                </form>

                <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* --- FIX: The Google Sign-In button now uses the new loading state --- */}
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleProcessing}
                    className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                    {isGoogleProcessing ? (
                      <>
                        <Loader className="animate-spin h-5 w-5" />
                        <span className="ml-3">Signing in...</span>
                      </>
                    ) : (
                      <>
                        <GoogleIcon />
                        <span className="ml-3">{authMode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}</span>
                      </>
                    )}
                </button>
                
                <p className="mt-6 text-center text-sm text-gray-600">
                  {authMode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                  <button onClick={() => switchMode(authMode === 'signin' ? 'signup' : 'signin')} className="font-medium text-primary-600 hover:text-primary-700">
                    {authMode === 'signin' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div layout transition={{ duration: 0.5, type: 'spring' }} className="hidden lg:flex w-1/2 bg-primary-50 items-center justify-center p-12 relative overflow-hidden">
           <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-center text-primary-900 z-10"
           >
            <h2 className="text-4xl font-bold leading-tight">"The best investment on Earth is Earth itself."</h2>
            <p className="mt-4 text-lg text-primary-700">- Louis Glickman</p>
           </motion.div>
          <motion.div className="absolute -top-20 -right-20 w-72 h-72 bg-primary-200 rounded-full opacity-50 animate-blob"></motion.div>
          <motion.div className="absolute -bottom-20 -left-20 w-72 h-72 bg-primary-200 rounded-full opacity-50 animate-blob animation-delay-4000"></motion.div>
        </motion.div>
      </div>
    </div>
  );
};