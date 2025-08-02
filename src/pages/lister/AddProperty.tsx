import React, { useState, useRef, useEffect } from 'react';
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
import { useCreateProperty } from '../../hooks/useProperties';

export const AddProperty: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createProperty = useCreateProperty();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  });

  const [images, setImages] = useState<File[]>([]);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || images.length >= 5) return;

    setUploadingImages(true);
    const newFiles = Array.from(files).slice(0, 5 - images.length);
    const newImages = [...images, ...newFiles];
    const newPreviews: string[] = [];

    newFiles.forEach(file => {
      const previewUrl = URL.createObjectURL(file);
      newPreviews.push(previewUrl);
    });

    setImages(newImages);
    setImageUrls(prev => [...prev, ...newPreviews]);
    setUploadingImages(false);
    
    if (e.target) e.target.value = '';
  };

  const handleAddImageUrl = () => {
    if (imageInput.trim() && imageUrls.length < 5) {
      setImageUrls(prev => [...prev, imageInput.trim()]);
      setImageInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    if (imageUrls[index].startsWith('blob:')) {
      URL.revokeObjectURL(imageUrls[index]);
    }
    
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  // --- CHANGE: handleSubmit now uses the authenticated user's info ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        alert("You must be logged in to list a property.");
        return;
    }

    setUploadingImages(true);

    try {
      const imagesToUpload = images.length > 0 ? images : [];

      const propertyData = {
        title: formData.title,
        description: formData.description,
        price: parseInt(formData.price),
        location: formData.location,
        type: formData.type,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        area: parseInt(formData.area),
        features: selectedAmenities,
        images: imagesToUpload,
        // Automatically use the logged-in user's details
        listerName: user.name,
        listerEmail: user.email,
        listerPhone: user.phone || '', // Use phone from user profile if available
      };

      await createProperty.mutateAsync(propertyData);

      imageUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });

      navigate('/lister/dashboard');

    } catch (error) {
      console.error('Error creating property:', error);
      alert('Error creating property. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  useEffect(() => {
    return () => {
        imageUrls.forEach(url => {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
    };
  }, [imageUrls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } }
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
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div variants={itemVariants} className="flex items-center mb-8">
          <button
            onClick={() => navigate('/lister/dashboard')}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="ml-4">
            <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
            <p className="text-gray-600 mt-1">Fill in the details to list your property</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Home className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Basic Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Title *</label>
                <input type="text" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="e.g., Modern Downtown Apartment" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none transition-all" placeholder="Describe your property, its features, and what makes it special..." required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><DollarSign className="inline h-4 w-4 mr-1" />Price *</label>
                <input type="number" value={formData.price} onChange={(e) => handleInputChange('price', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="450000" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><MapPin className="inline h-4 w-4 mr-1" />Location *</label>
                <input type="text" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="Downtown, New York" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
                <select value={formData.type} onChange={(e) => handleInputChange('type', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" required>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                  <option value="villa">Villa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all">
                  <option value="available">Available</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Property Details */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-primary-100 rounded-lg"><Square className="h-5 w-5 text-primary-600" /></div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Property Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><Bed className="inline h-4 w-4 mr-1" />Bedrooms *</label>
                <input type="number" value={formData.bedrooms} onChange={(e) => handleInputChange('bedrooms', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="3" min="0" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><Bath className="inline h-4 w-4 mr-1" />Bathrooms *</label>
                <input type="number" value={formData.bathrooms} onChange={(e) => handleInputChange('bathrooms', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="2" min="0" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><Square className="inline h-4 w-4 mr-1" />Area (sq ft) *</label>
                <input type="number" value={formData.area} onChange={(e) => handleInputChange('area', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="1200" min="0" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><Calendar className="inline h-4 w-4 mr-1" />Year Built</label>
                <input type="number" value={formData.yearBuilt} onChange={(e) => handleInputChange('yearBuilt', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="2020" min="1800" max={new Date().getFullYear()} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><Car className="inline h-4 w-4 mr-1" />Parking Spaces</label>
                <input type="number" value={formData.parkingSpaces} onChange={(e) => handleInputChange('parkingSpaces', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="2" min="0" />
              </div>
            </div>
          </motion.div>

          {/* Images */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-primary-100 rounded-lg"><ImageIcon className="h-5 w-5 text-primary-600" /></div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Property Images</h2>
            </div>
            <div className="flex items-center space-x-4 mb-6 bg-gray-100 rounded-lg p-1">
              <button type="button" onClick={() => setImageUploadMethod('file')} className={`flex items-center px-4 py-2 rounded-md transition-colors ${imageUploadMethod === 'file' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                <Upload className="h-4 w-4 mr-2" />Upload Files
              </button>
              <button type="button" onClick={() => setImageUploadMethod('url')} className={`flex items-center px-4 py-2 rounded-md transition-colors ${imageUploadMethod === 'url' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                <Link2 className="h-4 w-4 mr-2" />Add URLs
              </button>
            </div>
            {imageUploadMethod === 'file' && (
              <div className={`border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors ${images.length >= 5 || uploadingImages ? 'cursor-not-allowed opacity-50' : ''}`}>
                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" disabled={images.length >= 5 || uploadingImages} />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={images.length >= 5 || uploadingImages} className="text-primary-600 hover:text-primary-700 font-medium text-lg">
                  {uploadingImages ? 'Uploading...' : 'Click to upload images'}
                </button>
                <p className="text-gray-500 text-sm mt-2">PNG, JPG, JPEG up to 10MB each (Max 5 images)</p>
              </div>
            )}
            {imageUploadMethod === 'url' && (
              <div className="flex space-x-3">
                <input type="url" value={imageInput} onChange={(e) => setImageInput(e.target.value)} className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="Enter image URL" />
                <button type="button" onClick={handleAddImageUrl} disabled={imageUrls.length >= 5} className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Add Image</button>
              </div>
            )}
            {imageUrls.length > 0 && (
              <div className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img src={url} alt={`Property ${index + 1}`} className="w-full h-full object-cover rounded-lg border border-gray-200" />
                      <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p className="text-sm text-gray-600 mt-4">You can add up to 5 images. {imageUrls.length}/5 images added.</p>
          </motion.div>

          {/* Amenities */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-primary-100 rounded-lg"><Check className="h-5 w-5 text-primary-600" /></div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Amenities</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {amenitiesList.map((amenity: string) => (
                <label key={amenity} className="relative flex items-center cursor-pointer">
                  <input type="checkbox" checked={selectedAmenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} className="sr-only" />
                  <div className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${selectedAmenities.includes(amenity) ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}>
                    {selectedAmenities.includes(amenity) && (<Check className="h-4 w-4 text-primary-600 float-right" />)}
                    <span className="text-sm font-medium">{amenity}</span>
                  </div>
                </label>
              ))}
            </div>
          </motion.div>

          {/* Submit Buttons */}
          <motion.div variants={itemVariants} className="flex justify-end space-x-4">
            <button type="button" onClick={() => navigate('/lister/dashboard')} className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium">Cancel</button>
            <button type="submit" disabled={createProperty.isPending || uploadingImages} className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium flex items-center">
              {createProperty.isPending || uploadingImages ? (<><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>{uploadingImages ? 'Uploading...' : 'Creating...'}</>) : ('List Property')}
            </button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
};

