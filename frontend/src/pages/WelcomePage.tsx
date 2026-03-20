import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// WelcomePage — shown once to new users after their first Google sign-in.
// The backend redirects here (instead of /) when isNewUser === true in the OAuth callback.
// No special guard needed — only new Google users are redirected here by the backend.
export const WelcomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚽</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome to Football Finder!
        </h1>

        {user && (
          <p className="text-gray-600 mb-4">
            Hi, <span className="font-medium">{user.name}</span>! Your account has been created
            using your Google profile.
          </p>
        )}

        <p className="text-sm text-gray-500 mb-6">
          You can now post match tips, upvote community content, and save your favourite teams.
        </p>

        <Link
          to="/"
          className="inline-block bg-green-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
        >
          Start exploring
        </Link>

        <p className="text-xs text-gray-400 mt-4">
          You can update your profile at any time from the navbar menu.
        </p>
      </div>
    </div>
  );
};
