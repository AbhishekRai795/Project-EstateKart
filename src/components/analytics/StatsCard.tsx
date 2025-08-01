import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: React.ReactNode; // FIXED: Change type to React.ReactNode to accept pre-rendered JSX elements
  color?: 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon, // FIXED: No need to rename/destructure as Icon
  color = 'primary',
  className = ''
}) => {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    success: 'from-green-500 to-green-600',
    warning: 'from-yellow-500 to-yellow-600',
    error: 'from-red-500 to-red-600'
  };

  const changeColor = change?.type === 'increase' ? 'text-green-600' : 'text-red-600';

  return ( // FIXED: Removed duplicate return statement
    <motion.div
      className={`bg-gradient-to-r ${colorClasses[color]} text-white p-6 rounded-xl shadow-lg ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>{icon}</div> {/* FIXED: Render the pre-rendered icon directly */}
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-3xl font-bold mb-2">{value}</p>
      {change && (
        <p className={`text-sm ${changeColor}`}>
          {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
          <span className="ml-1 opacity-75">vs last month</span>
        </p>
      )}
    </motion.div>
  );
};
