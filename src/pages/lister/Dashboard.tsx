import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Plus, 
  Users, 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  Calendar,
  Building,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProperty } from '../../contexts/PropertyContext';

export const ListerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getPropertiesByLister, getPropertyAnalytics } = useProperty();
  
  const listerProperties = getPropertiesByLister(user?.id || '');
  const analytics = getPropertyAnalytics(user?.id || '');

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
      

      {/* Welcome Banner */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}! 👋</h2>
              <p className="text-primary-100">
                Here's what's happening with your properties today
              </p>
            </div>
            <div className="hidden md:block">
              <Link
                to="/add-property"
                className="group bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 border border-white/30 hover:border-white/50 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Add Property</span>
              </Link>
            </div>
          </div>
          
          {/* Mobile Add Property Button */}
          <div className="md:hidden mt-4">
            <Link
              to="/add-property"
              className="group bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 border border-white/30 hover:border-white/50"
            >
              <Plus className="w-5 h-5" />
              <span>Add Property</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">+2 this month</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{analytics.totalProperties}</p>
            <p className="text-sm text-gray-600">Total Properties</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">+12% this week</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{analytics.totalViews.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Views</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">+5 pending</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{analytics.totalOffers}</p>
            <p className="text-sm text-gray-600">Total Offers</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">+2.1% from last month</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{analytics.conversionRate}%</p>
            <p className="text-sm text-gray-600">Conversion Rate</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions - ENHANCED DESIGN */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Add Property */}
          <Link
            to="/add-property"
            className="group bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-2xl text-center hover:shadow-primary-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform border border-gray-100/50 relative overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-4 right-4 w-12 h-12 bg-green-100 rounded-full opacity-30 group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Plus className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                Add Property
              </h3>
              <p className="text-gray-600 leading-relaxed">
                List a new property for sale or rent
              </p>
            </div>
          </Link>

          {/* My Properties */}
          <Link
            to="/lister/properties"
            className="group bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-2xl text-center hover:shadow-primary-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform border border-gray-100/50 relative overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-4 right-4 w-12 h-12 bg-blue-100 rounded-full opacity-30 group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Building className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                My Properties
              </h3>
              <p className="text-gray-600 leading-relaxed">
                View and manage all your listings
              </p>
            </div>
          </Link>

          {/* Client Management */}
          <Link
            to="/lister/clients"
            className="group bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-2xl text-center hover:shadow-primary-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform border border-gray-100/50 relative overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-4 right-4 w-12 h-12 bg-purple-100 rounded-full opacity-30 group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                Client Management
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Manage queries and scheduled viewings
              </p>
            </div>
          </Link>

          {/* Analytics */}
          <Link
            to="/lister/analytics"
            className="group bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-2xl text-center hover:shadow-primary-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform border border-gray-100/50 relative overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-4 right-4 w-12 h-12 bg-orange-100 rounded-full opacity-30 group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                Analytics
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Detailed insights and performance metrics
              </p>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Recent Properties & Quick Overview - CONSISTENT HEIGHTS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Properties - 2/3 WIDTH, FIXED HEIGHT */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Properties</h2>
            <Link
              to="/lister/properties"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors flex items-center"
            >
              View all
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* FIXED HEIGHT CONTAINER */}
          <div className="h-[500px]">
            {listerProperties.length > 0 ? (
              <div className="space-y-4 h-full overflow-y-auto">
                {listerProperties.slice(0, 3).map((property) => (
                  <div key={property.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
                    <div className="flex">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-24 h-24 object-cover"
                      />
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900 mb-1">{property.title}</h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span className="text-xs">{property.location}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                <span>{property.views}</span>
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="w-3 h-3 mr-1" />
                                <span>{property.offers} offers</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-primary-600">
                              ${property.price.toLocaleString()}
                            </span>
                            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                              property.status === 'available' ? 'bg-green-100 text-green-800' :
                              property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100 h-full flex flex-col justify-center">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No properties yet</h3>
                <p className="text-gray-600 mb-6">Start by adding your first property listing</p>
                <Link
                  to="/add-property"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-medium mx-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Overview - 1/3 WIDTH, MATCHING HEIGHT */}
        <div className="lg:col-span-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Overview</h3>
          
          {/* SAME HEIGHT AS RECENT PROPERTIES */}
          <div className="h-[500px] space-y-4 flex flex-col">
            {/* Property Status Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 flex-1">
              <h4 className="font-bold text-gray-900 mb-4">Property Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Available</span>
                  </div>
                  <span className="text-sm font-medium">{analytics.propertiesByStatus.available}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Pending</span>
                  </div>
                  <span className="text-sm font-medium">{analytics.propertiesByStatus.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Sold</span>
                  </div>
                  <span className="text-sm font-medium">{analytics.propertiesByStatus.sold}</span>
                </div>
              </div>
            </div>

            {/* Average Price */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 flex-1">
              <h4 className="font-bold text-gray-900 mb-2">Average Price</h4>
              <p className="text-2xl font-bold text-primary-600">
                ${analytics.averagePrice.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Across all properties</p>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 flex-1">
              <h4 className="font-bold text-gray-900 mb-2">Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Views</span>
                  <span className="text-sm font-medium">{analytics.totalViews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Conversion</span>
                  <span className="text-sm font-medium">{analytics.conversionRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
