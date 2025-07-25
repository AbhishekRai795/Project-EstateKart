import React from 'react';
import { motion } from 'framer-motion';

interface ConversionFunnelProps {
  data: {
    views: number;
    inquiries: number;
    offers: number;
    sales: number;
  };
}

export const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ data }) => {
  const { views, inquiries, offers, sales } = data;
  
  const steps = [
    { label: 'Views', value: views, color: 'bg-blue-500', percentage: 100 },
    { label: 'Inquiries', value: inquiries, color: 'bg-green-500', percentage: views > 0 ? (inquiries / views) * 100 : 0 },
    { label: 'Offers', value: offers, color: 'bg-yellow-500', percentage: views > 0 ? (offers / views) * 100 : 0 },
    { label: 'Sales', value: sales, color: 'bg-red-500', percentage: views > 0 ? (sales / views) * 100 : 0 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{step.label}</span>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">{step.value.toLocaleString()}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({step.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
            
            <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${step.percentage}%` }}
                transition={{ duration: 1, delay: index * 0.2 }}
                className={`h-full ${step.color} rounded-lg flex items-center justify-center text-white font-medium`}
              >
                {step.percentage > 20 && (
                  <span className="text-sm">{step.value.toLocaleString()}</span>
                )}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Insights</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">View to Inquiry Rate:</span>
            <span className="font-medium text-gray-900 ml-1">
              {views > 0 ? ((inquiries / views) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div>
            <span className="text-gray-600">Offer Conversion:</span>
            <span className="font-medium text-gray-900 ml-1">
              {inquiries > 0 ? ((offers / inquiries) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};