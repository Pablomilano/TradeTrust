import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../_utils';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminResult = await requireAdmin(request);

  if ('error' in adminResult) {
    return NextResponse.json({ error: adminResult.error }, { status: adminResult.status });
  }

  const { adminClient } = adminResult;
  const profileId = params.id;

  const { data: profile, error: profileFetchError } = await adminClient
    .from('profiles')
    .select('id, user_id')
    .eq('id', profileId)
    .single();

  if (profileFetchError || !profile) {
    return NextResponse.json(
      { error: profileFetchError?.message || 'Profile not found.' },
      { status: 404 }
    );
  }

  const { data: clientRows, error: clientsError } = await adminClient
    .from('clients')
    .select('id')
    .eq('tradesperson_id', profile.user_id);

  if (clientsError) {
    return NextResponse.json({ error: clientsError.message }, { status: 500 });
  }

  const clientIds = (clientRows || []).map((row) => row.id);

  if (clientIds.length > 0) {
    const { error: jobsDeleteError } = await adminClient
      .from('jobs')
      .delete()
      .in('client_id', clientIds);

    if (jobsDeleteError) {
      return NextResponse.json({ error: jobsDeleteError.message }, { status: 500 });
    }
  }

  const { error: clientsDeleteError } = await adminClient
    .from('clients')
    .delete()
    .eq('tradesperson_id', profile.user_id);

  if (clientsDeleteError) {
    return NextResponse.json({ error: clientsDeleteError.message }, { status: 500 });
  }

  const { error: enquiriesDeleteError } = await adminClient
    .from('enquiries')
    .delete()
    .eq('profile_id', profileId);

  if (enquiriesDeleteError) {
    return NextResponse.json({ error: enquiriesDeleteError.message }, { status: 500 });
  }

  const { error: reviewsDeleteError } = await adminClient
    .from('reviews')
    .delete()
    .eq('profile_id', profileId);

  if (reviewsDeleteError) {
    return NextResponse.json({ error: reviewsDeleteError.message }, { status: 500 });
  }

  const { error: profileDeleteError } = await adminClient
    .from('profiles')
    .delete()
    .eq('id', profileId);

  if (profileDeleteError) {
    return NextResponse.json({ error: profileDeleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}