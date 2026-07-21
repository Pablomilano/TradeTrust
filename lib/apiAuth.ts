import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

// Authenticates an API route request using the Supabase access token sent
// from the client (Authorization: Bearer <token>). Returns a Supabase client
// scoped to that user, so all normal RLS policies apply — this route never
// uses a service-role key.
export async function authenticateRequest(
  request: Request
): Promise<{ supabase: SupabaseClient; user: User } | { error: string; status: number }> {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');

  if (!token) {
    return { error: 'Missing Authorization header', status: 401 };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: 'Server is missing Supabase environment variables', status: 500 };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { error: 'Invalid or expired session', status: 401 };
  }

  return { supabase, user: data.user };
}
