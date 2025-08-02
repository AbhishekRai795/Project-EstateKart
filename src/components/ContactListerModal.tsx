import React, { useState } from 'react';
import { X, Send, User, Mail, Phone, MessageSquare, AlertCircle } from 'lucide-react';
import { createClientQuery } from '../services/clientQueryService';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentUser } from 'aws-amplify/auth';

interface ContactListerModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    title: string;
    location: string;
    price: number;
    ownerId: string;
    listerName?: string;
    listerEmail?: string;
  } | null;
}

const ContactListerModal: React.FC<ContactListerModalProps> = ({
  isOpen,
  onClose,
  property
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    clientName: user?.name || '',
    clientEmail: user?.email || '',
    clientPhone: '',
    subject: property ? `Inquiry about ${property.title}` : 'Inquiry',
    message: '',
    // The 'priority' field is removed from the state
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (property) {
      setFormData(prev => ({ ...prev, subject: `Inquiry about ${property.title}` }));
    }
  }, [property]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to contact the lister.');
      return;
    }

    if (!property) {
      setError('Property information is missing.');
      return;
    }

    if (!formData.clientName || !formData.clientEmail || !formData.message) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const currentUser = await getCurrentUser();
      const userId = currentUser.userId;

      await createClientQuery({
        propertyId: property.id,
        propertyOwnerId: property.ownerId,
        userId: userId,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone || undefined,
        subject: formData.subject,
        message: formData.message,
        // The 'priority' field is no longer passed to the service
      });

      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setFormData({
          clientName: user?.name || '',
          clientEmail: user?.email || '',
          clientPhone: '',
          subject: `Inquiry about ${property.title}`,
          message: '',
        });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Contact Lister</h2>
            <p className="text-sm text-gray-600">Send a message about this property</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 text-sm">{property.title}</h3>
          <p className="text-gray-600 text-sm">{property.location}</p>
          <p className="text-orange-600 font-bold text-sm">₹{property.price?.toLocaleString()}</p>
        </div>

        {submitted ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</h3>
            <p className="text-gray-600">Your inquiry has been sent to the property lister. They will get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Your Name *
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Your Email *
              </label>
              <input
                type="email"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Your Phone (Optional)
              </label>
              <input
                type="tel"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Subject of your inquiry"
              />
            </div>

            {/* The Priority section has been removed */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Your Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Tell the lister what you're interested in..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </div>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactListerModal;
