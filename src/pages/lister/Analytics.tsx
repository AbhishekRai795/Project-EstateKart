import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Eye, DollarSign, Users, Calendar, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProperty } from '../../contexts/PropertyContext';
import { StatsCard } from '../../components/analytics/StatsCard';
import { PropertyViewsChart } from '../../components/analytics/PropertyViewsChart';
import { ConversionFunnel } from '../../components/analytics/ConversionFunnel';

export const ListerAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { getPropertiesByLister, getPropertyAnalytics } = useProperty();
  const [timeRange, setTimeRange] = useState('6months');

  const listerProperties = getPropertiesByLister(user?.id || '');
  const analytics = getPropertyAnalytics(user?.id || '');

  // Mock data for comprehensive analytics
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

  const performanceMetrics = {
    avgViewsPerProperty: Math.round(analytics.totalViews / (analytics.totalProperties || 1)),
    avgTimeOnMarket: 45, // days
    responseRate: 92, // percentage
    customerSatisfaction: 4.8
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
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <div className="bg-primary-100 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary-600" />
              </div>
              <span>Analytics Dashboard</span>
            </h1>
            <p className="text-gray-600 mt-2">Track your property performance and sales metrics</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Properties"
          value={analytics.totalProperties}
          change={{ value: 12, type: 'increase' }}
          icon={TrendingUp}
          color="primary"
        />
        <StatsCard
          title="Total Views"
          value={analytics.totalViews.toLocaleString()}
          change={{ value: 23, type: 'increase' }}
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
          change={{ value: 5, type: 'increase' }}
          icon={Users}
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

      {/* Performance Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Avg Views/Property</h3>
            <Eye className="h-5 w-5 text-primary-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{performanceMetrics.avgViewsPerProperty}</p>
          <p className="text-sm text-green-600 mt-1">+12% vs last period</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Avg Time on Market</h3>
            <Calendar className="h-5 w-5 text-primary-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{performanceMetrics.avgTimeOnMarket} days</p>
          <p className="text-sm text-green-600 mt-1">-5 days vs average</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Response Rate</h3>
            <Users className="h-5 w-5 text-primary-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{performanceMetrics.responseRate}%</p>
          <p className="text-sm text-green-600 mt-1">Above industry avg</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Customer Rating</h3>
            <TrendingUp className="h-5 w-5 text-primary-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{performanceMetrics.customerSatisfaction}/5</p>
          <p className="text-sm text-green-600 mt-1">Excellent rating</p>
        </div>
      </motion.div>

      {/* Property Status Breakdown */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Property Status Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-4 w-fit mx-auto mb-3">
              <div className="w-8 h-8 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.propertiesByStatus.available}</p>
            <p className="text-sm text-gray-600">Available</p>
          </div>
          <div className="text-center">
            <div className="bg-yellow-100 rounded-full p-4 w-fit mx-auto mb-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.propertiesByStatus.pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-4 w-fit mx-auto mb-3">
              <div className="w-8 h-8 bg-red-500 rounded-full"></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.propertiesByStatus.sold}</p>
            <p className="text-sm text-gray-600">Sold</p>
          </div>
        </div>
      </motion.div>

      {/* Insights and Recommendations */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-primary-900 mb-4">
          📈 Insights & Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="bg-green-500 rounded-full p-1 mt-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-primary-900">Strong Performance</p>
                <p className="text-sm text-primary-700">Your conversion rate is 23% above market average</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 rounded-full p-1 mt-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-primary-900">Optimal Pricing</p>
                <p className="text-sm text-primary-700">Your properties are priced competitively in the market</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="bg-yellow-500 rounded-full p-1 mt-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-primary-900">Photo Opportunity</p>
                <p className="text-sm text-primary-700">Consider adding more photos to increase view duration</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-purple-500 rounded-full p-1 mt-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-primary-900">Market Timing</p>
                <p className="text-sm text-primary-700">Spring season shows highest engagement rates</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};