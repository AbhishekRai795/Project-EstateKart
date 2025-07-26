import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  MapPin, 
  DollarSign, 
  Home,
  Bath,
  Bed,
  Square,
  Calendar,
  Car,
  Check,
  ImageIcon,
  Link2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProperty } from '../../contexts/PropertyContext';

export const AddProperty: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addProperty } = useProperty();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    type: 'house' as 'house' | 'apartment' | 'condo' | 'villa',
    status: 'available' as 'available' | 'pending' | 'sold',
    yearBuilt: '',
    parkingSpaces: '',
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUploadMethod, setImageUploadMethod] = useState<'file' | 'url'>('file');

  const amenitiesList = [
    'Swimming Pool', 'Gym', 'Parking', 'Balcony', 'Garden', 'Security',
    'Elevator', 'Air Conditioning', 'Heating', 'Internet', 'Furnished',
    'Pet Friendly', 'Laundry', 'Fireplace', 'Terrace', 'Storage'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || imageUrls.length >= 5) return;

    setUploadingImages(true);
    
    for (let i = 0; i < Math.min(files.length, 5 - imageUrls.length); i++) {
      const file = files[i];
      
      // Create a local URL for preview (in real app, you'd upload to S3/Cloudinary)
      const localUrl = URL.createObjectURL(file);
      
      // For demo purposes, we'll use placeholder images
      // In production, you'd upload to your image service here
      const demoImageUrls = [
        'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'
      ];
      
      const randomImage = demoImageUrls[Math.floor(Math.random() * demoImageUrls.length)];
      setImageUrls(prev => [...prev, randomImage]);
    }
    
    setUploadingImages(false);
    e.target.value = ''; // Reset file input
  };

  const handleAddImageUrl = () => {
    if (imageInput.trim() && imageUrls.length < 5) {
      setImageUrls(prev => [...prev, imageInput.trim()]);
      setImageInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const propertyData = {
      ...formData,
      price: parseFloat(formData.price),
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      area: parseInt(formData.area),
      images: imageUrls.length > 0 ? imageUrls : [
        'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      amenities: selectedAmenities,
      listerId: user.id,
      listerName: user.name,
      yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : undefined,
      parkingSpaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces) : 0
    };

    addProperty(propertyData);
    navigate('/lister/dashboard');
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
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/lister/dashboard')}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Add New Property</h1>
            <p className="text-gray-600">Fill in the details to list your property</p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Home className="w-6 h-6 mr-3 text-primary-600" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., Modern Downtown Apartment"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none transition-all"
                placeholder="Describe your property, its features, and what makes it special..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Price *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="450000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="Downtown, New York"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                required
              >
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
                <option value="villa">Villa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              >
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Property Details */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Bed className="w-4 h-4 inline mr-1" />
                Bedrooms *
              </label>
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="3"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Bath className="w-4 h-4 inline mr-1" />
                Bathrooms *
              </label>
              <input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="2"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Square className="w-4 h-4 inline mr-1" />
                Area (sq ft) *
              </label>
              <input
                type="number"
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="1200"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Year Built
              </label>
              <input
                type="number"
                value={formData.yearBuilt}
                onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="2020"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Car className="w-4 h-4 inline mr-1" />
                Parking Spaces
              </label>
              <input
                type="number"
                value={formData.parkingSpaces}
                onChange={(e) => handleInputChange('parkingSpaces', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="2"
                min="0"
              />
            </div>
          </div>
        </motion.div>

        {/* Images - RESTORED FILE UPLOAD */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Upload className="w-6 h-6 mr-3 text-primary-600" />
            Property Images
          </h2>
          
          {/* Upload Method Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6 w-fit">
            <button
              type="button"
              onClick={() => setImageUploadMethod('file')}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                imageUploadMethod === 'file'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Upload Files
            </button>
            <button
              type="button"
              onClick={() => setImageUploadMethod('url')}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                imageUploadMethod === 'url'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Link2 className="w-4 h-4 mr-2" />
              Add URLs
            </button>
          </div>

          {/* File Upload */}
          {imageUploadMethod === 'file' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={imageUrls.length >= 5 || uploadingImages}
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer ${imageUrls.length >= 5 ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {uploadingImages ? 'Uploading...' : 'Click to upload images'}
                  </p>
                  <p className="text-gray-500">
                    PNG, JPG, JPEG up to 10MB each (Max 5 images)
                  </p>
                </label>
              </div>
            </div>
          )}

          {/* URL Input */}
          {imageUploadMethod === 'url' && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="url"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter image URL"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  disabled={!imageInput.trim() || imageUrls.length >= 5}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Image
                </button>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {imageUrls.length > 0 && (
            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Property ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500 mt-4">
            You can add up to 5 images. {imageUrls.length}/5 images added.
          </p>
        </motion.div>

        {/* Amenities */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {amenitiesList.map((amenity) => (
              <label
                key={amenity}
                className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedAmenities.includes(amenity)
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded mr-3 flex items-center justify-center ${
                  selectedAmenities.includes(amenity)
                    ? 'bg-primary-500'
                    : 'border-2 border-gray-300'
                }`}>
                  {selectedAmenities.includes(amenity) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium">{amenity}</span>
              </label>
            ))}
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name *
              </label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="John Smith"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email *
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone *
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
          </div>
        </motion.div>

        {/* Submit Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="button"
            onClick={() => navigate('/lister/dashboard')}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploadingImages}
            className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadingImages ? 'Uploading...' : 'List Property'}
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
};
