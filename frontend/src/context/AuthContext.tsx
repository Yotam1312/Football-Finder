import React, { useState, useEffect } from 'react';
import type { AuthUser } from '../types';

// The shape of values available to all components via useAuth()
interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  // Call this after login or set-password to re-fetch the current user from the API
  refreshAuth: () => void;
  // Calls POST /api/auth/logout, then clears the user from state
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

// AuthProvider wraps the entire app and keeps track of who is logged in.
// On every app load it calls GET /api/auth/me — if a valid cookie exists,
// the server returns the user; otherwise it returns 401 and we stay as a guest.
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetches the currently authenticated user from the backend.
  // credentials: 'include' is required so the browser sends the httpOnly cookie.
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // 401 means no valid session — this is normal for guests
        setUser(null);
      }
    } catch {
      // Network error or server down — treat as logged out
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth state once when the app first loads
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshAuth: fetchCurrentUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth — call this inside any component to access auth state.
// Throws if used outside AuthProvider (should never happen in normal usage).
export const useAuth = (): AuthContextValue => {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
