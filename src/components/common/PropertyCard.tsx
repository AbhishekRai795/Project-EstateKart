import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Square, ShoppingCart, Eye, DollarSign, Calendar, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Property } from '../../contexts/PropertyContext'; // Reusing existing type

interface PropertyCardProps {
  property: Property;
  onCatalogueToggle?: (propertyId: string) => void;
  isInCatalogue?: boolean;
  onFavoriteToggle?: (propertyId: string) => void;
  isFavorite?: boolean;
  onClick?: () => void;
  showStats?: boolean;
  viewMode?: 'grid' | 'list';
  onScheduleViewing?: (propertyId: string) => void;
  isListerView?: boolean; // NEW: Prop to indicate if the card is being viewed by the lister
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onCatalogueToggle,
  isInCatalogue = false,
  onFavoriteToggle,
  isFavorite = false,
  onClick,
  showStats = false,
  viewMode = 'grid',
  onScheduleViewing,
  isListerView = false, // Default to false
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleProtectedAction = (action?: (id: string) => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user) {
      action?.(property.id);
    } else {
      navigate('/auth?mode=signin');
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/property/${property.id}`);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const imageUrl = property.images?.[0] || `https://placehold.co/400x256/EFEFEF/333333?text=No+Image`;

  const ScheduleButton = ({ isList = false }) => (
    <motion.button 
      whileHover={{ scale: isListerView ? 1 : 1.05 }} 
      whileTap={{ scale: isListerView ? 1 : 0.95 }} 
      onClick={handleProtectedAction(onScheduleViewing)} 
      disabled={isListerView}
      className={`flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg transition-all duration-300 ${isListerView ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-orange-500/25'} ${isList ? 'px-4 py-2 rounded-xl' : 'absolute bottom-4 right-4 px-3 py-2 rounded-xl text-sm'}`}
      title={isListerView ? "You cannot schedule a viewing for your own property" : "Schedule a viewing"}
    >
      <Calendar size={16} />
      <span>{isList ? 'Schedule Viewing' : 'Schedule'}</span>
    </motion.button>
  );

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/20 border border-gray-100/50 cursor-pointer group flex items-center space-x-8"
        onClick={handleCardClick}
      >
        <div className="relative w-80 h-48 flex-shrink-0">
          <img src={imageUrl.replace('400x256', '320x192')} alt={property.title} className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500" />
          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(property.status)}`}>{property.status.charAt(0).toUpperCase() + property.status.slice(1)}</div>
          <div className="absolute bottom-4 right-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-2xl font-bold text-lg shadow-lg">{formatPrice(property.price)}</div>
        </div>

        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">{property.title}</h3>
          <div className="flex items-center space-x-4 mb-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleProtectedAction(onCatalogueToggle)} className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${isInCatalogue ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-600'}`}>
              <ShoppingCart size={16} /><span>{isInCatalogue ? 'In Catalogue' : 'Add to Catalogue'}</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleProtectedAction(onFavoriteToggle)} className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${isFavorite ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'}`}>
              <Heart size={16} /><span>{isFavorite ? 'Favorite' : 'Add to Favorites'}</span>
            </motion.button>
            <ScheduleButton isList={true} />
          </div>
          <div className="flex items-center text-gray-600 mb-3"><MapPin size={16} className="mr-2" /><span>{property.location}</span></div>
          <p className="text-gray-600 mb-4 line-clamp-2">{property.description}</p>
          <div className="flex items-center space-x-6 text-gray-700 mb-4">
            <div className="flex items-center space-x-2"><Bed size={16} /><span>{property.bedrooms}</span></div>
            <div className="flex items-center space-x-2"><Bath size={16} /><span>{property.bathrooms}</span></div>
            <div className="flex items-center space-x-2"><Square size={16} /><span>{property.area} sqft</span></div>
          </div>
          {showStats && (
            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1"><Eye size={14} /><span>{property.views} views</span></div>
              <div className="flex items-center space-x-1"><DollarSign size={14} /><span>{property.offers || 0} offers</span></div>
            </div>
          )}
          <div className="text-sm text-gray-500"><span className="font-medium">Listed by</span><span className="ml-2 text-primary-600 font-semibold">{property.listerName}</span></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/20 border border-gray-100/50 cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="relative h-64 overflow-hidden">
        <img src={imageUrl} alt={property.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(property.status)}`}>{property.status.charAt(0).toUpperCase() + property.status.slice(1)}</div>
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleProtectedAction(onCatalogueToggle)} className={`p-3 rounded-full shadow-lg transition-all duration-300 ${isInCatalogue ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white' : 'bg-white/90 text-gray-700 hover:bg-primary-50 hover:text-primary-600'}`}><ShoppingCart size={16} /></motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleProtectedAction(onFavoriteToggle)} className={`p-3 rounded-full shadow-lg transition-all duration-300 ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-red-50 hover:text-red-600'}`}><Heart size={16} /></motion.button>
        </div>
        <div className="absolute bottom-4 left-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-2xl font-bold text-lg shadow-lg">{formatPrice(property.price)}</div>
        <ScheduleButton />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">{property.title}</h3>
        <div className="flex items-center text-gray-600 mb-3"><MapPin size={16} className="mr-2" /><span>{property.location}</span></div>
        <p className="text-gray-600 mb-4 line-clamp-2">{property.description}</p>
        <div className="flex items-center justify-between text-gray-700 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1"><Bed size={16} /><span>{property.bedrooms}</span></div>
            <div className="flex items-center space-x-1"><Bath size={16} /><span>{property.bathrooms}</span></div>
            <div className="flex items-center space-x-1"><Square size={16} /><span>{property.area} sqft</span></div>
          </div>
        </div>
        {showStats && (
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-1"><Eye size={14} /><span>{property.views} views</span></div>
            <div className="flex items-center space-x-1"><DollarSign size={14} /><span>{property.offers || 0} offers</span></div>
          </div>
        )}
        <div className="text-sm text-gray-500"><span className="font-medium">Listed by</span><span className="ml-2 text-primary-600 font-semibold">{property.listerName}</span></div>
      </div>
    </motion.div>
  );
};
