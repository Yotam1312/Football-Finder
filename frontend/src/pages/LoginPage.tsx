import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// LoginPage — allows users to sign in with email + password or via Google OAuth.
// On successful email login, updates the auth context and redirects to the home page.
// On Google sign-in, triggers a full browser redirect to the backend OAuth endpoint.
export const LoginPage: React.FC = () => {
  const { refreshAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for ?error=cancelled — set by the backend when user cancels Google sign-in
  const oauthError = searchParams.get('error') === 'cancelled'
    ? 'Sign-in was cancelled. Please try again.'
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // credentials: 'include' is required so the browser stores the httpOnly cookie
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        // Refresh the auth context so the Navbar reflects the logged-in user
        refreshAuth();
        navigate('/');
      } else {
        // 401 = wrong email or password
        setError('Invalid email or password.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clicking "Continue with Google" triggers a full browser redirect to the
  // backend OAuth endpoint. The backend stores returnTo and then redirects to Google.
  // We use window.location.href (not fetch) because OAuth requires a real navigation.
  const handleGoogleSignIn = () => {
    const returnTo = searchParams.get('returnTo') || '/';
    window.location.href = `/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
    >
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Log in</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
            />
          </div>

          {/* Inline error — shown on 401 response from email+password login */}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px]"
          >
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        {/* OAuth cancelled error — shown when returning from Google with ?error=cancelled */}
        {oauthError && (
          <p className="text-sm text-red-600 text-center mt-3">{oauthError}</p>
        )}

        {/* Divider between email login and Google sign-in */}
        <div className="flex items-center gap-3 my-4">
          <hr className="flex-1 border-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        {/* Google sign-in button — triggers a full browser redirect (not a fetch call) */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors min-h-[48px]"
        >
          {/* Simple Google "G" logo using SVG */}
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-sm text-center text-gray-500 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-green-600 hover:underline">Register</Link>
        </p>
      </div>
    </motion.div>
  );
};
