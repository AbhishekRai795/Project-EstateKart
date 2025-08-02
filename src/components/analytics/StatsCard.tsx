import React from 'react';
import { motion } from 'framer-motion';

// The props interface is updated to match the new design's requirements.
interface StatsCardProps {
  title: string;
  value: string | number;
  // --- FIX: Made the 'change' prop optional by adding a '?' ---
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'danger';
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon, color }) => {
  // Defines the color schemes for the icons and text based on the 'color' prop
  const colorClasses = {
    primary: {
      iconBg: 'bg-primary-100',
      iconText: 'text-primary-600',
      changeText: 'text-primary-600',
    },
    success: {
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      changeText: 'text-green-600',
    },
    warning: {
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
      changeText: 'text-yellow-600',
    },
    danger: {
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      changeText: 'text-red-600',
    },
  };

  const selectedColor = colorClasses[color];

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
      // The card background is now white with a subtle border and shadow.
      className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        {/* The icon background and text color are derived from the color prop. */}
        <div className={`p-2 rounded-lg ${selectedColor.iconBg}`}>
          <div className={`${selectedColor.iconText} h-6 w-6`}>
            {icon}
          </div>
        </div>
      </div>
      <div className="mt-2">
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        {/* --- FIX: Only render the change text if the 'change' prop exists --- */}
        {change && (
          <p className={`mt-1 text-sm ${change.type === 'increase' ? selectedColor.changeText : 'text-red-600'}`}>
            <span className="font-semibold">{change.type === 'increase' ? '↑' : '↓'} {change.value}%</span> vs last month
          </p>
        )}
      </div>
    </motion.div>
  );
};
