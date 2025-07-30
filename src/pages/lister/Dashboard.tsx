import React, { useMemo } from 'react';
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
  Building,
  MapPin,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useListerProperties } from '../../hooks/useProperties';

export const ListerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: listerProperties = [], isLoading, error } = useListerProperties();
  
  const analytics = useMemo(() => {
    if (!listerProperties || listerProperties.length === 0) {
      return {
        totalProperties: 0,
        totalViews: 0,
        totalOffers: 0,
        conversionRate: '0.00',
        averagePrice: 0,
        propertiesByStatus: {
          available: 0,
          pending: 0,
          sold: 0
        }
      };
    }

    const totalViews = listerProperties.reduce((sum, prop) => sum + (prop.views || 0), 0);
    const totalOffers = 0;
    const conversionRate = totalViews > 0 ? (totalOffers / totalViews * 100).toFixed(2) : '0.00';
    const totalValue = listerProperties.reduce((sum, prop) => sum + (prop.price || 0), 0);
    const averagePrice = listerProperties.length > 0 ? Math.round(totalValue / listerProperties.length) : 0;

    return {
      totalProperties: listerProperties.length,
      totalViews,
      totalOffers,
      conversionRate,
      averagePrice,
      propertiesByStatus: {
        available: listerProperties.filter(p => p.status === 'available').length,
        pending: listerProperties.filter(p => p.status === 'pending').length,
        sold: listerProperties.filter(p => p.status === 'sold').length
      }
    };
  }, [listerProperties]);

  const recentProperties = useMemo(() => {
    return [...listerProperties]
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 3);
  }, [listerProperties]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">Error loading your dashboard. Please try again.</div>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-40 translate-x-40 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-30 -translate-x-30 animate-blob animation-delay-2000"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-black mb-4">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-primary-100 text-xl font-light">
              Here's what's happening with your properties today
            </p>
            
            <div className="mt-8">
              <Link
                to="/lister/add-property"
                className="group bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 shadow-2xl hover:shadow-white/20 relative overflow-hidden transform hover:scale-105 inline-flex items-center space-x-3"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Plus className="w-6 h-6 relative z-10" />
                <span className="relative z-10">Add New Property</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid - DESIGN REFINED */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-500">Total Properties</p>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-gray-800">{analytics.totalProperties}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-500">Total Views</p>
            <div className="p-3 bg-green-50 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-gray-800">{analytics.totalViews.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-500">Total Offers</p>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-gray-800">{analytics.totalOffers}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-gray-800">{analytics.conversionRate}%</p>
        </div>
      </motion.div>
      
      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/lister/add-property" className="group bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-xl text-center hover:shadow-primary-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform border border-gray-100/50 relative overflow-hidden cursor-pointer">
            <div className="relative z-10"><div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg"><Plus className="w-8 h-8" /></div><h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">Add Property</h3><p className="text-gray-600 leading-relaxed">List a new property for sale or rent</p></div>
          </Link>
          <Link to="/lister/properties" className="group bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-xl text-center hover:shadow-primary-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform border border-gray-100/50 relative overflow-hidden cursor-pointer">
            <div className="relative z-10"><div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg"><Building className="w-8 h-8" /></div><h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">My Properties</h3><p className="text-gray-600 leading-relaxed">View and manage all your listings</p></div>
          </Link>
          <Link to="/lister/clients" className="group bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-xl text-center hover:shadow-primary-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform border border-gray-100/50 relative overflow-hidden cursor-pointer">
            <div className="relative z-10"><div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg"><Users className="w-8 h-8" /></div><h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">Client Management</h3><p className="text-gray-600 leading-relaxed">Manage queries and scheduled viewings</p></div>
          </Link>
          <Link to="/lister/analytics" className="group bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-xl text-center hover:shadow-primary-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform border border-gray-100/50 relative overflow-hidden cursor-pointer">
            <div className="relative z-10"><div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg"><BarChart3 className="w-8 h-8" /></div><h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">Analytics</h3><p className="text-gray-600 leading-relaxed">Detailed insights and performance metrics</p></div>
          </Link>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

          <div className="h-[500px]">
            {recentProperties.length > 0 ? (
              <div className="space-y-4 h-full overflow-y-auto pr-4">
                {recentProperties.map((property) => (
                  <div key={property.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center">
                      <img
                        src={property.imageUrls?.[0] || 'https://placehold.co/100x100/EFEFEF/333333?text=No+Image'}
                        alt={property.title!}
                        className="w-28 h-28 object-cover"
                      />
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-800 mb-1">{property.title}</h3>
                            <div className="flex items-center text-gray-500 mb-2">
                              <MapPin className="w-4 h-4 mr-1.5" />
                              <span className="text-sm">{property.location}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Eye className="w-4 h-4 mr-1.5" />
                                <span>{property.views || 0}</span>
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-1.5" />
                                <span>0 offers</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-xl font-bold text-primary-600">
                              ${property.price?.toLocaleString()}
                            </span>
                            <div className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold mt-1 ${
                              property.status === 'available' ? 'bg-green-100 text-green-800' :
                              property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {property.status?.charAt(0).toUpperCase() + property.status!.slice(1)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-gray-100 h-full flex flex-col justify-center">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No properties yet</h3>
                <p className="text-gray-600 mb-6">Start by adding your first property listing</p>
                <Link
                  to="/lister/add-property"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-medium mx-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Overview</h3>
          <div className="h-[500px] space-y-4 flex flex-col">
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 flex-1">
              <h4 className="font-semibold text-gray-700 mb-4">Property Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Available</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{analytics.propertiesByStatus.available}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Pending</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{analytics.propertiesByStatus.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Sold</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{analytics.propertiesByStatus.sold}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 flex-1">
              <h4 className="font-semibold text-gray-700 mb-2">Average Price</h4>
              <p className="text-3xl font-extrabold text-primary-600">
                ${analytics.averagePrice.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Across all listed properties</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 flex-1">
              <h4 className="font-semibold text-gray-700 mb-2">Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Views</span>
                  <span className="font-semibold text-gray-800">{analytics.totalViews}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Conversion</span>
                  <span className="font-semibold text-gray-800">{analytics.conversionRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
