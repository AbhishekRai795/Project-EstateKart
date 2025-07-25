import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Filter, TrendingUp, MapPin, DollarSign } from 'lucide-react';
import { useProperty } from '../../contexts/PropertyContext';
import { useAuth } from '../../contexts/AuthContext';
import { PropertyCard } from '../../components/common/PropertyCard';

export const UserRecommendations: React.FC = () => {
  const { user } = useAuth();
  const { properties, catalogueProperties, toggleCatalogue } = useProperty();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock AI recommendations - in real app, this would come from AWS ML service
  const getRecommendations = () => {
    // Simulate AI-based recommendations
    const userPreferences = {
      priceRange: [200000, 600000],
      preferredLocations: ['Downtown', 'Brooklyn'],
      propertyTypes: ['apartment', 'condo']
    };

    return properties
      .filter(property => {
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'budget') return property.price < 400000;
        if (selectedCategory === 'luxury') return property.price > 600000;
        if (selectedCategory === 'location') return property.location.includes('Downtown');
        return true;
      })
      .sort((a, b) => {
        // Simple scoring based on views and price
        const scoreA = a.views * 0.1 + (1000000 - a.price) * 0.0001;
        const scoreB = b.views * 0.1 + (1000000 - b.price) * 0.0001;
        return scoreB - scoreA;
      });
  };

  const recommendations = getRecommendations();

  const categories = [
    { id: 'all', label: 'All Recommendations', icon: Sparkles },
    { id: 'budget', label: 'Budget Friendly', icon: DollarSign },
    { id: 'luxury', label: 'Luxury Properties', icon: TrendingUp },
    { id: 'location', label: 'Prime Locations', icon: MapPin },
  ];

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
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-xl">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Recommendations</h1>
            <p className="text-gray-600">Personalized property suggestions powered by AWS ML</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {recommendations.length} Properties Recommended for You
              </h2>
              <p className="text-purple-100">
                Based on your preferences and browsing history
              </p>
            </div>
            <Sparkles className="h-16 w-16 text-purple-200" />
          </div>
        </div>
      </motion.div>

      {/* Category Filters */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary-500" />
            Recommendation Categories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <Icon className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">{category.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* AI Insights */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            🤖 AI Insights About Your Preferences
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-fit mx-auto mb-2">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <p className="font-medium text-blue-900">Preferred Budget</p>
              <p className="text-sm text-blue-700">$300K - $500K</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-fit mx-auto mb-2">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-medium text-blue-900">Favorite Areas</p>
              <p className="text-sm text-blue-700">Downtown, Brooklyn</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-fit mx-auto mb-2">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <p className="font-medium text-blue-900">Match Score</p>
              <p className="text-sm text-blue-700">92% Accuracy</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recommendations List */}
      <motion.div variants={itemVariants}>
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((property, index) => (
              <div key={property.id} className="relative">
                {index < 3 && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold z-10 shadow-lg">
                    Top Pick
                  </div>
                )}
                <PropertyCard
                  property={property}
                  onCatalogueToggle={toggleCatalogue}
                  isInCatalogue={catalogueProperties.includes(property.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-gray-100 rounded-full p-12 w-fit mx-auto mb-8">
              <Sparkles className="h-20 w-20 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No recommendations yet</h3>
            <p className="text-gray-600 mb-10 max-w-md mx-auto text-lg">
              Browse some properties first to help our AI understand your preferences
            </p>
          </div>
        )}
      </motion.div>

      {/* How It Works */}
      <motion.div variants={itemVariants} className="mt-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            How Our AI Recommendations Work
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-full p-4 w-fit mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Analyze Behavior</h4>
              <p className="text-gray-600 text-sm">We track your browsing patterns, saved properties, and search preferences</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-full p-4 w-fit mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AWS ML Processing</h4>
              <p className="text-gray-600 text-sm">Our machine learning models process your data using AWS SageMaker</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full p-4 w-fit mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Personalized Results</h4>
              <p className="text-gray-600 text-sm">Get tailored property suggestions that match your unique preferences</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};