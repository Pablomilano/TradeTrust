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
