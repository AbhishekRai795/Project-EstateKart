import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Calendar, Search, Filter, Phone, Mail, Clock, User, MapPin, CheckCircle, XCircle, X, Loader2, AlertTriangle, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getReceivedQueries, updateQueryStatus } from '../../services/clientQueryService';
// --- CHANGE: Import Amplify client and types ---
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { propertyService } from '../../services/propertyService';

// --- CHANGE: Initialize the Amplify Data client ---
const client = generateClient<Schema>();

// Enhanced types with proper image handling
type ClientQueryWithProperty = Schema['ClientQuery']['type'] & {
  property?: (Schema['Property']['type'] & {
    imageUrls?: string[];
  }) | null;
};

// Corrected type for ScheduledViewingWithDetails to include all possible statuses
type ViewingStatus = 'scheduled' | 'completed' | 'cancelled' | 'accepted' | 'rejected';

type ScheduledViewingWithDetails = Omit<Schema['PropertyViewing']['type'], 'status' | 'user' | 'property'> & {
  status?: ViewingStatus | null;
  property?: (Schema['Property']['type'] & {
    imageUrls?: string[];
  }) | null;
  user?: (Schema['User']['type']) | null; // Use the full User type from the schema
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string | null;
};

export const ClientManagement: React.FC = () => {
  const { user } = useAuth();

  // --- State Management ---
  const [clientQueries, setClientQueries] = useState<ClientQueryWithProperty[]>([]);
  const [scheduledViewings, setScheduledViewings] = useState<ScheduledViewingWithDetails[]>([]);
  const [listerProperties, setListerProperties] = useState<(Schema['Property']['type'] & { imageUrls?: string[] })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'queries' | 'viewings'>('queries');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedQuery, setSelectedQuery] = useState<ClientQueryWithProperty | null>(null);

  // --- Data Fetching (Simplified) ---
  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [propertiesData, queriesData, viewingsData] = await Promise.all([
        propertyService.getPropertiesByOwner(user.id),
        getReceivedQueries(user.id),
        propertyService.getListerViewings(user.id),
      ]);

      const enrichedQueries = queriesData.map((query) => ({
        ...query,
        property: propertiesData.find((p) => p.id === query.propertyId) || null,
      }));

      // --- FIX: Explicitly fetch full user profiles for each viewing ---
      // 1. Get unique user IDs from all viewings
      const userIds = [...new Set(viewingsData.map(v => v.userId).filter(id => !!id))];
      
      // 2. Fetch all unique user profiles in parallel
      let userProfilesMap = new Map<string, Schema['User']['type']>();
      if (userIds.length > 0) {
        const userProfilePromises = userIds.map(id => client.models.User.get({ id }));
        const userProfileResults = await Promise.all(userProfilePromises);
        userProfileResults.forEach(result => {
          if (result.data) {
            userProfilesMap.set(result.data.id, result.data);
          }
        });
      }

      // 3. Enrich viewings with the fetched user profiles
      const enrichedViewings: ScheduledViewingWithDetails[] = viewingsData.map((viewing) => {
        const property = propertiesData.find((p) => p.id === viewing.propertyId);
        const userProfile = userProfilesMap.get(viewing.userId); // Get the full profile from our map

        // Use the full name from the fetched profile, with fallbacks
        const clientName = userProfile?.name || userProfile?.username || 'Unknown Client';
        const clientEmail = userProfile?.email || 'No email available';
        const clientPhone = userProfile?.phone || null;
        
        return {
          ...viewing,
          status: viewing.status as ViewingStatus,
          property: property || null,
          user: userProfile || null, // Attach the full user object
          clientName,
          clientEmail,
          clientPhone,
        };
      });

      setListerProperties(propertiesData);
      setClientQueries(enrichedQueries as ClientQueryWithProperty[]);
      setScheduledViewings(enrichedViewings);

    } catch (err) {
      console.error("Failed to fetch client management data:", err);
      setError("Could not load data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Memoized Computations ---
  const propertyStats = useMemo(() => {
    const stats: { [key: string]: { queries: number; viewings: number; property: any } } = {};
    listerProperties.forEach(property => {
      stats[property.id] = {
        queries: clientQueries.filter(q => q.propertyId === property.id).length,
        viewings: scheduledViewings.filter(v => v.propertyId === property.id).length,
        property
      };
    });
    return stats;
  }, [listerProperties, clientQueries, scheduledViewings]);

  const bannerStats = useMemo(() => ({
    unreadQueries: clientQueries.filter(q => q.status === 'unread').length,
    upcomingViewings: scheduledViewings.filter(v => v.status === 'scheduled' || v.status === 'accepted').length,
    totalQueries: clientQueries.length
  }), [clientQueries, scheduledViewings]);

  const filteredQueries = useMemo(() => {
    return clientQueries
      .filter(item => selectedPropertyId ? item.propertyId === selectedPropertyId : true)
      .filter(item => statusFilter === 'all' ? true : item.status === statusFilter)
      .filter(item => {
        if (!searchQuery) return true;
        const lowerCaseQuery = searchQuery.toLowerCase();
        const propertyTitle = item.property?.title?.toLowerCase() || '';
        const clientName = item.clientName?.toLowerCase() || '';
        return propertyTitle.includes(lowerCaseQuery) || clientName.includes(lowerCaseQuery);
      });
  }, [clientQueries, selectedPropertyId, statusFilter, searchQuery]);

  const filteredViewings = useMemo(() => {
    return scheduledViewings
      .filter(item => selectedPropertyId ? item.propertyId === selectedPropertyId : true)
      .filter(item => statusFilter === 'all' ? true : item.status === statusFilter)
      .filter(item => {
        if (!searchQuery) return true;
        const lowerCaseQuery = searchQuery.toLowerCase();
        const propertyTitle = item.property?.title?.toLowerCase() || '';
        const clientName = item.clientName?.toLowerCase() || '';
        return propertyTitle.includes(lowerCaseQuery) || clientName.includes(lowerCaseQuery);
      });
  }, [scheduledViewings, selectedPropertyId, statusFilter, searchQuery]);


  // --- Action Handlers ---
  const handleViewingAction = async (viewingId: string, status: ViewingStatus) => {
    try {
      const { data: updatedViewing, errors } = await client.models.PropertyViewing.update({
        id: viewingId,
        status: status,
      });

      if (errors || !updatedViewing) {
        throw new Error(errors?.[0]?.message || "Failed to update viewing status.");
      }

      setScheduledViewings(prev => prev.map(v => v.id === viewingId ? { ...v, status } : v));
      alert(`Viewing has been ${status}.`);
    } catch (err: any) {
      console.error(`Failed to update viewing status:`, err);
      alert(`Error: Could not update viewing status. ${err.message}`);
    }
  };
  
  const handleQueryAction = async (queryId: string, status: 'read' | 'replied') => {
    try {
      await updateQueryStatus(queryId, status);
      setClientQueries(prev => prev.map(q => q.id === queryId ? {...q, status} : q));
      if (status === 'replied') {
        setSelectedQuery(null);
      }
      alert(`Query marked as ${status}.`);
    } catch(err) {
      console.error(`Failed to update query status:`, err);
      alert(`Error: Could not update query status.`);
    }
  };

  const handleQueryClick = async (query: ClientQueryWithProperty) => {
    setSelectedQuery(query);
    if (query.status === 'unread') {
      await handleQueryAction(query.id, 'read');
    }
  };

  const handleContactClient = (client: any) => {
    setSelectedContact(client);
    setShowContactModal(true);
  };

  // --- UI Helper Functions ---
  const getStatusColor = (status: string | null | undefined) => {
    switch (status) {
      case 'unread':
      case 'new':
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'read':
      case 'responded':
      case 'completed':
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'replied':
      case 'closed':
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-2xl mx-auto my-10">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-700">An Error Occurred</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <button 
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header and Banner (unchanged) */}
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
                {bannerStats.unreadQueries} New Queries
              </h2>
              <p className="text-blue-100 text-lg">
                {bannerStats.upcomingViewings} upcoming viewings scheduled • {bannerStats.totalQueries} total queries
              </p>
            </div>
            <Users className="h-16 w-16 text-blue-200" />
          </div>
        </div>
      </motion.div>

      {/* Stats Cards and Tabs (unchanged) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Unread Queries</p>
              <p className="text-2xl font-bold text-blue-900">{bannerStats.unreadQueries}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Upcoming Viewings</p>
              <p className="text-2xl font-bold text-green-900">{bannerStats.upcomingViewings}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total Queries</p>
              <p className="text-2xl font-bold text-purple-900">{bannerStats.totalQueries}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </motion.div>
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex space-x-2 bg-gray-100 rounded-xl p-2 w-fit">
          <button onClick={() => setActiveTab('queries')} className={`flex items-center space-x-3 px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${ activeTab === 'queries' ? 'bg-white text-blue-600 shadow-lg' : 'text-gray-600 hover:text-gray-900' }`} >
            <MessageSquare className="h-5 w-5" />
            <span>Client Queries</span>
          </button>
          <button onClick={() => setActiveTab('viewings')} className={`flex items-center space-x-3 px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${ activeTab === 'viewings' ? 'bg-white text-blue-600 shadow-lg' : 'text-gray-600 hover:text-gray-900' }`} >
            <Calendar className="h-5 w-5" />
            <span>Scheduled Viewings</span>
          </button>
        </div>
      </motion.div>

      {/* Search and Filter (unchanged) */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input type="text" placeholder={`Search ${activeTab}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
          </div>
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-500"/>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" >
              <option value="all">All Status</option>
              {activeTab === 'queries' ? (
                <>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                </>
              ) : (
                <>
                  <option value="scheduled">Scheduled</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
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
        {!selectedPropertyId ? (
          // Property List View (unchanged)
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {activeTab === 'queries' ? 'Properties with Queries' : 'Properties with Scheduled Viewings'}
            </h3>
            {Object.entries(propertyStats).map(([propertyId, stats]) => {
              const count = activeTab === 'queries' ? stats.queries : stats.viewings;
              if (count === 0) return null;
              const property = stats.property;
              const primaryImage = property.imageUrls && property.imageUrls.length > 0 ? property.imageUrls[0] : 'https://placehold.co/100x100/E2E8F0/4A5568?text=No+Image';
              return (
                <motion.div key={propertyId} whileHover={{ y: -3, scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedPropertyId(propertyId)} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 cursor-pointer border border-gray-100 hover:border-blue-200" >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img src={primaryImage} alt={property.title} className="w-20 h-20 object-cover rounded-xl border border-gray-200" onError={(e) => { const target = e.target as HTMLImageElement; target.src = 'https://placehold.co/100x100/E2E8F0/4A5568?text=No+Image'; }} />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{property.title}</h3>
                        <p className="text-gray-600 flex items-center"><MapPin className="h-4 w-4 mr-1" />{property.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-xl font-bold text-lg">{count} {activeTab === 'queries' ? 'Queries' : 'Viewings'}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          // Detailed List View
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{listerProperties.find(p => p.id === selectedPropertyId)?.title} - {activeTab === 'queries' ? 'Queries' : 'Viewings'}</h3>
              <button onClick={() => setSelectedPropertyId(null)} className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors" ><X className="h-6 w-6" /></button>
            </div>
            
            {activeTab === 'queries' ? (
              // Queries List (unchanged)
              filteredQueries.map((query) => {
                const primaryImage = query.property?.imageUrls && query.property.imageUrls.length > 0 ? query.property.imageUrls[0] : 'https://placehold.co/80x60/E2E8F0/4A5568?text=No+Image';
                return (
                  <motion.div key={query.id} whileHover={{ y: -2, scale: 1.01 }} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100" >
                    <div className="flex items-start justify-between mb-6"><div className="flex items-center space-x-3 mb-3"><span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(query.status)}`}>{query.status?.toUpperCase()}</span></div></div>
                    <div className="flex items-start space-x-4 mb-4">
                      <img src={primaryImage} alt={query.property?.title || 'Property'} className="w-16 h-12 object-cover rounded-lg border border-gray-200 flex-shrink-0" onError={(e) => { const target = e.target as HTMLImageElement; target.src = 'https://placehold.co/80x60/E2E8F0/4A5568?text=No+Image'; }} />
                      <div className="flex-1"><div className="flex items-center space-x-6 text-gray-600 mb-2"><div className="flex items-center space-x-2"><User className="h-5 w-5" /><span className="font-medium">{query.clientName}</span></div><div className="flex items-center space-x-2"><Clock className="h-5 w-5" /><span>{new Date(query.createdAt!).toLocaleDateString()}</span></div></div><div className="text-sm text-gray-500"><strong>Subject:</strong> {query.subject}</div></div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6 mb-6"><p className="text-gray-800 leading-relaxed">{query.message}</p></div>
                    <div className="flex items-center justify-end space-x-4">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleContactClient(query)} className="px-6 py-3 text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 font-bold" >Contact Client</motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleQueryClick(query)} className="px-6 py-3 text-gray-600 border-2 border-gray-600 rounded-xl hover:bg-gray-50 transition-all duration-300 font-bold" >View Details</motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleQueryAction(query.id, 'replied')} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-bold shadow-lg hover:shadow-blue-500/25" >Mark as Replied</motion.button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              // Viewings List (Updated)
              filteredViewings.map((viewing) => {
                const primaryImage = viewing.property?.imageUrls && viewing.property.imageUrls.length > 0 ? viewing.property.imageUrls[0] : 'https://placehold.co/80x60/E2E8F0/4A5568?text=No+Image';
                return (
                  <motion.div key={viewing.id} whileHover={{ y: -2, scale: 1.01 }} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100" >
                    <div className="flex items-start justify-between mb-6"><div className="flex items-center space-x-3 mb-3"><span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(viewing.status)}`}>{viewing.status?.toUpperCase()}</span></div></div>
                    <div className="flex items-start space-x-4 mb-6">
                      <img src={primaryImage} alt={viewing.property?.title || 'Property'} className="w-20 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0" onError={(e) => { const target = e.target as HTMLImageElement; target.src = 'https://placehold.co/80x60/E2E8F0/4A5568?text=No+Image'; }} />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{viewing.property?.title || 'Property Viewing'}</h3>
                        <p className="text-gray-600 mb-2">Client: {viewing.clientName}</p>
                        {viewing.clientEmail && (<p className="text-gray-500 text-sm">Email: {viewing.clientEmail}</p>)}
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-bold text-blue-900 text-lg">{new Date(viewing.scheduledAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          <p className="text-blue-700 text-lg">{new Date(viewing.scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                        </div>
                        <Calendar className="h-10 w-10 text-blue-600" />
                      </div>
                      {viewing.message && (<div className="pt-4 border-t border-blue-200"><p className="text-blue-800">{viewing.message}</p></div>)}
                    </div>
                    <div className="flex items-center justify-between">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleContactClient(viewing)} className="px-6 py-3 text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 font-bold" >Contact Client</motion.button>
                      <div className="flex items-center space-x-3">
                        {viewing.status === 'scheduled' && (
                          <>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleViewingAction(viewing.id, 'accepted')} className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300 font-bold flex items-center gap-2" >
                              <Check className="h-4 w-4" />Accept
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleViewingAction(viewing.id, 'rejected')} className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 font-bold flex items-center gap-2" >
                              <XCircle className="h-4 w-4" />Reject
                            </motion.button>
                          </>
                        )}
                        {viewing.status === 'accepted' && (
                          <>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleViewingAction(viewing.id, 'completed')} className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 font-bold flex items-center gap-2" >
                              <CheckCircle className="h-4 w-4" />Complete
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleViewingAction(viewing.id, 'cancelled')} className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 font-bold flex items-center gap-2" >
                              <XCircle className="h-4 w-4" />Cancel
                            </motion.button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </motion.div>
      {/* Query Detail Modal with Enhanced Image Display */}
      {selectedQuery && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200" >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedQuery.subject}</h2>
                  <p className="text-gray-600 mt-1">From: {selectedQuery.clientName}</p>
                </div>
                <button onClick={() => setSelectedQuery(null)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors" >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Property Information with Images */}
                {selectedQuery.property && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Property Details</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-gray-900 text-xl mb-2">{selectedQuery.property.title}</h4>
                        <p className="text-gray-600 flex items-center mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {selectedQuery.property.location}
                        </p>
                        <p className="text-2xl font-bold text-blue-600 mb-4">
                          ₹{selectedQuery.property.price.toLocaleString()}
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Bedrooms:</span>
                            <span className="ml-2">{selectedQuery.property.bedrooms}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Bathrooms:</span>
                            <span className="ml-2">{selectedQuery.property.bathrooms}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Area:</span>
                            <span className="ml-2">{selectedQuery.property.area} sq ft</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Type:</span>
                            <span className="ml-2 capitalize">{selectedQuery.property.type}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Property Images */}
                      <div>
                        {selectedQuery.property.imageUrls && selectedQuery.property.imageUrls.length > 0 ? (
                          <div className="space-y-3">
                            <img 
                              src={selectedQuery.property.imageUrls[0]} 
                              alt={selectedQuery.property.title}
                              className="w-full h-48 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://placehold.co/400x300/E2E8F0/4A5568?text=No+Image';
                              }}
                            />
                            {selectedQuery.property.imageUrls.length > 1 && (
                              <div className="grid grid-cols-3 gap-2">
                                {selectedQuery.property.imageUrls.slice(1, 4).map((imageUrl, index) => (
                                  <img 
                                    key={index}
                                    src={imageUrl} 
                                    alt={`${selectedQuery.property?.title} ${index + 2}`}
                                    className="w-full h-16 object-cover rounded border border-gray-200"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">No Images Available</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Query Message */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Client Message</h3>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
                    <p className="text-gray-800 leading-relaxed">{selectedQuery.message}</p>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{selectedQuery.clientEmail}</p>
                        <p className="text-sm text-gray-600">Email Address</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedQuery.clientPhone && (
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <Phone className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">{selectedQuery.clientPhone}</p>
                          <p className="text-sm text-gray-600">Phone Number</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Query Metadata */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedQuery.status)}`}>
                      {selectedQuery.status?.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedQuery.priority === 'high' ? 'bg-red-100 text-red-600' :
                      selectedQuery.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {selectedQuery.priority?.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Received: {new Date(selectedQuery.createdAt!).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.open(`mailto:${selectedQuery.clientEmail}?subject=Re: ${selectedQuery.subject}`)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  <Mail className="h-5 w-5" />
                  Reply via Email
                </motion.button>
                
                {selectedQuery.clientPhone && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open(`tel:${selectedQuery.clientPhone}`)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-green-500/25 flex items-center justify-center gap-2"
                  >
                    <Phone className="h-5 w-5" />
                    Call Client
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQueryAction(selectedQuery.id, 'replied')}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 rounded-xl font-bold transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  Mark as Replied
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Enhanced Contact Modal */}
      {showContactModal && selectedContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200" >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Contact Information</h3>
              <button onClick={() => setShowContactModal(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors" >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <User className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">{selectedContact.clientName || 'Unknown Client'}</p>
                  <p className="text-sm text-gray-600">Client Name</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <Mail className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">{selectedContact.clientEmail || 'No email available'}</p>
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
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => window.open(`mailto:${selectedContact.clientEmail}`)} className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-green-500/25 flex items-center justify-center gap-2" >
                <Mail className="h-5 w-5" />
                Email
              </motion.button>
              {selectedContact.clientPhone && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => window.open(`tel:${selectedContact.clientPhone}`)} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2" >
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
