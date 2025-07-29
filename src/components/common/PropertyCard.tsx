import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Square, ShoppingCart, Eye, DollarSign, Calendar, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    type: 'house' | 'apartment' | 'condo' | 'villa';
    status: 'available' | 'pending' | 'sold';
    imageUrls?: string[]; // Updated for backend images
    listerId: string;
    listerName: string;
    createdAt: string;
    views: number;
    features?: string[];
  };
  onCatalogueToggle?: (propertyId: string) => void;
  isInCatalogue?: boolean;
  onClick?: () => void;
  showStats?: boolean;
  viewMode?: 'grid' | 'list';
  onScheduleViewing?: (propertyId: string) => void;
  onFavoriteToggle?: (propertyId: string) => void;
  isFavorite?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onCatalogueToggle,
  isInCatalogue = false,
  onClick,
  showStats = false,
  viewMode = 'grid',
  onScheduleViewing,
  onFavoriteToggle,
  isFavorite = false
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCatalogueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCatalogueToggle?.(property.id);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle?.(property.id);
  };

  const handleScheduleViewing = (e: React.MouseEvent) => {
    e.stopPropagation();
    onScheduleViewing?.(property.id);
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
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get main image with fallback
  const mainImage = property.imageUrls && property.imageUrls.length > 0 
    ? property.imageUrls[0] 
    : 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800';

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100"
        onClick={handleCardClick}
      >
        <div className="flex flex-col md:flex-row">
          {/* Image Section - Left */}
          <div className="relative md:w-80 h-64 md:h-auto">
            <img
              src={mainImage}
              alt={property.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            
            {/* Status Badge */}
            <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
              {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
            </div>

            {/* Price Badge */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg">
              <span className="text-lg font-bold text-gray-900">{formatPrice(property.price)}</span>
            </div>
          </div>

          {/* Content Section - Right */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{property.title}</h3>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2 mb-4">
                {user && onCatalogueToggle && (
                  <button
                    onClick={handleCatalogueClick}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isInCatalogue
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1 inline" />
                    {isInCatalogue ? 'In Catalogue' : 'Add to Catalogue'}
                  </button>
                )}

                {user && onFavoriteToggle && (
                  <button
                    onClick={handleFavoriteClick}
                    className={`p-2 rounded-lg transition-colors ${
                      isFavorite
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                )}

                {onScheduleViewing && (
                  <button
                    onClick={handleScheduleViewing}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    <Calendar className="h-4 w-4 mr-1 inline" />
                    Schedule Viewing
                  </button>
                )}
              </div>

              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{property.location}</span>
              </div>

              <p className="text-gray-600 text-sm line-clamp-2 mb-4">{property.description}</p>
            </div>

            <div className="space-y-3">
              {/* Property Details */}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  <span>{property.bedrooms}</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  <span>{property.bathrooms}</span>
                </div>
                <div className="flex items-center">
                  <Square className="h-4 w-4 mr-1" />
                  <span>{property.area} sqft</span>
                </div>
              </div>

              {/* Stats for Lister View */}
              {showStats && (
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{property.views} views</span>
                  </div>
                </div>
              )}

              {/* Lister Info */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Listed by</span>
                <span className="font-medium">{property.listerName}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group border border-gray-100"
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={mainImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Status Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
          {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
        </div>

        {/* Catalogue Button */}
        {user && onCatalogueToggle && (
          <button
            onClick={handleCatalogueClick}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
              isInCatalogue
                ? 'bg-primary-600 text-white'
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        )}

        {/* Favorite Button */}
        {user && onFavoriteToggle && (
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-14 p-2 rounded-full transition-all ${
              isFavorite
                ? 'bg-red-600 text-white'
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg">
          <span className="text-lg font-bold text-gray-900">{formatPrice(property.price)}</span>
        </div>

        {/* Schedule Viewing Button */}
        {onScheduleViewing && (
          <button
            onClick={handleScheduleViewing}
            className="absolute bottom-3 right-3 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium opacity-0 group-hover:opacity-100"
          >
            <Calendar className="h-4 w-4 mr-1 inline" />
            Schedule Viewing
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{property.title}</h3>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{property.description}</p>

        {/* Property Details */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center">
            <Square className="h-4 w-4 mr-1" />
            <span>{property.area} sqft</span>
          </div>
        </div>

        {/* Stats for Lister View */}
        {showStats && (
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              <span>{property.views} views</span>
            </div>
          </div>
        )}

        {/* Lister Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Listed by</span>
          <span className="font-medium">{property.listerName}</span>
        </div>
      </div>
    </motion.div>
  );
};
