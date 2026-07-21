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

  const { error } = await adminClient
    .from('reviews')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}