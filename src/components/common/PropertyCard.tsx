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
        whileHover={{ y: -3, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        onClick={handleCardClick}
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer group border border-gray-100 hover:border-primary-200"
      >
        <div className="flex">
          {/* Image Section - Left */}
          <div className="relative w-72 h-56 flex-shrink-0 overflow-hidden">
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(property.status)} shadow-lg`}>
                {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
              </span>
            </div>

            {/* Price Badge */}
            <div className="absolute bottom-4 left-4">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-lg">
                {formatPrice(property.price)}
              </div>
            </div>
          </div>

          {/* Content Section - Right */}
          <div className="flex-1 p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                  {property.title}
                </h3>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  {user && onCatalogueToggle && (
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCatalogueClick}
                      className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary-300"
                    >
                      <ShoppingCart
                        className={`h-5 w-5 transition-colors duration-300 ${
                          isInCatalogue ? 'text-blue-500 fill-current' : 'text-gray-600'
                        }`}
                      />
                    </motion.button>
                  )}
                  
                  {onScheduleViewing && (
                    <motion.button
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleScheduleViewing}
                      className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-primary-500/25 flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Schedule Viewing
                    </motion.button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-5 w-5 mr-2 text-primary-500" />
                <span className="text-base font-medium">{property.location}</span>
              </div>

              <p className="text-gray-600 text-base mb-6 line-clamp-2 leading-relaxed">
                {property.description}
              </p>

              {/* Property Details */}
              <div className="flex items-center space-x-6 text-gray-600 mb-6">
                <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                  <Bed className="h-5 w-5 mr-2 text-primary-500" />
                  <span className="font-medium">{property.bedrooms}</span>
                </div>
                <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                  <Bath className="h-5 w-5 mr-2 text-primary-500" />
                  <span className="font-medium">{property.bathrooms}</span>
                </div>
                <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                  <Square className="h-5 w-5 mr-2 text-primary-500" />
                  <span className="font-medium">{property.area} sqft</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              {/* Stats for Lister View */}
              {showStats && (
                <div className="flex items-center space-x-6 text-gray-600">
                  <div className="flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-blue-500" />
                    <span className="font-medium">{property.views} views</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                    <span className="font-medium">{property.offers} offers</span>
                  </div>
                </div>
              )}

              {/* Lister Info */}
              <div className="text-right">
                <p className="text-sm text-gray-500">Listed by</p>
                <p className="text-base font-bold text-gray-700">{property.listerName}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer group border border-gray-100 hover:border-primary-200"
    >
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(property.status)} shadow-lg`}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </span>
        </div>

        {/* Catalogue Button */}
        {user && onCatalogueToggle && (
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCatalogueClick}
            className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary-300"
          >
            <ShoppingCart
              className={`h-5 w-5 transition-colors duration-300 ${
                isInCatalogue ? 'text-blue-500 fill-current' : 'text-gray-600'
              }`}
            />
          </motion.button>
        )}

        {/* Price Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-lg">
            {formatPrice(property.price)}
          </div>
        </div>
        
        {/* Schedule Viewing Button */}
        {onScheduleViewing && (
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleScheduleViewing}
            className="absolute bottom-4 right-4 px-4 py-2 bg-white text-primary-600 rounded-xl text-sm font-bold hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200 hover:border-primary-300 flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Schedule Viewing
          </motion.button>
        )}
      </div>

      {/* Content Section */}
      <div className="p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
          {property.title}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="h-5 w-5 mr-2 text-primary-500" />
          <span className="text-base font-medium">{property.location}</span>
        </div>

        <p className="text-gray-600 text-base mb-6 line-clamp-2 leading-relaxed">
          {property.description}
        </p>

        {/* Property Details */}
        <div className="flex items-center justify-between text-gray-600 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
              <Bed className="h-5 w-5 mr-2 text-primary-500" />
              <span className="font-medium">{property.bedrooms}</span>
            </div>
            <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
              <Bath className="h-5 w-5 mr-2 text-primary-500" />
              <span className="font-medium">{property.bathrooms}</span>
            </div>
            <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
              <Square className="h-5 w-5 mr-2 text-primary-500" />
              <span className="font-medium">{property.area} sqft</span>
            </div>
          </div>
        </div>

        {/* Stats for Lister View */}
        {showStats && (
          <div className="flex items-center justify-between text-gray-600 pt-4 border-t border-gray-100 mb-4">
            <div className="flex items-center">
              <Eye className="h-5 w-5 mr-2 text-blue-500" />
              <span className="font-medium">{property.views} views</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-500" />
              <span className="font-medium">{property.offers} offers</span>
            </div>
          </div>
        )}

        {/* Lister Info */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">Listed by</p>
          <p className="text-base font-bold text-gray-700">{property.listerName}</p>
        </div>
      </div>
    </motion.div>
  );
};