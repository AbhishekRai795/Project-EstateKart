import React from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, TrendingUp, Sparkles, Plus, Heart, BarChart3 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProperty, Property } from '../contexts/PropertyContext'; // Import Property type from context
import { PropertyCard } from '../components/common/PropertyCard';
import { SearchBar } from '../components/common/SearchBar';
import { StatsCard } from '../components/analytics/StatsCard';

interface SearchFilters {
  location?: string;
  priceRange?: [number, number];
  propertyType?: string;
}

export const Landing: React.FC = () => {
  const { user } = useAuth();
  const { properties, catalogueProperties, toggleCatalogue } = useProperty();
  const navigate = useNavigate();

  // Get recent and featured properties
  const recentProperties: Property[] = properties.slice(0, 6);
  const recommendedProperties: Property[] = properties.filter((p: Property) => p.views > 200).slice(0, 3);
  const catalogueCount = catalogueProperties.length;
  const viewedCount = 12; // Mock data

  const handleSearch = (query: string, filters: SearchFilters) => {
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
          {recommendedProperties.map((property: Property) => (
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
          {recentProperties.map((property: Property) => (
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
      <motion.section variants={itemVariants} className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="bg-primary-100 p-3 rounded-lg w-fit mb-4 group-hover:bg-primary-200 transition-colors">
              <Search className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Advanced Search</h3>
            <p className="text-sm text-gray-600">Use filters to find exactly what you're looking for</p>
          </motion.button>

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
              <Plus className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">List Property</h3>
            <p className="text-sm text-gray-600">Add your property to our marketplace</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4 group-hover:bg-blue-200 transition-colors">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-sm text-gray-600">View market trends and insights</p>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section for Non-authenticated Users */}
      {!user && (
        <motion.section variants={itemVariants} className="text-center mt-24">
          <h2 className="text-4xl font-bold mb-8 text-gray-900">Ready to Get Started?</h2>
          <p className="text-2xl text-gray-700 mb-12 font-light">
            Join thousands of users finding their perfect property
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
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
            >
              <Link
                to="/auth/login"
                className="group border-2 border-primary-500 text-primary-600 hover:bg-primary-50 hover:border-primary-600 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-500 hover:shadow-lg relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10">Sign In</span>
              </Link>
            </motion.div>
          </div>
        </motion.section>
      )}
    </motion.div>
  );
};
