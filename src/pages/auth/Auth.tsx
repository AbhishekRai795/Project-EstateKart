import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader,
  Shield,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type AuthMode = 'signin' | 'signup' | 'verify-email';

interface ValidationError {
  field: string;
  message: string;
}

export const Auth: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, login, register, confirmSignUp, resendSignUpCode, loading } = useAuth();

  // CRITICAL FIX: Prevent auto-redirect during error states
  const [hasError, setHasError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: ''
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Password strength validation
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  // CRITICAL FIX: Only redirect if user exists AND no error AND not processing
  useEffect(() => {
    if (user && !loading && !hasError && !isProcessing && !error) {
      console.log('User authenticated, redirecting to dashboard');
      navigate('/user-dashboard', { replace: true });
    }
  }, [user, loading, navigate, hasError, isProcessing, error]);

  // Set initial mode based on URL params
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setAuthMode('signup');
    } else {
      setAuthMode('signin');
    }
  }, [searchParams]);

  // Real-time password validation
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

  // Enhanced form validation
  const validateForm = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (authMode === 'signup') {
      if (!formData.name.trim()) {
        errors.push({ field: 'name', message: 'Full name is required' });
      } else if (formData.name.trim().length < 2) {
        errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
        errors.push({ field: 'email', message: 'Email address is required' });
      } else if (!emailRegex.test(formData.email)) {
        errors.push({ field: 'email', message: 'Please enter a valid email address' });
      }

      if (!formData.password) {
        errors.push({ field: 'password', message: 'Password is required' });
      } else {
        if (formData.password.length < 8) {
          errors.push({ field: 'password', message: 'Password must be at least 8 characters long' });
        }
        if (!/[A-Z]/.test(formData.password)) {
          errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter' });
        }
        if (!/[a-z]/.test(formData.password)) {
          errors.push({ field: 'password', message: 'Password must contain at least one lowercase letter' });
        }
        if (!/\d/.test(formData.password)) {
          errors.push({ field: 'password', message: 'Password must contain at least one number' });
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
          errors.push({ field: 'password', message: 'Password must contain at least one special character (!@#$%^&*...)' });
        }
      }

      if (!formData.confirmPassword) {
        errors.push({ field: 'confirmPassword', message: 'Please confirm your password' });
      } else if (formData.password !== formData.confirmPassword) {
        errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
      }

      if (!acceptTerms) {
        errors.push({ field: 'terms', message: 'Please accept the Terms of Service and Privacy Policy' });
      }
    } else if (authMode === 'signin') {
      if (!formData.email.trim()) {
        errors.push({ field: 'email', message: 'Email address is required' });
      }
      if (!formData.password) {
        errors.push({ field: 'password', message: 'Password is required' });
      }
    } else if (authMode === 'verify-email') {
      if (!formData.verificationCode.trim()) {
        errors.push({ field: 'verificationCode', message: 'Verification code is required' });
      } else if (formData.verificationCode.length !== 6) {
        errors.push({ field: 'verificationCode', message: 'Verification code must be 6 digits' });
      }
    }

    return errors;
  };

  // CRITICAL FIX: Handle authentication without triggering state changes
  const handleAuthentication = async () => {
    console.log('🚀 Authentication started for mode:', authMode);
    
    // Set processing state to prevent redirects
    setIsProcessing(true);
    setHasError(false);
    setError('');
    setSuccessMessage('');
    setValidationErrors([]);

    try {
      // Form validation
      const errors = validateForm();
      if (errors.length > 0) {
        setValidationErrors(errors);
        setError(errors[0].message);
        setHasError(true);
        return;
      }

      if (authMode === 'signup') {
        console.log('📝 Starting registration...');
        try {
          const result = await register(formData.email, formData.password, formData.name);
          
          if (result.needsVerification) {
            setAuthMode('verify-email');
            setSuccessMessage(`We've sent a verification code to ${formData.email}. Please check your email and enter the code below.`);
          } else {
            // Login after successful registration
            await login(formData.email, formData.password);
            // Don't navigate here - let useEffect handle it
          }
        } catch (err: any) {
          console.error('❌ Registration error:', err);
          setHasError(true);
          if (err.message?.includes('User already exists') || err.message?.includes('UsernameExistsException')) {
            setError('An account with this email already exists. Please try signing in instead.');
          } else if (err.message?.includes('Invalid email')) {
            setError('Please enter a valid email address.');
          } else if (err.message?.includes('Password policy') || err.message?.includes('InvalidPasswordException')) {
            setError('Password does not meet security requirements. Please check the requirements below.');
          } else {
            setError(err.message || 'Registration failed. Please try again.');
          }
        }
      } else if (authMode === 'signin') {
        console.log('🔑 Starting signin...');
        try {
          // CRITICAL: Don't let AuthContext loading state interfere
          await login(formData.email, formData.password);
          console.log('✅ Login successful');
          // Don't navigate here - let useEffect handle it after state updates
        } catch (err: any) {
          console.error('❌ Login error:', err);
          setHasError(true);
          
          // Comprehensive error handling
          if (err.message?.includes('verify your email') || err.message?.includes('User is not confirmed')) {
            setError('Please verify your email address before signing in.');
            setAuthMode('verify-email');
          } else if (
            err.message?.includes('Incorrect username or password') || 
            err.message?.includes('NotAuthorizedException') ||
            err.message?.includes('Invalid login credentials')
          ) {
            setError('Incorrect email or password. Please check your credentials and try again.');
          } else if (err.message?.includes('User does not exist') || err.message?.includes('UserNotFoundException')) {
            setError('No account found with this email address. Please sign up first.');
          } else if (err.message?.includes('Too many failed attempts') || err.message?.includes('TooManyRequestsException')) {
            setError('Too many failed login attempts. Please wait a few minutes before trying again.');
          } else if (err.message?.includes('UserNotConfirmedException')) {
            setError('Please verify your email address before signing in.');
            setAuthMode('verify-email');
          } else {
            setError('Login failed. Please check your credentials and try again.');
          }
          
          console.log('🔴 Error set, staying in current mode');
        }
      } else if (authMode === 'verify-email') {
        console.log('🔐 Starting email verification...');
        try {
          setIsVerifying(true);
          await confirmSignUp(formData.email, formData.verificationCode);
          
          setSuccessMessage('Email verified successfully! Signing you in...');
          
          setTimeout(async () => {
            try {
              await login(formData.email, formData.password);
              // Don't navigate here - let useEffect handle it
            } catch (loginErr: any) {
              setError('Email verified successfully! Please sign in with your credentials.');
              setAuthMode('signin');
              setHasError(true);
            }
            setIsVerifying(false);
          }, 1500);
        } catch (err: any) {
          console.error('❌ Verification error:', err);
          setHasError(true);
          if (err.message?.includes('CodeMismatchException')) {
            setError('Invalid verification code. Please check the code and try again.');
          } else if (err.message?.includes('ExpiredCodeException')) {
            setError('Verification code has expired. Please request a new code.');
          } else {
            setError(err.message || 'Invalid verification code. Please try again or request a new code.');
          }
          setIsVerifying(false);
        }
      }
    } catch (err: any) {
      console.error('❌ Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
      setHasError(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle button click
  const handleButtonClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    await handleAuthentication();
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAuthentication();
    }
  };

  // Handle resend verification code
  const handleResendCode = async () => {
    if (!formData.email.trim()) {
      setError('Email address is required to resend code');
      return;
    }

    try {
      await resendSignUpCode(formData.email);
      setSuccessMessage('New verification code sent to your email');
      setError('');
      setFormData(prev => ({ ...prev, verificationCode: '' }));
    } catch (err: any) {
      console.error('Resend error:', err);
      setError(err.message || 'Failed to resend verification code');
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error && value.trim() !== '') {
      setError('');
      setHasError(false);
    }
    if (successMessage && field === 'verificationCode') setSuccessMessage('');
    setValidationErrors(prev => prev.filter(err => err.field !== field));
  };

  // Switch between modes
  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setError('');
    setSuccessMessage('');
    setValidationErrors([]);
    setHasError(false);
    setIsProcessing(false);
    if (mode === 'signin') {
      setFormData(prev => ({ ...prev, name: '', confirmPassword: '', verificationCode: '' }));
    }
  };

  // Get field error
  const getFieldError = (field: string) => {
    return validationErrors.find(err => err.field === field)?.message;
  };

  // Password strength indicator
  const PasswordStrengthIndicator = () => (
    <div className="mt-2 space-y-1">
      <p className="text-xs text-gray-600 mb-2">Password must contain:</p>
      <div className="grid grid-cols-1 gap-1 text-xs">
        <div className={`flex items-center space-x-1 ${passwordStrength.minLength ? 'text-green-600' : 'text-gray-400'}`}>
          {passwordStrength.minLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          <span>At least 8 characters</span>
        </div>
        <div className={`flex items-center space-x-1 ${passwordStrength.hasUppercase ? 'text-green-600' : 'text-gray-400'}`}>
          {passwordStrength.hasUppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          <span>One uppercase letter</span>
        </div>
        <div className={`flex items-center space-x-1 ${passwordStrength.hasLowercase ? 'text-green-600' : 'text-gray-400'}`}>
          {passwordStrength.hasLowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          <span>One lowercase letter</span>
        </div>
        <div className={`flex items-center space-x-1 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
          {passwordStrength.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          <span>One number</span>
        </div>
        <div className={`flex items-center space-x-1 ${passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}>
          {passwordStrength.hasSpecialChar ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          <span>One special character</span>
        </div>
      </div>
    </div>
  );

  // CRITICAL FIX: Don't show redirect screen when there's an error
  if (user && !loading && !hasError && !isProcessing && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <div className="mt-4 text-lg text-gray-600">Redirecting to dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to EstateKart
          </Link>
          <div className="flex items-center justify-center mb-2">
            {authMode === 'verify-email' && <Shield className="h-8 w-8 text-primary-600 mr-2" />}
            <h1 className="text-3xl font-bold text-gray-900">
              {authMode === 'signin' ? 'Welcome back!' : 
               authMode === 'signup' ? 'Join EstateKart' : 
               'Verify Your Email'}
            </h1>
          </div>
          <p className="text-gray-600">
            {authMode === 'signin' ? 'Sign in to your account to continue' :
             authMode === 'signup' ? 'Create your account to get started' :
             'Enter the 6-digit code we sent to your email'}
          </p>
        </div>

        {/* Tab Navigation - Only show for signin/signup */}
        {authMode !== 'verify-email' && (
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8 relative">
            <motion.div
              className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm"
              initial={false}
              animate={{
                left: authMode === 'signin' ? '4px' : '50%',
                width: 'calc(50% - 4px)'
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button
              onClick={() => switchMode('signin')}
              className={`relative z-10 flex-1 py-3 text-sm font-medium rounded-xl transition-colors ${
                authMode === 'signin' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`relative z-10 flex-1 py-3 text-sm font-medium rounded-xl transition-colors ${
                authMode === 'signup' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Form Container */}
        <div className="relative">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl"></div>
          
          <div className="relative p-8">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <span className="text-green-700 text-sm">{successMessage}</span>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                <span className="text-red-700 text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Form Fields Container */}
            <div className="space-y-6">
              {/* OTP Verification Section */}
              {authMode === 'verify-email' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Email Display */}
                  <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-blue-700 text-sm">Verification code sent to:</p>
                    <p className="text-blue-900 font-semibold text-lg">{formData.email}</p>
                  </div>

                  {/* OTP Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                      Enter 6-Digit Verification Code
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={formData.verificationCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          handleInputChange('verificationCode', value);
                        }}
                        onKeyPress={handleKeyPress}
                        className={`block w-full px-4 py-4 border-2 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-center text-2xl font-mono tracking-widest ${
                          getFieldError('verificationCode') 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-primary-500'
                        }`}
                        placeholder="000000"
                        disabled={isVerifying}
                      />
                    </div>
                    {getFieldError('verificationCode') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {getFieldError('verificationCode')}
                      </p>
                    )}
                  </div>

                  {/* Resend Code */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={loading}
                      className="text-sm text-primary-600 hover:text-primary-700 transition-colors font-medium disabled:opacity-50"
                    >
                      Resend Code
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Name Field (Sign Up Only) */}
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      onKeyPress={handleKeyPress}
                      className={`pl-10 block w-full px-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                        getFieldError('name') 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-primary-500'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {getFieldError('name') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {getFieldError('name')}
                    </p>
                  )}
                </div>
              )}

              {/* Email Field */}
              {authMode !== 'verify-email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onKeyPress={handleKeyPress}
                      className={`pl-10 block w-full px-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                        getFieldError('email') 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-primary-500'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {getFieldError('email') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {getFieldError('email')}
                    </p>
                  )}
                </div>
              )}

              {/* Password Field */}
              {authMode !== 'verify-email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      onKeyPress={handleKeyPress}
                      className={`pl-10 pr-10 block w-full px-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                        getFieldError('password') 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-primary-500'
                      }`}
                      placeholder={authMode === 'signin' ? 'Enter your password' : 'Create a password'}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {getFieldError('password') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {getFieldError('password')}
                    </p>
                  )}
                  {/* Password Strength Indicator for Signup */}
                  {authMode === 'signup' && formData.password && (
                    <PasswordStrengthIndicator />
                  )}
                </div>
              )}

              {/* Confirm Password Field (Sign Up Only) */}
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      onKeyPress={handleKeyPress}
                      className={`pl-10 pr-10 block w-full px-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                        getFieldError('confirmPassword') 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-primary-500'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {getFieldError('confirmPassword') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {getFieldError('confirmPassword')}
                    </p>
                  )}
                </div>
              )}

              {/* Remember Me / Terms */}
              {authMode === 'signin' ? (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors"
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 transition-colors">
                    Forgot password?
                  </Link>
                </div>
              ) : authMode === 'signup' && (
                <div>
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors mt-0.5"
                    />
                    <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-600">
                      I agree to the{' '}
                      <Link to="/terms" className="text-primary-600 hover:text-primary-700 transition-colors">
                        Terms of Service
                      </Link>
                      {' '}
                      and{' '}
                      <Link to="/privacy" className="text-primary-600 hover:text-primary-700 transition-colors">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {getFieldError('terms') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {getFieldError('terms')}
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleButtonClick}
                disabled={loading || isVerifying || isProcessing}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading || isVerifying || isProcessing ? (
                  <Loader className="animate-spin h-5 w-5" />
                ) : authMode === 'signin' ? (
                  'Sign In'
                ) : authMode === 'signup' ? (
                  'Create Account'
                ) : (
                  isVerifying ? 'Verifying...' : 'Verify Email'
                )}
              </button>
            </div>

            {/* Footer Text */}
            {authMode === 'signin' ? (
              <p className="mt-6 text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => switchMode('signup')}
                  className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Sign up
                </button>
              </p>
            ) : authMode === 'signup' ? (
              <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => switchMode('signin')}
                  className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p className="mt-6 text-center text-sm text-gray-600">
                <button
                  onClick={() => switchMode('signin')}
                  className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Back to Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
