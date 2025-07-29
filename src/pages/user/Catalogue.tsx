import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, Filter, Grid, List, Trash2, Heart, Calendar, X, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PropertyCard } from '../../components/common/PropertyCard';
import { SearchBar } from '../../components/common/SearchBar';
import { useNavigate } from 'react-router-dom';
import { useProperties, useScheduleViewing } from '../../hooks/useProperties';

export const UserCatalogue: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use backend hooks instead of PropertyContext
  const { data: properties = [], isLoading, error } = useProperties();
  const scheduleViewing = useScheduleViewing();
  
  const [catalogueProperties, setCatalogueProperties] = useState<string[]>([]);
  const [favoriteProperties, setFavoriteProperties] = useState<string[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    message: '',
    name: user?.name || '',
    email: user?.email || '',
    phone: ''
  });

  // Transform properties data with proper null handling
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
      imageUrls: property.imageUrls?.filter((url): url is string => url !== null && url !== undefined) || [],
      listerId: property.listerId || '',
      listerName: property.listerName || 'Anonymous',
      createdAt: property.createdAt || new Date().toISOString(),
      views: property.views || 0,
      features: property.features?.filter((feature): feature is string => feature !== null && feature !== undefined) || [],
    }));

  // In a real app, catalogueProperties would come from UserPreference table
  // For now, we'll simulate it with local state
  useEffect(() => {
    // Mock some initial catalogue properties for demo
    if (transformedProperties.length > 0) {
      const initialCatalogue = transformedProperties.slice(0, 3).map(p => p.id);
      setCatalogueProperties(initialCatalogue);
    }
  }, [transformedProperties]);

  // Get catalogue properties
  const cataloguePropertiesList = transformedProperties.filter(property => 
    catalogueProperties.includes(property.id)
  );

  // Update filtered properties when catalogue changes
  useEffect(() => {
    setFilteredProperties(cataloguePropertiesList);
  }, [cataloguePropertiesList]);

  const handleSearch = async (query: string, filters: any) => {
    setIsSearching(true);
    let filtered = cataloguePropertiesList;

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
        sorted = sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'alphabetical':
        sorted = sorted.sort((a, b) => a.title.localeCompare(b.title));
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
    
    // In a real app, this would update the UserPreference table
    console.log('Catalogue updated:', propertyId);
  };

  const handleFavoriteToggle = (propertyId: string) => {
    setFavoriteProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
    
    // In a real app, this would update the UserPreference table
    console.log('Favorites updated:', propertyId);
  };

  const handleRemoveFromCatalogue = (propertyId: string) => {
    setCatalogueProperties(prev => prev.filter(id => id !== propertyId));
    setFilteredProperties(prev => prev.filter(p => p.id !== propertyId));
  };

  const clearCatalogue = () => {
    if (window.confirm('Are you sure you want to clear your entire catalogue?')) {
      setCatalogueProperties([]);
      setFilteredProperties([]);
    }
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Catalogue</h2>
            <p className="text-gray-600 mb-6">There was an error loading your catalogue. Please try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Refresh Page
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

          {cataloguePropertiesList.length > 0 && (
            <div className="flex items-center space-x-4">
              <span className="bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium">
                {cataloguePropertiesList.length} {cataloguePropertiesList.length === 1 ? 'Property' : 'Properties'}
              </span>
              <button
                onClick={clearCatalogue}
                className="text-red-600 hover:text-red-700 font-medium transition-colors flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </button>
            </div>
          )}
        </motion.div>

        {/* Search and Filters */}
        {cataloguePropertiesList.length > 0 && (
          <motion.div variants={itemVariants} className="mb-8">
            <SearchBar onSearch={handleSearch} loading={isSearching} />
          </motion.div>
        )}

        {/* Controls */}
        {cataloguePropertiesList.length > 0 && (
          <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="mb-4 lg:mb-0">
              <span className="text-lg font-semibold text-gray-900">
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Loading catalogue...
                  </div>
                ) : (
                  `${filteredProperties.length} properties in your catalogue`
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
                <option value="recent">Recently Added</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="alphabetical">Alphabetical</option>
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
        )}

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
                <div key={property.id} className="relative group">
                  <PropertyCard
                    property={property}
                    viewMode={viewMode}
                    onCatalogueToggle={handleCatalogueToggle}
                    isInCatalogue={true} // Always true in catalogue view
                    onFavoriteToggle={handleFavoriteToggle}
                    isFavorite={favoriteProperties.includes(property.id)}
                    onScheduleViewing={handleScheduleViewing}
                  />
                  
                  {/* Remove from catalogue button */}
                  <button
                    onClick={() => handleRemoveFromCatalogue(property.id)}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 z-10"
                    title="Remove from catalogue"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : cataloguePropertiesList.length === 0 ? (
            // Empty catalogue state
            <div className="text-center py-20">
              <div className="text-gray-400 text-6xl mb-6">🛒</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Your catalogue is empty</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start building your catalogue by browsing properties and saving the ones you're interested in.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/user/properties')}
                  className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Browse Properties
                </button>
                <button
                  onClick={() => navigate('/user/recommendations')}
                  className="border border-primary-600 text-primary-600 px-8 py-3 rounded-lg hover:bg-primary-50 transition-colors font-medium flex items-center justify-center"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  View Recommendations
                </button>
              </div>
            </div>
          ) : (
            // No search results state
            <div className="text-center py-20">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No matching properties found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
              <button
                onClick={() => setFilteredProperties(cataloguePropertiesList)}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear search and show all catalogue properties
              </button>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        {cataloguePropertiesList.length > 0 && (
          <motion.div variants={itemVariants} className="mt-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Ready to take the next step?</h3>
            <p className="mb-6 opacity-90">Schedule viewings for your favorite properties or explore more options</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/user/properties')}
                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Browse More Properties
              </button>
              <button
                onClick={() => navigate('/user/recommendations')}
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
              >
                Get Recommendations
              </button>
            </div>
          </motion.div>
        )}

        {/* Schedule Viewing Modal */}
        {showScheduleModal && (
          <>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowScheduleModal(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              >
                <form onSubmit={handleScheduleSubmit} className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Schedule Viewing</h2>
                    <button
                      type="button"
                      onClick={() => setShowScheduleModal(false)}
                      className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                      <input
                        type="text"
                        value={scheduleForm.name}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={scheduleForm.email}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        value={scheduleForm.phone}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                      <textarea
                        value={scheduleForm.message}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, message: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none transition-all"
                        placeholder="Any specific requirements or questions..."
                      />
                    </div>
                  </div>

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
