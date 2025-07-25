import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Square, Heart, Eye, DollarSign } from 'lucide-react';
import { Property } from '../../contexts/PropertyContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PropertyCardProps {
  property: Property;
  onFavoriteToggle?: (propertyId: string) => void;
  isFavorite?: boolean;
  onClick?: () => void;
  showStats?: boolean;
  viewMode?: 'grid' | 'list';
  onScheduleViewing?: (propertyId: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onFavoriteToggle,
  isFavorite = false,
  onClick,
  showStats = false,
  viewMode = 'grid',
  onScheduleViewing
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
      // Default navigation based on user role
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

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        onClick={handleCardClick}
        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
      >
        <div className="flex">
          {/* Image Section - Left */}
          <div className="relative w-64 h-48 flex-shrink-0 overflow-hidden">
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
              </span>
            </div>

            {/* Price Badge */}
            <div className="absolute bottom-3 left-3">
              <div className="bg-primary-500 text-white px-3 py-1 rounded-lg font-bold text-sm">
                {formatPrice(property.price)}
              </div>
            </div>
          </div>

          {/* Content Section - Right */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {property.title}
                </h3>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {user && onFavoriteToggle && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleFavoriteClick}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    >
                      <Heart
                        className={`h-4 w-4 transition-colors ${
                          isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'
                        }`}
                      />
                    </motion.button>
                  )}
                  
                  {onScheduleViewing && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleScheduleViewing}
                      className="px-3 py-1 bg-primary-500 text-white rounded-lg text-xs font-medium hover:bg-primary-600 transition-colors"
                    >
                      Schedule Viewing
                    </motion.button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{property.location}</span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {property.description}
              </p>

              {/* Property Details */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
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
            </div>

            <div className="flex items-center justify-between">
              {/* Stats for Lister View */}
              {showStats && (
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{property.views} views</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>{property.offers} offers</span>
                  </div>
                </div>
              )}

              {/* Lister Info */}
              <div className="text-right">
                <p className="text-xs text-gray-500">Listed by</p>
                <p className="text-sm font-medium text-gray-700">{property.listerName}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </span>
        </div>

        {/* Favorite Button */}
        {user && onFavoriteToggle && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'
              }`}
            />
          </motion.button>
        )}

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-primary-500 text-white px-3 py-1 rounded-lg font-bold">
            {formatPrice(property.price)}
          </div>
        </div>
        
        {/* Schedule Viewing Button */}
        {onScheduleViewing && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleScheduleViewing}
            className="absolute bottom-3 right-3 px-3 py-1 bg-white text-primary-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors shadow-md"
          >
            Schedule Viewing
          </motion.button>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
          {property.title}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {property.description}
        </p>

        {/* Property Details */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-4">
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
        </div>

        {/* Stats for Lister View */}
        {showStats && (
          <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-100">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              <span>{property.views} views</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>{property.offers} offers</span>
            </div>
          </div>
        )}

        {/* Lister Info */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">Listed by</p>
          <p className="text-sm font-medium text-gray-700">{property.listerName}</p>
        </div>
      </div>
    </motion.div>
  );
};