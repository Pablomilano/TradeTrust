'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/useAuth';
import TradeTrustLogo from '../../components/TradeTrustLogo';

interface ProfileRow {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  trade: string;
  coverage_area: string | null;
  visibility: boolean;
  created_at: string;
}

interface ReviewRow {
  id: string;
  profile_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface SummaryResponse {
  totals: {
    users: number;
    enquiriesAllTime: number;
    enquiriesThisWeek: number;
    reviews: number;
    jobs: number;
  };
  profiles: ProfileRow[];
  reviews: ReviewRow[];
}

type Section = 'overview' | 'profiles' | 'reviews';

export default function AdminPage() {
  const { session, loading: authLoading } = useAuth();
  const [section, setSection] = useState<Section>('overview');
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSummary = async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/summary', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error || 'Failed to load admin data.');
      } else {
        setData(json);
      }
    } catch {
      setError('Failed to reach the server.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && session) {
      fetchSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, session]);

  const handleDeleteProfile = async (profile: ProfileRow) => {
    if (!session) return;
    const label = profile.business_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'this profile';
    const confirmed = window.confirm(`Delete ${label}? This also removes their clients, jobs, enquiries, and reviews. This can't be undone.`);
    if (!confirmed) return;

    setDeletingId(profile.id);
    try {
      const response = await fetch(`/api/admin/profiles/${profile.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error || 'Failed to delete profile.');
      } else {
        await fetchSummary();
      }
    } catch {
      setError('Failed to reach the server.');
    }
    setDeletingId(null);
  };

  const handleDeleteReview = async (review: ReviewRow) => {
    if (!session) return;
    const confirmed = window.confirm(`Delete the review from ${review.reviewer_name}? This can't be undone.`);
    if (!confirmed) return;

    setDeletingId(review.id);
    try {
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error || 'Failed to delete review.');
      } else {
        await fetchSummary();
      }
    } catch {
      setError('Failed to reach the server.');
    }
    setDeletingId(null);
  };

  if (authLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-bg text-sm text-gray-400">Loading…</main>;
  }

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg text-center">
        <p className="text-lg font-semibold text-[#F8F5EE]">Admin access requires sign-in.</p>
        <Link href="/auth/signin" className="rounded-full bg-[#E8631C] px-5 py-3 text-sm font-semibold text-white">Sign in</Link>
      </main>
    );
  }

  const formatDate = (value: string) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const nameFor = (p: ProfileRow) => p.business_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unnamed';

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="hidden w-56 flex-shrink-0 bg-[#14171B] text-white sm:block">
        <div className="px-5 py-6">
          <TradeTrustLogo variant="light" />
          <p className="mt-1 text-xs text-gray-400">Admin</p>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {([
            { key: 'overview', label: 'Overview' },
            { key: 'profiles', label: 'Profiles' },
            { key: 'reviews', label: 'Reviews' },
          ] as { key: Section; label: string }[]).map((item) => (
            <button
              key={item.key}
              onClick={() => setSection(item.key)}
              className={`rounded-xl px-4 py-2.5 text-left text-sm font-medium transition ${
                section === item.key ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto px-3 pb-6 pt-8">
          <Link href="/dashboard" className="block rounded-xl px-4 py-2.5 text-sm text-gray-400 hover:bg-white/5 hover:text-white">← Back to app</Link>
        </div>
      </aside>

      <main className="flex-1 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between gap-4 sm:hidden">
            <p className="text-lg font-bold text-[#F8F5EE]">Admin</p>
          </div>
          <div className="mt-2 flex gap-2 sm:hidden">
            {(['overview', 'profiles', 'reviews'] as Section[]).map((key) => (
              <button
                key={key}
                onClick={() => setSection(key)}
                className={`rounded-full px-4 py-2 text-xs font-semibold ${section === key ? 'bg-[#14171B] text-white' : 'bg-white text-muted'}`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
          )}

          {loading && !data ? (
            <p className="mt-8 text-sm text-gray-400">Loading admin data…</p>
          ) : data ? (
            <>
              {section === 'overview' && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
                    <p className="text-sm text-muted">Users</p>
                    <p className="mt-2 text-3xl font-bold text-text">{data.totals.users}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
                    <p className="text-sm text-muted">Enquiries</p>
                    <p className="mt-2 text-3xl font-bold text-text">{data.totals.enquiriesThisWeek}</p>
                    <p className="mt-1 text-xs text-muted">this week · {data.totals.enquiriesAllTime} all time</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
                    <p className="text-sm text-muted">Reviews</p>
                    <p className="mt-2 text-3xl font-bold text-text">{data.totals.reviews}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
                    <p className="text-sm text-muted">Jobs</p>
                    <p className="mt-2 text-3xl font-bold text-text">{data.totals.jobs}</p>
                  </div>
                </div>
              )}

              {section === 'profiles' && (
                <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-white shadow-card">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Trade</th>
                        <th className="px-4 py-3 font-medium">Area</th>
                        <th className="px-4 py-3 font-medium">Joined</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.profiles.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-6 text-center text-muted">No profiles yet.</td></tr>
                      ) : (
                        data.profiles.map((profile) => (
                          <tr key={profile.id} className="border-b border-border last:border-0">
                            <td className="px-4 py-3 font-medium text-text">{nameFor(profile)}</td>
                            <td className="px-4 py-3 text-muted">{profile.trade}</td>
                            <td className="px-4 py-3 text-muted">{profile.coverage_area || '—'}</td>
                            <td className="px-4 py-3 text-muted">{formatDate(profile.created_at)}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${profile.visibility ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                {profile.visibility ? 'Public' : 'Hidden'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDeleteProfile(profile)}
                                disabled={deletingId === profile.id}
                                className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                              >
                                {deletingId === profile.id ? 'Deleting…' : 'Delete'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {section === 'reviews' && (
                <div className="mt-6 grid gap-4">
                  {data.reviews.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-white p-6 text-center text-sm text-muted">No reviews yet.</div>
                  ) : (
                    data.reviews.map((review) => (
                      <div key={review.id} className="rounded-2xl border border-border bg-white p-5 shadow-card">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-text">{review.reviewer_name}</p>
                            <p className="mt-1 text-xs text-muted">{formatDate(review.created_at)} · {review.rating}/5</p>
                          </div>
                          <button
                            onClick={() => handleDeleteReview(review)}
                            disabled={deletingId === review.id}
                            className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                          >
                            {deletingId === review.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </div>
                        <p className="mt-3 text-sm text-text">{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
