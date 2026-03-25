import React from 'react';
import { motion } from 'framer-motion';

// Placeholder — full implementation in Plan 02 (Phase 20)
export const StadiumGuidePage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="min-h-screen bg-green-50 pb-20 md:pb-0"
    >
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-800">Stadium Guide</h1>
        <p className="text-gray-500 mt-2">Loading...</p>
      </div>
    </motion.div>
  );
};
