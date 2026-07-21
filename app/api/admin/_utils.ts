import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

export const ADMIN_EMAIL = 'paulmilne00@gmail.com';

function getAuthToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  const [scheme, token] = authHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

export async function requireAdmin(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return {
      error: 'Missing Supabase server environment variables.',
      status: 500,
    } as const;
  }

  const token = getAuthToken(request);
  if (!token) {
    return {
      error: 'Missing auth token.',
      status: 401,
    } as const;
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: userData, error: userError } = await authClient.auth.getUser();

  if (userError || !userData.user) {
    return {
      error: userError?.message || 'Not authenticated.',
      status: 401,
    } as const;
  }

  if (userData.user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return {
      error: 'Forbidden.',
      status: 403,
    } as const;
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return {
    adminClient,
  } as const;
}