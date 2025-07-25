import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Calendar, Search, Filter, Eye, Phone, Mail, Clock, User, MapPin } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
          <div className="bg-primary-100 p-3 rounded-lg">
            <Users className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
            <p className="text-gray-600">Manage client queries and scheduled viewings</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                {clientQueries.filter(q => q.status === 'new').length} New Queries
              </h2>
              <p className="text-primary-100">
                {scheduledViewings.filter(v => v.status === 'scheduled').length} upcoming viewings scheduled
              </p>
            </div>
            <Users className="h-12 w-12 text-primary-200" />
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('queries')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'queries'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Client Queries</span>
          </button>
          <button
            onClick={() => setActiveTab('viewings')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'viewings'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Scheduled Viewings</span>
          </button>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
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
        {activeTab === 'queries' ? (
          /* Client Queries */
          <div className="space-y-6">
            {clientQueries.length > 0 ? (
              clientQueries.map((query) => (
                <motion.div
                  key={query.id}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{query.propertyTitle}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(query.type)}`}>
                          {query.type.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(query.status)}`}>
                          {query.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{query.clientName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{query.clientEmail}</span>
                        </div>
                        {query.clientPhone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-4 w-4" />
                            <span>{query.clientPhone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{query.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-gray-800">{query.message}</p>
                  </div>

                  <div className="flex items-center justify-end space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium"
                    >
                      View Property
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                    >
                      Respond
                    </motion.button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No queries found</h3>
                <p className="text-gray-600">No client queries match your current filters</p>
              </div>
            )}
          </div>
        ) : (
          /* Scheduled Viewings */
          <div className="space-y-6">
            {scheduledViewings.length > 0 ? (
              scheduledViewings.map((viewing) => (
                <motion.div
                  key={viewing.id}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{viewing.propertyTitle}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viewing.status)}`}>
                          {viewing.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{viewing.clientName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{viewing.clientEmail}</span>
                        </div>
                        {viewing.clientPhone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-4 w-4" />
                            <span>{viewing.clientPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-primary-900">
                          {new Date(viewing.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-primary-700">
                          {new Date(`2000-01-01T${viewing.time}`).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit', 
                            hour12: true 
                          })}
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-primary-600" />
                    </div>
                    {viewing.message && (
                      <div className="mt-3 pt-3 border-t border-primary-200">
                        <p className="text-primary-800 text-sm">{viewing.message}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium"
                    >
                      View Property
                    </motion.button>
                    {viewing.status === 'scheduled' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                      >
                        Contact Client
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No viewings found</h3>
                <p className="text-gray-600">No scheduled viewings match your current filters</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};