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

                              {profile.accreditations.length > 0 && (
      let db = supabase
                                  {profile.accreditations.slice(0, 3).map((accreditation) => (
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
                    {profiles.map((profile) => {
                      const initials = getInitials(profile.business_name);
                      const accreditations = profile.accreditations?.filter(Boolean) || [];
                      const hasPhoto = Boolean(profile.photo_url);

                      return (
                        <article key={profile.id} className="group relative overflow-hidden rounded-2xl border border-[#e6ebf2] bg-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                          <div className="h-8 w-full bg-[#0A1628]/95" />
                          <div className="absolute left-5 top-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#0A1628] text-base font-semibold text-white shadow-md">
                            {hasPhoto ? (
                              <img src={profile.photo_url || ''} alt={profile.business_name || 'Tradesperson'} className="h-full w-full object-cover" />
                            ) : (
                              initials
                            )}
                          </div>

                          <div className="px-5 pb-5 pt-5">
                            <div className="ml-16 flex flex-col gap-3">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                  <h2 className="text-2xl font-bold leading-tight text-[#1d1d1f]">{profile.trade || tradeLabel}</h2>
                                  <p className="mt-1 text-base font-semibold text-[#2f3640]">{profile.business_name || 'Tradesperson'}</p>
                                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#5f6368]">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4 text-[#0071e3]">
                                      <path d="M12 21s6-5.5 6-10a6 6 0 1 0-12 0c0 4.5 6 10 6 10Z" />
                                      <circle cx="12" cy="11" r="2.5" />
                                    </svg>
                                    <span>{profile.coverage_area || 'Coverage area available on request'}</span>
                                  </div>
                                </div>
                                <span className="rounded-full border border-[#d7e2f0] bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#4d5b6e]">
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
                                    <span key={accreditation} className="rounded-full border border-[#d2dbe8] bg-white px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-[#516073]">
                                      {accreditation}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="mt-5 border-t border-[#eef2f7] pt-4">
                              <Link
                                href={`/trades/${profile.id}`}
                                className="block w-full rounded-xl bg-[#0071e3] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#005ec8]"
                              >
                                View profile →
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    })}
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
