import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Home, Search, User, PlusCircle, BarChart3 } from 'lucide-react';

export const Landing: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-7xl font-black text-gray-900 mb-8 leading-tight"
          >
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent">
              EstateKart
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl text-gray-700 mb-12 max-w-3xl mx-auto font-light leading-relaxed"
          >
            The modern real estate platform connecting property buyers with trusted listers. 
            Discover, manage, and analyze properties with powerful tools and insights.
          </motion.p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
          <Link
            to="/properties"
            className="group bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-primary-500/25 hover:scale-105 transform"
          >
            <Search className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
            Browse Properties
          </Link>

          {user ? (
            <Link
              to="/user-dashboard"
              className="group bg-gradient-to-r from-secondary-700 to-secondary-800 hover:from-secondary-800 hover:to-secondary-900 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-secondary-500/25 hover:scale-105 transform"
            >
              <BarChart3 className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
              My Dashboard
            </Link>
          ) : (
            <Link
              to="/auth/login"
              className="group bg-gradient-to-r from-secondary-700 to-secondary-800 hover:from-secondary-800 hover:to-secondary-900 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-secondary-500/25 hover:scale-105 transform"
            >
              <User className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
              Join EstateKart
            </Link>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="group bg-white p-8 rounded-3xl shadow-2xl text-center hover:shadow-primary-500/10 transition-all duration-500 hover:scale-105 transform border border-gray-100"
          >
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-4 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Search className="w-12 h-12 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Browse Properties</h3>
            <p className="text-gray-600 leading-relaxed">
              Explore thousands of properties without needing to sign up. 
              Get personalized recommendations when you join.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="group bg-white p-8 rounded-3xl shadow-2xl text-center hover:shadow-primary-500/10 transition-all duration-500 hover:scale-105 transform border border-gray-100"
          >
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-4 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Home className="w-12 h-12 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Build Your Catalogue</h3>
            <p className="text-gray-600 leading-relaxed">
              Create your personalized property catalogue and get notified 
              about similar listings. Sign in required.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="group bg-white p-8 rounded-3xl shadow-2xl text-center hover:shadow-primary-500/10 transition-all duration-500 hover:scale-105 transform border border-gray-100"
          >
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-4 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <PlusCircle className="w-12 h-12 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">List Your Property</h3>
            <p className="text-gray-600 leading-relaxed">
              Become a lister and showcase your properties to thousands 
              of potential buyers. Full dashboard included.
            </p>
          </motion.div>
        </div>

        {/* Call to Action */}
        {!user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mt-20"
          >
            <p className="text-2xl text-gray-700 mb-8 font-light">
              Ready to get started?
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/auth/register"
                className="group bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-primary-500/25 hover:scale-105 transform"
              >
                Create Account
              </Link>
              <Link
                to="/auth/login"
                className="group border-2 border-primary-500 text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 transform"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};