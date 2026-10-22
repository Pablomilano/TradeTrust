# TradeTrust

A Next.js App Router project scaffold for TradeTrust, an AI-enabled marketplace for local tradespeople.

## What is included

- Next.js App Router scaffold
- Supabase client setup
- Environment variable placeholders for Supabase, Stripe, Twilio, and Anthropic
- Sign-up and sign-in flows for tradespeople
- Initial dashboard page
- TypeScript schema definitions for tradespeople, clients, jobs, reviews, and subscriptions

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in your `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and other secret keys.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Run the app:

   ```bash
   npm run dev
   ```

## Supabase schema proposal

The schema includes:

- `tradespeople`
- `clients`
- `jobs`
- `reviews`
- `subscriptions`

See `db/schema.sql` for a starting migration.

## XAU/USD signal runner

The optional standalone runner requests XAU/USD candles from Twelve Data for
D1, H4, H1, and M15, analyzes only fully closed candles, and asks Claude for at
most one long/short setup or NO TRADE. Code rejects setups with invalid stops,
out-of-range risk, or less than 1.5:1 reward-to-risk at any target. Accepted
signals and NO TRADE decisions are appended to `signals.jsonl`; accepted
signals are sent to Telegram only when both Telegram variables are configured.
The runner does not place trades.

Set `TWELVE_DATA_API_KEY` and `ANTHROPIC_API_KEY` in your environment. To enable
Telegram, also set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`. Run it from the
repository root with:

```bash
node --env-file=.env.local scripts/xau-usd-signals.mjs
```

Schedule this command externally if periodic signals are desired. `signals.jsonl`
is ignored by Git because it contains generated runtime data.
