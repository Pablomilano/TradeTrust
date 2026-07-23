import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const SPOTS_PER_TRADE_AREA = 25;

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server is missing Supabase environment variables.' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const trade = searchParams.get('trade')?.trim();
  const area = searchParams.get('area')?.trim();

  if (!trade || !area) {
    return NextResponse.json({ error: 'Missing trade or area.' }, { status: 400 });
  }

  // Service role bypasses RLS — this route only ever returns a count, never the underlying rows.
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { count, error } = await supabase
    .from('waitlist_signups')
    .select('*', { count: 'exact', head: true })
    .eq('trade', trade)
    .ilike('coverage_area', area);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const taken = Math.min(count ?? 0, SPOTS_PER_TRADE_AREA);

  return NextResponse.json({
    taken,
    cap: SPOTS_PER_TRADE_AREA,
    remaining: Math.max(SPOTS_PER_TRADE_AREA - taken, 0),
  });
}
