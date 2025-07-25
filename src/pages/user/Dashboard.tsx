import React from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, TrendingUp, MapPin, Home as HomeIcon, Star, Sparkles } from 'lucide-react';
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
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-primary-100 text-lg relative z-10">
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
          title="My Catalogue"
          value={catalogueCount}
          icon={ShoppingCart}
          color="error"
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
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary-500" />
            Recommended Properties
          </h2>
          <button className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/properties')}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer group border border-gray-100 hover:border-primary-200"
          >
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
              <Search className="h-7 w-7 text-primary-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-3 text-lg">Browse Properties</h3>
            <p className="text-gray-600 leading-relaxed">Explore thousands of properties with advanced filters</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/catalogue')}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer group border border-gray-100 hover:border-primary-200"
          >
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
              <ShoppingCart className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-3 text-lg">My Catalogue</h3>
            <p className="text-gray-600 leading-relaxed">View and manage your saved properties</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/recommendations')}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer group border border-gray-100 hover:border-primary-200"
          >
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="h-7 w-7 text-purple-600" />
            <h3 className="font-bold text-gray-900 mb-3 text-lg">Recommendations</h3>
            <p className="text-gray-600 leading-relaxed">Get AI-powered personalized property suggestions</p>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
};