import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, LogOut, Menu, X, BarChart3, Settings, Search, Plus, ShoppingCart, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/properties', label: 'Browse Properties', icon: Search },
    ...(user ? [
      { path: '/user-dashboard', label: 'My Dashboard', icon: User },
      { path: '/catalogue', label: 'My Catalogue', icon: ShoppingCart },
      { path: '/recommendations', label: 'Recommendations', icon: Sparkles },
      { path: '/add-property', label: 'List Property', icon: Plus },
      { path: '/dashboard', label: 'Lister Dashboard', icon: BarChart3 },
    ] : [])
  ];


  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-primary-500 to-primary-600 p-2 rounded-xl shadow-lg hover:shadow-primary-500/25 transition-all duration-300"
            >
              <Home className="h-6 w-6 text-white" />
            </motion.div>
            <span className="text-xl font-black bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              EstateKart
            </span>
          </Link>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Hamburger Menu */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </motion.button>

                {/* Profile Menu */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-3 text-sm rounded-xl p-2 hover:bg-primary-50 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                      alt={user.name}
                      className="h-8 w-8 rounded-full ring-2 ring-primary-200 hover:ring-primary-300 transition-all duration-300"
                    />
                    <div className="text-left hidden sm:block">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">Member</p>
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl ring-1 ring-black/5 py-2 border border-gray-100"
                      >
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 rounded-lg mx-2"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Profile Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all duration-200 rounded-lg mx-2"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/auth/login"
                  className="text-gray-600 hover:text-primary-600 px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover:bg-primary-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-primary-500/25 hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Hamburger Menu Content */}
        <AnimatePresence>
          {isMobileMenuOpen && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-200/50 py-6 bg-gradient-to-b from-white to-gray-50/50"
            >
              <nav className="flex flex-col space-y-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActivePath(item.path)
                          ? 'text-primary-600 bg-primary-50 shadow-sm'
                          : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};