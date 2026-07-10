'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const TRADE_LABELS: Record<string, string> = {
  electrician: 'Electrician',
  plumber: 'Plumber',
  'gas-engineer': 'Gas Engineer',
  builder: 'Builder',
  joiner: 'Joiner',
  plasterer: 'Plasterer',
  'painter-and-decorator': 'Painter & Decorator',
  'general-maintenance': 'General Maintenance',
};

interface Profile {
  id: string;
  business_name: string | null;
  trade: string;
  coverage_area: string | null;
  bio: string | null;
  accreditations?: string[] | null;
  photo_url?: string | null;
}

function formatTradeLabel(trade: string) {
  return TRADE_LABELS[trade] || trade;
}

function titleForTrade(trade: string) {
  const label = formatTradeLabel(trade);
  return `${label}${label.endsWith('s') ? '' : 's'} near you`;
}

function getInitials(name: string | null | undefined) {
  if (!name) return 'T';

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'T';
}

export default function TradeResultsPage() {
  const params = useParams<{ trade: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tradeFromRoute = params?.trade || '';
  const tradeLabel = formatTradeLabel(tradeFromRoute);
  const areaParam = searchParams.get('area') || '';

  const [query, setQuery] = useState(areaParam);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async (areaQuery?: string) => {
    if (!tradeLabel) return;

    setLoading(true);
    setError(null);

    try {
      let db = supabase
        .from('profiles')
        .select('id, business_name, trade, coverage_area, bio, accreditations')
        .eq('visibility', true)
        .eq('trade', tradeLabel)
        .order('created_at', { ascending: false });

      if (areaQuery && areaQuery.trim()) {
        db = db.ilike('coverage_area', `%${areaQuery.trim()}%`);
      }

      const { data, error: queryError } = await db;

      if (queryError) {
        setError(queryError.message);
        setProfiles([]);
      } else {
        setProfiles(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tradeLabel) {
      router.replace('/find');
      return;
    }

    setQuery(areaParam);
    fetchProfiles(areaParam);
  }, [tradeLabel, areaParam, router]);

  const handleSearch = (event?: React.FormEvent) => {
    event?.preventDefault();
    const nextQuery = query.trim();
    setQuery(nextQuery);
    router.push(`/find/${tradeFromRoute}${nextQuery ? `?area=${encodeURIComponent(nextQuery)}` : ''}`);
    fetchProfiles(nextQuery);
  };

  const title = useMemo(() => titleForTrade(tradeFromRoute), [tradeFromRoute]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f8ff] to-white">
      <div className="border-b border-border bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-text">{title}</h1>
            <p className="mt-2 text-sm text-text-secondary">Search by postcode or town to narrow the results.</p>
          </div>
          <Link href="/find" className="text-sm font-semibold text-brand-500">Back to trades</Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSearch} className="mb-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Enter postcode or town"
            className="flex-1 rounded-full border border-border px-4 py-3 text-[#1d1d1f]"
          />
          <button type="submit" className="rounded-full bg-[#0071e3] px-5 py-3 font-semibold text-white">Search</button>
        </form>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-brand-500"></div>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
        ) : profiles.length === 0 ? (
          <div className="rounded-lg border border-border bg-[#fbfbfb] p-8 text-center">
            <p className="text-lg font-semibold text-text-secondary">No tradespeople found in that area yet.</p>
            <p className="mt-2 text-text-secondary">Try a wider postcode or town.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {profiles.map((profile) => {
              const initials = getInitials(profile.business_name);
              const accreditations = profile.accreditations?.filter(Boolean) || [];
              const hasPhoto = Boolean(profile.photo_url);

              return (
                <article key={profile.id} className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl">
                  <div className="h-14 w-full bg-[#0A1628]" />
                  <div className="absolute left-5 top-5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#0A1628] text-2xl font-semibold text-white shadow-lg">
                    {hasPhoto ? (
                      <img src={profile.photo_url || ''} alt={profile.business_name || 'Tradesperson'} className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>

                  <div className="px-5 pb-5 pt-20">
                    <div className="ml-32 flex flex-col gap-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h2 className="text-xl font-bold text-[#1d1d1f]">{profile.business_name || 'Tradesperson'}</h2>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#5f6368]">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4 text-[#0071e3]">
                              <path d="M12 21s6-5.5 6-10a6 6 0 1 0-12 0c0 4.5 6 10 6 10Z" />
                              <circle cx="12" cy="11" r="2.5" />
                            </svg>
                            <span>{profile.coverage_area || 'Coverage area available on request'}</span>
                          </div>
                        </div>
                        <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0A1628]">
                          {profile.trade}
                        </span>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-sm text-[#5f6368]">
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {Array.from({ length: 5 }, (_, index) => (
                              <span key={index}>{index < 4 ? '★' : '☆'}</span>
                            ))}
                          </div>
                          <span>No reviews yet</span>
                        </div>
                        {profile.bio && <p className="line-clamp-2 text-sm leading-6 text-[#5f6368]">{profile.bio}</p>}
                      </div>

                      {accreditations.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {accreditations.slice(0, 3).map((accreditation) => (
                            <span key={accreditation} className="rounded-full border border-[#0A1628] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0A1628]">
                              {accreditation}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 border-t border-[#eef2f7] pt-4">
                      <Link
                        href={`/trades/${profile.id}`}
                        className="block w-full rounded-b-2xl bg-[#0A1628] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#081826] shadow-inner"
                      >
                        View profile →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
