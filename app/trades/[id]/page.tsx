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
      <div className="min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8">
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-r from-brand-50 to-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={() => router.back()}
            className="text-sm text-brand-500 hover:text-brand-600 font-medium mb-4"
          >
            ← Back to search
          </button>
          <h1 className="text-3xl font-bold text-text">
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
          <div className="md:col-span-2">
            {/* About */}
            {profile.bio && (
              <div className="mb-6">
                <h2 className="font-semibold text-text mb-2">About</h2>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Coverage */}
            <div className="mb-6">
              <h2 className="font-semibold text-text mb-2">Coverage</h2>
              <p className="text-text-secondary text-sm">
                {profile.coverage_area || 'Coverage area not specified'}
              </p>
              {profile.coverage_radius && (
                <p className="text-text-secondary text-sm">
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
                      className="inline-block bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      ✓ {acc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enquiry Form */}
          <div className="md:col-span-1">
            <div className="rounded-lg border border-border bg-[#fbfbfb] p-6 sticky top-4">
              <h3 className="font-semibold text-text mb-4">Send Enquiry</h3>

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
                <p className="mt-4 text-xs text-text-secondary text-center">
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
