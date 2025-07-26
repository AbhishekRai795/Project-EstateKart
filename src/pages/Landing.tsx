import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Home, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap, 
  Heart, 
  Star,
  ArrowRight,
  Award,
  Target,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Landing: React.FC = () => {
  const { user } = useAuth();

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const features = [
    {
      icon: Search,
      title: "Smart Property Search",
      description: "Advanced AI-powered search with intelligent filters to find your perfect match",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Heart,
      title: "Save & Compare",
      description: "Build your property catalogue and compare features side-by-side",
      color: "from-red-500 to-red-600"
    },
    {
      icon: Users,
      title: "Expert Listers",
      description: "Connect with verified property professionals and trusted agents",
      color: "from-green-500 to-green-600"
    },
    {
      icon: TrendingUp,
      title: "Market Insights",
      description: "Get real-time market analytics and property value predictions",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Shield,
      title: "Secure Transactions",
      description: "End-to-end security with verified listings and protected communications",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Zap,
      title: "Instant Notifications",
      description: "Get alerts for new properties, price changes, and viewing opportunities",
      color: "from-yellow-500 to-yellow-600"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Sign Up & Set Preferences",
      description: "Create your account and tell us what you're looking for",
      icon: Users
    },
    {
      number: "02", 
      title: "Browse & Discover",
      description: "Explore thousands of properties with our smart search",
      icon: Search
    },
    {
      number: "03",
      title: "Save & Compare",
      description: "Build your catalogue and compare your favorite properties",
      icon: Heart
    },
    {
      number: "04",
      title: "Connect & Close",
      description: "Contact listers and schedule viewings to find your dream home",
      icon: Home
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "First-time Buyer",
      content: "EstateKart made finding my first home incredibly easy. The search filters are so intuitive!",
      rating: 5,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    {
      name: "Michael Rodriguez",
      role: "Property Investor",
      content: "The market insights feature helped me identify the best investment opportunities. Highly recommend!",
      rating: 5,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
    },
    {
      name: "Emily Johnson",
      role: "Property Lister",
      content: "As a real estate agent, EstateKart has transformed how I connect with serious buyers.",
      rating: 5,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily"
    }
  ];

  const stats = [
    { number: "50K+", label: "Properties Listed", icon: Home },
    { number: "25K+", label: "Happy Customers", icon: Users },
    { number: "500+", label: "Expert Listers", icon: Award },
    { number: "95%", label: "Success Rate", icon: Target }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Toned Down Animated Background Blobs */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-35 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10"
      >
        {/* Hero Section */}
        <motion.section 
          variants={itemVariants}
          className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mb-8">
                <Sparkles className="w-4 h-4 mr-2" />
                Welcome to the Future of Real Estate
              </span>
            </motion.div>

            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-tight"
            >
              Find Your Perfect
              <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent block">
                Dream Home
              </span>
            </motion.h1>

            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Discover thousands of properties, connect with trusted agents, and make your real estate dreams come true with EstateKart's intelligent platform.
            </motion.p>

            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            >
              {!user ? (
                <>
                  <Link
                    to="/auth?mode=signup"
                    className="group bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 shadow-2xl hover:shadow-primary-500/30 relative overflow-hidden transform hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <span className="relative z-10 flex items-center">
                      Get Started Free
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                  <Link
                    to="/properties"
                    className="group border-2 border-primary-500 text-primary-600 hover:bg-primary-50 hover:border-primary-600 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 hover:shadow-lg relative overflow-hidden transform hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-primary-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <span className="relative z-10 flex items-center">
                      Browse Properties
                      <Search className="ml-2 w-5 h-5" />
                    </span>
                  </Link>
                </>
              ) : (
                <Link
                  to="/user-dashboard"
                  className="group bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 shadow-2xl hover:shadow-primary-500/30 relative overflow-hidden transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative z-10 flex items-center">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              )}
            </motion.div>

            {/* Stats Section */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="p-3 bg-primary-100 rounded-full">
                      <stat.icon className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section - Constantly Sliding Cards */}
        <motion.section 
          variants={itemVariants}
          className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <motion.h2 
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-black text-gray-900 mb-6"
              >
                Why Choose{' '}
                <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                  EstateKart?
                </span>
              </motion.h2>
              <motion.p 
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                We're revolutionizing real estate with cutting-edge technology and personalized service
              </motion.p>
            </div>

            {/* Constantly Sliding Cards Container */}
            <div className="relative">
              <div className="flex space-x-6 animate-slide-infinite">
                {/* Duplicate features array to create seamless loop */}
                {[...features, ...features].map((feature, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-80 bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
                  >
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-6`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section 
          variants={itemVariants}
          className="py-24 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <motion.h2 
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-black text-gray-900 mb-6"
              >
                How EstateKart Works
              </motion.h2>
              <motion.p 
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Your journey to finding the perfect property in four simple steps
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center group"
                >
                  <div className="relative mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <step.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-bold text-sm">{step.number}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section 
          variants={itemVariants}
          className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <motion.h2 
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-black text-gray-900 mb-6"
              >
                What Our Users Say
              </motion.h2>
              <motion.p 
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Join thousands of satisfied users who found their dream properties with EstateKart
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100"
                >
                  <div className="flex items-center mb-6">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed">"{testimonial.content}"</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Final CTA Section - UPDATED WITH FIX */}
        <motion.section 
          variants={itemVariants}
          className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}></div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.h2 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-black text-white mb-6"
            >
              {user ? 'Welcome to Your Real Estate Journey!' : 'Ready to Find Your Dream Home?'}
            </motion.h2>
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-primary-100 mb-12 max-w-2xl mx-auto"
            >
              {user 
                ? 'Continue exploring properties and managing your real estate portfolio with EstateKart\'s powerful tools.'
                : 'Join thousands of happy customers who found their perfect property through EstateKart. Start your journey today!'
              }
            </motion.p>

            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              {user ? (
                // Authenticated user buttons
                <>
                  <Link
                    to="/user-dashboard"
                    className="group bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 shadow-2xl hover:shadow-white/20 relative overflow-hidden transform hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center">
                      Go to Dashboard
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                  <Link
                    to="/properties"
                    className="group border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 relative overflow-hidden transform hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center">
                      Browse Properties
                      <Search className="ml-2 w-5 h-5" />
                    </span>
                  </Link>
                </>
              ) : (
                // Non-authenticated user buttons
                <>
                  <Link
                    to="/auth?mode=signup"
                    className="group bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 shadow-2xl hover:shadow-white/20 relative overflow-hidden transform hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center">
                      Start Free Today
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                  <Link
                    to="/properties"
                    className="group border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 relative overflow-hidden transform hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center">
                      Explore Properties
                      <Search className="ml-2 w-5 h-5" />
                    </span>
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};
