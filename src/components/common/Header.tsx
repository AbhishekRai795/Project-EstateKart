import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  User, 
  LogOut, 
  Menu, 
  X, 
  BarChart3, 
  Settings, 
  Search, 
  Plus, 
  ShoppingCart, 
  Sparkles,
  Building,
  Users,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const isOnListerDashboard = location.pathname.startsWith('/lister') || location.pathname === '/dashboard';

  const allMenuItems = [
    // Browse Section
    { 
      section: 'Browse',
      items: [
        { path: '/properties', label: 'Browse Properties', icon: Search },
      ]
    },
    // User Account Section
    ...(user ? [{
      section: 'My Account',
      items: [
        { path: '/user-dashboard', label: 'My Dashboard', icon: User },
        { path: '/catalogue', label: 'My Catalogue', icon: ShoppingCart },
        { path: '/recommendations', label: 'Recommendations', icon: Sparkles },
      ]
    }] : []),
    // Lister Tools Section
    ...(user ? [{
      section: 'Lister Tools',
      items: [
        { path: '/lister/dashboard', label: 'Lister Dashboard', icon: Building },
        { path: '/lister/properties', label: 'My Properties', icon: Building },
        { path: '/add-property', label: 'Add Property', icon: Plus },
        { path: '/lister/clients', label: 'Client Management', icon: Users },
        { path: '/lister/analytics', label: 'Analytics', icon: TrendingUp },
      ]
    }] : []),
    // Settings Section
    ...(user ? [{
      section: 'Settings',
      items: [
        { path: '/profile', label: 'Profile Settings', icon: Settings },
      ]
    }] : [])
  ];

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Side - Hamburger + Logo */}
            <div className="flex items-center space-x-4">
              {/* Hamburger Menu Button - Now on Left */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative z-50"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black text-gray-900 group-hover:text-primary-600 transition-colors">
                  EstateKart
                </span>
              </Link>
            </div>

            {/* Right Side - Auth/User Info */}
            <div className="flex items-center space-x-4">
              {/* Auth Section (Desktop) - Only for non-authenticated users */}
              {!user && (
                <div className="hidden md:flex items-center space-x-4">
                  <Link
                    to="/auth?mode=signin"
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-2 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* User Avatar (Desktop) */}
              {user && (
                <div className="hidden md:flex items-center space-x-3">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-primary-200"
                  />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">
                      {isOnListerDashboard ? 'Lister' : 'User'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sliding Sidebar Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Menu Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary-500 to-primary-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-black text-white">EstateKart</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* User Info */}
              {user && (
                <div className="mt-4 flex items-center space-x-3">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-white/30"
                  />
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-primary-100 text-sm">
                      {isOnListerDashboard ? 'Lister Mode' : 'User Mode'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Content */}
            <div className="p-4 pb-6">
              {/* Auth Links for Non-Authenticated Users */}
              {!user && (
                <div className="space-y-2 mb-6">
                  <Link
                    to="/auth?mode=signin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Sign In</span>
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Get Started</span>
                  </Link>
                </div>
              )}

              {/* Menu Sections */}
              <div className="space-y-6">
                {allMenuItems.map((section, sectionIndex) => (
                  <div key={section.section}>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-2">
                      {section.section}
                    </h3>
                    <ul className="space-y-1">
                      {section.items.map((item) => (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center space-x-3 py-3 px-3 rounded-lg transition-colors group ${
                              isActivePath(item.path)
                                ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-600'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <item.icon className={`w-5 h-5 ${
                              isActivePath(item.path) ? 'text-primary-600' : 'text-gray-500'
                            }`} />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Logout Button */}
                {user && (
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 py-3 px-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left group"
                    >
                      <LogOut className="w-5 h-5 text-red-500" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};