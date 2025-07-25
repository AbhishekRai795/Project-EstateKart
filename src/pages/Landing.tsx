import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, Heart, BarChart3, Users, MapPin, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Landing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen"
    >
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-50 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-primary-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 rounded-2xl shadow-2xl w-fit mx-auto mb-8"
            >
              <Home className="h-16 w-16 text-white" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                EstateKart
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              The modern real estate platform connecting property buyers with trusted listers. 
              Discover, manage, and analyze properties with powerful tools and insights.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={() => navigate('/properties')}
                className="bg-primary-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Search className="h-5 w-5" />
                <span>Browse Properties</span>
              </button>
              
              {!user && (
                <Link to="/auth/register">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="border-2 border-primary-500 text-primary-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-50 transition-all flex items-center space-x-2"
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span>Join EstateKart</span>
                  </motion.button>
                </Link>
              )}
              
              {user && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard')}
                  className="border-2 border-primary-500 text-primary-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-50 transition-all flex items-center space-x-2"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Lister Dashboard</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose EstateKart?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built for the modern real estate market with cutting-edge technology and user-centric design
            </p>
          </motion.div>

          

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* For Buyers */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className="bg-blue-500 p-4 rounded-xl w-fit mb-6">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Search</h3>
              <p className="text-gray-600 mb-6">
                Advanced filtering, map integration, and personalized recommendations to find your perfect property
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-blue-500" />Interactive property maps</li>
                <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-blue-500" />Save favorites & get alerts</li>
                <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-blue-500" />Compare properties side-by-side</li>
              </ul>
            </motion.div>

            {/* For Property Listers */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className="bg-primary-500 p-4 rounded-xl w-fit mb-6">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Analytics Dashboard</h3>
              <p className="text-gray-600 mb-6">
                Comprehensive insights into your property performance, viewer engagement, and market trends
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-primary-500" />Real-time view tracking</li>
                <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-primary-500" />Conversion funnel analysis</li>
                <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-primary-500" />Market comparison tools</li>
              </ul>
            </motion.div>

            {/* Platform Benefits */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className="bg-green-500 p-4 rounded-xl w-fit mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Seamless Experience</h3>
              <p className="text-gray-600 mb-6">
                Modern, intuitive interface designed for both buyers and sellers with mobile-first approach
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-green-500" />Responsive design</li>
                <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-green-500" />Secure authentication</li>
                <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-green-500" />Real-time notifications</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center text-white">
            <h2 className="text-4xl font-bold mb-12">Trusted by Thousands</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold mb-2">10K+</div>
                <div className="text-primary-100">Properties Listed</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">5K+</div>
                <div className="text-primary-100">Happy Buyers</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">2K+</div>
                <div className="text-primary-100">Trusted Listers</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">98%</div>
                <div className="text-primary-100">Satisfaction Rate</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of users who trust EstateKart for their real estate needs
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-600 transition-all shadow-lg"
                >
                  Join EstateKart
                </motion.button>
              </Link>
              <button
                onClick={() => navigate('/properties')}
                className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all"
              >
                Browse Properties
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all"
                >
                  Start as Lister
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};