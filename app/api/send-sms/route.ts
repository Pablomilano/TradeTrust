import { NextResponse } from 'next/server';
import { authenticateRequest } from '../../../lib/apiAuth';

export const runtime = 'nodejs';

// Converts a UK local number (07123 456789) to E.164 (+447123456789).
// Leaves already-international numbers (+...) untouched.
function toE164UK(rawPhone: string): string | null {
  const trimmed = rawPhone.trim().replace(/[\s()-]/g, '');
  if (trimmed.startsWith('+')) return trimmed;
  if (trimmed.startsWith('0')) return `+44${trimmed.slice(1)}`;
  return null;
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { supabase } = auth;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return NextResponse.json(
      { error: 'Twilio environment variables are not fully set (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER)' },
      { status: 500 }
    );
  }

  let jobId: string | undefined;
  let message: string | undefined;
  try {
    const body = await request.json();
    jobId = body.jobId;
    message = body.message;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!jobId || !message || !message.trim()) {
    return NextResponse.json({ error: 'jobId and message are required' }, { status: 400 });
  }

  // RLS scopes this to jobs owned by the authenticated tradesperson.
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, client_id')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, phone')
    .eq('id', job.client_id)
    .single();

  if (clientError || !client || !client.phone) {
    return NextResponse.json({ error: 'Client has no phone number on file' }, { status: 400 });
  }

  const toNumber = toE164UK(client.phone);
  if (!toNumber) {
    return NextResponse.json({ error: `Could not parse client phone number: ${client.phone}` }, { status: 400 });
  }

  const twilioResponse = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        To: toNumber,
        From: fromNumber,
        Body: message,
      }),
    }
  );

  if (!twilioResponse.ok) {
    const errText = await twilioResponse.text();
    return NextResponse.json({ error: `Twilio error: ${errText}` }, { status: 502 });
  }

  const nowIso = new Date().toISOString();
  const { error: updateError } = await supabase
    .from('jobs')
    .update({ last_contacted_at: nowIso })
    .eq('id', jobId);

  if (updateError) {
    // SMS sent but the job record didn't update — surface this rather than hide it.
    return NextResponse.json(
      { warning: 'SMS sent, but failed to update last_contacted_at', error: updateError.message },
      { status: 207 }
    );
  }

  return NextResponse.json({ success: true, lastContactedAt: nowIso });
}
