import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ProfilePage — shows the logged-in user's profile and allows editing.
// Accessible via the "Profile Settings" dropdown item in the Navbar.
// All fields are editable for both Google and email+password users.
// Password change section is shown only for email+password users.
export const ProfilePage: React.FC = () => {
  const { user, logout, refreshAuth } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if somehow accessed while not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  // ── Profile edit form state ─────────────────────────────────────────
  const [name, setName] = useState(user.name);
  const [age, setAge] = useState(user.age?.toString() ?? '');
  const [country, setCountry] = useState(user.country ?? '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Password change form state (email users only) ────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Delete account state ─────────────────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Handlers ─────────────────────────────────────────────────────────

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          age: age.trim() ? parseInt(age, 10) : null,
          country: country.trim() || null,
        }),
      });

      if (res.ok) {
        // Refresh the auth context so the navbar shows the updated name
        refreshAuth();
        setProfileMessage({ type: 'success', text: 'Profile updated.' });
      } else {
        const data = await res.json().catch(() => ({}));
        setProfileMessage({ type: 'error', text: data.error ?? 'Failed to save changes.' });
      }
    } catch {
      setProfileMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMessage(null);

    try {
      const res = await fetch('/api/users/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully.' });
        setCurrentPassword('');
        setNewPassword('');
      } else {
        const data = await res.json().catch(() => ({}));
        setPasswordMessage({ type: 'error', text: data.error ?? 'Failed to change password.' });
      }
    } catch {
      setPasswordMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        // Logout clears the local auth state; then redirect to homepage
        await logout();
        navigate('/');
      } else {
        setShowDeleteConfirm(false);
        alert('Failed to delete account. Please try again.');
      }
    } catch {
      setShowDeleteConfirm(false);
      alert('Something went wrong. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h1>

        {/* ── Avatar section ─────────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Profile Picture</h2>
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.name}'s avatar`}
                className="w-16 h-16 rounded-full object-cover border border-gray-200"
              />
            ) : (
              // Placeholder initials avatar when no photo is set
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center border border-gray-200">
                <span className="text-xl font-bold text-green-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              {/* Upload is deferred to Phase 10 (Azure Blob setup required).
                  Show the button as disabled with a tooltip so users know it is coming. */}
              <button
                disabled
                title="Custom photo upload coming in a future update"
                className="text-sm border border-gray-300 text-gray-400 px-3 py-1.5 rounded-md cursor-not-allowed"
              >
                Upload photo (coming soon)
              </button>
              {user.accountType === 'google' && (
                <p className="text-xs text-gray-400 mt-1">
                  Using your Google profile photo
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Account type badge ─────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Account type</p>
              <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              user.accountType === 'google'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-green-50 text-green-700'
            }`}>
              {user.accountType === 'google' ? 'Google Account' : 'Email & Password'}
            </span>
          </div>
        </div>

        {/* ── Profile edit form ──────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Personal Details</h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

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
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="country"
                type="text"
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. Spain"
              />
            </div>

            {profileMessage && (
              <p className={`text-sm ${profileMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {profileMessage.text}
              </p>
            )}

            <button
              type="submit"
              disabled={profileSaving}
              className="w-full bg-green-600 text-white py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {profileSaving ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>

        {/* ── Password change (email+password users only) ────────────── */}
        {user.accountType === 'email' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="At least 8 characters"
                />
              </div>

              {passwordMessage && (
                <p className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordMessage.text}
                </p>
              )}

              <button
                type="submit"
                disabled={passwordSaving}
                className="w-full border border-green-600 text-green-600 py-2 rounded-md text-sm font-medium hover:bg-green-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {passwordSaving ? 'Changing...' : 'Change password'}
              </button>
            </form>
          </div>
        )}

        {/* ── Danger zone — delete account ───────────────────────────── */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-red-100">
          <h2 className="text-base font-semibold text-red-600 mb-2">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-4">
            Permanently delete your account. Your posts will remain but become anonymous.
            This action cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-sm border border-red-300 text-red-600 px-4 py-2 rounded-md hover:bg-red-50 transition-colors"
            >
              Delete account
            </button>
          ) : (
            // Confirmation step — requires explicit user action before deleting
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-700 font-medium mb-3">
                Are you sure? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="text-sm bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Yes, delete my account'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="text-sm border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
