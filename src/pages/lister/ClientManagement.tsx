import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Calendar, Search, Filter, Eye, Phone, Mail, Clock, User, MapPin, CheckCircle, XCircle, RotateCcw, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProperty } from '../../contexts/PropertyContext';

interface ClientQuery {
  id: string;
  propertyId: string;
  propertyTitle: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  message: string;
  type: 'inquiry' | 'viewing' | 'offer';
  status: 'new' | 'responded' | 'closed';
  createdAt: Date;
}

interface ScheduledViewing {
  id: string;
  propertyId: string;
  propertyTitle: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  message?: string;
  createdAt: Date;
}

export const ClientManagement: React.FC = () => {
  const { user } = useAuth();
  const { getPropertiesByLister } = useProperty();
  const [activeTab, setActiveTab] = useState<'queries' | 'viewings'>('queries');
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);

  const listerProperties = getPropertiesByLister(user?.id || '');

  // Mock data for client queries
  const clientQueries: ClientQuery[] = [
    {
      id: '1',
      propertyId: '1',
      propertyTitle: 'Modern Downtown Apartment',
      clientName: 'John Smith',
      clientEmail: 'john@example.com',
      clientPhone: '+1-555-0123',
      message: 'I am very interested in this property. Can we schedule a viewing this weekend?',
      type: 'viewing',
      status: 'new',
      createdAt: new Date('2024-01-15T10:30:00')
    },
    {
      id: '2',
      propertyId: '2',
      propertyTitle: 'Luxury Family Villa',
      clientName: 'Sarah Johnson',
      clientEmail: 'sarah@example.com',
      message: 'What are the monthly maintenance fees for this property?',
      type: 'inquiry',
      status: 'responded',
      createdAt: new Date('2024-01-14T15:45:00')
    }
  ];

  // Mock data for scheduled viewings
  const scheduledViewings: ScheduledViewing[] = [
    {
      id: '1',
      propertyId: '1',
      propertyTitle: 'Modern Downtown Apartment',
      clientName: 'John Smith',
      clientEmail: 'john@example.com',
      clientPhone: '+1-555-0123',
      date: '2024-01-20',
      time: '14:00',
      status: 'scheduled',
      message: 'Looking forward to seeing the property',
      createdAt: new Date('2024-01-15T10:30:00')
    },
    {
      id: '2',
      propertyId: '2',
      propertyTitle: 'Luxury Family Villa',
      clientName: 'Mike Davis',
      clientEmail: 'mike@example.com',
      date: '2024-01-18',
      time: '10:00',
      status: 'completed',
      createdAt: new Date('2024-01-12T09:20:00')
    }
  ];

  // Group queries and viewings by property
  const getPropertyStats = () => {
    const stats: { [key: string]: { queries: number; viewings: number; property: any } } = {};
    
    listerProperties.forEach(property => {
      stats[property.id] = {
        queries: clientQueries.filter(q => q.propertyId === property.id).length,
        viewings: scheduledViewings.filter(v => v.propertyId === property.id).length,
        property
      };
    });
    
    return stats;
  };

  const propertyStats = getPropertyStats();

  const handleContactClient = (client: any) => {
    setSelectedContact(client);
    setShowContactModal(true);
  };

  const handleViewingAction = (viewingId: string, action: 'accept' | 'reject' | 'extend') => {
    console.log(`${action} viewing:`, viewingId);
    // Here you would update the viewing status
    alert(`Viewing ${action}ed successfully!`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'responded':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'closed':
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'inquiry':
        return 'bg-yellow-100 text-yellow-800';
      case 'viewing':
        return 'bg-blue-100 text-blue-800';
      case 'offer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl">
            <Users className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Client Management</h1>
            <p className="text-gray-600">Manage client queries and scheduled viewings</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="flex items-center justify-between">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">
                {clientQueries.filter(q => q.status === 'new').length} New Queries
              </h2>
              <p className="text-blue-100 text-lg">
                {scheduledViewings.filter(v => v.status === 'scheduled').length} upcoming viewings scheduled
              </p>
            </div>
            <Users className="h-16 w-16 text-blue-200" />
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex space-x-2 bg-gray-100 rounded-xl p-2 w-fit">
          <button
            onClick={() => setActiveTab('queries')}
            className={`flex items-center space-x-3 px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
              activeTab === 'queries'
                ? 'bg-white text-blue-600 shadow-lg'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Client Queries</span>
          </button>
          <button
            onClick={() => setActiveTab('viewings')}
            className={`flex items-center space-x-3 px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
              activeTab === 'viewings'
                ? 'bg-white text-blue-600 shadow-lg'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span>Scheduled Viewings</span>
          </button>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              {activeTab === 'queries' ? (
                <>
                  <option value="new">New</option>
                  <option value="responded">Responded</option>
                  <option value="closed">Closed</option>
                </>
              ) : (
                <>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </>
              )}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div variants={itemVariants}>
        {!selectedProperty ? (
          /* Property Overview */
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {activeTab === 'queries' ? 'Properties with Queries' : 'Properties with Scheduled Viewings'}
            </h3>
            {Object.entries(propertyStats).map(([propertyId, stats]) => {
              const count = activeTab === 'queries' ? stats.queries : stats.viewings;
              if (count === 0) return null;
              
              return (
                <motion.div
                  key={propertyId}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedProperty(propertyId)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 cursor-pointer border border-gray-100 hover:border-blue-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={stats.property.images[0]}
                        alt={stats.property.title}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{stats.property.title}</h3>
                        <p className="text-gray-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {stats.property.location}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-xl font-bold text-lg">
                        {count} {activeTab === 'queries' ? 'Queries' : 'Viewings'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Detailed View */
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {propertyStats[selectedProperty]?.property.title} - {activeTab === 'queries' ? 'Queries' : 'Viewings'}
              </h3>
              <button
                onClick={() => setSelectedProperty(null)}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {activeTab === 'queries' ? (
              clientQueries
                .filter(q => q.propertyId === selectedProperty)
                .map((query) => (
                <motion.div
                  key={query.id}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(query.type)}`}>
                          {query.type.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(query.status)}`}>
                          {query.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-gray-600 mb-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-5 w-5" />
                          <span className="font-medium">{query.clientName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-5 w-5" />
                          <span>{query.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <p className="text-gray-800 leading-relaxed">{query.message}</p>
                  </div>

                  <div className="flex items-center justify-end space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleContactClient(query)}
                      className="px-6 py-3 text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 font-bold"
                    >
                      Contact Client
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-bold shadow-lg hover:shadow-blue-500/25"
                    >
                      Respond
                    </motion.button>
                  </div>
                </motion.div>
              ))
            ) : (
              scheduledViewings
                .filter(v => v.propertyId === selectedProperty)
                .map((viewing) => (
                <motion.div
                  key={viewing.id}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(viewing.status)}`}>
                          {viewing.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-gray-600 mb-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-5 w-5" />
                          <span className="font-medium">{viewing.clientName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-5 w-5" />
                          <span>{viewing.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-bold text-blue-900 text-lg">
                          {new Date(viewing.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-blue-700 text-lg">
                          {new Date(`2000-01-01T${viewing.time}`).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit', 
                            hour12: true 
                          })}
                        </p>
                      </div>
                      <Calendar className="h-10 w-10 text-blue-600" />
                    </div>
                    {viewing.message && (
                      <div className="pt-4 border-t border-blue-200">
                        <p className="text-blue-800">{viewing.message}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleContactClient(viewing)}
                      className="px-6 py-3 text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 font-bold"
                    >
                      Contact Client
                    </motion.button>
                    
                    {viewing.status === 'scheduled' && (
                      <div className="flex items-center space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewingAction(viewing.id, 'accept')}
                          className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300 font-bold flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Accept
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewingAction(viewing.id, 'extend')}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-all duration-300 font-bold flex items-center gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Extend
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewingAction(viewing.id, 'reject')}
                          className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 font-bold flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </motion.div>

      {/* Contact Modal */}
      {showContactModal && selectedContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Contact Information</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <User className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">{selectedContact.clientName}</p>
                  <p className="text-sm text-gray-600">Client Name</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <Mail className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">{selectedContact.clientEmail}</p>
                  <p className="text-sm text-gray-600">Email Address</p>
                </div>
              </div>

              {selectedContact.clientPhone && (
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                  <Phone className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedContact.clientPhone}</p>
                    <p className="text-sm text-gray-600">Phone Number</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-4 mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open(`mailto:${selectedContact.clientEmail}`)}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-green-500/25 flex items-center justify-center gap-2"
              >
                <Mail className="h-5 w-5" />
                Email
              </motion.button>
              {selectedContact.clientPhone && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.open(`tel:${selectedContact.clientPhone}`)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  <Phone className="h-5 w-5" />
                  Call
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};