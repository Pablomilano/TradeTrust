'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

const TRADE_OPTIONS = [
  'All trades',
  'Electrician',
  'Plumber',
  'Gas Engineer',
  'Builder',
  'Joiner',
  'Plasterer',
  'Painter & Decorator',
  'General Maintenance',
];

function slugifyTrade(trade: string) {
  return trade
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function Home() {
  const router = useRouter();
  const [selectedTrade, setSelectedTrade] = useState('All trades');
  const [area, setArea] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedArea = area.trim();
    const route = selectedTrade === 'All trades'
      ? `/find${trimmedArea ? `?area=${encodeURIComponent(trimmedArea)}` : ''}`
      : `/find/${slugifyTrade(selectedTrade)}${trimmedArea ? `?area=${encodeURIComponent(trimmedArea)}` : ''}`;

    router.push(route);
  };

  return (
    <main className="min-h-screen bg-white text-text">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-bold">TradeTrust</h1>
          <nav className="flex gap-4">
            <Link href="/auth/signin" className="text-sm text-text-secondary hover:text-text">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <section className="w-full bg-[#0A1628] text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">Find a tradesperson you can actually trust</h2>
            <p className="mt-4 max-w-2xl text-lg text-gray-300">Verified local electricians, plumbers, and builders — with real reviews from real customers</p>

            <form onSubmit={handleSubmit} className="mt-8 w-full">
              <div className="flex max-w-3xl flex-col gap-3 rounded-2xl bg-white p-3 md:flex-row md:items-center md:gap-0 md:rounded-full md:p-1">
                <select
                  value={selectedTrade}
                  onChange={(event) => setSelectedTrade(event.target.value)}
                  className="min-h-[48px] w-full rounded-xl border border-[#e6e6ea] bg-white px-4 py-3 pr-10 text-sm text-[#1d1d1f] placeholder:text-[#6b7280] shadow-sm md:w-[240px] md:rounded-l-full md:border-r-0 md:pr-4 md:shadow-none"
                  style={{
                    backgroundImage:
                      'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27none%27 stroke=%27%231d1d1f%27 stroke-width=%271.8%27%3E%3Cpath d=%27M6 8l4 4 4-4%27/%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1rem',
                  }}
                >
                  {TRADE_OPTIONS.map((trade) => (
                    <option key={trade} value={trade}>
                      {trade}
                    </option>
                  ))}
                </select>
                <input
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  type="search"
                  placeholder="Postcode or town"
                  className="min-h-[48px] w-full rounded-xl border border-[#e6e6ea] bg-white px-4 py-3 text-sm text-[#1d1d1f] placeholder:text-[#6b7280] shadow-sm md:rounded-none md:border-l-0 md:border-r-0 md:px-4 md:shadow-none"
                />
                <button
                  type="submit"
                  className="min-h-[48px] w-full rounded-xl bg-[#0071e3] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#005ec8] md:w-auto md:rounded-r-full md:shadow-none"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f5f7] py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-8 shadow-md">
            <div className="flex items-start gap-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="1.5" className="shrink-0">
                <circle cx="11" cy="11" r="5.5" />
                <path d="m15 15 4 4" />
              </svg>
              <div>
                <h3 className="text-2xl font-bold">Find a tradesperson</h3>
                <p className="mt-2 text-text-secondary">Browse verified tradespeople in your area. Get quotes, read reviews, and contact them instantly.</p>
                <div className="mt-4">
                  <Link href="/find" className="inline-flex items-center rounded-full bg-[#0071e3] px-5 py-2 font-semibold text-white">Browse tradespeople →</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-md">
            <div className="flex items-start gap-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="1.5" className="shrink-0">
                <path d="M5 8.5A2.5 2.5 0 0 1 7.5 6h9A2.5 2.5 0 0 1 19 8.5v8A2.5 2.5 0 0 1 16.5 19h-9A2.5 2.5 0 0 1 5 16.5v-8Z" />
                <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" />
                <path d="M8 12h8" />
              </svg>
              <div>
                <h3 className="text-2xl font-bold">Manage your business</h3>
                <p className="mt-2 text-text-secondary">Create a profile, get enquiries from homeowners, and manage jobs all in one place.</p>
                <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
                  <Link href="/auth/signup" className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-[#0071e3] px-4 py-2 text-sm font-semibold text-white sm:px-5">Get started free</Link>
                  <Link href="/auth/signin" className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-[#0071e3] px-4 py-2 text-sm font-semibold text-[#0071e3] sm:px-5">Sign in</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h3 className="mb-8 text-center text-2xl font-bold">Why TradeTrust</h3>
        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm sm:p-7">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="1.8" className="mx-auto mb-4">
              <path d="M12 3l7 3v5c0 4.2-2.7 7.7-7 9-4.3-1.3-7-4.8-7-9V6l7-3Z" />
              <path d="m9.5 12 1.7 1.7 3.3-3.4" />
            </svg>
            <h4 className="font-semibold">Verified profiles</h4>
            <p className="mt-2 text-sm text-text-secondary">All tradespeople are real and vetted</p>
          </div>

          <div className="rounded-2xl bg-white p-6 text-center shadow-sm sm:p-7">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="1.8" className="mx-auto mb-4">
              <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H10l-4 3v-3H7.5A2.5 2.5 0 0 1 5 13.5v-7Z" />
              <path d="m8.5 8.5 1.3 1.3 2.7-2.7" />
            </svg>
            <h4 className="font-semibold">Real reviews</h4>
            <p className="mt-2 text-sm text-text-secondary">Genuine feedback from real customers</p>
          </div>

          <div className="rounded-2xl bg-white p-6 text-center shadow-sm sm:p-7">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="1.8" className="mx-auto mb-4">
              <circle cx="12" cy="12" r="8" />
              <path d="M12 7.2v9.6" />
              <path d="M9.2 10.2h5.6" />
            </svg>
            <h4 className="font-semibold">No commission</h4>
            <p className="mt-2 text-sm text-text-secondary">We keep things simple and fair</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-[#f7f7f8]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
          <div className="font-semibold">TradeTrust</div>
          <div className="text-sm text-text-secondary">© 2025 TradeTrust</div>
        </div>
      </footer>
    </main>
  );
}
