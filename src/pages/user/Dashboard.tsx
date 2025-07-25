import React from 'react';
import { motion } from 'framer-motion';
import { Search, Heart, TrendingUp, MapPin, Home as HomeIcon, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProperty } from '../../contexts/PropertyContext';
import { PropertyCard } from '../../components/common/PropertyCard';
import { SearchBar } from '../../components/common/SearchBar';
import { StatsCard } from '../../components/analytics/StatsCard';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { properties, favoriteProperties, toggleFavorite } = useProperty();

  // Get recent and featured properties
  const recentProperties = properties.slice(0, 6);
  const featuredProperties = properties.filter(p => p.views > 200).slice(0, 3);
  const favoriteCount = favoriteProperties.length;
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
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-primary-100 text-lg">
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
          title="Saved Favorites"
          value={favoriteCount}
          icon={Heart}
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

      {/* Featured Properties */}
      <motion.section variants={itemVariants} className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Properties</h2>
          <button className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
            View all →
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onFavoriteToggle={toggleFavorite}
              isFavorite={favoriteProperties.includes(property.id)}
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
              onFavoriteToggle={toggleFavorite}
              isFavorite={favoriteProperties.includes(property.id)}
            />
          ))}
        </div>
      </motion.section>

      {/* Quick Actions */}
      <motion.section variants={itemVariants}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="bg-primary-100 p-3 rounded-lg w-fit mb-4 group-hover:bg-primary-200 transition-colors">
              <Search className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Advanced Search</h3>
            <p className="text-sm text-gray-600">Use filters to find exactly what you're looking for</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="bg-red-100 p-3 rounded-lg w-fit mb-4 group-hover:bg-red-200 transition-colors">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">My Favorites</h3>
            <p className="text-sm text-gray-600">View all your saved properties in one place</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="bg-green-100 p-3 rounded-lg w-fit mb-4 group-hover:bg-green-200 transition-colors">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Map View</h3>
            <p className="text-sm text-gray-600">Explore properties on an interactive map</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4 group-hover:bg-blue-200 transition-colors">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Recommendations</h3>
            <p className="text-sm text-gray-600">Get personalized property suggestions</p>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
};