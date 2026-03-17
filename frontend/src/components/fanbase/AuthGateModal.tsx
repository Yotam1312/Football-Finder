import React from 'react';
import { Link } from 'react-router-dom';

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// AuthGateModal — shown when a guest user tries to add a tip.
// Directs them to register or log in instead of showing the post form.
// Clicking the backdrop or the × button closes the modal.
export const AuthGateModal: React.FC<AuthGateModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    // Backdrop — clicking outside the card closes the modal
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      {/* Modal card — stops click events from reaching the backdrop */}
      <div
        className="bg-white rounded-xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="flex items-center justify-end mb-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Icon */}
        <div className="text-center mb-4">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 text-2xl">
            ⚽
          </div>
        </div>

        {/* Heading and subtext */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Join Football Finder to share your tips
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Create a free account to post seat tips, pub recommendations, and more.
        </p>

        {/* Action buttons — stacked */}
        <div className="space-y-3">
          <Link
            to="/register"
            className="block w-full bg-green-600 text-white text-center py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            onClick={onClose}
          >
            Create Account
          </Link>
          <Link
            to="/login"
            className="block w-full border border-gray-300 text-gray-700 text-center py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};
