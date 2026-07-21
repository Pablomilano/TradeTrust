import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../_utils';

interface ProfileRow {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  trade: string;
  coverage_area: string | null;
  visibility: boolean;
  created_at: string;
}

interface ReviewRow {
  id: string;
  profile_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

function startOfWeekIso() {
  const now = new Date();
  const day = now.getDay();
  const offsetToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + offsetToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

export async function GET(request: NextRequest) {
  const adminResult = await requireAdmin(request);

  if ('error' in adminResult) {
    return NextResponse.json({ error: adminResult.error }, { status: adminResult.status });
  }

  const { adminClient } = adminResult;

  const [profilesRes, reviewsRes, enquiriesAllRes, enquiriesWeekRes, jobsRes] = await Promise.all([
    adminClient
      .from('profiles')
      .select('id, user_id, first_name, last_name, business_name, trade, coverage_area, visibility, created_at')
      .order('created_at', { ascending: false }),
    adminClient
      .from('reviews')
      .select('id, profile_id, reviewer_name, rating, comment, created_at')
      .order('created_at', { ascending: false }),
    adminClient.from('enquiries').select('id', { count: 'exact', head: true }),
    adminClient.from('enquiries').select('id', { count: 'exact', head: true }).gte('created_at', startOfWeekIso()),
    adminClient.from('jobs').select('id', { count: 'exact', head: true }),
  ]);

  if (profilesRes.error || reviewsRes.error || enquiriesAllRes.error || enquiriesWeekRes.error || jobsRes.error) {
    return NextResponse.json(
      {
        error:
          profilesRes.error?.message ||
          reviewsRes.error?.message ||
          enquiriesAllRes.error?.message ||
          enquiriesWeekRes.error?.message ||
          jobsRes.error?.message ||
          'Failed to load admin summary.',
      },
      { status: 500 }
    );
  }

  const profiles = (profilesRes.data || []) as ProfileRow[];
  const reviews = (reviewsRes.data || []) as ReviewRow[];

  return NextResponse.json({
    totals: {
      users: profiles.length,
      enquiriesAllTime: enquiriesAllRes.count || 0,
      enquiriesThisWeek: enquiriesWeekRes.count || 0,
      reviews: reviews.length,
      jobs: jobsRes.count || 0,
    },
    profiles,
    reviews,
  });
}