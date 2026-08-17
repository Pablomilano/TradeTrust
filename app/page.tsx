'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { TRADES, slugifyTrade } from '../lib/trades';
import TradeTrustLogo from '../components/TradeTrustLogo';

const TRADE_OPTIONS = ['All trades', ...TRADES];

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
    <main className="min-h-screen bg-[#14171B] text-[#F8F5EE]">
      <header className="border-b border-[#2A2A2A]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <TradeTrustLogo variant="light" />
          <nav className="flex gap-4">
            <Link
              href="/auth/signin"
              className="text-[11px] uppercase tracking-[0.14em] text-[#A8A49C] transition hover:text-white"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <span className="inline-block rounded-full border border-[#E8631C] px-4 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#E8631C]">
          Verified · Real reviews · No commission
        </span>

        <h1 className="mt-6 max-w-4xl text-5xl font-bold leading-[0.98] tracking-[-0.02em] text-white sm:text-6xl lg:text-7xl">
          Find a tradesperson you can <span className="text-[#E8631C]">actually trust</span>.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-[#A8A49C] sm:text-lg">
          Verified local electricians, plumbers and builders — with real reviews from real customers.
        </p>

        <form onSubmit={handleSubmit} className="mt-9 max-w-3xl rounded-2xl bg-[#F2E9D8] p-5 sm:p-6">
          <span className="mb-2.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-[#8A7F6A]">
            What do you need, and where?
          </span>
          <div className="flex flex-col gap-3 md:flex-row">
            <select
              value={selectedTrade}
              onChange={(event) => setSelectedTrade(event.target.value)}
              aria-label="Trade"
              className="min-h-[52px] w-full appearance-none rounded-xl border-[1.5px] border-[#D9CCB4] bg-white px-4 py-3 pr-10 text-sm text-[#14171B] outline-none focus:border-[#E8631C] md:w-[220px]"
              style={{
                backgroundImage:
                  'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27none%27 stroke=%27%2314171B%27 stroke-width=%271.8%27%3E%3Cpath d=%27M6 8l4 4 4-4%27/%3E%3C/svg%3E")',
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
              aria-label="Postcode or town"
              placeholder="Postcode or town — e.g. Widnes, WA8"
              className="min-h-[52px] w-full rounded-xl border-[1.5px] border-[#D9CCB4] bg-white px-4 py-3 text-sm text-[#14171B] outline-none focus:border-[#E8631C]"
            />
            <button
              type="submit"
              className="min-h-[52px] rounded-xl bg-[#14171B] px-8 text-sm font-semibold text-white transition hover:bg-[#E8631C] md:flex-none"
            >
              Search
            </button>
          </div>
        </form>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#2F2F2F] bg-[#1E1E1E] p-7">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2B2B2B]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8631C" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="11" cy="11" r="5.5" />
                <path d="m15 15 4 4" />
              </svg>
            </span>
            <h2 className="mt-5 text-2xl font-bold text-white">Find a tradesperson</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-[#A8A49C]">
              Browse verified tradespeople in your area. Get quotes, read reviews, and contact them
              instantly.
            </p>
            <Link
              href="/find"
              className="mt-6 inline-flex items-center rounded-full bg-[#E8631C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c9550f]"
            >
              Browse tradespeople →
            </Link>
          </div>

          <div className="rounded-2xl border border-[#2F2F2F] bg-[#1E1E1E] p-7">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2B2B2B]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8631C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 8.5A2.5 2.5 0 0 1 7.5 6h9A2.5 2.5 0 0 1 19 8.5v8A2.5 2.5 0 0 1 16.5 19h-9A2.5 2.5 0 0 1 5 16.5v-8Z" />
                <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" />
                <path d="M8 12h8" />
              </svg>
            </span>
            <h2 className="mt-5 text-2xl font-bold text-white">Manage your business</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-[#A8A49C]">
              Create a profile, get enquiries from homeowners, and manage jobs all in one place.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link
                href="/auth/signup"
                className="inline-flex items-center rounded-full bg-[#E8631C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c9550f]"
              >
                Get started free
              </Link>
              <Link
                href="/auth/signin"
                className="inline-flex items-center rounded-full border border-[#E8631C] px-5 py-2.5 text-sm font-semibold text-[#E8631C] transition hover:bg-[#E8631C] hover:text-white"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between gap-4 border-t border-[#2A2A2A] pt-12">
          <h2 className="text-sm font-semibold text-white">Why TradeTrust</h2>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E6A63]">
            Built for tradespeople
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Verified profiles',
              body: 'Every tradesperson is real, checked, and accountable for their work.',
              icon: (
                <>
                  <path d="M12 3l7 3v5c0 4.2-2.7 7.7-7 9-4.3-1.3-7-4.8-7-9V6l7-3Z" />
                  <path d="m9.5 12 1.7 1.7 3.3-3.4" />
                </>
              ),
            },
            {
              title: 'Real reviews',
              body: 'Genuine feedback from real customers on jobs that actually happened.',
              icon: (
                <>
                  <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H10l-4 3v-3H7.5A2.5 2.5 0 0 1 5 13.5v-7Z" />
                  <path d="m8.5 8.5 1.3 1.3 2.7-2.7" />
                </>
              ),
            },
            {
              title: 'No commission',
              body: 'No cut of your work, no monthly fee for leads you never asked for.',
              icon: (
                <>
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 7.2v9.6" />
                  <path d="M9.2 10.2h5.6" />
                </>
              ),
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-[#2F2F2F] bg-[#1E1E1E] p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#2B2B2B]">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#E8631C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {item.icon}
                </svg>
              </span>
              <h3 className="mt-4 text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#A8A49C]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#2A2A2A]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6 lg:px-8">
          <TradeTrustLogo variant="light" />
          <span className="text-[10px] uppercase tracking-[0.14em] text-[#6E6A63]">
            © 2026 TradeTrust — verified local tradespeople, real reviews
          </span>
        </div>
      </footer>
    </main>
  );
}
