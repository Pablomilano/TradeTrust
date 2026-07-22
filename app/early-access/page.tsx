'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { TRADES } from '../../lib/trades';

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
    <main className="min-h-screen bg-bg text-text">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold">TradeTrust</Link>
        </div>
      </header>

      <section className="w-full bg-[#0A1628] text-white">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:py-28">
          <span className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-amber-300">
            Early access · opening one trade at a time
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl">Get seen before the crowd does.</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-gray-300">
            We're onboarding a small number of tradespeople in each area before TradeTrust opens to clients.
            Real profiles, real reviews, no bidding for leads. Once your trade fills up locally, the list closes.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="-mt-16 grid gap-4 sm:-mt-20 sm:grid-cols-3 sm:gap-5">
          {[
            { title: 'No fees while you\u2019re founding', body: 'Founding members list for free — no charge for as long as you hold that status.' },
            { title: 'First in, first seen', body: 'Early profiles and reviews are what clients see first when your trade opens locally.' },
            { title: 'Shape what we build', body: 'Founding members get a direct line to us on what the platform should do next.' },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-border bg-white p-5 shadow-card">
              <p className="font-semibold text-text">{card.title}</p>
              <p className="mt-2 text-sm text-muted">{card.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-[28px] border border-border bg-white p-6 shadow-card sm:p-8">
          {submitted ? (
            <div className="py-6 text-center">
              <h2 className="text-2xl font-bold text-text">You're on the list</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted">
                We'll be in touch before TradeTrust opens to clients in your area. When we reach out, setting up
                your profile takes a few minutes — there's no cost while you're a founding member.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-semibold text-text">Apply for early access</h2>
              <p className="mt-1 text-sm text-muted">Tell us a bit about your trade and where you cover.</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-text">
                  <span>Name</span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-text">
                  <span>Trade</span>
                  <select
                    value={form.trade}
                    onChange={(e) => setForm({ ...form, trade: e.target.value })}
                    className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {TRADES.map((trade) => (
                      <option key={trade} value={trade}>{trade}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm text-text">
                  <span>Coverage area</span>
                  <input
                    required
                    placeholder="e.g. Widnes"
                    value={form.coverage_area}
                    onChange={(e) => setForm({ ...form, coverage_area: e.target.value })}
                    className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-text">
                  <span>Email</span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-text sm:col-span-2">
                  <span>Phone (optional)</span>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </label>
              </div>

              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#0071e3] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#005ec8] disabled:opacity-60 sm:w-auto"
              >
                {submitting ? 'Submitting…' : 'Join the early access list'}
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="px-4 py-10 text-center text-xs text-muted">
        TradeTrust — verified local tradespeople, real reviews.
      </footer>
    </main>
  );
}
