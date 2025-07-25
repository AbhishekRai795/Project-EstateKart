import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  MapPin, 
  DollarSign, 
  Bed, 
  Bath, 
  Square, 
  Upload, 
  X,
  Plus,
  Save,
  ArrowLeft,
  Camera,
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProperty } from '../../contexts/PropertyContext';

// TODO: Import AWS SDK for S3 operations
// import AWS from 'aws-sdk';
// import { uploadToS3, deleteFromS3 } from '../../services/s3Service';

export const AddProperty: React.FC = () => {
  const { user } = useAuth();
  const { addProperty } = useProperty();
  const navigate = useNavigate();

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
    images: [] as string[],
    amenities: [] as string[],
    yearBuilt: '',
    parkingSpaces: '',
    furnished: false,
    petFriendly: false,
    contactPhone: '',
    contactEmail: ''
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('url');
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // TODO: Initialize AWS S3 configuration
  // const s3 = new AWS.S3({
  //   accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  //   secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  //   region: process.env.REACT_APP_AWS_REGION
  // });

  const availableAmenities = [
    'Swimming Pool', 'Gym', 'Parking', 'Garden', 'Balcony', 'Elevator',
    'Security', 'Air Conditioning', 'Heating', 'Fireplace', 'Laundry',
    'Storage', 'Terrace', 'Garage', 'Basement', 'Attic'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addImageUrl = () => {
    if (newImageUrl.trim() && !imageUrls.includes(newImageUrl.trim())) {
      setImageUrls(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (index: number) => {
    const imageToRemove = imageUrls[index];
    setImageUrls(prev => prev.filter((_, i) => i !== index));
    
    // TODO: If this is an S3 URL, delete from S3 bucket
    // if (imageToRemove.includes('s3.amazonaws.com') || imageToRemove.includes('amazonaws.com')) {
    //   const key = extractS3KeyFromUrl(imageToRemove);
    //   deleteFromS3(key).catch(console.error);
    // }
  };

  // TODO: Function to extract S3 key from URL
  // const extractS3KeyFromUrl = (url: string): string => {
  //   const urlParts = url.split('/');
  //   return urlParts.slice(-2).join('/'); // Assuming format: bucket/folder/filename
  // };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);

    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        // TODO: Validate file type and size
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
          throw new Error(`File ${file.name} is not a supported image format`);
        }

        if (file.size > maxSize) {
          throw new Error(`File ${file.name} is too large. Maximum size is 5MB`);
        }

        // TODO: Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop();
        const fileName = `properties/${user?.id}/${timestamp}-${randomString}.${fileExtension}`;

        // TODO: Upload to S3 with progress tracking
        // const uploadParams = {
        //   Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
        //   Key: fileName,
        //   Body: file,
        //   ContentType: file.type,
        //   ACL: 'public-read', // Make images publicly accessible
        //   Metadata: {
        //     'uploaded-by': user?.id || 'unknown',
        //     'property-id': 'temp', // Will be updated after property creation
        //     'upload-timestamp': timestamp.toString()
        //   }
        // };

        // Track upload progress
        const fileId = `${file.name}-${index}`;
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        // TODO: Implement S3 upload with progress
        // const upload = s3.upload(uploadParams);
        // 
        // upload.on('httpUploadProgress', (progress) => {
        //   const percentCompleted = Math.round((progress.loaded / progress.total) * 100);
        //   setUploadProgress(prev => ({ ...prev, [fileId]: percentCompleted }));
        // });
        //
        // const result = await upload.promise();
        // return result.Location; // S3 URL

        // TEMPORARY: Create object URL for preview (remove when S3 is implemented)
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            // Simulate upload progress
            let progress = 0;
            const interval = setInterval(() => {
              progress += 10;
              setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
              if (progress >= 100) {
                clearInterval(interval);
                resolve(result);
              }
            }, 100);
          };
          reader.readAsDataURL(file);
        });
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImageUrls(prev => [...prev, ...uploadedUrls]);
      
      // Clear progress tracking
      setUploadProgress({});
      
    } catch (error) {
      console.error('Error uploading images:', error);
      alert(`Error uploading images: ${error}`);
    } finally {
      setUploadingImages(false);
      // Reset file input
      event.target.value = '';
    }
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

    // TODO: Update S3 metadata with actual property ID after creation
    // const propertyId = generatePropertyId(); // Generate unique property ID
    // await updateS3Metadata(imageUrls, propertyId);

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
    navigate('/my-properties');
  };

  // TODO: Function to update S3 object metadata
  // const updateS3Metadata = async (imageUrls: string[], propertyId: string) => {
  //   const updatePromises = imageUrls
  //     .filter(url => url.includes('amazonaws.com'))
  //     .map(async (url) => {
  //       const key = extractS3KeyFromUrl(url);
  //       const copyParams = {
  //         Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
  //         CopySource: `${process.env.REACT_APP_S3_BUCKET_NAME}/${key}`,
  //         Key: key,
  //         Metadata: {
  //           'uploaded-by': user?.id || 'unknown',
  //           'property-id': propertyId,
  //           'upload-timestamp': Date.now().toString()
  //         },
  //         MetadataDirective: 'REPLACE'
  //       };
  //       
  //       return s3.copyObject(copyParams).promise();
  //     });
  //   
  //   await Promise.all(updatePromises);
  // };

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
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/my-properties')}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <div className="bg-primary-100 p-2 rounded-lg">
                <Plus className="h-6 w-6 text-primary-600" />
              </div>
              <span>Add New Property</span>
            </h1>
            <p className="text-gray-600 mt-2">Fill in the details to list your property</p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Home className="h-5 w-5 text-primary-600" />
            <span>Basic Information</span>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Describe your property in detail..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ($) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="450000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                required
              >
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
                <option value="villa">Villa</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., Downtown, New York"
                  required
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Property Details */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Square className="h-5 w-5 text-primary-600" />
            <span>Property Details</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms *
              </label>
              <div className="relative">
                <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="3"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bathrooms *
              </label>
              <div className="relative">
                <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="2"
                  min="0"
                  step="0.5"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area (sq ft) *
              </label>
              <input
                type="number"
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="1200"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Built
              </label>
              <input
                type="number"
                value={formData.yearBuilt}
                onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="2020"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parking Spaces
              </label>
              <input
                type="number"
                value={formData.parkingSpaces}
                onChange={(e) => handleInputChange('parkingSpaces', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="2"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              >
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="furnished"
                checked={formData.furnished}
                onChange={(e) => handleInputChange('furnished', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="furnished" className="ml-2 text-sm text-gray-700">
                Furnished
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="petFriendly"
                checked={formData.petFriendly}
                onChange={(e) => handleInputChange('petFriendly', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="petFriendly" className="ml-2 text-sm text-gray-700">
                Pet Friendly
              </label>
            </div>
          </div>
        </motion.div>

        {/* Images Section - Enhanced */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <ImageIcon className="h-5 w-5 text-primary-600" />
            <span>Property Images</span>
          </h2>
          
          {/* Upload Method Toggle */}
          <div className="mb-6">
            <div className="flex rounded-lg bg-gray-100 p-1 w-fit">
              <button
                type="button"
                onClick={() => setUploadMethod('url')}
                className={`flex items-center space-x-2 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                  uploadMethod === 'url'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LinkIcon className="h-4 w-4" />
                <span>Image URL</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('upload')}
                className={`flex items-center space-x-2 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                  uploadMethod === 'upload'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Camera className="h-4 w-4" />
                <span>Upload Files</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {uploadMethod === 'url' ? (
              /* URL Input Method */
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter image URL (e.g., https://images.pexels.com/...)"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={addImageUrl}
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Add
                </motion.button>
              </div>
            ) : (
              /* File Upload Method */
              <div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={uploadingImages}
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center space-y-4"
                  >
                    <div className="bg-primary-100 p-4 rounded-full">
                      <Upload className="h-8 w-8 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {uploadingImages ? 'Uploading...' : 'Upload Images'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Click to select or drag and drop images here
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Supports: JPG, PNG, WebP (Max 5MB each)
                      </p>
                    </div>
                  </label>
                </div>

                {/* Upload Progress */}
                {Object.keys(uploadProgress).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(uploadProgress).map(([fileId, progress]) => (
                      <div key={fileId} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700">{fileId.split('-')[0]}</span>
                          <span className="text-sm text-gray-500">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Image Preview Grid */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Property ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImageUrl(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-primary-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Main Image
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Image Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">📸 Image Guidelines</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• First image will be used as the main property image</li>
                <li>• Upload high-quality images for better engagement</li>
                <li>• Include exterior, interior, and key feature photos</li>
                <li>• Recommended: 5-10 images per property</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Amenities */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Amenities</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableAmenities.map((amenity) => (
              <motion.button
                key={amenity}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleAmenity(amenity)}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  selectedAmenities.includes(amenity)
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                }`}
              >
                {amenity}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="contact@example.com"
              />
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div variants={itemVariants} className="flex justify-end space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => navigate('/my-properties')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={uploadingImages}
            className="px-8 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            <span>{uploadingImages ? 'Uploading...' : 'List Property'}</span>
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
};