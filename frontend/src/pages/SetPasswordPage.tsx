import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// SetPasswordPage — only accessible to Level 2 (email-verified) users.
// Allows them to upgrade to a full account (Level 3) by setting a password.
export const SetPasswordPage: React.FC = () => {
  const { user, isLoading, refreshAuth } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Guard: redirect guests and Level 3 users to home immediately
  // isLoading check prevents redirecting before we know the user's state
  useEffect(() => {
    if (!isLoading && (user === null || user.level === 3)) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    setServerError(null);

    // Client-side validation before sending to the API
    if (password.length < 8) {
      setFieldError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setFieldError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // credentials: 'include' sends the httpOnly session cookie
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // Refresh auth context — user.level will now be 3
        refreshAuth();
        setSuccess(true);
        // Redirect to home after 2 seconds so the user can read the success message
        setTimeout(() => navigate('/'), 2000);
      } else {
        setServerError('Failed to set password. Please try again.');
      }
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // While auth is loading or redirect is in progress, render nothing
  if (isLoading || user === null || user.level === 3) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Set a password</h1>
        <p className="text-sm text-gray-500 mb-6">
          This upgrades your account so you can log in with email and password next time.
        </p>

        {success ? (
          // Success state — shown after password is set, auto-redirects to home
          <div className="text-green-700 bg-green-50 border border-green-200 rounded-md px-4 py-3 text-sm">
            Password set! You now have a full account. Redirecting...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Repeat your password"
              />
            </div>

            {/* Client-side validation error (mismatch / too short) */}
            {fieldError && (
              <p className="text-sm text-red-600">{fieldError}</p>
            )}

            {/* Server error */}
            {serverError && (
              <p className="text-sm text-red-600">{serverError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Set password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
