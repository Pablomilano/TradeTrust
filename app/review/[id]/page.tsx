'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface ProfilePreview {
  id: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  trade: string;
}

export default function ReviewSubmissionPage() {
  const params = useParams<{ id: string }>();
  const profileId = params?.id || '';

  const [profile, setProfile] = useState<ProfilePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedName, setSubmittedName] = useState<string | null>(null);

  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) return;

      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, business_name, trade')
        .eq('id', profileId)
        .single();

      if (fetchError) {
        setError(fetchError.message);
        setProfile(null);
      } else {
        setProfile(data as ProfilePreview);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [profileId]);

  const displayName = useMemo(() => {
    if (!profile) return '';
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    return profile.business_name || fullName || 'Tradesperson';
  }, [profile]);

  const canSubmit = reviewerName.trim().length > 0 && rating >= 1 && comment.trim().length >= 20;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profileId || !canSubmit) return;

    setSubmitting(true);
    setError(null);

    const cleanName = reviewerName.trim();
    const cleanComment = comment.trim();

    const { error: insertError } = await supabase
      .from('reviews')
      .insert([
        {
          profile_id: profileId,
          reviewer_name: cleanName,
          rating,
          comment: cleanComment,
        },
      ]);

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    setSubmittedName(cleanName);
    setReviewerName('');
    setRating(0);
    setComment('');
    setSubmitting(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#14171B] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-white p-6 text-sm text-muted">Loading review page...</div>
      </main>
    );
  }

  if (error && !profile) {
    return (
      <main className="min-h-screen bg-[#14171B] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#14171B] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5f6368]">Leave a review</p>
        <h1 className="mt-2 text-2xl font-bold text-[#1d1d1f]">{displayName}</h1>
        {profile?.trade && <p className="mt-1 text-sm font-semibold text-[#E8631C]">{profile.trade}</p>}

        {submittedName ? (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <p className="font-semibold">Thanks {submittedName} — your review has been posted</p>
            <Link href={`/trades/${profileId}`} className="mt-2 inline-block font-semibold text-green-900 underline">
              View public profile
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <label className="flex flex-col gap-2 text-sm text-[#1d1d1f]">
              <span className="font-semibold">Your first name</span>
              <input
                type="text"
                value={reviewerName}
                onChange={(event) => setReviewerName(event.target.value)}
                placeholder="e.g. Sarah"
                className="rounded-xl border border-[#d9e1ed] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#E8631C]"
                required
              />
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-[#1d1d1f]">Star rating</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, index) => {
                  const value = index + 1;
                  const active = value <= rating;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d9e1ed] bg-white text-xl"
                    >
                      <span className={active ? 'text-amber-500' : 'text-[#c8cfdb]'}>★</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex flex-col gap-2 text-sm text-[#1d1d1f]">
              <span className="font-semibold">Written review</span>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Tell others what your experience was like..."
                minLength={20}
                rows={5}
                className="rounded-xl border border-[#d9e1ed] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#E8631C]"
                required
              />
              <span className="text-xs text-[#5f6368]">Minimum 20 characters.</span>
            </label>

            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#E8631C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#c9550f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Posting...' : 'Post review'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
