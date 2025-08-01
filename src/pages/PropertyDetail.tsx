import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Bed, Bath, Square, ShoppingCart, Share2,
  Mail, Calendar, ChevronLeft, ChevronRight, User, Heart, X,
  Loader2, Eye, Star, Wifi, Car, Shield, Trees,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  useProperty,
  useScheduleViewing,
  useUserPreferences,
  useToggleCatalogue,
  useToggleFavorite,
  useIncrementPropertyView // Your hook for view incrementing
} from '../hooks/useProperties';

// Your original Modal Component is preserved
const Modal: React.FC<{ title: string, onClose: () => void, children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <motion.div 
      initial={{scale: 0.9, opacity: 0}} 
      animate={{scale: 1, opacity: 1}} 
      transition={{duration: 0.2}} 
      className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5 relative" 
      onClick={e => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X size={20}/>
          </button>
      </div>
      {children}
    </motion.div>
  </div>
);


export const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: property, isLoading, error } = useProperty(id!);
  const { data: preferences, refetch: refetchPreferences } = useUserPreferences();
  const catalogueProperties = preferences?.catalogueProperties || [];
  const favoriteProperties = preferences?.favoriteProperties || [];
  const toggleCatalogue = useToggleCatalogue();
  const toggleFavorite = useToggleFavorite();
  const scheduleViewing = useScheduleViewing();
  const incrementView = useIncrementPropertyView(); // Using your hook

  // All your original state is preserved
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

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

  // --- FIX FOR VIEW COUNT ---
  // This is the only part of the logic that has been changed.
  // Think of `sessionStorage` as a short-term memory for a browser tab.
  // We check this memory first. If we haven't seen this property ID before in this
  // session, we increment the view count in the database and then add the ID to our
  // memory. If we *have* seen it, we do nothing.
  useEffect(() => {
    if (id) {
      const viewedProperties = JSON.parse(sessionStorage.getItem('viewedProperties') || '[]');
      if (!viewedProperties.includes(id)) {
        incrementView.mutate(id);
        viewedProperties.push(id);
        sessionStorage.setItem('viewedProperties', JSON.stringify(viewedProperties));
      }
    }
  }, [id, incrementView]);

  useEffect(() => {
    if (user) {
      refetchPreferences();
    }
  }, [user, refetchPreferences]);

  // Your original transformation logic is preserved
  const transformedProperty = property ? {
    ...property,
    id: property.id || '',
    title: property.title || '',
    description: property.description || '',
    price: property.price || 0,
    location: property.location || '',
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    area: property.area || 0,
    type: property.type || 'house' as 'house' | 'apartment' | 'condo' | 'villa',
    status: property.status || 'available' as 'available' | 'pending' | 'sold',
    imageUrls: property.imageUrls?.filter((url): url is string => !!url) || [],
    ownerId: property.ownerId || '',
    listerName: property.listerName || 'Anonymous',
    listerEmail: property.listerEmail || '',
    listerPhone: property.listerPhone || '',
    createdAt: property.createdAt || new Date().toISOString(),
    views: property.views || 0,
    features: property.features?.filter((feature): feature is string => !!feature) || [],
  } : null;

  const isInCatalogue = catalogueProperties.includes(transformedProperty?.id || '');
  const isFavorite = favoriteProperties.includes(transformedProperty?.id || '');

  // All your handler functions are preserved
  const handleToggleAction = async (action: 'catalogue' | 'favorite') => {
    if (!transformedProperty) return;
    const mutation = action === 'catalogue' ? toggleCatalogue : toggleFavorite;
    try {
      await mutation.mutateAsync(transformedProperty.id);
      setTimeout(() => refetchPreferences(), 100);
    } catch (e) {
      console.error(`Error toggling ${action}:`, e);
      refetchPreferences();
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transformedProperty) return;

    try {
      await scheduleViewing.mutateAsync({
        propertyId: transformedProperty.id,
        propertyOwnerId: transformedProperty.ownerId,
        scheduledAt: new Date(`${scheduleForm.date}T${scheduleForm.time}`).toISOString(),
        message: scheduleForm.message,
      });

      alert('Viewing scheduled successfully!');
      setShowScheduleModal(false);
    } catch (err) {
      console.error('Error scheduling viewing:', err);
      alert('Failed to schedule viewing.');
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transformedProperty) return;
    try {
      console.log('Contact form submitted:', contactForm);
      alert('Message sent successfully!');
      setShowContactForm(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message.');
    }
  };

  const nextImage = () => {
    if (transformedProperty?.imageUrls.length) {
      setCurrentImageIndex(p => (p + 1) % transformedProperty.imageUrls.length);
    }
  };

  const prevImage = () => {
    if (transformedProperty?.imageUrls.length) {
      setCurrentImageIndex(p => (p - 1 + transformedProperty.imageUrls.length) % transformedProperty.imageUrls.length);
    }
  };

  // All your helper functions and JSX are preserved exactly as they were.
  const formatPrice = (price: number) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(price);

  const getStatusColor = (status: string) => ({
    available: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    sold: 'bg-red-100 text-red-800 border-red-200',
  }[status] || 'bg-gray-100 text-gray-800 border-gray-200');

  const getFeatureIcon = (feature: string) => {
    const lower = feature.toLowerCase();
    if (lower.includes('wifi')) return Wifi;
    if (lower.includes('parking')) return Car;
    if (lower.includes('security')) return Shield;
    if (lower.includes('garden')) return Trees;
    return Star;
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center text-center">
      <div>
        <Loader2 className="h-10 w-10 text-primary-600 mx-auto animate-spin mb-4" />
        <h2 className="text-lg font-semibold text-gray-900">Loading Property...</h2>
      </div>
    </div>
  );

  if (error || !transformedProperty) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center text-center p-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
        <p className="text-gray-600 mb-6">This property may not exist or has been removed.</p>
        <div className="flex justify-center gap-4">
          <button onClick={() => navigate('/user/properties')} className="bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 text-sm font-semibold">View Properties</button>
          <button onClick={() => navigate(-1)} className="border-2 border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-semibold">Go Back</button>
        </div>
      </div>
    </div>
  );

  const images = transformedProperty.imageUrls;
  const mainImage = images.length > 0 ? images[currentImageIndex] : 'https://via.placeholder.com/1200x800.png?text=No+Image+Available';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"><ArrowLeft size={18} /> Back</button>
          <div className="flex items-center gap-2">
            <button onClick={() => alert('Share functionality coming soon!')} className="p-2 rounded-full border border-gray-300 hover:bg-gray-100"><Share2 size={18} /></button>
            {user && <>
              <button onClick={() => handleToggleAction('favorite')} className={`p-2 rounded-full border ${isFavorite ? 'bg-red-50 border-red-200 text-red-500' : 'hover:bg-gray-100 border-gray-300'}`}><Heart size={18} className={isFavorite ? 'fill-current' : ''} /></button>
              <button onClick={() => handleToggleAction('catalogue')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${isInCatalogue ? 'bg-primary-50 border-primary-200 text-primary-600' : 'hover:bg-gray-100 border-gray-300'}`}><ShoppingCart size={16} /> {isInCatalogue ? 'In Catalogue' : 'Add'}</button>
            </>}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative h-80 lg:h-[480px] rounded-2xl overflow-hidden shadow-xl group">
              <img src={mainImage} alt={transformedProperty.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer" onClick={() => setShowImageModal(true)} />
              {images.length > 1 && <>
                <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white"><ChevronLeft size={20} /></button>
                <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white"><ChevronRight size={20} /></button>
              </>}
              <div className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(transformedProperty.status)}`}>{transformedProperty.status}</div>
              <div className="absolute top-3 right-3 px-2.5 py-1 text-xs bg-black/50 text-white rounded-full flex items-center gap-1.5"><Eye size={14} />{transformedProperty.views}</div>
            </motion.div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 md:grid-cols-7 gap-2 mt-3">
                {images.slice(0, 7).map((img, i) => (
                  <button key={i} onClick={() => setCurrentImageIndex(i)} className={`h-20 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === i ? 'border-primary-500 ring-2 ring-primary-200' : 'border-transparent hover:border-gray-300'}`}>
                    <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-5">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white/80 backdrop-blur-lg p-5 rounded-2xl shadow-lg border border-gray-200/50">
              <h1 className="text-2xl font-bold text-gray-900">{transformedProperty.title}</h1>
              <p className="flex items-center gap-2 text-gray-500 mt-1 text-sm"><MapPin size={16} /> {transformedProperty.location}</p>
              <p className="text-3xl font-bold text-primary-600 my-3">{formatPrice(transformedProperty.price)}</p>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div className="p-2.5 bg-gray-100 rounded-lg"><Bed className="mx-auto mb-1 h-5 w-5 text-gray-600" />{transformedProperty.bedrooms} Beds</div>
                <div className="p-2.5 bg-gray-100 rounded-lg"><Bath className="mx-auto mb-1 h-5 w-5 text-gray-600" />{transformedProperty.bathrooms} Baths</div>
                <div className="p-2.5 bg-gray-100 rounded-lg"><Square className="mx-auto mb-1 h-5 w-5 text-gray-600" />{transformedProperty.area} sqft</div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white/80 backdrop-blur-lg p-5 rounded-2xl shadow-lg border border-gray-200/50">
              <h3 className="text-lg font-bold mb-3">Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {user && <button onClick={() => setShowScheduleModal(true)} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold text-sm"> <Calendar size={16} /> Schedule Viewing</button>}
                <button onClick={() => setShowContactForm(true)} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-semibold text-sm"><Mail size={16} /> Contact Lister</button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white/80 backdrop-blur-lg p-5 rounded-2xl shadow-lg border border-gray-200/50">
              <h3 className="text-lg font-bold mb-3">Listed By</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center"><User className="text-primary-600" /></div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{transformedProperty.listerName}</p>
                  <p className="text-xs text-gray-500">{transformedProperty.listerEmail}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white/80 backdrop-blur-lg p-5 rounded-2xl shadow-lg border border-gray-200/50">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2"><Star size={20} /> Features</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              {transformedProperty.features.map(f => <div key={f} className="flex items-center gap-2 p-2 bg-gray-100 rounded-md"><div className="p-1 bg-primary-100 text-primary-600 rounded-full">{React.createElement(getFeatureIcon(f), { size: 14 })}</div> {f}</div>)}
            </div>
          </div>
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-lg p-5 rounded-2xl shadow-lg border border-gray-200/50">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2"><MessageCircle size={20} /> Description</h2>
            <p className="text-gray-700 leading-relaxed text-sm">{transformedProperty.description}</p>
          </div>
        </div>
      </main>

      {/* Your original modals are preserved */}
      {showScheduleModal && (
        <Modal title="Schedule Viewing" onClose={() => setShowScheduleModal(false)}>
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
        </Modal>
      )}
       {showContactForm && (
        <Modal title="Contact Lister" onClose={() => setShowContactForm(false)}>
          <form onSubmit={handleContactSubmit} className="space-y-3 text-sm">
            <input type="text" placeholder="Name" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} className="w-full p-2 border rounded-md" required />
            <input type="email" placeholder="Email" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} className="w-full p-2 border rounded-md" required />
            <input type="tel" placeholder="Phone (Optional)" value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})} className="w-full p-2 border rounded-md" />
            <textarea placeholder="Your message..." value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} className="w-full p-2 border rounded-md h-28"></textarea>
            <button type="submit" className="w-full py-2 bg-primary-600 text-white rounded-md font-semibold hover:bg-primary-700">Send</button>
          </form>
        </Modal>
      )}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowImageModal(false)}>
            <img src={mainImage} className="max-w-full max-h-full rounded-lg shadow-2xl" />
             <button onClick={() => setShowImageModal(false)} className="absolute top-4 right-4 p-2 bg-white/80 rounded-full text-black"><X/></button>
        </div>
      )}
    </motion.div>
  );
};
export default PropertyDetail;
