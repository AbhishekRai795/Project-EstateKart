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
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-primary-600">EstateKart</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The modern real estate platform connecting property buyers with trusted listers. 
            Discover, manage, and analyze properties with powerful tools and insights.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link
            to="/properties"
            className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center gap-2 shadow-lg"
          >
            <Search className="w-5 h-5" />
            Browse Properties
          </Link>

          {user ? (
            <Link
              to="/dashboard"
              className="bg-secondary-800 hover:bg-secondary-900 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center gap-2 shadow-lg"
            >
              <BarChart3 className="w-5 h-5" />
              Lister Dashboard
            </Link>
          ) : (
            <Link
              to="/auth/login"
              className="bg-secondary-800 hover:bg-secondary-900 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center gap-2 shadow-lg"
            >
              <User className="w-5 h-5" />
              Join EstateKart
            </Link>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-lg text-center"
          >
            <Search className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Browse Properties</h3>
            <p className="text-gray-600">
              Explore thousands of properties without needing to sign up. 
              Get personalized recommendations when you join.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-lg text-center"
          >
            <Home className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Save Favorites</h3>
            <p className="text-gray-600">
              Create your wishlist of dream properties and get notified 
              about similar listings. Sign in required.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white p-6 rounded-xl shadow-lg text-center"
          >
            <PlusCircle className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">List Your Property</h3>
            <p className="text-gray-600">
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
            className="text-center mt-16"
          >
            <p className="text-lg text-gray-600 mb-4">
              Ready to get started?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth/register"
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-md"
              >
                Create Account
              </Link>
              <Link
                to="/auth/login"
                className="border border-primary-500 text-primary-600 hover:bg-primary-50 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
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