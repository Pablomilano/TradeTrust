'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  trade: string;
  coverage_area: string | null;
  coverage_radius: number | null;
  phone: string | null;
  bio: string | null;
  accreditations: string[];
}

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface EnquiryForm {
  homeowner_name: string;
  phone: string;
  email: string;
  description: string;
  preferred_contact_time: 'Morning' | 'Afternoon' | 'Evening' | 'Anytime';
}

export default function TradePage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [form, setForm] = useState<EnquiryForm>({
    homeowner_name: '',
    phone: '',
    email: '',
    description: '',
    preferred_contact_time: 'Anytime',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error: err } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .eq('visibility', true)
          .single();

        if (err) {
          setError(err.message);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!profileId) return;

      const { data, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, reviewer_name, rating, comment, created_at')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (reviewsError) {
        setReviews([]);
      } else {
        setReviews((data as Review[]) || []);
      }
    };

    fetchReviews();
  }, [profileId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;

    try {
      setSubmitting(true);
      const { error: err } = await supabase
        .from('enquiries')
        .insert([
          {
            profile_id: profileId,
            homeowner_name: form.homeowner_name,
            phone: form.phone,
            email: form.email,
            description: form.description,
            preferred_contact_time: form.preferred_contact_time,
          },
        ]);

      if (err) {
        setError(err.message);
      } else {
        setSubmitSuccess(true);
        setForm({
          homeowner_name: '',
          phone: '',
          email: '',
          description: '',
          preferred_contact_time: 'Anytime',
        });
        setTimeout(() => setSubmitSuccess(false), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#14171B] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error || 'Profile not found'}
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 text-brand-500 hover:text-brand-600 font-medium"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const displayName =
    profile.first_name || profile.last_name
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
      : 'Tradesperson';
  const reviewAverage = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : null;

  const digitsOnlyPhone = profile.phone ? profile.phone.replace(/\D/g, '') : '';
  const whatsappPhone = digitsOnlyPhone
    ? digitsOnlyPhone.startsWith('44')
      ? digitsOnlyPhone
      : `44${digitsOnlyPhone.replace(/^0/, '')}`
    : '';
  const whatsappHref = whatsappPhone
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent("Hi, I found you on TradeTrust and I'd like to get a quote.")}`
    : '';

  return (
    <div className="min-h-screen bg-[#14171B]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#14171B] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={() => router.back()}
            className="text-sm text-brand-500 hover:text-brand-600 font-medium mb-4"
          >
            ← Back to search
          </button>
          <h1 className="text-3xl font-bold text-[#F8F5EE]">
            {profile.business_name || displayName}
          </h1>
          <p className="mt-1 text-lg text-brand-500 font-semibold">
            {profile.trade}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Profile Info */}
          <div className="md:col-span-2 rounded-2xl border border-border bg-white p-6 shadow-card">
            {/* About */}
            {profile.bio && (
              <div className="mb-6">
                <h2 className="font-semibold text-text mb-2">About</h2>
                <p className="text-muted text-sm leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Coverage */}
            <div className="mb-6">
              <h2 className="font-semibold text-text mb-2">Coverage</h2>
              <p className="text-muted text-sm">
                {profile.coverage_area || 'Coverage area not specified'}
              </p>
              {profile.coverage_radius && (
                <p className="text-muted text-sm">
                  Radius: {profile.coverage_radius} miles
                </p>
              )}
            </div>

            {/* Accreditations */}
            {profile.accreditations && profile.accreditations.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold text-text mb-2">
                  Accreditations
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.accreditations.map((acc, i) => (
                    <span
                      key={i}
                      className="inline-block bg-brand-500/10 text-brand-500 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      ✓ {acc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h2 className="font-semibold text-text mb-2">Reviews</h2>
              <p className="mb-3 text-sm text-muted">
                {reviews.length > 0
                  ? `${reviewAverage} / 5 from ${reviews.length} review${reviews.length === 1 ? '' : 's'}`
                  : 'No reviews yet'}
              </p>
              {reviews.length > 0 && (
                <div className="space-y-3">
                  {reviews.slice(0, 6).map((review) => (
                    <article key={review.id} className="rounded-xl border border-border bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-text">{review.reviewer_name}</p>
                        <p className="text-sm text-amber-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                      </div>
                      <p className="mt-2 text-sm text-muted">{review.comment}</p>
                      <p className="mt-2 text-xs text-muted">
                        {new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Enquiry Form */}
          <div className="md:col-span-1">
            <div className="rounded-lg border border-border bg-[#fbfbfb] p-6 sticky top-4">
              {whatsappHref && (
                <div className="mb-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    Quick contact
                  </p>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 32 32"
                      width="20"
                      height="20"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M16 3.2c-6.96 0-12.6 5.52-12.6 12.34 0 2.4.7 4.64 1.92 6.54L3.2 28.8l6.96-2.04a12.75 12.75 0 0 0 5.84 1.4c6.96 0 12.6-5.52 12.6-12.34C28.6 8.72 22.96 3.2 16 3.2Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M22 19.4c-.28.78-1.58 1.42-2.2 1.52-.56.1-1.28.14-2.08-.1-.48-.14-1.1-.36-1.9-.7-3.34-1.44-5.52-4.8-5.68-5.02-.16-.22-1.34-1.76-1.34-3.36 0-1.6.86-2.38 1.16-2.7.3-.32.66-.4.88-.4h.62c.2 0 .46-.08.72.56.28.68.94 2.34 1.02 2.52.08.18.14.4.02.64-.12.24-.18.4-.36.62-.18.22-.38.48-.54.64-.18.18-.38.38-.16.74.22.36.98 1.6 2.1 2.58 1.44 1.24 2.66 1.62 3.02 1.8.36.18.56.16.76-.1.2-.26.88-1.02 1.12-1.38.24-.36.48-.3.82-.18.34.12 2.12.98 2.48 1.16.36.18.6.26.68.4.08.14.08.82-.2 1.6Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>💬 Message on WhatsApp</span>
                  </a>
                </div>
              )}

              <h3 className="font-semibold text-text mb-4">Or send an enquiry</h3>

              {submitSuccess && (
                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                  ✓ Enquiry sent! They'll contact you shortly.
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmitEnquiry} className="space-y-3">
                <label className="flex flex-col gap-1 text-xs font-medium text-text">
                  Name
                  <input
                    type="text"
                    name="homeowner_name"
                    value={form.homeowner_name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-medium text-text">
                  Email
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-medium text-text">
                  Phone
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="07xxx xxxxxx"
                    className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-medium text-text">
                  When to contact
                  <select
                    name="preferred_contact_time"
                    value={form.preferred_contact_time}
                    onChange={handleInputChange}
                    className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option>Morning</option>
                    <option>Afternoon</option>
                    <option>Evening</option>
                    <option>Anytime</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-medium text-text">
                  Tell them about your job
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="Describe your project..."
                    rows={4}
                    className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-brand-500 text-white px-4 py-3 font-semibold text-sm hover:brightness-95 disabled:opacity-50 transition"
                >
                  {submitting ? 'Sending...' : 'Send Enquiry'}
                </button>
              </form>

              {profile.phone && (
                <p className="mt-4 text-xs text-muted text-center">
                  Or call: {profile.phone}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
