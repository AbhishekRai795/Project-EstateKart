import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Filter, Star, Clock, User, Mail, Phone, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Query {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'neutral' | 'negative';
  category: 'pricing' | 'viewing' | 'features' | 'location' | 'general';
  status: 'new' | 'responded' | 'closed';
  createdAt: Date;
  nlpScore: number;
  keywords: string[];
  urgencyIndicators: string[];
}

export const ListerQueries: React.FC = () => {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('priority');

  // Mock data - will be replaced with AWS Lambda API calls
  const queries: Query[] = [
    {
      id: '1',
      propertyId: 'prop1',
      propertyTitle: 'Modern Downtown Apartment',
      buyerName: 'John Smith',
      buyerEmail: 'john@example.com',
      buyerPhone: '+1-555-0123',
      message: 'I am very interested in this property and would like to schedule a viewing as soon as possible. Can we arrange something for this weekend? Also, is the price negotiable?',
      priority: 'high',
      sentiment: 'positive',
      category: 'viewing',
      status: 'new',
      createdAt: new Date('2024-01-15T10:30:00'),
      nlpScore: 0.85,
      keywords: ['interested', 'viewing', 'weekend', 'negotiable'],
      urgencyIndicators: ['as soon as possible', 'this weekend']
    },
    {
      id: '2',
      propertyId: 'prop2',
      propertyTitle: 'Luxury Family Villa',
      buyerName: 'Sarah Johnson',
      buyerEmail: 'sarah@example.com',
      message: 'Hello, I have some questions about the amenities. Does the property include a swimming pool and gym access? Also, what are the monthly maintenance fees?',
      priority: 'medium',
      sentiment: 'neutral',
      category: 'features',
      status: 'new',
      createdAt: new Date('2024-01-14T15:45:00'),
      nlpScore: 0.65,
      keywords: ['amenities', 'swimming pool', 'gym', 'maintenance fees'],
      urgencyIndicators: []
    },
    {
      id: '3',
      propertyId: 'prop1',
      propertyTitle: 'Modern Downtown Apartment',
      buyerName: 'Mike Davis',
      buyerEmail: 'mike@example.com',
      message: 'The price seems too high for the area. Are you willing to consider a lower offer? I have been looking for months and this is overpriced.',
      priority: 'low',
      sentiment: 'negative',
      category: 'pricing',
      status: 'responded',
      createdAt: new Date('2024-01-13T09:20:00'),
      nlpScore: 0.35,
      keywords: ['price', 'high', 'lower offer', 'overpriced'],
      urgencyIndicators: ['looking for months']
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'negative': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'responded': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredQueries = queries
    .filter(query => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'priority') return query.priority === 'high';
      if (selectedFilter === 'new') return query.status === 'new';
      return query.category === selectedFilter;
    })
    .filter(query => 
      query.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      query.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      query.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'nlp') {
        return b.nlpScore - a.nlpScore;
      }
      return 0;
    });

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
            <MessageSquare className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Buyer Queries</h1>
            <p className="text-gray-600">AI-powered query analysis and prioritization</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                {queries.filter(q => q.status === 'new').length} New Queries
              </h2>
              <p className="text-primary-100">
                Sorted by AI priority and sentiment analysis
              </p>
            </div>
            <MessageSquare className="h-12 w-12 text-primary-200" />
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search queries by message, buyer name, or property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="all">All Queries</option>
              <option value="new">New Only</option>
              <option value="priority">High Priority</option>
              <option value="pricing">Pricing</option>
              <option value="viewing">Viewing</option>
              <option value="features">Features</option>
              <option value="location">Location</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="priority">Sort by Priority</option>
              <option value="date">Sort by Date</option>
              <option value="nlp">Sort by AI Score</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{queries.filter(q => q.priority === 'high').length}</div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{queries.filter(q => q.sentiment === 'positive').length}</div>
            <div className="text-sm text-gray-600">Positive Sentiment</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{queries.filter(q => q.status === 'new').length}</div>
            <div className="text-sm text-gray-600">Awaiting Response</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{(queries.reduce((sum, q) => sum + q.nlpScore, 0) / queries.length * 100).toFixed(0)}%</div>
            <div className="text-sm text-gray-600">Avg AI Score</div>
          </div>
        </div>
      </motion.div>

      {/* Queries List */}
      <motion.div variants={itemVariants} className="space-y-6">
        {filteredQueries.length > 0 ? (
          filteredQueries.map((query) => (
            <motion.div
              key={query.id}
              whileHover={{ y: -2, scale: 1.01 }}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6"
            >
              {/* Query Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{query.propertyTitle}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(query.priority)}`}>
                      {query.priority.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(query.status)}`}>
                      {query.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{query.buyerName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>{query.buyerEmail}</span>
                    </div>
                    {query.buyerPhone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span>{query.buyerPhone}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{query.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {getSentimentIcon(query.sentiment)}
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">AI Score</div>
                    <div className="text-lg font-bold text-primary-600">{(query.nlpScore * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </div>

              {/* Query Message */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-800 leading-relaxed">{query.message}</p>
              </div>

              {/* AI Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Key Topics (AI Detected)</h4>
                  <div className="flex flex-wrap gap-2">
                    {query.keywords.map((keyword, index) => (
                      <span key={index} className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                
                {query.urgencyIndicators.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Urgency Indicators</h4>
                    <div className="flex flex-wrap gap-2">
                      {query.urgencyIndicators.map((indicator, index) => (
                        <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                          {indicator}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Category:</span>
                  <span className="font-medium capitalize">{query.category}</span>
                  <span>•</span>
                  <span>Sentiment:</span>
                  <span className={`font-medium capitalize ${
                    query.sentiment === 'positive' ? 'text-green-600' :
                    query.sentiment === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {query.sentiment}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
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
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No queries found</h3>
            <p className="text-gray-600">No queries match your current filters</p>
          </div>
        )}
      </motion.div>

      {/* AI Insights Panel */}
      <motion.div variants={itemVariants} className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          🤖 AI Insights & Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="bg-green-500 rounded-full p-1 mt-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-blue-900">High Engagement Properties</p>
                <p className="text-sm text-blue-700">Modern Downtown Apartment is receiving 40% more queries than average</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-yellow-500 rounded-full p-1 mt-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-blue-900">Common Concerns</p>
                <p className="text-sm text-blue-700">Most queries are about pricing and viewing schedules</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 rounded-full p-1 mt-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-blue-900">Response Time Impact</p>
                <p className="text-sm text-blue-700">Queries responded within 2 hours have 65% higher conversion</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-purple-500 rounded-full p-1 mt-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-blue-900">Sentiment Trends</p>
                <p className="text-sm text-blue-700">Overall sentiment is positive with 60% positive queries this week</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};