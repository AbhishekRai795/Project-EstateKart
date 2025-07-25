import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, DollarSign, TrendingUp, Home as HomeIcon, Users, BarChart3, MessageSquare } from 'lucide-react';
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
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-4">
              Welcome back, {user?.name}! 🏠
            </h1>
            <p className="text-primary-100 text-xl mb-8">
              Manage your properties and track your sales performance
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/add-property')}
              className="bg-white text-primary-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-6 w-6" />
              <span>Add New Property</span>
            </motion.button>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-40 translate-x-40"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full translate-y-20 translate-x-20"></div>
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
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <HomeIcon className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No properties listed yet</h3>
            <p className="text-gray-600 mb-8 text-lg">Start by adding your first property listing</p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/add-property')}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-primary-500/25 inline-flex items-center space-x-3"
            >
              <Plus className="h-6 w-6" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/add-property')}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group border border-gray-100 hover:border-primary-200"
          >
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <Plus className="h-7 w-7 text-primary-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-3 text-lg">Add Property</h3>
            <p className="text-gray-600 leading-relaxed">List a new property for sale or rent</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/clients')}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group border border-gray-100 hover:border-primary-200"
          >
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <MessageSquare className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-3 text-lg">Client Management</h3>
            <p className="text-gray-600 leading-relaxed">Manage queries and scheduled viewings</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/analytics')}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group border border-gray-100 hover:border-primary-200"
          >
            <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <BarChart3 className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-3 text-lg">Analytics</h3>
            <p className="text-gray-600 leading-relaxed">Detailed insights and performance metrics</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/my-properties')}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group border border-gray-100 hover:border-primary-200"
          >
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <HomeIcon className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-3 text-lg">My Properties</h3>
            <p className="text-gray-600 leading-relaxed">View and manage all your listings</p>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
};