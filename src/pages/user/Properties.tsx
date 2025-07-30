import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Grid, List, Loader2, X } from 'lucide-react';
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
import { Property } from '../../contexts/PropertyContext'; // Reusing type

export const UserProperties: React.FC = () => {
  const { user } = useAuth();
  const { data: properties = [], isLoading, error } = useProperties();
  const { data: preferences } = useUserPreferences();
  const scheduleViewing = useScheduleViewing();
  const toggleCatalogue = useToggleCatalogue();
  const toggleFavorite = useToggleFavorite();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('recent');
  const [isSearching, setIsSearching] = useState(false);
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

  useEffect(() => {
    if (properties) {
      const transformedProperties = properties
        .filter(property => property.id && property.title)
        .map(property => ({
          ...property,
          images: property.imageUrls?.filter(Boolean) || [],
          createdAt: property.createdAt ? new Date(property.createdAt) : new Date(),
        }));
      setFilteredProperties(transformedProperties);
    }
  }, [properties]);

  const handleSearch = (query: string, filters: any) => {
    setIsSearching(true);
    let masterList = properties.map(p => ({ ...p, images: p.imageUrls?.filter(Boolean) || [] }));
    
    let localFiltered = masterList;

    if (query) {
      localFiltered = localFiltered.filter(property =>
        property.title?.toLowerCase().includes(query.toLowerCase()) ||
        property.description?.toLowerCase().includes(query.toLowerCase()) ||
        property.location?.toLowerCase().includes(query.toLowerCase())
      );
    }
    // Implement other filters as needed
    setFilteredProperties(localFiltered);
    setIsSearching(false);
  };

  const handleSort = (sortType: string) => {
    setSortBy(sortType);
    let sorted = [...filteredProperties];
    // Sorting logic...
    setFilteredProperties(sorted);
  };

  // FIX: Added the missing handler function for scheduling a viewing
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
          {/* Sorting and View Mode controls... */}
        </motion.div>

        <motion.div variants={itemVariants}>
          {isLoading ? (
            <div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property as unknown as Property}
                  viewMode={viewMode}
                  onCatalogueToggle={toggleCatalogue.mutate}
                  isInCatalogue={preferences?.catalogueProperties?.includes(property.id)}
                  onFavoriteToggle={toggleFavorite.mutate}
                  isFavorite={preferences?.favoriteProperties?.includes(property.id)}
                  onScheduleViewing={handleScheduleViewing} // FIX: Passing the correct handler function
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Schedule Viewing Modal */}
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