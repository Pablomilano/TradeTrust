'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';
import { supabase } from '../../lib/supabaseClient';

const ADMIN_EMAIL = 'paulmilne00@gmail.com';

interface AdminProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  trade: string;
  coverage_area: string | null;
  visibility: boolean;
  created_at: string;
}

interface AdminReview {
  id: string;
  profile_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface AdminSummary {
  totals: {
    users: number;
    enquiriesAllTime: number;
    enquiriesThisWeek: number;
    reviews: number;
    jobs: number;
  };
  profiles: AdminProfile[];
  reviews: AdminReview[];
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function profileDisplayName(profile: AdminProfile) {
  if (profile.business_name?.trim()) return profile.business_name;
  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  return fullName || 'Unnamed profile';
}

export default function AdminPage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL;

  const reviewsByProfileId = useMemo(() => {
    const map = new Map<string, string>();
    for (const profile of summary?.profiles || []) {
      map.set(profile.id, profileDisplayName(profile));
    }
    return map;
  }, [summary?.profiles]);

  const fetchSummary = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      setError('Missing session token. Please sign in again.');
      setAdminLoading(false);
      return;
    }

    const res = await fetch('/api/admin/summary', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const payload = await res.json();

    if (!res.ok) {
      setError(payload.error || 'Failed to load admin data.');
      setSummary(null);
      setAdminLoading(false);
      return;
    }

    setSummary(payload as AdminSummary);
    setError(null);
    setAdminLoading(false);
  };

  useEffect(() => {
    if (loading) return;

    if (!session) {
      router.replace('/auth/signin');
      return;
    }

    if (!isAdmin) {
      router.replace('/dashboard');
      return;
    }

    fetchSummary();
  }, [loading, session, isAdmin, router]);

  const handleDeleteProfile = async (profile: AdminProfile) => {
    if (!window.confirm(`Delete ${profileDisplayName(profile)} and related data? This cannot be undone.`)) {
      return;
    }

    setDeletingProfileId(profile.id);

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      setError('Missing session token. Please sign in again.');
      setDeletingProfileId(null);
      return;
    }

    const res = await fetch(`/api/admin/profiles/${profile.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const payload = await res.json();

    if (!res.ok) {
      setError(payload.error || 'Failed to delete profile.');
    } else {
      await fetchSummary();
    }

    setDeletingProfileId(null);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Delete this review? This cannot be undone.')) {
      return;
    }

    setDeletingReviewId(reviewId);

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      setError('Missing session token. Please sign in again.');
      setDeletingReviewId(null);
      return;
    }

    const res = await fetch(`/api/admin/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const payload = await res.json();

    if (!res.ok) {
      setError(payload.error || 'Failed to delete review.');
    } else {
      await fetchSummary();
    }

    setDeletingReviewId(null);
  };

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen bg-[#eef1f5] p-6">
        <div className="mx-auto max-w-6xl rounded-2xl border border-[#d8dee8] bg-white p-6 text-sm text-[#4b5563]">
          Loading admin panel...
        </div>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#eef1f5]">
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <aside className="w-full bg-[#0d1b3d] px-6 py-8 text-white lg:min-h-screen lg:w-64 lg:shrink-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9db5ef]">Admin</p>
          <h1 className="mt-2 text-2xl font-bold">TradeTrust</h1>
          <p className="mt-2 text-sm text-[#c7d5f8]">Platform control panel</p>

          <nav className="mt-8 space-y-2 text-sm">
            <a href="#stats" className="block rounded-xl bg-[#132a5d] px-3 py-2">Stats</a>
            <a href="#profiles" className="block rounded-xl px-3 py-2 text-[#d7e3ff] hover:bg-[#132a5d]">Profiles</a>
            <a href="#reviews" className="block rounded-xl px-3 py-2 text-[#d7e3ff] hover:bg-[#132a5d]">Reviews</a>
          </nav>
        </aside>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-6 rounded-2xl border border-[#d8dee8] bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-semibold text-[#111827]">Admin Overview</h2>
            <p className="mt-1 text-sm text-[#6b7280]">Signed in as {session.user.email}</p>
          </header>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <section id="stats" className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-[#d8dee8] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Users</p>
              <p className="mt-2 text-3xl font-bold text-[#111827]">{summary?.totals.users ?? 0}</p>
            </article>
            <article className="rounded-2xl border border-[#d8dee8] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Enquiries</p>
              <p className="mt-2 text-3xl font-bold text-[#111827]">{summary?.totals.enquiriesAllTime ?? 0}</p>
              <p className="mt-1 text-xs text-[#6b7280]">{summary?.totals.enquiriesThisWeek ?? 0} this week</p>
            </article>
            <article className="rounded-2xl border border-[#d8dee8] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Reviews</p>
              <p className="mt-2 text-3xl font-bold text-[#111827]">{summary?.totals.reviews ?? 0}</p>
            </article>
            <article className="rounded-2xl border border-[#d8dee8] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Jobs</p>
              <p className="mt-2 text-3xl font-bold text-[#111827]">{summary?.totals.jobs ?? 0}</p>
            </article>
          </section>

          <section id="profiles" className="mb-6 rounded-2xl border border-[#d8dee8] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-[#111827]">Tradespeople Profiles ({summary?.profiles.length || 0})</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#e5e7eb] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-[#6b7280]">
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Trade</th>
                    <th className="px-3 py-3">Area</th>
                    <th className="px-3 py-3">Date joined</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f2f5]">
                  {(summary?.profiles || []).map((profile) => (
                    <tr key={profile.id}>
                      <td className="px-3 py-3 font-medium text-[#111827]">{profileDisplayName(profile)}</td>
                      <td className="px-3 py-3 text-[#374151]">{profile.trade}</td>
                      <td className="px-3 py-3 text-[#374151]">{profile.coverage_area || '-'}</td>
                      <td className="px-3 py-3 text-[#374151]">{formatDate(profile.created_at)}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${profile.visibility ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                          {profile.visibility ? 'Public' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => handleDeleteProfile(profile)}
                          disabled={deletingProfileId === profile.id}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                        >
                          {deletingProfileId === profile.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="reviews" className="rounded-2xl border border-[#d8dee8] bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-[#111827]">Reviews ({summary?.reviews.length || 0})</h3>

            <div className="space-y-3">
              {(summary?.reviews || []).map((review) => (
                <article key={review.id} className="rounded-xl border border-[#e5e7eb] bg-[#fbfcfe] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">
                        {review.reviewer_name} · {review.rating}/5
                      </p>
                      <p className="text-xs text-[#6b7280]">
                        {reviewsByProfileId.get(review.profile_id) || 'Unknown profile'} · {formatDate(review.created_at)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(review.id)}
                      disabled={deletingReviewId === review.id}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                    >
                      {deletingReviewId === review.id ? 'Deleting...' : 'Delete review'}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-[#374151]">{review.comment}</p>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}