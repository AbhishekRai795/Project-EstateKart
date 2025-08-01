import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, Grid, List, Trash2, Heart, X, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PropertyCard } from '../../components/common/PropertyCard';
import { SearchBar } from '../../components/common/SearchBar';
import {
  useProperties,
  useUserPreferences,
  useToggleCatalogue,
  useToggleFavorite,
} from '../../hooks/useProperties';
import { Property } from '../../contexts/PropertyContext';

// --- Kept from functional Catalogue.tsx ---
// This transformation function is critical for data stability. It ensures that
// even if the backend API returns an incomplete object, our frontend component
// will have default values and won't crash.
const transformProperty = (property: any): Property => ({
  ...property,
  id: property.id || '',
  title: property.title || 'Untitled',
  description: property.description || '',
  price: property.price || 0,
  location: property.location || 'N/A',
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

export const UserCatalogue: React.FC = () => {
  const navigate = useNavigate();

  // --- Kept from functional Catalogue.tsx ---
  // Robust hooks that handle the entire data lifecycle (loading, error, success).
  const {
    data: allProperties = [],
    isLoading: isLoadingProperties,
    error: propertiesError
  } = useProperties();

  const {
    data: preferences,
    isLoading: isLoadingPreferences,
    error: preferencesError
  } = useUserPreferences();

  const toggleCatalogue = useToggleCatalogue();
  const toggleFavorite = useToggleFavorite();

  // UI State
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [isSearching, setIsSearching] = useState(false);

  const catalogueIds = useMemo(() =>
    new Set(preferences?.catalogueProperties || []),
    [preferences]
  );

  // --- Kept from functional Catalogue.tsx ---
  // This useEffect correctly filters AND transforms the property data.
  useEffect(() => {
    if (propertiesError || preferencesError) {
      console.error('Catalogue: Error loading data:', { propertiesError, preferencesError });
      setFilteredProperties([]);
      return;
    }

    if (catalogueIds.size === 0 || !allProperties.length) {
      setFilteredProperties([]);
      return;
    }

    try {
      const list = allProperties
        .filter(p => p?.id && catalogueIds.has(p.id))
        .map(transformProperty);

      setFilteredProperties(list);
    } catch (error) {
      console.error('Catalogue: Error transforming properties:', error);
      setFilteredProperties([]);
    }
  }, [catalogueIds, allProperties, propertiesError, preferencesError]);

  const handleSearch = (query: string) => {
    setIsSearching(true);
    try {
      const masterList = allProperties
        .filter(p => p?.id && catalogueIds.has(p.id))
        .map(transformProperty);

      let localFiltered = masterList;
      if (query) {
        localFiltered = localFiltered.filter(property =>
          property.title.toLowerCase().includes(query.toLowerCase()) ||
          property.description.toLowerCase().includes(query.toLowerCase()) ||
          property.location.toLowerCase().includes(query.toLowerCase())
        );
      }
      setFilteredProperties(localFiltered);
    } catch (error) {
      console.error('Catalogue: Error during search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSort = (sortType: string) => {
    setSortBy(sortType);
    let sorted = [...filteredProperties];

    switch (sortType) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'recent':
        sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'alphabetical':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    setFilteredProperties(sorted);
  };

  const handleRemoveFromCatalogue = async (propertyId: string) => {
    try {
      await toggleCatalogue.mutateAsync(propertyId);
    } catch (error) {
      console.error('Catalogue: Error removing from catalogue:', error);
    }
  };
  
  // REMOVED: `window.confirm` to prevent app from freezing in certain environments.
  // A custom modal would be a good future addition here.
  const clearCatalogue = async () => {
    try {
      const removalPromises = filteredProperties.map(p => toggleCatalogue.mutateAsync(p.id));
      await Promise.all(removalPromises);
    } catch (error) {
      console.error('Catalogue: Error clearing catalogue:', error);
    }
  };

  const handleFavoriteToggle = async (propertyId: string) => {
    try {
      await toggleFavorite.mutateAsync(propertyId);
    } catch (error) {
      console.error('Catalogue: Error toggling favorite:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  
  // --- Adopted from Catalogue.tsx ---
  // Superior loading and error states for a better user experience.
  if (isLoadingProperties || isLoadingPreferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-primary-600 mx-auto animate-spin mb-4" />
          <h2 className="text-lg font-semibold text-gray-900">Loading Your Catalogue...</h2>
        </div>
      </div>
    );
  }
  
  if (propertiesError || preferencesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Catalogue</h2>
            <p className="text-gray-600 mb-4">There was an error loading your saved properties.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
      </div>
    );
  }

  const isCatalogueEmpty = catalogueIds.size === 0;

  return (
    // --- Adopted from Catalogue (1).tsx ---
    // The overall layout, header, and control panel design.
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/user/dashboard')}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                <ShoppingCart className="h-10 w-10 text-primary-600 mr-4" />
                My Catalogue
              </h1>
              <p className="text-lg text-gray-600 mt-2">Your saved properties collection</p>
            </div>
          </div>
          {!isCatalogueEmpty && (
            <div className="flex items-center space-x-4">
              <span className="bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium">
                {catalogueIds.size} {catalogueIds.size === 1 ? 'Property' : 'Properties'}
              </span>
              <button onClick={clearCatalogue} className="text-red-600 hover:text-red-700 font-medium transition-colors flex items-center">
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </button>
            </div>
          )}
        </motion.div>

        {!isCatalogueEmpty && (
          <>
            <motion.div variants={itemVariants} className="mb-8">
              <SearchBar onSearch={handleSearch} loading={isSearching} />
            </motion.div>
            <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="mb-4 lg:mb-0">
                <span className="text-lg font-semibold text-gray-900">
                  {`${filteredProperties.length} properties found`}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                >
                  <option value="recent">Recently Added</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  ><Grid className="h-5 w-5" /></button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  ><List className="h-5 w-5" /></button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        <motion.div variants={itemVariants}>
          {!isCatalogueEmpty ? (
            filteredProperties.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {filteredProperties.map((property) => (
                  <div key={property.id} className="relative group">
                    <PropertyCard
                      property={property}
                      onCatalogueToggle={() => handleRemoveFromCatalogue(property.id)}
                      isInCatalogue={true}
                      onFavoriteToggle={() => handleFavoriteToggle(property.id)}
                      isFavorite={preferences?.favoriteProperties?.includes(property.id)}
                    />
                    <button
                      onClick={() => handleRemoveFromCatalogue(property.id)}
                      className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 z-10"
                      title="Remove from catalogue"
                    ><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            ) : (
              // Adopted from Catalogue (1).tsx - "No Results" state
              <div className="text-center py-20">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Matching Properties Found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters.</p>
                <button
                  onClick={() => handleSearch('')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear Search
                </button>
              </div>
            )
          ) : (
            // Adopted from Catalogue (1).tsx - "Empty" state
            <div className="text-center py-20">
              <div className="text-gray-400 text-6xl mb-6">🛒</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Your catalogue is empty</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">Browse properties and save them to your catalogue to see them here.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/user/properties')}
                  className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center"
                ><Search className="h-5 w-5 mr-2" />Browse Properties</button>
                <button
                  onClick={() => navigate('/user/recommendations')}
                  className="border border-primary-600 text-primary-600 px-8 py-3 rounded-lg hover:bg-primary-50 transition-colors font-medium flex items-center justify-center"
                ><Heart className="h-5 w-5 mr-2" />View Recommendations</button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
