import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, DollarSign, TrendingUp, Home as HomeIcon, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProperty } from '../../contexts/PropertyContext';
import { StatsCard } from '../../components/analytics/StatsCard';
import { PropertyViewsChart } from '../../components/analytics/PropertyViewsChart';
import { ConversionFunnel } from '../../components/analytics/ConversionFunnel';
import { PropertyCard } from '../../components/common/PropertyCard';

export const ListerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getPropertiesByLister, getPropertyAnalytics } = useProperty();
  const navigate = useNavigate();

  const listerProperties = getPropertiesByLister(user?.id || '');
  const analytics = getPropertyAnalytics(user?.id || '');

  // Mock data for charts
  const viewsData = [
    { name: 'Jan', views: 120, offers: 8 },
    { name: 'Feb', views: 180, offers: 12 },
    { name: 'Mar', views: 220, offers: 15 },
    { name: 'Apr', views: 290, offers: 22 },
    { name: 'May', views: 340, offers: 28 },
    { name: 'Jun', views: 380, offers: 35 },
  ];

  const conversionData = {
    views: 1530,
    inquiries: 245,
    offers: 89,
    sales: 12
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name}! 🏠
            </h1>
            <p className="text-primary-100 text-lg mb-6">
              Manage your properties and track your sales performance
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/lister/add-property')}
              className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add New Property</span>
            </motion.button>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 translate-x-16"></div>
        </div>
      </motion.div>

      {/* My Properties Section */}
      <motion.section variants={itemVariants} className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Properties</h2>
          <button 
            onClick={() => navigate('/my-properties')}
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            View all →
          </button>
        </div>
        
        {listerProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listerProperties.slice(0, 3).map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                showStats={true}
                onClick={() => navigate(`/property/${property.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <HomeIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties listed yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first property listing</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/add-property')}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Property</span>
            </motion.button>
          </div>
        )}
      </motion.section>
      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Properties"
          value={analytics.totalProperties}
          icon={HomeIcon}
          color="primary"
        />
        <StatsCard
          title="Total Views"
          value={analytics.totalViews.toLocaleString()}
          change={{ value: 15, type: 'increase' }}
          icon={Eye}
          color="success"
        />
        <StatsCard
          title="Total Offers"
          value={analytics.totalOffers}
          change={{ value: 8, type: 'increase' }}
          icon={DollarSign}
          color="warning"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${analytics.conversionRate}%`}
          change={{ value: 3, type: 'increase' }}
          icon={TrendingUp}
          color="success"
        />
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div variants={itemVariants}>
          <PropertyViewsChart data={viewsData} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <ConversionFunnel data={conversionData} />
        </motion.div>
      </div>

      {/* Recent Properties */}

      {/* Quick Actions */}
      <motion.section variants={itemVariants}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/add-property')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="bg-primary-100 p-3 rounded-lg w-fit mb-4 group-hover:bg-primary-200 transition-colors">
              <Plus className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Add Property</h3>
            <p className="text-sm text-gray-600">List a new property for sale or rent</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="bg-green-100 p-3 rounded-lg w-fit mb-4 group-hover:bg-green-200 transition-colors">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">View Offers</h3>
            <p className="text-sm text-gray-600">Check offers from potential buyers</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/analytics')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4 group-hover:bg-blue-200 transition-colors">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-sm text-gray-600">Detailed insights and performance metrics</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4 group-hover:bg-purple-200 transition-colors">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Manage Clients</h3>
            <p className="text-sm text-gray-600">View and manage client interactions</p>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
};