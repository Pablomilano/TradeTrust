'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import TradeTrustLogo from '../../components/TradeTrustLogo';
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import { TRADES } from '../../lib/trades';

const display = Archivo({ subsets: ['latin'], weight: ['700', '900'], variable: '--font-display' });
const body = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' });

export default function EarlyAccessPage() {
  const [form, setForm] = useState<{ name: string; trade: string; coverage_area: string; email: string; phone: string }>({
    name: '',
    trade: TRADES[0],
    coverage_area: '',
    email: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spots, setSpots] = useState<{ taken: number; cap: number; remaining: number } | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams({ trade: form.trade });
      fetch(`/api/waitlist-count?${params.toString()}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json && typeof json.taken === 'number') {
            setSpots(json);
          }
        })
        .catch(() => {
          // A failed count shouldn't block the form — just skip showing it.
        });
    }, 300);

    return () => clearTimeout(timeout);
  }, [form.trade]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch('/api/waitlist-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        trade: form.trade,
        coverage_area: form.coverage_area.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
      }),
    });

    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      setError(json.error || 'Something went wrong submitting your details — please try again.');
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <main className={`${display.variable} ${body.variable} ${mono.variable} min-h-screen bg-[#14171B]`} style={{ fontFamily: 'var(--font-body)' }}>
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/">
            <TradeTrustLogo variant="light" />
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-8">
          {/* Left: headline + comparison */}
          <div>
            <span
              className="inline-flex items-center rounded-full border border-[#E8631C]/40 bg-[#E8631C]/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#E8631C]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Early access · founding members only
            </span>

            <h1
              className="mt-6 text-[2.75rem] font-black leading-[1.03] tracking-tight text-white sm:text-6xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              No more Checkatrade.
              <br />
              <span className="text-[#E8631C]">No £150/month. No 12-month contract.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-300">
              TradeTrust is a marketplace built for tradespeople, not against them. Real profiles, real reviews, fair
              leads — and your client relationships stay yours.
            </p>

            <div className="mt-9 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
              <div className="bg-[#1B1E24] p-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-500" style={{ fontFamily: 'var(--font-mono)' }}>
                  Checkatrade & co.
                </p>
                <ul className="mt-3 space-y-2 text-sm text-gray-400">
                  <li>£60–150+ per month, whether you get leads or not</li>
                  <li>12-month contract, even with zero leads</li>
                  <li>Lose your reviews the day you stop paying</li>
                </ul>
              </div>
              <div className="bg-[#1B1E24] p-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#E8631C]" style={{ fontFamily: 'var(--font-mono)' }}>
                  The TradeTrust way
                </p>
                <ul className="mt-3 space-y-2 text-sm text-gray-200">
                  <li>Free, forever, as a founding member</li>
                  <li>No contract — leave whenever you like</li>
                  <li>Your reviews and client relationships stay yours</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right: signature docket card */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm -rotate-2 rounded-xl border-2 border-dashed border-[#3a3e46] bg-[#F3ECDD] p-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] transition-transform hover:rotate-0">
              <div className="flex items-center justify-between border-b border-[#14171B]/15 pb-3">
                <span className="text-sm font-black tracking-tight text-[#14171B]" style={{ fontFamily: 'var(--font-display)' }}>
                  TradeTrust
                </span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#14171B]/50" style={{ fontFamily: 'var(--font-mono)' }}>
                  Member card
                </span>
              </div>

              <div className="mt-4 space-y-2.5 text-sm text-[#14171B]" style={{ fontFamily: 'var(--font-mono)' }}>
                <div className="flex justify-between"><span className="text-[#14171B]/50">Trade</span><span className="font-medium">Plasterer</span></div>
                <div className="flex justify-between"><span className="text-[#14171B]/50">Area</span><span className="font-medium">Widnes</span></div>
                <div className="flex justify-between"><span className="text-[#14171B]/50">Member no.</span><span className="font-medium">014 / 25</span></div>
                <div className="flex items-center justify-between">
                  <span className="text-[#14171B]/50">Status</span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#1FA971]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1FA971]" /> Active
                  </span>
                </div>
              </div>

              <div className="relative mt-6 flex justify-center">
                <div className="-rotate-6 rounded-md border-2 border-[#E8631C] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-[#E8631C]" style={{ fontFamily: 'var(--font-mono)' }}>
                  Founding Member
                </div>
              </div>
              <p className="mt-4 text-center text-[10px] uppercase tracking-[0.1em] text-[#14171B]/40" style={{ fontFamily: 'var(--font-mono)' }}>
                Illustrative — 25 spots per trade
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="border-t border-white/10 bg-[#1B1E24]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
            {[
              {
                title: 'Free, forever, as a founding member',
                body: 'Join now and you\u2019ll never pay. Once TradeTrust opens publicly, new members pay £24.99/month — still a fraction of Checkatrade.',
                dot: '#E8631C',
              },
              {
                title: 'Keep your client relationships',
                body: 'Reviews and client data belong to you, not the platform. You build your reputation, not theirs.',
                dot: '#1FA971',
              },
              {
                title: 'Fair leads, no bidding wars',
                body: 'Clients find your profile because you\u2019re the right fit — not because you outbid five other trades.',
                dot: '#E8631C',
              },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-white/10 bg-[#14171B] p-6">
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: card.dot }} />
                <p className="mt-3 font-semibold text-white">{card.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:py-16">
          <h2 className="text-2xl font-black text-white sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
            How the platforms compare
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            Approximate 2026 figures reported by independent trade-advice sites — actual cost varies by trade and
            region, and most platforms don&apos;t publish exact pricing.
          </p>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="bg-[#1B1E24] p-4 font-medium text-gray-400" style={{ fontFamily: 'var(--font-mono)' }}></th>
                  <th className="border-x-2 border-t-2 border-[#E8631C] bg-[#E8631C]/10 p-4 font-semibold text-white">
                    TradeTrust
                  </th>
                  <th className="bg-[#1B1E24] p-4 font-medium text-gray-300">Checkatrade</th>
                  <th className="bg-[#1B1E24] p-4 font-medium text-gray-300">MyBuilder</th>
                  <th className="bg-[#1B1E24] p-4 font-medium text-gray-300">Rated People</th>
                </tr>
              </thead>
              <tbody style={{ fontFamily: 'var(--font-mono)' }}>
                {[
                  ['Monthly fee', 'Free (founding), £24.99 after', '£60\u2013150+/month', 'None', 'None (~£40/month optional)'],
                  ['Per-lead cost', 'None', 'Often on top of membership', '~£15\u201340 per shortlist \u2014 win or lose', '~£5\u201330 per lead'],
                  ['Contract length', 'None \u2014 leave anytime', 'Typically 12 months', 'None', 'None'],
                  ['Who owns your reviews', 'You', 'The platform', 'The platform', 'The platform'],
                  ['Competing trades per job', '1 \u2014 no bidding', '3\u20134 typically', '3\u20136 typically', '3\u20135 typically'],
                ].map((row, i) => (
                  <tr key={row[0]} className={i % 2 === 0 ? 'bg-[#14171B]' : 'bg-[#181B21]'}>
                    <td className="p-4 font-medium text-gray-400">{row[0]}</td>
                    <td className="border-x-2 border-[#E8631C] p-4 text-white">{row[1]}</td>
                    <td className="p-4 text-gray-400">{row[2]}</td>
                    <td className="p-4 text-gray-400">{row[3]}</td>
                    <td className="p-4 text-gray-400">{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="mx-auto max-w-2xl px-4 py-16 sm:py-20">
        <div className="rounded-2xl border-2 border-dashed border-[#3a3e46] bg-[#F3ECDD] p-6 sm:p-8">
          {submitted ? (
            <div className="py-6 text-center">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1FA971]" style={{ fontFamily: 'var(--font-mono)' }}>
                <span className="h-2 w-2 rounded-full bg-[#1FA971]" /> Application received
              </span>
              <h2 className="mt-3 text-2xl font-black text-[#14171B]" style={{ fontFamily: 'var(--font-display)' }}>You&apos;re on the list</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-[#14171B]/60">
                We&apos;ll be in touch before TradeTrust opens to clients in your area. When we reach out, setting up
                your profile takes a few minutes — there&apos;s no cost while you&apos;re a founding member.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-black text-[#14171B]" style={{ fontFamily: 'var(--font-display)' }}>Apply for early access</h2>
              <p className="mt-1 text-sm text-[#14171B]/60">Tell us a bit about your trade and where you cover.</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-[#14171B]">
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-[#14171B]/50" style={{ fontFamily: 'var(--font-mono)' }}>Name</span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="rounded-xl border border-[#14171B]/15 bg-white px-4 py-3 text-sm text-[#14171B] outline-none focus:ring-2 focus:ring-[#E8631C]"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-[#14171B]">
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-[#14171B]/50" style={{ fontFamily: 'var(--font-mono)' }}>Trade</span>
                  <select
                    value={form.trade}
                    onChange={(e) => setForm({ ...form, trade: e.target.value })}
                    className="rounded-xl border border-[#14171B]/15 bg-white px-4 py-3 text-sm text-[#14171B] outline-none focus:ring-2 focus:ring-[#E8631C]"
                  >
                    {TRADES.map((trade) => (
                      <option key={trade} value={trade}>{trade}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm text-[#14171B]">
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-[#14171B]/50" style={{ fontFamily: 'var(--font-mono)' }}>Coverage area</span>
                  <input
                    required
                    placeholder="e.g. Widnes"
                    value={form.coverage_area}
                    onChange={(e) => setForm({ ...form, coverage_area: e.target.value })}
                    className="rounded-xl border border-[#14171B]/15 bg-white px-4 py-3 text-sm text-[#14171B] outline-none focus:ring-2 focus:ring-[#E8631C]"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-[#14171B]">
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-[#14171B]/50" style={{ fontFamily: 'var(--font-mono)' }}>Email</span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="rounded-xl border border-[#14171B]/15 bg-white px-4 py-3 text-sm text-[#14171B] outline-none focus:ring-2 focus:ring-[#E8631C]"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-[#14171B] sm:col-span-2">
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-[#14171B]/50" style={{ fontFamily: 'var(--font-mono)' }}>Phone (optional)</span>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="rounded-xl border border-[#14171B]/15 bg-white px-4 py-3 text-sm text-[#14171B] outline-none focus:ring-2 focus:ring-[#E8631C]"
                  />
                </label>
              </div>

              {spots && (
                <div
                  className={`mt-5 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
                    spots.remaining === 0
                      ? 'border-[#14171B]/15 bg-[#14171B]/5 text-[#14171B]/70'
                      : 'border-[#E8631C]/30 bg-[#E8631C]/10 text-[#b8500f]'
                  }`}
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${spots.remaining === 0 ? 'bg-[#14171B]/40' : 'bg-[#E8631C]'}`} />
                  {spots.remaining === 0
                    ? `${form.trade} is full for now — join to be notified if a spot opens.`
                    : `Only ${spots.remaining} of ${spots.cap} ${form.trade.toLowerCase()} spots left nationally`}
                </div>
              )}

              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#E8631C] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d1560f] disabled:opacity-60 sm:w-auto"
              >
                {submitting ? 'Submitting…' : 'Join the early access list'}
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-10 text-center text-xs text-gray-500">
        TradeTrust — verified local tradespeople, real reviews.
      </footer>
    </main>
  );
}
