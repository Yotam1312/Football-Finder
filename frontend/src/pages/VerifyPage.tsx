import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Post } from '../types';
import { useAuth } from '../context/AuthContext';

// VerifyPage — the page users land on when they click the email verification link.
// Token is in the URL path (/verify/:token).
// On load, it calls POST /api/auth/verify/:token to create the post.
// It then shows a confirmation screen, or an error state if the token is expired/invalid.
export const VerifyPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { user, refreshAuth } = useAuth();

  // The overall page status — drives which UI to render
  const [status, setStatus] = useState<'loading' | 'success' | 'already-used' | 'expired' | 'error'>('loading');

  // The post that was created — returned in the verify response
  const [post, setPost] = useState<Post | null>(null);

  // Team name and ID for the "Back to {TeamName}" link
  const [teamName, setTeamName] = useState('');
  const [teamId, setTeamId] = useState<number | null>(null);

  // State for the resend button on the expired screen
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const verify = async () => {
      try {
        // Call POST /api/auth/verify/:token — no body needed, token is in the path
        const res = await fetch(`/api/auth/verify/${token}`, {
          method: 'POST',
          credentials: 'include',
        });

        if (res.ok) {
          // Verification succeeded — the post has been created
          const data = await res.json();
          setPost(data.post);

          // Fetch the team name for the "Back to {TeamName}" link
          if (data.post?.teamId) {
            setTeamId(data.post.teamId);
            try {
              const teamRes = await fetch(`/api/fanbase/team/${data.post.teamId}`);
              if (teamRes.ok) {
                const teamData = await teamRes.json();
                setTeamName(teamData.team?.name ?? '');
              }
            } catch {
              // Non-critical — if team name fails, the link still works
            }
          }

          // Refresh auth context so Level 2 session is recognized immediately
          refreshAuth();
          setStatus('success');
        } else {
          const data = await res.json().catch(() => ({}));
          if (res.status === 400 && data.code === 'EXPIRED') {
            setStatus('expired');
          } else if (res.status === 400) {
            // 400 without EXPIRED code = token already used
            setStatus('already-used');
          } else if (res.status === 404) {
            setStatus('error');
          } else {
            setStatus('error');
          }
        }
      } catch {
        // Network error — treat as generic error
        setStatus('error');
      }
    };

    verify();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handles the "Resend verification email" button on the expired screen.
  // Calls POST /api/auth/resend with the expired token so the backend can
  // look up the pending post data and send a fresh link.
  const handleResend = async () => {
    setResendStatus('sending');
    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiredToken: token }),
      });

      if (res.ok) {
        setResendStatus('sent');
      } else {
        setResendStatus('error');
      }
    } catch {
      setResendStatus('error');
    }
  };

  // ── Loading state — spinner while the API call is in flight ──
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
        <p className="text-gray-500 text-sm">Verifying your post...</p>
      </div>
    );
  }

  // ── Success state — post is live! ──
  if (status === 'success') {
    const postTypeLabels: Record<string, string> = {
      GENERAL_TIP: 'general tip',
      SEAT_TIP: 'seat tip',
      PUB_RECOMMENDATION: 'pub recommendation',
      IM_GOING: "I'm Going post",
    };
    const typeLabel = post?.postType ? (postTypeLabels[post.postType] ?? 'post') : 'post';

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          {/* Green checkmark circle */}
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 text-3xl font-bold mx-auto mb-4">
            ✓
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your post is live!</h1>
          <p className="text-gray-600 text-sm mb-6">
            Your {typeLabel} has been published to the {teamName ? `${teamName} FanBase` : 'FanBase'}.
          </p>

          {/* Upgrade prompt — only shown to Level 2 users who want to manage their post */}
          {user?.level === 2 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-green-800 mb-2">
                Want to edit or delete your post later? Set a password to upgrade to a full account.
              </p>
              <Link
                to="/set-password"
                className="text-sm font-medium text-green-700 hover:underline"
              >
                Set a password →
              </Link>
            </div>
          )}

          {/* Back to team FanBase link */}
          {teamId ? (
            <Link
              to={`/fanbase/team/${teamId}`}
              className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Back to {teamName ? `${teamName} FanBase` : 'FanBase'}
            </Link>
          ) : (
            <Link
              to="/fanbase"
              className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Back to FanBase Hub
            </Link>
          )}
        </div>
      </div>
    );
  }

  // ── Expired state — token is past its 24-hour window ──
  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">This link has expired.</h1>
          <p className="text-gray-600 text-sm mb-6">
            Verification links expire after 24 hours.
          </p>

          {/* Resend button — sends a new verification email */}
          {resendStatus === 'idle' && (
            <button
              onClick={handleResend}
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Resend verification email
            </button>
          )}

          {resendStatus === 'sending' && (
            <button
              disabled
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
            >
              Sending...
            </button>
          )}

          {resendStatus === 'sent' && (
            <p className="text-green-700 text-sm font-medium bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              A new link has been sent to your email.
            </p>
          )}

          {resendStatus === 'error' && (
            <div>
              <p className="text-red-600 text-sm mb-3">
                Failed to resend. Please try again.
              </p>
              <button
                onClick={() => setResendStatus('idle')}
                className="text-sm text-gray-500 underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Already-used state — token was valid but post already created ──
  if (status === 'already-used') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            This link has already been used.
          </h1>
          <p className="text-gray-600 text-sm mb-6">Your post is already live.</p>
          <Link
            to="/fanbase"
            className="inline-block text-sm text-green-600 hover:underline"
          >
            ← Back to FanBase Hub
          </Link>
        </div>
      </div>
    );
  }

  // ── Error state — invalid or unknown token ──
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          This link is invalid or has expired.
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          Please try submitting your post again.
        </p>
        <Link
          to="/fanbase"
          className="inline-block text-sm text-green-600 hover:underline"
        >
          ← Back to FanBase Hub
        </Link>
      </div>
    </div>
  );
};
