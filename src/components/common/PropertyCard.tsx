import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Square, ShoppingCart, Eye, DollarSign, Calendar } from 'lucide-react';
import { Property } from '../../contexts/PropertyContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PropertyCardProps {
  property: Property;
  onCatalogueToggle?: (propertyId: string) => void;
  isInCatalogue?: boolean;
  onClick?: () => void;
  showStats?: boolean;
  viewMode?: 'grid' | 'list';
  onScheduleViewing?: (propertyId: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onCatalogueToggle,
  isInCatalogue = false,
  onClick,
  showStats = false,
  viewMode = 'grid',
  onScheduleViewing
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCatalogueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCatalogueToggle?.(property.id);
  };

  const handleScheduleViewing = (e: React.MouseEvent) => {
    e.stopPropagation();
    onScheduleViewing?.(property.id);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to property detail page
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex">
          {/* Image Section - Left */}
          <div className="w-1/3 relative">
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-48 object-cover"
            />
            
            {/* Status Badge */}
            <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
              {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
            </div>

            {/* Price Badge */}
            <div className="absolute bottom-3 left-3 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              {formatPrice(property.price)}
            </div>
          </div>

          {/* Content Section - Right */}
          <div className="w-2/3 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                {property.title}
              </h3>

              {/* Action Buttons */}
              <div className="flex gap-2 mb-4">
                {user && onCatalogueToggle && (
                  <button
                    onClick={handleCatalogueClick}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      isInCatalogue
                        ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>{isInCatalogue ? 'In Catalogue' : 'Add to Catalogue'}</span>
                  </button>
                )}

                {onScheduleViewing && (
                  <button
                    onClick={handleScheduleViewing}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>Schedule Viewing</span>
                  </button>
                )}
              </div>

              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{property.location}</span>
              </div>

              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                {property.description}
              </p>

              {/* Property Details */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Bed className="w-4 h-4 mr-1" />
                  <span>{property.bedrooms}</span>
                </div>
                <div className="flex items-center">
                  <Bath className="w-4 h-4 mr-1" />
                  <span>{property.bathrooms}</span>
                </div>
                <div className="flex items-center">
                  <Square className="w-4 h-4 mr-1" />
                  <span>{property.area} sqft</span>
                </div>
              </div>

              {/* Stats for Lister View */}
              {showStats && (
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    <span>{property.views} views</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span>{property.offers} offers</span>
                  </div>
                </div>
              )}
            </div>

            {/* Lister Info */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-500">
                <span className="block">Listed by</span>
                <span className="font-medium text-gray-900">{property.listerName}</span>
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
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group border border-gray-100 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Status Badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
          {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
        </div>

        {/* Catalogue Button */}
        {user && onCatalogueToggle && (
          <button
            onClick={handleCatalogueClick}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
              isInCatalogue
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-white/90 text-gray-600 hover:bg-primary-600 hover:text-white shadow-lg'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        )}

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3 bg-primary-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
          {formatPrice(property.price)}
        </div>

        {/* Schedule Viewing Button */}
        {onScheduleViewing && (
          <button
            onClick={handleScheduleViewing}
            className="absolute bottom-3 right-3 bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            <Calendar className="w-3 h-3 inline mr-1" />
            Schedule Viewing
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
          {property.title}
        </h3>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{property.location}</span>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {property.description}
        </p>

        {/* Property Details */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center">
              <Square className="w-4 h-4 mr-1" />
              <span>{property.area} sqft</span>
            </div>
          </div>
        </div>

        {/* Stats for Lister View */}
        {showStats && (
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              <span>{property.views} views</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              <span>{property.offers} offers</span>
            </div>
          </div>
        )}

        {/* Lister Info */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            <span className="block">Listed by</span>
            <span className="font-medium text-gray-900">{property.listerName}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
