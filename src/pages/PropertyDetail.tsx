import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  ShoppingCart, 
  Share2, 
  Phone, 
  Mail, 
  Calendar,
  Car,
  Home,
  Shield,
  Wifi,
  Dumbbell,
  Trees,
  ChevronLeft,
  ChevronRight,
  Star,
  User,
  Heart
} from 'lucide-react';
import { useProperty } from '../contexts/PropertyContext';
import { useAuth } from '../contexts/AuthContext';

export const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { properties, catalogueProperties, toggleCatalogue, favorites, toggleFavorite } = useProperty();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    date: '',
    time: '',
    message: ''
  });
  const [contactForm, setContactForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    message: ''
  });

  const property = properties.find(p => p.id === id);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-primary-600 hover:text-primary-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const isInCatalogue = catalogueProperties.includes(property.id);
  const isFavorite = favorites.includes(property.id);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the contact form data to your backend
    console.log('Contact form submitted:', contactForm);
    alert('Your message has been sent to the lister!');
    setShowContactForm(false);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Schedule viewing:', scheduleForm);
    alert('Viewing scheduled successfully! The lister will contact you soon.');
    setShowScheduleModal(false);
    setScheduleForm({ 
      name: user?.name || '', 
      email: user?.email || '', 
      phone: '', 
      date: '', 
      time: '', 
      message: '' 
    });
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

  const amenityIcons: { [key: string]: any } = {
    'Swimming Pool': Trees,
    'Gym': Dumbbell,
    'Parking': Car,
    'Garden': Trees,
    'Security': Shield,
    'Air Conditioning': Home,
    'Wifi': Wifi,
    'Elevator': Home,
    'Balcony': Home,
    'Fireplace': Home,
    'Laundry': Home,
    'Storage': Home,
    'Terrace': Trees,
    'Garage': Car,
    'Basement': Home,
    'Attic': Home
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to listings</span>
            </motion.button>
            
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleCatalogue(property.id)}
                className={`p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors ${
                  isInCatalogue ? 'text-blue-500 fill-current' : 'text-gray-600'
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </motion.button>
              
              {user?.role === 'user' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleFavorite(property.id)}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <Heart
                    className={`h-5 w-5 transition-colors ${
                      isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'
                    }`}
                  />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="relative h-96 md:h-[500px]">
                <img
                  src={property.images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(property.status)}`}>
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                  </span>
                </div>

                {/* Price Badge */}
                <div className="absolute bottom-4 left-4">
                  <div className="bg-primary-500 text-white px-4 py-2 rounded-lg font-bold text-xl">
                    {formatPrice(property.price)}
                  </div>
                </div>

                {/* Navigation Arrows */}
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Image Indicators */}
                {property.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    {property.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Property Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="text-lg">{property.location}</span>
                </div>
                
                <div className="flex items-center space-x-6 text-gray-600">
                  <div className="flex items-center">
                    <Bed className="h-5 w-5 mr-2" />
                    <span>{property.bedrooms} Bedrooms</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-5 w-5 mr-2" />
                    <span>{property.bathrooms} Bathrooms</span>
                  </div>
                  <div className="flex items-center">
                    <Square className="h-5 w-5 mr-2" />
                    <span>{property.area} sqft</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-600 leading-relaxed">{property.description}</p>
              </div>
            </motion.div>

            {/* Property Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Property Features</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="bg-primary-100 p-4 rounded-lg w-fit mx-auto mb-2">
                    <Home className="h-6 w-6 text-primary-600" />
                  </div>
                  <p className="font-medium text-gray-900">{property.type.charAt(0).toUpperCase() + property.type.slice(1)}</p>
                  <p className="text-sm text-gray-600">Property Type</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-primary-100 p-4 rounded-lg w-fit mx-auto mb-2">
                    <Calendar className="h-6 w-6 text-primary-600" />
                  </div>
                  <p className="font-medium text-gray-900">2020</p>
                  <p className="text-sm text-gray-600">Year Built</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-primary-100 p-4 rounded-lg w-fit mx-auto mb-2">
                    <Car className="h-6 w-6 text-primary-600" />
                  </div>
                  <p className="font-medium text-gray-900">2</p>
                  <p className="text-sm text-gray-600">Parking Spaces</p>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['Swimming Pool', 'Gym', 'Parking', 'Garden', 'Security', 'Air Conditioning'].map((amenity) => {
                    const IconComponent = amenityIcons[amenity] || Home;
                    return (
                      <div key={amenity} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <IconComponent className="h-5 w-5 text-primary-600" />
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 sticky top-32"
            >
              <div className="text-center mb-6">
                <div className="bg-primary-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <User className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{property.listerName}</h3>
                <p className="text-gray-600">Property Lister</p>
                <div className="flex items-center justify-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">(4.8)</span>
                </div>
              </div>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowContactForm(true)}
                  className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg hover:bg-primary-600 transition-colors font-medium"
                >
                  Contact Lister
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowScheduleModal(true)}
                  className="w-full border-2 border-primary-500 text-primary-600 py-3 px-4 rounded-lg hover:bg-primary-50 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Viewing</span>
                </motion.button>

                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </motion.button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex justify-between">
                    <span>Listed on:</span>
                    <span>{new Date(property.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Property ID:</span>
                    <span>#{property.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Views:</span>
                    <span>{property.views}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Contact Lister</h3>
              <button
                onClick={() => setShowContactForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                  placeholder="I'm interested in this property..."
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </form>
          </motion.div>
        </div>
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
                <ArrowLeft className="h-6 w-6" />
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
    </div>
  );
};