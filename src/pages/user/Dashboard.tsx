import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, TrendingUp, Home as HomeIcon, Star, Sparkles, Plus, Heart, X, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PropertyCard } from '../../components/common/PropertyCard';
import { SearchBar } from '../../components/common/SearchBar';
import { StatsCard } from '../../components/analytics/StatsCard';
import { useNavigate } from 'react-router-dom';
import {
  useProperties,
  useScheduleViewing,
  useUserPreferences,
  useToggleCatalogue,
  useToggleFavorite,
} from '../../hooks/useProperties';
import { Property } from '../../contexts/PropertyContext'; // Reusing type

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Use backend hooks
  const { data: properties = [], isLoading: isLoadingProperties, error } = useProperties();
  const { data: preferences, refetch: refetchPreferences, isLoading: isLoadingPreferences } = useUserPreferences();
  const toggleCatalogue = useToggleCatalogue();
  const toggleFavorite = useToggleFavorite();
  const scheduleViewing = useScheduleViewing();

  // UI State
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

  // Refetch user preferences when the component mounts or the user changes
  useEffect(() => {
    if (user) {
      refetchPreferences();
    }
  }, [user, refetchPreferences]);

  // Memoize property lists for performance
  const transformedProperties = React.useMemo(() => properties
    .filter(property => property.id && property.title)
    .map(property => ({
      ...property,
      images: property.imageUrls?.filter(Boolean) || [],
      createdAt: property.createdAt ? new Date(property.createdAt) : new Date(),
    })), [properties]);

  const recentProperties = React.useMemo(() => transformedProperties
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6), [transformedProperties]);

  const recommendedProperties = React.useMemo(() => transformedProperties
    .filter(p => (p.views || 0) > 10)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 3), [transformedProperties]);

  const featuredProperties = React.useMemo(() => transformedProperties
    .filter(p => (p.price || 0) > 500000)
    .sort((a, b) => (b.price || 0) - (a.price || 0))
    .slice(0, 3), [transformedProperties]);

  // Real-time stats from preferences
  const totalProperties = transformedProperties.length;
  const catalogueCount = preferences?.catalogueProperties?.length || 0;
  const favoriteCount = preferences?.favoriteProperties?.length || 0;

  const handleSearch = (query: string, filters: any) => {
    const searchParams = new URLSearchParams({ q: query, ...filters });
    navigate(`/user/properties?${searchParams.toString()}`);
  };

  const handleCatalogueToggle = async (propertyId: string) => {
    await toggleCatalogue.mutateAsync(propertyId);
  };

  const handleFavoriteToggle = async (propertyId: string) => {
    await toggleFavorite.mutateAsync(propertyId);
  };

  const handleScheduleViewing = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const property = transformedProperties.find(p => p.id === selectedPropertyId);
    if (!property) return;

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
    alert('Viewing scheduled successfully!');
    setShowScheduleModal(false);
  };

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
      <div className="p-5"><div className="h-6 bg-gray-200 rounded mb-2"></div><div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div><div className="h-4 bg-gray-200 rounded w-1/2"></div></div>
    </div>
  );

  if (error) return <div>Error loading dashboard. Please refresh.</div>;
  const isLoading = isLoadingProperties || isLoadingPreferences;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div variants={itemVariants} className="relative mb-12 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-8 md:p-12 text-white relative">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-36 -translate-y-36 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-48 translate-y-48 animate-pulse delay-1000"></div>
            <div className="relative z-10">
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-bold mb-4">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl text-primary-100 max-w-2xl mb-6">
                Discover your perfect property from {totalProperties} amazing listings
              </motion.p>
              <div className="flex flex-wrap gap-6 mt-8">
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

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatsCard title="Available Properties" value={totalProperties.toString()} icon={TrendingUp} color="primary" />
          <StatsCard title="Your Catalogue" value={catalogueCount.toString()} icon={ShoppingCart} color="success" />
          <StatsCard title="Your Favorites" value={favoriteCount.toString()} icon={Star} color="warning" />
        </motion.div>

        {featuredProperties.length > 0 && (
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center"><Star className="h-8 w-8 text-yellow-500 mr-3" />Featured Properties</h2>
                <p className="text-gray-600 mt-2">Premium properties with exceptional value</p>
              </div>
              <button onClick={() => navigate('/user/properties?featured=true')} className="text-primary-600 hover:text-primary-700 font-medium transition-colors">View all featured →</button>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(3)].map((_, i) => <PropertySkeleton key={i} />)}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProperties.map(p => (
                  <PropertyCard key={p.id} property={p as unknown as Property} onCatalogueToggle={handleCatalogueToggle} isInCatalogue={preferences?.catalogueProperties?.includes(p.id)} onFavoriteToggle={handleFavoriteToggle} isFavorite={preferences?.favoriteProperties?.includes(p.id)} onScheduleViewing={handleScheduleViewing} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {recommendedProperties.length > 0 && (
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center"><Sparkles className="h-8 w-8 text-primary-600 mr-3" />Recommended for You</h2>
                <p className="text-gray-600 mt-2">Popular properties based on user views</p>
              </div>
              <button onClick={() => navigate('/user/recommendations')} className="text-primary-600 hover:text-primary-700 font-medium transition-colors">View all recommendations →</button>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(3)].map((_, i) => <PropertySkeleton key={i} />)}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedProperties.map(p => (
                  <PropertyCard key={p.id} property={p as unknown as Property} onCatalogueToggle={handleCatalogueToggle} isInCatalogue={preferences?.catalogueProperties?.includes(p.id)} onFavoriteToggle={handleFavoriteToggle} isFavorite={preferences?.favoriteProperties?.includes(p.id)} onScheduleViewing={handleScheduleViewing} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center"><HomeIcon className="h-8 w-8 text-primary-600 mr-3" />Recently Added</h2>
              <p className="text-gray-600 mt-2">Latest properties on the market</p>
            </div>
            <button onClick={() => navigate('/user/properties')} className="text-primary-600 hover:text-primary-700 font-medium transition-colors">View all properties →</button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(6)].map((_, i) => <PropertySkeleton key={i} />)}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProperties.map(p => (
                <PropertyCard key={p.id} property={p as unknown as Property} onCatalogueToggle={handleCatalogueToggle} isInCatalogue={preferences?.catalogueProperties?.includes(p.id)} onFavoriteToggle={handleFavoriteToggle} isFavorite={preferences?.favoriteProperties?.includes(p.id)} onScheduleViewing={handleScheduleViewing} />
              ))}
            </div>
          )}
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