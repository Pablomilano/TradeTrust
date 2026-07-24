import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ADMIN_EMAIL } from '../admin/_utils';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: 'Server is missing Supabase environment variables.' }, { status: 500 });
  }

  let body: { name?: string; trade?: string; coverage_area?: string; email?: string; phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { name, trade, coverage_area, email, phone } = body;

  if (!name || !trade || !coverage_area || !email) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, anonKey);

  const { error: insertError } = await supabase.from('waitlist_signups').insert([
    { name, trade, coverage_area, email, phone: phone || null },
  ]);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Best-effort notifications — a failed email should never fail the signup itself.
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'TradeTrust <onboarding@resend.dev>',
          to: [ADMIN_EMAIL],
          subject: `New early access signup: ${name} (${trade})`,
          html: `
            <p>New TradeTrust early access signup:</p>
            <ul>
              <li><strong>Name:</strong> ${name}</li>
              <li><strong>Trade:</strong> ${trade}</li>
              <li><strong>Area:</strong> ${coverage_area}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Phone:</strong> ${phone || '—'}</li>
            </ul>
          `,
        }),
      });
    } catch {
      // Signup already succeeded; the email is a nice-to-have, so swallow this.
    }

    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'TradeTrust <onboarding@resend.dev>',
          to: [email],
          subject: `You're on the TradeTrust early access list, ${name.split(' ')[0]}`,
          html: `
            <p>Hey ${name.split(' ')[0]},</p>
            <p>Thanks for signing up to TradeTrust — wanted to be upfront: this is a new platform I'm building from scratch, not an established company. I'm pushing hard to get it market-ready so clients in ${coverage_area} can search the database and find a ${trade.toLowerCase()} directly.</p>
            <p>You're in early as a founding member, which locks in your rate before it goes up to £24.99/month for everyone else later.</p>
            <p>I'll keep you posted as we hit key milestones (search live, first client leads, etc). Appreciate you being early on this — feel free to reply with any thoughts on what you'd want from it as a working ${trade.toLowerCase()}.</p>
          `,
        }),
      });
    } catch {
      // Signup already succeeded; the email is a nice-to-have, so swallow this.
    }
  }

  return NextResponse.json({ ok: true });
}