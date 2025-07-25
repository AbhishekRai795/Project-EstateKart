import React from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, TrendingUp, MapPin, Home as HomeIcon, Star, Sparkles, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProperty } from '../../contexts/PropertyContext';
import { PropertyCard } from '../../components/common/PropertyCard';
import { SearchBar } from '../../components/common/SearchBar';
import { StatsCard } from '../../components/analytics/StatsCard';
import { useNavigate } from 'react-router-dom';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { properties, catalogueProperties, toggleCatalogue } = useProperty();
  const navigate = useNavigate();

  // Get recent and recommended properties
  const recentProperties = properties.slice(0, 6);
  const recommendedProperties = properties.filter(p => p.views > 200).slice(0, 3);
  const catalogueCount = catalogueProperties.length;
  const viewedCount = 12; // Mock data

  const handleSearch = (query: string, filters: any) => {
    console.log('Search:', query, filters);
    navigate('/properties');
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
        <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
          {/* Animated background blobs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-40 translate-x-40 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-30 -translate-x-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-black mb-4">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-primary-100 text-xl font-light">
              Discover your perfect property from thousands of listings
            </p>
          </div>
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
          <button 
            onClick={() => navigate('/properties')}
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            View all →
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onCatalogueToggle={toggleCatalogue}
              isInCatalogue={catalogueProperties.includes(property.id)}
            />
          ))}
        </div>
      </motion.section>

      {/* Quick Actions */}
      <motion.section variants={itemVariants}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/properties')}
            className="group bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-2xl text-center hover:shadow-primary-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform border border-gray-100/50 relative overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-5 rounded-2xl w-fit mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10">
              <Search className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold mb-6 text-gray-900 relative z-10">Browse Properties</h3>
            <p className="text-gray-600 leading-relaxed relative z-10">
              Use filters to find exactly what you're looking for
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/catalogue')}
            className="group bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-2xl text-center hover:shadow-primary-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform border border-gray-100/50 relative overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-5 rounded-2xl w-fit mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold mb-6 text-gray-900 relative z-10">My Catalogue</h3>
            <p className="text-gray-600 leading-relaxed relative z-10">
              View and manage your saved properties
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/recommendations')}
            className="group bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-2xl text-center hover:shadow-primary-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform border border-gray-100/50 relative overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-5 rounded-2xl w-fit mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold mb-6 text-gray-900 relative z-10">Recommendations</h3>
            <p className="text-gray-600 leading-relaxed relative z-10">
              AI-powered property suggestions just for you
            </p>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
};