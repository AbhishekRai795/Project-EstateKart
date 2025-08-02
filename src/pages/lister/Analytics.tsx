import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BarChart3, Clock, ArrowLeft } from 'lucide-react';

export const ListerAnalytics: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg mx-auto"
      >
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 mb-6">
          <Clock className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center space-x-3">
          <BarChart3 className="h-8 w-8 text-primary-500" />
          <span>Lister Analytics</span>
        </h1>
        <p className="text-gray-600 text-lg mb-2">This feature is currently under construction.</p>
        <p className="text-2xl font-bold text-primary-600 animate-pulse">
          Coming Soon!
        </p>
        <p className="text-gray-500 mt-6">
          We're working hard to bring you detailed insights and analytics for your properties. Stay tuned for updates!
        </p>

        <div className="mt-8">
          <Link
            to="/lister/dashboard"
            className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
