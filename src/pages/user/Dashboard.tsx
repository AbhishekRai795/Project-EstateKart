import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, TrendingUp, Home as HomeIcon, Star, Sparkles, Plus, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { Property } from '../../contexts/PropertyContext';
import {
  useProperties,
  useUserPreferences,
  useToggleCatalogue,
  useToggleFavorite,
} from '../../hooks/useProperties';

import { PropertyCard } from '../../components/common/PropertyCard';
import { SearchBar } from '../../components/common/SearchBar';
import { StatsCard } from '../../components/analytics/StatsCard';


// --- Functionality from the newer Dashboard ---
// This function is crucial for ensuring data from the backend is consistent
// and doesn't cause runtime errors if fields are missing.
const transformProperty = (property: any): Property => ({
  ...property,
  id: property.id || '',
  title: property.title || 'Untitled Property',
  description: property.description || '',
  price: property.price || 0,
  location: property.location || 'Not specified',
  bedrooms: property.bedrooms || 0,
  bathrooms: property.bathrooms || 0,
  area: property.area || 0,
  type: property.type || 'house',
  status: property.status || 'available',
  ownerId: property.ownerId || '',
  listerName: property.listerName || 'N/A',
  images: property.imageUrls?.filter(Boolean) as string[] || [],
  createdAt: property.createdAt || new Date().toISOString(),
  views: property.views || 0,
  features: property.features || [],
});

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- Robust data fetching hooks connected to your backend services ---
  const {
    data: properties = [],
    isLoading: isLoadingProperties,
    error: propertiesError,
    refetch: refetchProperties
  } = useProperties();

  const {
    data: preferences,
    refetch: refetchPreferences,
    isLoading: isLoadingPreferences
  } = useUserPreferences();

  const toggleCatalogue = useToggleCatalogue();
  const toggleFavorite = useToggleFavorite();

  // UI State
  const [, setSelectedPropertyId] = useState<string>('');

  // --- useEffects for robust data handling and component lifecycle ---
  useEffect(() => {
    if (user) {
      refetchPreferences();
    }
  }, [user, refetchPreferences]);

  useEffect(() => {
    if (propertiesError) {
      console.error('Dashboard: Properties loading error:', propertiesError);
      // Retry fetching after 5 seconds if an error occurs
      const retryTimer = setTimeout(() => {
        refetchProperties();
      }, 5000);

      return () => clearTimeout(retryTimer);
    }
  }, [propertiesError, refetchProperties]);

  // --- Memoized property lists for performance, using the safe transform function ---
  const transformedProperties = React.useMemo(() => {
    if (!properties || properties.length === 0) return [];
    return properties
      .filter(property => property?.id && property?.title)
      .map(transformProperty);
  }, [properties]);

  const recentProperties = React.useMemo(() =>
    [...transformedProperties]
      .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
      })
      .slice(0, 6),
    [transformedProperties]
  );

  const recommendedProperties = React.useMemo(() =>
    [...transformedProperties]
      .filter(p => (p.views || 0) > 10)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 3),
    [transformedProperties]
  );

  const featuredProperties = React.useMemo(() =>
    [...transformedProperties]
      .filter(p => (p.price || 0) > 500000)
      .sort((a, b) => (b.price || 0) - (a.price || 0))
      .slice(0, 3),
    [transformedProperties]
  );

  // --- Calculate stats from the processed data ---
  const totalProperties = transformedProperties.length;
  const catalogueCount = preferences?.catalogueProperties?.length || 0;
  const favoriteCount = preferences?.favoriteProperties?.length || 0;

  // --- Event Handlers with error handling ---
  const handleSearch = (query: string, filters: any) => {
    const searchParams = new URLSearchParams({ q: query, ...filters });
    navigate(`/user/properties?${searchParams.toString()}`);
  };

  const handleCatalogueToggle = async (propertyId: string) => {
    try {
      await toggleCatalogue.mutateAsync(propertyId);
    } catch (error) {
      console.error('Dashboard: Error toggling catalogue:', error);
    }
  };

  const handleFavoriteToggle = async (propertyId: string) => {
    try {
      await toggleFavorite.mutateAsync(propertyId);
    } catch (error) {
      console.error('Dashboard: Error toggling favorite:', error);
    }
  };

  const handleScheduleViewing = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    // Navigate to a detailed view or open a modal
    navigate(`/property/${propertyId}`);
  };

  // --- UI Design from Dashboard (1).tsx ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const PropertySkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      <div className="h-64 bg-gray-200"></div>
      <div className="p-5">
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );

  const isLoading = isLoadingProperties || isLoadingPreferences;
  const displayName = user?.name?.split(' ')[0] || 'User';

  if (propertiesError && !isLoading) {
      return <div className="flex items-center justify-center h-screen text-red-500">Error loading dashboard data. We are trying to reconnect...</div>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header section from Dashboard (1).tsx */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-40 translate-x-40 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-30 -translate-x-30 animate-blob animation-delay-2000"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-black mb-4">
                Welcome back, {displayName}! 👋
              </h1>
              <p className="text-primary-100 text-xl font-light max-w-2xl mb-6">
                Discover your perfect property from {totalProperties} amazing listings
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8">
                <div className="flex items-center space-x-2"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><HomeIcon className="h-4 w-4" /></div><span>{totalProperties} Properties</span></div>
                <div className="flex items-center space-x-2"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><ShoppingCart className="h-4 w-4" /></div><span>{catalogueCount} In Catalogue</span></div>
                <div className="flex items-center space-x-2"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><Heart className="h-4 w-4" /></div><span>{favoriteCount} Favorites</span></div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-12">
          <SearchBar onSearch={handleSearch} loading={isLoading} />
        </motion.div>
        
        {/* FIX: Reverted to 3-column grid and restored original card colors */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatsCard title="Available Properties" value={totalProperties.toString()} icon={<TrendingUp />} color="primary" />
          <StatsCard title="Your Catalogue" value={catalogueCount.toString()} icon={<ShoppingCart />} color="success" />
          <StatsCard title="Your Favorites" value={favoriteCount.toString()} icon={<Star />} color="warning" />
        </motion.div>

        {/* Featured Properties Section */}
        {featuredProperties.length > 0 && (
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center"><Star className="h-8 w-8 text-yellow-500 mr-3" />Featured Properties</h2>
                <p className="text-gray-600 mt-2">Premium properties with exceptional value</p>
              </div>
              <button onClick={() => navigate('/user/properties?featured=true')} className="text-primary-600 hover:text-primary-700 font-medium transition-colors">View all featured →</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                [...Array(3)].map((_, i) => <PropertySkeleton key={i} />)
              ) : (
                featuredProperties.map(p => (
                  <PropertyCard key={p.id} property={p} onCatalogueToggle={() => handleCatalogueToggle(p.id)} isInCatalogue={preferences?.catalogueProperties?.includes(p.id)} onFavoriteToggle={() => handleFavoriteToggle(p.id)} isFavorite={preferences?.favoriteProperties?.includes(p.id)} onScheduleViewing={() => handleScheduleViewing(p.id)} />
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Recommended Properties Section */}
        {recommendedProperties.length > 0 && (
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center"><Sparkles className="h-8 w-8 text-primary-600 mr-3" />Recommended for You</h2>
                <p className="text-gray-600 mt-2">Popular properties based on user views</p>
              </div>
              <button onClick={() => navigate('/user/recommendations')} className="text-primary-600 hover:text-primary-700 font-medium transition-colors">View all recommendations →</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                [...Array(3)].map((_, i) => <PropertySkeleton key={i} />)
              ) : (
                recommendedProperties.map(p => (
                  <PropertyCard key={p.id} property={p} onCatalogueToggle={() => handleCatalogueToggle(p.id)} isInCatalogue={preferences?.catalogueProperties?.includes(p.id)} onFavoriteToggle={() => handleFavoriteToggle(p.id)} isFavorite={preferences?.favoriteProperties?.includes(p.id)} onScheduleViewing={() => handleScheduleViewing(p.id)} />
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Recently Added Section */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center"><HomeIcon className="h-8 w-8 text-primary-600 mr-3" />Recently Added</h2>
              <p className="text-gray-600 mt-2">Latest properties on the market</p>
            </div>
            <button onClick={() => navigate('/user/properties')} className="text-primary-600 hover:text-primary-700 font-medium transition-colors">View all properties →</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading && recentProperties.length === 0 ? (
              [...Array(6)].map((_, i) => <PropertySkeleton key={i} />)
            ) : (
              recentProperties.map(p => (
                <PropertyCard key={p.id} property={p} onCatalogueToggle={() => handleCatalogueToggle(p.id)} isInCatalogue={preferences?.catalogueProperties?.includes(p.id)} onFavoriteToggle={() => handleFavoriteToggle(p.id)} isFavorite={preferences?.favoriteProperties?.includes(p.id)} onScheduleViewing={() => handleScheduleViewing(p.id)} />
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.button whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/user/properties')} className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl text-center hover:shadow-primary-500/20 transition-all duration-500 transform border border-gray-100/50 relative overflow-hidden cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Search className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Browse Properties</h3>
              <p className="text-gray-600 text-sm">Search and filter properties</p>
            </motion.button>
            <motion.button whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/user/catalogue')} className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl text-center hover:shadow-green-500/20 transition-all duration-500 transform border border-gray-100/50 relative overflow-hidden cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <ShoppingCart className="h-12 w-12 text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">My Catalogue</h3>
              <p className="text-gray-600 text-sm">View saved properties</p>
            </motion.button>
            <motion.button whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/user/recommendations')} className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl text-center hover:shadow-yellow-500/20 transition-all duration-500 transform border border-gray-100/50 relative overflow-hidden cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Sparkles className="h-12 w-12 text-yellow-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Recommendations</h3>
              <p className="text-gray-600 text-sm">AI-powered suggestions</p>
            </motion.button>
            <motion.button whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/lister/add-property')} className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl text-center hover:shadow-purple-500/20 transition-all duration-500 transform border border-gray-100/50 relative overflow-hidden cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Plus className="h-12 w-12 text-purple-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">List Property</h3>
              <p className="text-gray-600 text-sm">Add your property</p>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
