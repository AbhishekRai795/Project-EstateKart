import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Search } from 'lucide-react';
import { useProperty } from '../../contexts/PropertyContext';
import { PropertyCard } from '../../components/common/PropertyCard';

export const UserFavorites: React.FC = () => {
  const { properties, favoriteProperties, toggleFavorite } = useProperty();
  
  const favoritesList = properties.filter(property => 
    favoriteProperties.includes(property.id)
  );

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
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-red-100 p-3 rounded-lg">
            <Heart className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
            <p className="text-gray-600">Properties you've saved for later</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                {favoritesList.length} Saved Properties
              </h2>
              <p className="text-red-100">
                Keep track of properties that caught your attention
              </p>
            </div>
            <Heart className="h-12 w-12 text-red-200" />
          </div>
        </div>
      </motion.div>

      {/* Favorites List */}
      <motion.div variants={itemVariants}>
        {favoritesList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoritesList.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onFavoriteToggle={toggleFavorite}
                isFavorite={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full p-8 w-fit mx-auto mb-6">
              <Heart className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No favorites yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start browsing properties and save the ones you like by clicking the heart icon
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium inline-flex items-center space-x-2"
            >
              <Search className="h-5 w-5" />
              <span>Browse Properties</span>
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Tips */}
      {favoritesList.length > 0 && (
        <motion.div variants={itemVariants} className="mt-12">
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary-900 mb-3">
              💡 Pro Tips
            </h3>
            <ul className="space-y-2 text-primary-800">
              <li>• Set up alerts to get notified when similar properties are listed</li>
              <li>• Compare your favorites side by side to make better decisions</li>
              <li>• Contact agents directly from your favorites list</li>
              <li>• Share your favorites with family or friends for feedback</li>
            </ul>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};