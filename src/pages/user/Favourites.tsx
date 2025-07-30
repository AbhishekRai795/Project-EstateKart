// import React from 'react';
// import { motion } from 'framer-motion';
// import { ShoppingCart, Search } from 'lucide-react';
// import { useProperty } from '../../contexts/PropertyContext';
// import { PropertyCard } from '../../components/common/PropertyCard';

// export const UserFavourites: React.FC = () => {
//   const { properties, catalogueProperties, toggleCatalogue } = useProperty();
  
//   const catalogueList = properties.filter(property => 
//     catalogueProperties.includes(property.id)
//   );

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         duration: 0.6,
//         staggerChildren: 0.1
//       }
//     }
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0 }
//   };

//   return (
//     <motion.div
//       variants={containerVariants}
//       initial="hidden"
//       animate="visible"
//       className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
//     >
//       {/* Header */}
//       <motion.div variants={itemVariants} className="mb-8">
//         <div className="flex items-center space-x-3 mb-4">
//           <div className="bg-blue-100 p-3 rounded-xl">
//             <ShoppingCart className="h-6 w-6 text-blue-600" />
//           </div>
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">My Catalogue</h1>
//             <p className="text-gray-600">Properties you've saved for consideration</p>
//           </div>
//         </div>
        
//         <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
//           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
//           <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
//           <div className="flex items-center justify-between relative z-10">
//             <div>
//               <h2 className="text-2xl font-bold mb-2">
//                 {catalogueList.length} Properties in Catalogue
//               </h2>
//               <p className="text-blue-100">
//                 Keep track of properties that interest you
//               </p>
//             </div>
//             <ShoppingCart className="h-16 w-16 text-blue-200" />
//           </div>
//         </div>
//       </motion.div>

//       {/* Catalogue List */}
//       <motion.div variants={itemVariants}>
//         {catalogueList.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {catalogueList.map((property) => (
//               <PropertyCard
//                 key={property.id}
//                 property={property}
//                 onCatalogueToggle={toggleCatalogue}
//                 isInCatalogue={true}
//               />
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-20">
//             <div className="bg-gray-100 rounded-full p-12 w-fit mx-auto mb-8">
//               <ShoppingCart className="h-20 w-20 text-gray-400" />
//             </div>
//             <h3 className="text-3xl font-bold text-gray-900 mb-4">Your catalogue is empty</h3>
//             <p className="text-gray-600 mb-10 max-w-md mx-auto text-lg">
//               Start browsing properties and add the ones you like to your catalogue by clicking the cart icon
//             </p>
//             <motion.button
//               whileHover={{ scale: 1.05, y: -2 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => window.location.href = '/properties'}
//               className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-primary-500/25 inline-flex items-center space-x-3"
//             >
//               <Search className="h-6 w-6" />
//               <span>Browse Properties</span>
//             </motion.button>
//           </div>
//         )}
//       </motion.div>

//       {/* Tips */}
//       {catalogueList.length > 0 && (
//         <motion.div variants={itemVariants} className="mt-16">
//           <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-2xl p-8">
//             <h3 className="text-xl font-bold text-primary-900 mb-4 flex items-center gap-2">
//               💡 Pro Tips
//             </h3>
//             <div className="grid md:grid-cols-2 gap-6">
//               <ul className="space-y-3 text-primary-800">
//                 <li className="flex items-start gap-2">
//                   <span className="text-primary-500 font-bold">•</span>
//                   Set up alerts to get notified when similar properties are listed
//                 </li>
//                 <li className="flex items-start gap-2">
//                   <span className="text-primary-500 font-bold">•</span>
//                   Compare your catalogue properties side by side to make better decisions
//                 </li>
//               </ul>
//               <ul className="space-y-3 text-primary-800">
//                 <li className="flex items-start gap-2">
//                   <span className="text-primary-500 font-bold">•</span>
//                   Contact agents directly from your catalogue list
//                 </li>
//                 <li className="flex items-start gap-2">
//                   <span className="text-primary-500 font-bold">•</span>
//                   Share your catalogue with family or friends for feedback
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </motion.div>
//   );
// };