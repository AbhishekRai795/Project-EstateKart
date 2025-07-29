import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, TrendingUp, Home as HomeIcon, Star, Sparkles, Plus, Heart, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PropertyCard } from '../../components/common/PropertyCard';
import { SearchBar } from '../../components/common/SearchBar';
import { StatsCard } from '../../components/analytics/StatsCard';
import { useNavigate } from 'react-router-dom';
import { 
  useProperties, 
  useScheduleViewing, 
  useCatalogue, 
  useToggleCatalogue, 
  useToggleFavorite,
  useUserPreferences
} from '../../hooks/useProperties';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use backend hooks with persistent catalogue
  const { data: properties = [], isLoading, error } = useProperties();
  
  // Direct preferences data for real-time updates
  const { data: preferences, refetch: refetchPreferences } = useUserPreferences();
  const catalogueProperties = preferences?.catalogueProperties || [];
  const favoriteProperties = preferences?.favoriteProperties || [];
  
  const toggleCatalogue = useToggleCatalogue();
  const toggleFavorite = useToggleFavorite();
  const scheduleViewing = useScheduleViewing();
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    message: '',
    name: user?.name || '',
    email: user?.email || '',
    phone: ''
  });

  // Force refresh preferences when component mounts or user changes
  useEffect(() => {
    if (user) {
      refetchPreferences();
    }
  }, [user, refetchPreferences]);

  // Transform properties data with proper null handling
  const transformedProperties = properties
    .filter(property => property.id && property.title)
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

  // Get recent and recommended properties
  const recentProperties = transformedProperties
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);
    
  const recommendedProperties = transformedProperties
    .filter(p => p.views > 10)
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);

  const featuredProperties = transformedProperties
    .filter(p => p.price > 500000)
    .sort((a, b) => b.price - a.price)
    .slice(0, 3);

  // Real-time stats that update immediately
  const totalProperties = transformedProperties.length;
  const catalogueCount = catalogueProperties.length;
  const favoriteCount = favoriteProperties.length;

  const handleSearch = (query: string, filters: any) => {
    const searchParams = new URLSearchParams();
    if (query) searchParams.set('q', query);
    if (filters.location) searchParams.set('location', filters.location);
    if (filters.minPrice) searchParams.set('minPrice', filters.minPrice);
    if (filters.maxPrice) searchParams.set('maxPrice', filters.maxPrice);
    if (filters.bedrooms) searchParams.set('bedrooms', filters.bedrooms);
    if (filters.bathrooms) searchParams.set('bathrooms', filters.bathrooms);
    if (filters.propertyType) searchParams.set('type', filters.propertyType);
    
    navigate(`/user/properties?${searchParams.toString()}`);
  };

  // Optimistic updates with immediate UI feedback
  const handleCatalogueToggle = async (propertyId: string) => {
    try {
      await toggleCatalogue.mutateAsync(propertyId);
      // Force refresh to get latest data
      setTimeout(() => refetchPreferences(), 100);
    } catch (error) {
      console.error('Error toggling catalogue:', error);
      // Refresh anyway to sync with server state
      refetchPreferences();
    }
  };

  const handleFavoriteToggle = async (propertyId: string) => {
    try {
      await toggleFavorite.mutateAsync(propertyId);
      // Force refresh to get latest data
      setTimeout(() => refetchPreferences(), 100);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Refresh anyway to sync with server state
      refetchPreferences();
    }
  };

  const handleScheduleViewing = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const property = transformedProperties.find(p => p.id === selectedPropertyId);
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
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Loading skeleton component
  const PropertySkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
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
  );

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Dashboard</h2>
            <p className="text-gray-600 mb-6">There was an error loading your dashboard. Please try again.</p>
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
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="relative mb-12 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-8 md:p-12 text-white relative">
            {/* Animated background blobs */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-36 -translate-y-36 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-48 translate-y-48 animate-pulse delay-1000"></div>
            
            <div className="relative z-10">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl font-bold mb-4"
              >
                Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-primary-100 max-w-2xl mb-6"
              >
                Discover your perfect property from {totalProperties} amazing listings
              </motion.p>
              
              {/* Real-time stats in welcome banner */}
              <div className="flex flex-wrap gap-6 mt-8">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <HomeIcon className="h-4 w-4" />
                  </div>
                  <span>{totalProperties} Properties Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <span>{catalogueCount} In Your Catalogue</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Heart className="h-4 w-4" />
                  </div>
                  <span>{favoriteCount} Favorites</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search Section */}
        <motion.div variants={itemVariants} className="mb-12">
          <SearchBar onSearch={handleSearch} loading={isLoading} />
        </motion.div>

        {/* Stats Cards with real-time updates */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatsCard
            title="Available Properties"
            value={totalProperties.toString()}
            icon={TrendingUp}
            color="primary"
          />
          <StatsCard
            title="Your Catalogue"
            value={catalogueCount.toString()}
            icon={ShoppingCart}
            color="success"
          />
          <StatsCard
            title="Your Favorites"
            value={favoriteCount.toString()}
            icon={Star}
            color="warning"
          />
        </motion.div>

        {/* Featured Properties */}
        {featuredProperties.length > 0 && (
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Star className="h-8 w-8 text-yellow-500 mr-3" />
                  Featured Properties
                </h2>
                <p className="text-gray-600 mt-2">Premium properties with exceptional value</p>
              </div>
              <button
                onClick={() => navigate('/user/properties?featured=true')}
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                View all featured →
              </button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <PropertySkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onCatalogueToggle={handleCatalogueToggle}
                    isInCatalogue={catalogueProperties.includes(property.id)}
                    onFavoriteToggle={handleFavoriteToggle}
                    isFavorite={favoriteProperties.includes(property.id)}
                    onScheduleViewing={handleScheduleViewing}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Recommended Properties */}
        {recommendedProperties.length > 0 && (
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Sparkles className="h-8 w-8 text-primary-600 mr-3" />
                  Recommended for You
                </h2>
                <p className="text-gray-600 mt-2">Popular properties based on user views and engagement</p>
              </div>
              <button
                onClick={() => navigate('/user/recommendations')}
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                View all recommendations →
              </button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <PropertySkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onCatalogueToggle={handleCatalogueToggle}
                    isInCatalogue={catalogueProperties.includes(property.id)}
                    onFavoriteToggle={handleFavoriteToggle}
                    isFavorite={favoriteProperties.includes(property.id)}
                    onScheduleViewing={handleScheduleViewing}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Recent Properties with proper catalogue state */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                <HomeIcon className="h-8 w-8 text-primary-600 mr-3" />
                Recently Added
              </h2>
              <p className="text-gray-600 mt-2">Latest properties on the market</p>
            </div>
            <button
              onClick={() => navigate('/user/properties')}
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              View all properties →
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <PropertySkeleton key={i} />
              ))}
            </div>
          ) : recentProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onCatalogueToggle={handleCatalogueToggle}
                  isInCatalogue={catalogueProperties.includes(property.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                  isFavorite={favoriteProperties.includes(property.id)}
                  onScheduleViewing={handleScheduleViewing}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="text-gray-400 text-6xl mb-4">🏠</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No properties available yet</h3>
              <p className="text-gray-600 mb-6">Check back later for new listings!</p>
              <button
                onClick={() => navigate('/lister/add-property')}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                List Your Property
              </button>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/user/properties')}
              className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl text-center hover:shadow-primary-500/20 transition-all duration-500 transform border border-gray-100/50 relative overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Search className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Browse Properties</h3>
              <p className="text-gray-600 text-sm">Search and filter properties</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/user/catalogue')}
              className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl text-center hover:shadow-green-500/20 transition-all duration-500 transform border border-gray-100/50 relative overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <ShoppingCart className="h-12 w-12 text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">My Catalogue</h3>
              <p className="text-gray-600 text-sm">View saved properties</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/user/recommendations')}
              className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl text-center hover:shadow-yellow-500/20 transition-all duration-500 transform border border-gray-100/50 relative overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Sparkles className="h-12 w-12 text-yellow-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Recommendations</h3>
              <p className="text-gray-600 text-sm">AI-powered suggestions</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/lister/add-property')}
              className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl text-center hover:shadow-purple-500/20 transition-all duration-500 transform border border-gray-100/50 relative overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Plus className="h-12 w-12 text-purple-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">List Property</h3>
              <p className="text-gray-600 text-sm">Add your property</p>
            </motion.button>
          </div>
        </motion.div>

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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={scheduleForm.email}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={scheduleForm.phone}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
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
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={scheduleViewing.isPending}
                      className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
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
