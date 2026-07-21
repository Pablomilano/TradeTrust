import { NextResponse } from 'next/server';
import { authenticateRequest } from '../../../lib/apiAuth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const auth = await authenticateRequest(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { supabase, user } = auth;

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicApiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not set in the server environment' },
      { status: 500 }
    );
  }

  let jobId: string | undefined;
  try {
    const body = await request.json();
    jobId = body.jobId;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
  }

  // RLS scopes this to jobs owned by the authenticated tradesperson.
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, title, description, status, last_contacted_at, client_id, tradesperson_id')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, name, phone')
    .eq('id', job.client_id)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_name, first_name, trade')
    .eq('user_id', user.id)
    .single();

  const businessName = profile?.business_name || profile?.first_name || 'your tradesperson';
  const firstName = client.name?.split(' ')[0] || client.name || 'there';
  const daysSinceContact = job.last_contacted_at
    ? Math.floor((Date.now() - new Date(job.last_contacted_at).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const prompt = `Write a short, friendly SMS from a UK tradesperson to a client, following up on a job that has gone quiet.

Business name: ${businessName}
Trade: ${profile?.trade || 'tradesperson'}
Client first name: ${firstName}
Job title: ${job.title}
Job description: ${job.description}
Job status: ${job.status}
${daysSinceContact !== null ? `Days since last contact: ${daysSinceContact}` : 'No contact logged yet'}

Requirements:
- Under 300 characters, plain text, no markdown, no emoji, no placeholders like [Name].
- Friendly, low-pressure, professional British tone.
- Reference the job specifically, not a generic template.
- Sign off with the business name.
- Output ONLY the SMS text, nothing else.`;

  let anthropicResponse: Response;
  try {
    anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to reach the Anthropic API' }, { status: 502 });
  }

  if (!anthropicResponse.ok) {
    const errText = await anthropicResponse.text();
    return NextResponse.json(
      { error: `Anthropic API error: ${errText}` },
      { status: 502 }
    );
  }

  const data = await anthropicResponse.json();
  const draft = (data.content || [])
    .filter((block: { type: string }) => block.type === 'text')
    .map((block: { text: string }) => block.text)
    .join('\n')
    .trim();

  if (!draft) {
    return NextResponse.json({ error: 'No draft was returned' }, { status: 502 });
  }

  return NextResponse.json({ draft, clientName: client.name, clientPhone: client.phone });
}
