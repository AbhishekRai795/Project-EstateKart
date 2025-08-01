import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PropertyCard } from '../../components/common/PropertyCard';
import { SearchBar } from '../../components/common/SearchBar';
import {
  useProperties,
  useScheduleViewing,
  useToggleCatalogue,
  useToggleFavorite,
  useUserPreferences,
} from '../../hooks/useProperties';
import type { Schema } from '../../../amplify/data/resource';
import { Property } from '../../contexts/PropertyContext'; // Import the frontend Property type

// --- FIX FOR MISSING IMAGES ---
// This function acts as a translator. It takes the raw data from your backend
// and ensures it matches the 'Property' interface your frontend components expect.
// Most importantly, it maps the `imageUrls` array from the backend to the `images`
// array that the PropertyCard component needs.
const transformProperty = (property: Schema['Property']['type'] & { imageUrls?: string[] }): Property => ({
  id: property.id,
  title: property.title || 'Untitled Property',
  description: property.description || '',
  price: property.price || 0,
  location: property.location || 'N/A',
  bedrooms: property.bedrooms || 0,
  bathrooms: property.bathrooms || 0,
  area: property.area || 0,
  type: property.type || 'house',
  status: property.status || 'available',
  ownerId: property.ownerId,
  listerName: property.listerName || 'N/A',
  // This is the key mapping:
  images: property.imageUrls?.filter(Boolean) as string[] || [],
  createdAt: property.createdAt || new Date().toISOString(),
  views: property.views || 0,
  features: property.features || [],
});


export const UserProperties: React.FC = () => {
  const { user } = useAuth();
  const { data: properties = [], isLoading, error } = useProperties();
  const { data: preferences } = useUserPreferences();
  const scheduleViewing = useScheduleViewing();
  const toggleCatalogue = useToggleCatalogue();
  const toggleFavorite = useToggleFavorite();

  const [viewMode] = useState<'grid' | 'list'>('grid');
  // This state now holds the correctly shaped 'Property' type
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  // This state also holds the correctly shaped 'Property' type
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    message: '',
    name: user?.name || '',
    email: user?.email || '',
    phone: ''
  });

  // This useEffect now transforms the data as soon as it arrives from the backend.
  useEffect(() => {
    if (properties) {
      const transformed = properties.map(transformProperty);
      setFilteredProperties(transformed);
    }
  }, [properties]);

  const handleSearch = (query: string) => {
    setIsSearching(true);
    // Ensure we start with the full, transformed list of properties
    const masterList = (properties || []).map(transformProperty);
    
    let localFiltered = masterList;

    if (query) {
      localFiltered = localFiltered.filter(property =>
        property.title.toLowerCase().includes(query.toLowerCase()) ||
        property.description.toLowerCase().includes(query.toLowerCase()) ||
        property.location.toLowerCase().includes(query.toLowerCase())
      );
    }
    setFilteredProperties(localFiltered);
    setIsSearching(false);
  };

  const handleScheduleViewing = (propertyId: string) => {
    const propertyToSchedule = filteredProperties.find(p => p.id === propertyId);
    if(propertyToSchedule) {
        setSelectedProperty(propertyToSchedule);
        setShowScheduleModal(true);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;
    
    try {
      await scheduleViewing.mutateAsync({
        propertyId: selectedProperty.id,
        propertyOwnerId: selectedProperty.ownerId,
        scheduledAt: new Date(`${scheduleForm.date}T${scheduleForm.time}`).toISOString(),
        message: scheduleForm.message,
      });
      alert('Viewing scheduled successfully!');
      setShowScheduleModal(false);
    } catch (err) {
      alert('Failed to schedule viewing.');
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

  if (error) {
    return <div>Error loading properties. Please try again.</div>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Explore Properties</h1>
          <p className="text-lg text-gray-600">Discover your perfect home from our curated listings</p>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <SearchBar onSearch={handleSearch} loading={isSearching} />
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="mb-4 lg:mb-0">
            <span className="text-lg font-semibold text-gray-900">
              {isLoading ? (
                <div className="flex items-center"><Loader2 className="h-5 w-5 animate-spin mr-2" />Loading...</div>
              ) : (
                `${filteredProperties.length} properties found`
              )}
            </span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          {isLoading ? (
            <div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property} // No more 'as any' needed!
                  onCatalogueToggle={() => toggleCatalogue.mutate(property.id)}
                  isInCatalogue={preferences?.catalogueProperties?.includes(property.id)}
                  onFavoriteToggle={() => toggleFavorite.mutate(property.id)}
                  isFavorite={preferences?.favoriteProperties?.includes(property.id)}
                  onScheduleViewing={handleScheduleViewing}
                />
              ))}
            </div>
          )}
        </motion.div>

        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5 relative"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Schedule Viewing</h2>
                <button onClick={() => setShowScheduleModal(false)} className="p-1 rounded-full text-gray-400 hover:bg-gray-100"><X size={20}/></button>
              </div>
              <form onSubmit={handleScheduleSubmit} className="space-y-3 text-sm">
                <input type="text" placeholder="Name" value={scheduleForm.name} onChange={e => setScheduleForm({ ...scheduleForm, name: e.target.value })} className="w-full p-2 border rounded-md" required />
                <input type="email" placeholder="Email" value={scheduleForm.email} onChange={e => setScheduleForm({ ...scheduleForm, email: e.target.value })} className="w-full p-2 border rounded-md" required />
                <input type="tel" placeholder="Phone (Optional)" value={scheduleForm.phone} onChange={e => setScheduleForm({ ...scheduleForm, phone: e.target.value })} className="w-full p-2 border rounded-md" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={scheduleForm.date} onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })} className="w-full p-2 border rounded-md" required />
                  <input type="time" value={scheduleForm.time} onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })} className="w-full p-2 border rounded-md" required />
                </div>
                <textarea placeholder="Message..." value={scheduleForm.message} onChange={e => setScheduleForm({ ...scheduleForm, message: e.target.value })} className="w-full p-2 border rounded-md h-20"></textarea>
                <button type="submit" disabled={scheduleViewing.isPending} className="w-full py-2 bg-primary-600 text-white rounded-md font-semibold hover:bg-primary-700 disabled:opacity-50">
                  {scheduleViewing.isPending ? 'Scheduling...' : 'Confirm'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UserProperties;
