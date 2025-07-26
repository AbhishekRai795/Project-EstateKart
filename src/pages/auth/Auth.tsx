import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type AuthMode = 'signin' | 'signup';

export const Auth: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, loading } = useAuth();

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Set initial mode based on URL params
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setAuthMode('signup');
    } else {
      setAuthMode('signin');
    }
  }, [searchParams]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (authMode === 'signup') {
      // Sign-up validation
      if (!formData.name.trim()) {
        setError('Name is required');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
      if (!acceptTerms) {
        setError('Please accept the Terms of Service and Privacy Policy');
        return;
      }

      try {
        await register(formData.email, formData.password, formData.name);
        navigate('/dashboard');
      } catch (err) {
        setError('Registration failed. Please try again.');
      }
    } else {
      // Sign-in
      try {
        await login(formData.email, formData.password);
        navigate('/dashboard');
      } catch (err) {
        setError('Invalid credentials. Please try again.');
      }
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  // Switch between modes
  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setError('');
    // Keep email when switching modes for better UX
    if (mode === 'signin') {
      setFormData(prev => ({ ...prev, name: '', confirmPassword: '' }));
    }
  };

  // Form animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: authMode === 'signin' ? -20 : 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: authMode === 'signin' ? 20 : -20,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 -left-10 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 -right-10 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full space-y-8 relative z-10"
      >
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors mb-8">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to EstateKart
          </Link>
          
          <motion.div
            key={authMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              {authMode === 'signin' ? 'Welcome back!' : 'Join EstateKart'}
            </h2>
            <p className="text-gray-600">
              {authMode === 'signin' 
                ? 'Sign in to your account to continue' 
                : 'Create your account to get started'
              }
            </p>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-2xl p-1 relative">
          <motion.div
            className="absolute top-1 bottom-1 bg-white rounded-xl shadow-sm"
            initial={false}
            animate={{
              x: authMode === 'signin' ? 0 : '100%',
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

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm"></div>
          
          <div className="relative z-10">
            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                >
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={authMode}
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4"
                >
                  {/* Name Field (Sign Up Only) */}
                  {authMode === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="name"
                          type="text"
                          required={authMode === 'signup'}
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="pl-10 block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-10 block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="pl-10 pr-10 block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder={authMode === 'signin' ? 'Enter your password' : 'Create a password'}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field (Sign Up Only) */}
                  {authMode === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required={authMode === 'signup'}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className="pl-10 pr-10 block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Remember Me / Terms */}
                  <div className="flex items-center justify-between">
                    {authMode === 'signin' ? (
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                          Remember me
                        </label>
                      </div>
                    ) : (
                      <div className="flex items-start">
                        <input
                          id="accept-terms"
                          type="checkbox"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors mt-0.5"
                        />
                        <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-700">
                          I agree to the{' '}
                          <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                            Privacy Policy
                          </Link>
                        </label>
                      </div>
                    )}

                    {authMode === 'signin' && (
                      <Link
                        to="/auth/forgot-password"
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                      >
                        Forgot password?
                      </Link>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"></div>
                {loading ? (
                  <Loader className="animate-spin h-5 w-5" />
                ) : (
                  <span className="relative z-10">
                    {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                  </span>
                )}
              </motion.button>
            </form>

            {/* Demo Notice for Sign In */}
            {authMode === 'signin' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 text-sm font-medium">Demo Mode</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  Use any email/password combination to sign in
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-gray-600"
        >
          {authMode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => switchMode('signup')}
                className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => switchMode('signin')}
                className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Sign in
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};
