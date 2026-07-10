'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push('/auth/signin');
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card border border-border p-8">
        <h1 className="text-2xl font-semibold mb-2">Create a TradeTrust account</h1>
        <p className="text-muted mb-6">Trusted tools for local tradespeople.</p>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="flex flex-col text-sm">
            <span className="mb-2 text-sm">Email</span>
            <input className="p-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          <label className="flex flex-col text-sm">
            <span className="mb-2 text-sm">Password</span>
            <input className="p-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </label>

          <button className="mt-2 px-4 py-3 bg-brand-500 text-white rounded-full" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
          {error && <p className="text-red-600">{error}</p>}
        </form>

        <p className="mt-6 text-center text-sm">
          Already have an account? <a className="text-brand-500" href="/auth/signin">Sign in</a>
        </p>
      </div>
    </main>
  );
}
