import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// RegisterPage — lets new users create a Level 3 (full account) by providing
// email, password, name, and optionally age and favorite club.
// On success the server sets an httpOnly cookie. We then call refreshAuth()
// so the Navbar reflects the logged-in state, and redirect to home.
export const RegisterPage: React.FC = () => {
  const { refreshAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Clicking "Continue with Google" triggers a full browser redirect to the
  // backend OAuth endpoint — not a fetch call, because OAuth requires a real navigation.
  const handleGoogleSignIn = () => {
    const returnTo = searchParams.get('returnTo') || '/';
    window.location.href = `/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  // Age is optional — empty string means not provided
  const [age, setAge] = useState('');
  // Favorite club ID is optional — empty string means not provided
  const [favoriteClubId, setFavoriteClubId] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Build the request body — only include optional numeric fields when provided
    const body: Record<string, unknown> = { email, password, name };
    if (age.trim()) {
      body.age = parseInt(age, 10);
    }
    if (favoriteClubId.trim()) {
      body.favoriteClubId = parseInt(favoriteClubId, 10);
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // credentials: 'include' is required so the browser stores the httpOnly cookie
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (res.ok) {
        // The server has set the auth cookie — refresh the context so Navbar updates
        refreshAuth();
        navigate('/');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Registration failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create an Account</h1>

        {/* Google sign-in — creates an account automatically using Google name and email */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors min-h-[48px] mb-4"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <hr className="flex-1 border-gray-200" />
          <span className="text-xs text-gray-400">or register with email</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Required fields */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
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
              Password <span className="text-red-500">*</span>
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

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="How should we call you?"
            />
          </div>

          {/* Optional fields */}
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
              Age <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="age"
              type="number"
              value={age}
              onChange={e => setAge(e.target.value)}
              min={13}
              max={120}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. 25"
            />
          </div>

          <div>
            <label htmlFor="favoriteClubId" className="block text-sm font-medium text-gray-700 mb-1">
              Favorite Club ID <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="favoriteClubId"
              type="number"
              value={favoriteClubId}
              onChange={e => setFavoriteClubId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. 33 (club ID from the database)"
            />
            <p className="text-xs text-gray-400 mt-1">
              You can find team IDs by browsing the FanBase section.
            </p>
          </div>

          {/* Inline error — shown when the API returns an error */}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </motion.div>
  );
};
