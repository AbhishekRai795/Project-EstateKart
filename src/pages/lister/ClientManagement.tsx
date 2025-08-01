import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Filter, 
  Search, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye
} from 'lucide-react'; // FIXED: Removed unused imports (MessageSquare, Users, MapPin, User)
import { useListerViewings, useUpdateViewing } from '../../hooks/useProperties';
import { ClientList } from '../../components/lister/ClientList';

export const ClientManagement: React.FC = () => {
  const { data: scheduledViewings = [], isLoading, error, refetch } = useListerViewings();
  const updateViewing = useUpdateViewing();
  
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Filter and search viewings with time range
  const filteredViewings = useMemo(() => {
    return scheduledViewings.filter(viewing => {
      const status = viewing.status || 'scheduled';
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      const matchesSearch = !searchQuery || 
        viewing.property?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        viewing.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        viewing.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        viewing.message?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Time range filtering
      let matchesTimeRange = true;
      if (selectedTimeRange !== 'all') {
        const viewingDate = new Date(viewing.scheduledAt);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (selectedTimeRange) {
          case 'today':
            const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
            matchesTimeRange = viewingDate >= startOfToday && viewingDate < endOfToday;
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesTimeRange = viewingDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesTimeRange = viewingDate >= monthAgo;
            break;
        }
      }
      
      return matchesStatus && matchesSearch && matchesTimeRange;
    });
  }, [scheduledViewings, statusFilter, searchQuery, selectedTimeRange]);

  // Analytics
  const analytics = useMemo(() => {
    const scheduled = scheduledViewings.filter(v => (v.status || 'scheduled') === 'scheduled').length;
    const completed = scheduledViewings.filter(v => v.status === 'completed').length;
    const cancelled = scheduledViewings.filter(v => v.status === 'cancelled').length;
    const total = scheduledViewings.length;
    
    // Upcoming viewings (scheduled for today or future)
    const now = new Date();
    const upcoming = scheduledViewings.filter(v => 
      (v.status || 'scheduled') === 'scheduled' && new Date(v.scheduledAt) > now
    ).length;

    // Recent activity (last 7 days)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = scheduledViewings.filter(v => 
      new Date(v.scheduledAt) >= weekAgo
    ).length;
    
    return {
      total,
      scheduled,
      completed,
      cancelled,
      upcoming,
      recentActivity,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [scheduledViewings]);

  const handleUpdateStatus = async (id: string, status: 'completed' | 'cancelled', notes?: string) => {
    try {
      await updateViewing.mutateAsync({ id, status, notes });
      refetch();
    } catch (error) {
      console.error('Failed to update viewing status:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-slate-600 text-lg font-medium">Loading client management...</p>
              <p className="text-slate-500 text-sm">Fetching your viewing data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Failed to load client data</h2>
              <p className="text-slate-600 mb-6">There was an error loading your client information.</p>
              <button
                onClick={() => refetch()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Modern Header */}
        <motion.div variants={itemVariants} className="text-center lg:text-left">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-3">
                Client Management
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl">
                Streamline your property viewings and client interactions with our comprehensive management system
              </p>
            </div>
            <div className="mt-6 lg:mt-0 flex items-center space-x-4">
              <div className="bg-white px-4 py-2 rounded-full shadow-sm border">
                <span className="text-sm font-medium text-slate-700">
                  {filteredViewings.length} Active
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modern Analytics Grid */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Viewings</p>
                  <p className="text-2xl font-bold text-slate-900">{analytics.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Upcoming</p>
                  <p className="text-2xl font-bold text-amber-600">{analytics.upcoming}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-emerald-600">{analytics.completed}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{analytics.cancelled}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Success Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.completionRate}%</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">This Week</p>
                  <p className="text-2xl font-bold text-purple-600">{analytics.recentActivity}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modern Filters */}
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search by property, client, or message..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
              
              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Time Range Filter */}
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-slate-400" />
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                  className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="text-sm text-slate-600 font-medium whitespace-nowrap">
                {filteredViewings.length} of {scheduledViewings.length} viewings
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modern Viewings List */}
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center">
                    <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                    Property Viewings
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Manage all your scheduled property viewings
                  </p>
                </div>
                {scheduledViewings.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-700">Live Updates</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {scheduledViewings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No viewings scheduled</h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    Your property viewings will appear here once clients start scheduling appointments
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                      Share Property Links
                    </button>
                    <button className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium">
                      View Properties
                    </button>
                  </div>
                </div>
              ) : (
                <ClientList 
                  viewings={filteredViewings} 
                  onUpdateStatus={handleUpdateStatus} 
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Footer */}
        {scheduledViewings.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Quick Insights</h3>
                  <p className="text-blue-100">
                    You have {analytics.upcoming} upcoming viewings and a {analytics.completionRate}% completion rate
                  </p>
                </div>
                <div className="mt-4 lg:mt-0 flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-xl">{analytics.scheduled}</div>
                    <div className="text-blue-200">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-xl">{analytics.completed}</div>
                    <div className="text-blue-200">Completed</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
