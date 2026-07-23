'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/useAuth';
import { supabase } from '../../../lib/supabaseClient';

interface EnquiryRecord {
  id: string;
  profile_id: string;
  homeowner_name: string;
  phone: string;
  email?: string | null;
  description: string;
  preferred_contact_time: string;
  created_at: string;
  updated_at: string;
  is_read: boolean;
}

function formatRelativeTime(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMins = Math.max(1, Math.round(diffMs / 60000));

  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function DashboardEnquiriesPage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      router.push('/auth/signin');
    }
  }, [loading, session, router]);

  useEffect(() => {
    if (!session) return;

    const fetchEnquiries = async () => {
      setLoadingEnquiries(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) {
        setError(err.message);
        setEnquiries([]);
      } else {
        setEnquiries(data || []);
      }

      setLoadingEnquiries(false);
    };

    fetchEnquiries();
  }, [session]);

  const unreadCount = useMemo(() => {
    return enquiries.filter((item) => !item.is_read).length;
  }, [enquiries]);

  const markAsRead = async (id: string) => {
    setMarkingId(id);

    const { error: err } = await supabase
      .from('enquiries')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!err) {
      setEnquiries((current) =>
        current.map((item) => (item.id === id ? { ...item, is_read: true } : item))
      );
    } else {
      setError(err.message);
    }

    setMarkingId(null);
  };

  if (loading || loadingEnquiries) {
    return (
      <div className="min-h-screen bg-[#14171B] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-border bg-white p-6 text-center text-sm text-muted">
            Loading enquiries…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#14171B] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-brand-500">Dashboard</p>
            <h1 className="text-2xl font-semibold text-text">Enquiries</h1>
            <p className="mt-1 text-sm text-muted">
              New enquiries from homeowners appear here.
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-text hover:border-brand-500/50"
          >
            Back
          </button>
        </div>

        <div className="mb-6 rounded-3xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text">Inbox</p>
              <p className="text-sm text-muted">
                {unreadCount > 0
                  ? `${unreadCount} unread enquiry${unreadCount > 1 ? 'ies' : 'y'}`
                  : 'All caught up'}
              </p>
            </div>
            <div className="rounded-full bg-brand-500/10 px-3 py-2 text-sm font-semibold text-brand-500">
              {enquiries.length} total
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {enquiries.length === 0 ? (
          <div className="rounded-3xl border border-border bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-text">No enquiries yet</p>
            <p className="mt-2 text-sm text-muted">
              When a homeowner submits a request from your public profile, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {enquiries.map((enquiry) => (
              <article
                key={enquiry.id}
                className={`rounded-3xl border p-4 shadow-sm transition ${
                  enquiry.is_read
                    ? 'border-border bg-white'
                    : 'border-brand-500/30 bg-brand-500/5'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    {!enquiry.is_read && (
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-500" aria-label="Unread" />
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-text">
                          {enquiry.homeowner_name}
                        </h2>
                        {!enquiry.is_read && (
                          <span className="rounded-full bg-brand-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-500">
                            New
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {formatRelativeTime(enquiry.created_at)}
                      </p>
                    </div>
                  </div>

                  {!enquiry.is_read && (
                    <button
                      type="button"
                      onClick={() => markAsRead(enquiry.id)}
                      disabled={markingId === enquiry.id}
                      className="rounded-full border border-brand-500/30 bg-white px-3 py-1.5 text-sm font-medium text-brand-500 hover:border-brand-500/50 disabled:opacity-60"
                    >
                      {markingId === enquiry.id ? 'Saving…' : 'Mark as read'}
                    </button>
                  )}
                </div>

                <div className="mt-4 space-y-3 text-sm text-muted">
                  <div className="flex flex-wrap gap-3">
                    <a href={`tel:${enquiry.phone}`} className="font-medium text-brand-500 hover:text-[#c9550f]">
                      {enquiry.phone}
                    </a>
                    {enquiry.email && (
                      <a href={`mailto:${enquiry.email}`} className="font-medium text-brand-500 hover:text-[#c9550f]">
                        {enquiry.email}
                      </a>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Job</p>
                    <p className="mt-1 leading-6 text-text">{enquiry.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
                      {enquiry.preferred_contact_time}
                    </span>
                    <span className="text-xs text-muted">
                      {new Date(enquiry.created_at).toLocaleString('en-GB', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
