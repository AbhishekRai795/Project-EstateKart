import React from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, TrendingUp, MapPin, Home as HomeIcon, Star, Sparkles, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProperty } from '../../contexts/PropertyContext';
import { PropertyCard } from '../../components/common/PropertyCard';
import { SearchBar } from '../../components/common/SearchBar';
import { StatsCard } from '../../components/analytics/StatsCard';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { properties, catalogueProperties, toggleCatalogue } = useProperty();

  // Get recent and featured properties
  const recentProperties = properties.slice(0, 6);
  const recommendedProperties = properties.filter(p => p.views > 200).slice(0, 3);
  const catalogueCount = catalogueProperties.length;
  const viewedCount = 12; // Mock data

  const handleSearch = (query: string, filters: any) => {
    console.log('Search:', query, filters);
    // Implement search logic here
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
        <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-3xl p-10 text-white shadow-2xl">
          <h1 className="text-4xl font-black mb-4">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-primary-100 text-xl font-light">
            Discover your perfect property from thousands of listings
          </p>
        </div>
      </motion.div>

      {/* Search Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <SearchBar onSearch={handleSearch} />
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Properties Viewed"
          value={viewedCount}
          icon={Search}
          color="primary"
        />
        <StatsCard
          title="Catalogue Items"
          value={catalogueCount}
          icon={ShoppingCart}
          color="success"
        />
        <StatsCard
          title="Market Trend"
          value="+12%"
          change={{ value: 12, type: 'increase' }}
          icon={TrendingUp}
          color="success"
        />
      </motion.div>

      {/* Recommended Properties */}
      <motion.section variants={itemVariants} className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary-600" />
            Recommended Properties
          </h2>
          <button 
            onClick={() => navigate('/recommendations')}
            className="text-primary-600 hover:text-primary-700 font-bold transition-colors text-lg"
          >
            View all →
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onCatalogueToggle={toggleCatalogue}
              isInCatalogue={catalogueProperties.includes(property.id)}
            />
          ))}
        </div>
      </motion.section>

      {/* Recent Properties */}
      <motion.section variants={itemVariants} className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recently Added</h2>
          <button className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
            View all →
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentProperties.map((property) => (
            <PropertyCard
        <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
              property={property}
              onCatalogueToggle={toggleCatalogue}
              isInCatalogue={catalogueProperties.includes(property.id)}
            />
            className="group bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-2xl text-center hover:shadow-primary-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform border border-gray-100/50 relative overflow-hidden"
        </div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-5 rounded-2xl w-fit mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10">

      {/* Quick Actions */}
            <h3 className="text-2xl font-bold mb-6 text-gray-900 relative z-10">Browse Properties</h3>
            <p className="text-gray-600 leading-relaxed relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="bg-primary-100 p-3 rounded-lg w-fit mb-4 group-hover:bg-primary-200 transition-colors">
              <Search className="h-6 w-6 text-primary-600" />
            </div>
            className="group bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-2xl text-center hover:shadow-primary-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform border border-gray-100/50 relative overflow-hidden"
            <p className="text-sm text-gray-600">Use filters to find exactly what you're looking for</p>
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-5 rounded-2xl w-fit mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10">

          <motion.div
            <h3 className="text-2xl font-bold mb-6 text-gray-900 relative z-10">Build Your Catalogue</h3>
            <p className="text-gray-600 leading-relaxed relative z-10">
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="bg-red-100 p-3 rounded-lg w-fit mb-4 group-hover:bg-red-200 transition-colors">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">My Favorites</h3>
            <p className="text-sm text-gray-600">View all your saved properties in one place</p>
          </motion.div>

            className="group bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-2xl text-center hover:shadow-primary-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform border border-gray-100/50 relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-5 rounded-2xl w-fit mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10">
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <h3 className="text-2xl font-bold mb-6 text-gray-900 relative z-10">List Your Property</h3>
            <p className="text-gray-600 leading-relaxed relative z-10">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
          </motion.div>
              <Link
                to="/user-dashboard"
                className="group bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-500 flex items-center gap-4 shadow-2xl hover:shadow-gray-500/30 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <BarChart3 className="w-6 h-6 group-hover:scale-110 transition-transform duration-300 relative z-10" />
                <span className="relative z-10">My Dashboard</span>
            className="text-center mt-24"
              </Link>
            <p className="text-2xl text-gray-700 mb-12 font-light">
            whileTap={{ scale: 0.95 }}
            <motion.div
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              <Link
                <Link
                  to="/auth/register"
                  className="group bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-500 shadow-2xl hover:shadow-primary-500/30 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative z-10">Create Account</span>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                <span className="relative z-10">Join EstateKart</span>
                <Link
                  to="/auth/login"
                  className="group border-2 border-primary-500 text-primary-600 hover:bg-primary-50 hover:border-primary-600 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-500 hover:shadow-lg relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-primary-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative z-10">Sign In</span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
};