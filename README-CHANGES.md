# TradeTrust update: new trades + AI follow-up SMS

## 1. New trade categories

Added Tiler, Landscaper, Roofer, Carpet Fitter, Handyman.

The trade list used to be hardcoded separately in 4 places (homepage dropdown,
`/find` grid, `/find/[trade]` labels, dashboard signup form). It's now defined
once in `lib/trades.ts`, and all 4 places import from it — so adding a trade
in future is a one-line change in that file.

**Files changed:** `app/page.tsx`, `app/find/page.tsx`, `app/find/[trade]/page.tsx`,
`app/dashboard/page.tsx`
**File added:** `lib/trades.ts`

### Database
Your Supabase `profiles` table has a `check` constraint restricting `trade` to
the original 8 values. You need to run the migration below against your live DB
(Supabase SQL editor), or new trades will fail to save even though the UI allows
picking them:

```
db/migrations/add_new_trades.sql
```

`db/schema.sql` (your reference schema for fresh installs) has also been updated
to match.

## 2. AI follow-up SMS on cold jobs

When a job shows the "Going cold" badge (no contact in 5+ days), there's now a
**"Draft follow-up SMS"** button. It:

1. Calls Claude (Sonnet 5) to draft a short, specific SMS based on the job title,
   description, status, and how long it's been since contact.
2. Shows the draft in an editable box — you review/edit before anything is sent.
3. On "Send SMS", sends it via Twilio and updates `last_contacted_at` on the job.

Nothing sends automatically — every message goes through you first.

**Files added:**
- `app/api/draft-sms/route.ts` — calls the Anthropic API server-side
- `app/api/send-sms/route.ts` — sends via Twilio, updates the job record
- `lib/apiAuth.ts` — shared helper that authenticates the request using the
  caller's Supabase session (no service-role key used — normal RLS applies)

**Dashboard changes:** `app/dashboard/page.tsx` — new modal + button on cold job cards.

### Environment variables needed in Vercel
```
ANTHROPIC_API_KEY=sk-ant-...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+44...      # your Twilio sending number, E.164 format
```

### Notes / things to check
- Phone number handling assumes UK numbers: a client phone starting with `0`
  is converted to `+44...`; numbers already starting with `+` are left alone.
  If any client phone numbers are stored in another format, sending will fail
  for that client — worth spot-checking your `clients.phone` data.
- The draft prompt asks for under 300 characters, British tone, no emoji/markdown.
  Worth sending yourself a couple of test messages before relying on it with
  real clients.
- I did not add the Twilio SDK as a dependency — the route calls Twilio's REST
  API directly with `fetch`, to keep the footprint small since you said you
  already have Twilio set up elsewhere.

## Applying these changes
`CHANGES.diff` is a git patch of the modified files (not the new files, which
are included separately above). From your repo root:
```
git apply CHANGES.diff
```
Then copy in the new files (`lib/trades.ts`, `lib/apiAuth.ts`, `app/api/`,
`db/migrations/add_new_trades.sql`) from this bundle, or just copy everything
in this zip over your working copy and `git add -A`.

I ran `next build` locally against this code (with placeholder Supabase env
vars) and it compiled cleanly with no type errors.
