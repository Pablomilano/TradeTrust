import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const SPOTS_PER_TRADE = 25;

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server is missing Supabase environment variables.' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const trade = searchParams.get('trade')?.trim();

  if (!trade) {
    return NextResponse.json({ error: 'Missing trade.' }, { status: 400 });
  }

  // Service role bypasses RLS — this route only ever returns a count, never the underlying rows.
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { count, error } = await supabase
    .from('waitlist_signups')
    .select('*', { count: 'exact', head: true })
    .eq('trade', trade);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const taken = Math.min(count ?? 0, SPOTS_PER_TRADE);

  return NextResponse.json({
    taken,
    cap: SPOTS_PER_TRADE,
    remaining: Math.max(SPOTS_PER_TRADE - taken, 0),
  });
}

