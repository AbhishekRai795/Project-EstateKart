import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Grid, List, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PropertyCard } from '../../components/common/PropertyCard';
import { SearchBar } from '../../components/common/SearchBar';
import { useProperties, useScheduleViewing } from '../../hooks/useProperties';

export const UserProperties: React.FC = () => {
  const { user } = useAuth();
  const { data: properties = [], isLoading, error, refetch } = useProperties();
  const scheduleViewing = useScheduleViewing();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('recent');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [catalogueProperties, setCatalogueProperties] = useState<string[]>([]);
  const [favoriteProperties, setFavoriteProperties] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    message: '',
    name: user?.name || '',
    email: user?.email || '',
    phone: ''
  });

  // Transform and filter properties with proper null handling
  useEffect(() => {
    if (properties) {
      const transformedProperties = properties
        .filter(property => property.id && property.title) // Filter out incomplete data
        .map(property => ({
          id: property.id || '',
          title: property.title || '',
          description: property.description || '',
          price: property.price || 0,
          location: property.location || '',
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 0,
          area: property.area || 0,
          type: property.type || 'house' as 'house' | 'apartment' | 'condo' | 'villa',
          status: property.status || 'available' as 'available' | 'pending' | 'sold',
          imageUrls: property.imageUrls?.filter(Boolean) || [], // Remove null/undefined URLs
          listerId: property.listerId || '',
          listerName: property.listerName || 'Anonymous',
          createdAt: property.createdAt || new Date().toISOString(),
          views: property.views || 0,
          features: property.features?.filter(Boolean) || [], // Remove null features
        }));
      
      setFilteredProperties(transformedProperties);
    }
  }, [properties]);

  const handleSearch = async (query: string, filters: any) => {
    setIsSearching(true);
    let filtered = filteredProperties;

    // Filter by query
    if (query) {
      filtered = filtered.filter(property =>
        property.title?.toLowerCase().includes(query.toLowerCase()) ||
        property.description?.toLowerCase().includes(query.toLowerCase()) ||
        property.location?.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply filters
    if (filters.location) {
      filtered = filtered.filter(property =>
        property.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter(property => property.price >= parseInt(filters.minPrice));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(property => property.price <= parseInt(filters.maxPrice));
    }

    if (filters.bedrooms) {
      filtered = filtered.filter(property => property.bedrooms >= parseInt(filters.bedrooms));
    }

    if (filters.bathrooms) {
      filtered = filtered.filter(property => property.bathrooms >= parseInt(filters.bathrooms));
    }

    if (filters.propertyType) {
      filtered = filtered.filter(property => property.type === filters.propertyType);
    }

    if (filters.features && filters.features.length > 0) {
      filtered = filtered.filter(property =>
        filters.features.some((feature: string) =>
          property.features?.includes(feature)
        )
      );
    }

    setFilteredProperties(filtered);
    setIsSearching(false);
  };

  const handleSort = (sortType: string) => {
    setSortBy(sortType);
    let sorted = [...filteredProperties];

    switch (sortType) {
      case 'price-low':
        sorted = sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted = sorted.sort((a, b) => b.price - a.price);
        break;
      case 'recent':
        // Fixed: Proper null handling for date sorting
        sorted = sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'popular':
        sorted = sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      default:
        break;
    }

    setFilteredProperties(sorted);
  };

  const handleCatalogueToggle = (propertyId: string) => {
    setCatalogueProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleFavoriteToggle = (propertyId: string) => {
    setFavoriteProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleScheduleViewing = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const property = filteredProperties.find(p => p.id === selectedPropertyId);
    if (!property) return;

    try {
      await scheduleViewing.mutateAsync({
        propertyId: selectedPropertyId,
        clientName: scheduleForm.name,
        clientEmail: scheduleForm.email,
        clientPhone: scheduleForm.phone,
        date: scheduleForm.date,
        time: scheduleForm.time,
        message: scheduleForm.message,
        listerId: property.listerId,
      });

      alert('Viewing scheduled successfully! The lister will contact you soon.');
      setShowScheduleModal(false);
      setScheduleForm({
        date: '',
        time: '',
        message: '',
        name: user?.name || '',
        email: user?.email || '',
        phone: ''
      });
    } catch (error) {
      console.error('Error scheduling viewing:', error);
      alert('Failed to schedule viewing. Please try again.');
    }
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
    visible: { opacity: 1, y: 0 }
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
          <div className="h-64 bg-gray-200"></div>
          <div className="p-5">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
            <div className="flex space-x-4">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Properties</h2>
            <p className="text-gray-600 mb-6">There was an error loading the properties. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Explore Properties</h1>
          <p className="text-lg text-gray-600">Discover your perfect home from our curated listings</p>
        </motion.div>

        {/* Search */}
        <motion.div variants={itemVariants} className="mb-8">
          <SearchBar onSearch={handleSearch} loading={isSearching} />
        </motion.div>

        {/* Controls */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="mb-4 lg:mb-0">
            <span className="text-lg font-semibold text-gray-900">
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading properties...
                </div>
              ) : (
                `${filteredProperties.length} properties found`
              )}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
            >
              <option value="recent">Most Recent</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Properties Grid/List */}
        <motion.div variants={itemVariants}>
          {isLoading ? (
            <LoadingSkeleton />
          ) : filteredProperties.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}>
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  viewMode={viewMode}
                  onCatalogueToggle={user ? handleCatalogueToggle : undefined}
                  isInCatalogue={catalogueProperties.includes(property.id)}
                  onFavoriteToggle={user ? handleFavoriteToggle : undefined}
                  isFavorite={favoriteProperties.includes(property.id)}
                  onScheduleViewing={user ? handleScheduleViewing : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-gray-400 text-6xl mb-4">🏠</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
            </div>
          )}
        </motion.div>

        {/* Sign in prompt for non-authenticated users */}
        {!user && filteredProperties.length > 0 && (
          <motion.div variants={itemVariants} className="mt-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Want personalized recommendations?</h3>
            <p className="mb-6 opacity-90">Sign in to save properties to your catalogue, get AI-powered recommendations, and list your own properties</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.location.href = '/auth'}
                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => window.location.href = '/auth'}
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </motion.div>
        )}

        {/* Schedule Viewing Modal */}
        {showScheduleModal && (
          <>
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowScheduleModal(false)}
            />

            {/* Modal Container */}
            <div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              onClick={e => e.stopPropagation()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              >
                <form onSubmit={handleScheduleSubmit} className="p-6">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Schedule Property Viewing</h2>
                    <button
                      type="button"
                      onClick={() => setShowScheduleModal(false)}
                      className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={scheduleForm.name}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={scheduleForm.email}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={scheduleForm.phone}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Date
                        </label>
                        <input
                          type="date"
                          value={scheduleForm.date}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                          required
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Time
                        </label>
                        <select
                          value={scheduleForm.time}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                          required
                        >
                          <option value="">Select time</option>
                          <option value="9:00 AM">9:00 AM</option>
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="11:00 AM">11:00 AM</option>
                          <option value="2:00 PM">2:00 PM</option>
                          <option value="3:00 PM">3:00 PM</option>
                          <option value="4:00 PM">4:00 PM</option>
                          <option value="5:00 PM">5:00 PM</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message (Optional)
                      </label>
                      <textarea
                        value={scheduleForm.message}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, message: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none transition-all"
                        placeholder="Any specific requirements or questions..."
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowScheduleModal(false)}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={scheduleViewing.isPending}
                      className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {scheduleViewing.isPending ? 'Scheduling...' : 'Schedule Viewing'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};
