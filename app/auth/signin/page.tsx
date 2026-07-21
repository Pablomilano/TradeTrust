'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/useAuth';

function toFriendlyAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('failed to fetch') || normalized.includes('err_name_not_resolved')) {
    return 'Cannot reach Supabase right now. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your deployment environment, then redeploy.';
  }

  return message;
}

export default function SignInPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(toFriendlyAuthError(signInError.message));
      setLoading(false);
      return;
    }

    // Wait a brief moment to ensure session is established
    if (data.session) {
      setLoading(false);
      router.replace('/dashboard');
      return;
    } else {
      setError('Sign in succeeded but no session created. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      router.replace('/dashboard');
    }
  }, [session, router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card border border-border p-8">
        <h1 className="text-2xl font-semibold mb-2">Sign in to TradeTrust</h1>
        <p className="text-muted mb-6">Welcome back — manage your jobs and keep clients informed.</p>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="flex flex-col text-sm">
            <span className="mb-2 text-sm">Email</span>
            <input className="p-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          <label className="flex flex-col text-sm">
            <span className="mb-2 text-sm">Password</span>
            <input className="p-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          <button className="mt-2 px-4 py-3 bg-brand-500 text-white rounded-full" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          {error && <p className="text-red-600">{error}</p>}
        </form>

        <p className="mt-6 text-center text-sm">
          New to TradeTrust? <a className="text-brand-500" href="/auth/signup">Create an account</a>
        </p>
      </div>
    </main>
  );
}
