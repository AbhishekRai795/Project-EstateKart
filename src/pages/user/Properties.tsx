import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Grid, List, MapPin, X } from 'lucide-react';
import { useProperty } from '../../contexts/PropertyContext';
import { useAuth } from '../../contexts/AuthContext';
import { PropertyCard } from '../../components/common/PropertyCard';
import { SearchBar } from '../../components/common/SearchBar';

export const UserProperties: React.FC = () => {
  const { user } = useAuth();
  const { properties, catalogueProperties, toggleCatalogue } = useProperty();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredProperties, setFilteredProperties] = useState(properties);
  const [sortBy, setSortBy] = useState('recent');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    message: '',
    name: user?.name || '',
    email: user?.email || '',
    phone: ''
  });

  const handleSearch = (query: string, filters: any) => {
    let filtered = properties;

    // Filter by query
    if (query) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(query.toLowerCase()) ||
        property.description.toLowerCase().includes(query.toLowerCase()) ||
        property.location.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply filters
    if (filters.location) {
      filtered = filtered.filter(property =>
        property.location.toLowerCase().includes(filters.location.toLowerCase())
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

    setFilteredProperties(filtered);
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
        sorted = sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        sorted = sorted.sort((a, b) => b.views - a.views);
        break;
      default:
        break;
    }

    setFilteredProperties(sorted);
  };

  const handleScheduleViewing = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const schedulingData = {
      propertyId: selectedPropertyId,
      propertyTitle: properties.find(p => p.id === selectedPropertyId)?.title,
      clientName: scheduleForm.name,
      clientEmail: scheduleForm.email,
      clientPhone: scheduleForm.phone,
      date: scheduleForm.date,
      time: scheduleForm.time,
      message: scheduleForm.message,
      status: 'scheduled',
      createdAt: new Date()
    };
    
    console.log('Schedule viewing:', schedulingData);
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Properties</h1>
        <p className="text-gray-600">Discover your perfect home from our curated listings</p>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="mb-8">
        <SearchBar onSearch={handleSearch} />
      </motion.div>

      {/* Controls */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {filteredProperties.length} properties found
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
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Properties Grid/List */}
      <motion.div variants={itemVariants}>
        {filteredProperties.length > 0 ? (
          <div className={`${
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-6'
          }`}>
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                viewMode={viewMode}
                onCatalogueToggle={user ? toggleCatalogue : undefined}
                isInCatalogue={user ? catalogueProperties.includes(property.id) : false}
                onScheduleViewing={handleScheduleViewing}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </motion.div>

      {/* Sign in prompt for non-authenticated users */}
      {!user && (
        <motion.div variants={itemVariants} className="mt-16 bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-2xl p-10 text-center">
          <h3 className="text-2xl font-bold text-primary-900 mb-4">
            Want personalized recommendations?
          </h3>
          <p className="text-primary-700 mb-8 text-lg">
            Sign in to save properties to your catalogue, get AI-powered recommendations, and list your own properties
          </p>
          <div className="flex items-center justify-center space-x-6">
            <motion.a
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              href="/auth/login"
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-primary-500/25"
            >
              Sign In
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              href="/auth/register"
              className="border-2 border-primary-500 text-primary-600 hover:bg-primary-50 hover:border-primary-600 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300"
            >
              Sign Up
            </motion.a>
          </div>
        </motion.div>
      )}
      {/* Load More */}
      {filteredProperties.length > 0 && (
        <motion.div variants={itemVariants} className="mt-12 text-center">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-primary-500/25"
          >
            Load More Properties
          </motion.button>
        </motion.div>
      )}

      {/* Schedule Viewing Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Schedule Property Viewing</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-6">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Time
                </label>
                <select
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  required
                >
                  <option value="">Select time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  value={scheduleForm.message}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none transition-all"
                  placeholder="Any specific requirements or questions..."
                />
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl transition-all duration-300 font-bold shadow-lg hover:shadow-primary-500/25"
                >
                  Schedule Viewing
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};