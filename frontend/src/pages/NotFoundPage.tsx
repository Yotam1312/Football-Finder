import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// 404 Not Found page — shown for any URL that doesn't match a known route.
// Navbar is rendered automatically in App.tsx above the Routes block.
export const NotFoundPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 pb-20 md:pb-0"
    >
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-green-600 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Go Home
          </Link>
          <Link
            to="/"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Search Matches
          </Link>
          <Link
            to="/fanbase"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            FanBase Hub
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
