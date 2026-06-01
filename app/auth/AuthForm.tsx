'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase';

type Props = { mode: 'signin' | 'signup' };

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const sb = supabaseBrowser();
      if (mode === 'signup') {
        const { data, error: signErr } = await sb.auth.signUp({
          email,
          password,
        });
        if (signErr) throw signErr;
        if (data.user) {
          await sb.from('profiles').upsert({
            id: data.user.id,
            display_name: displayName || email.split('@')[0],
          });
        }
        if (!data.session) {
          setMessage('Check your email to confirm your account.');
          return;
        }
        router.push('/dashboard');
        router.refresh();
      } else {
        const { error: signErr } = await sb.auth.signInWithPassword({
          email,
          password,
        });
        if (signErr) throw signErr;
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      {mode === 'signup' && (
        <div>
          <label htmlFor="name" className="text-[10px] uppercase tracking-[0.18em] text-text-secondary block mb-1.5">
            Display name
          </label>
          <input
            id="name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input"
            placeholder="What should we call you?"
          />
        </div>
      )}
      <div>
        <label htmlFor="email" className="text-[10px] uppercase tracking-[0.18em] text-text-secondary block mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-[10px] uppercase tracking-[0.18em] text-text-secondary block mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        />
      </div>

      {error && (
        <div className="text-xs accent-synthesis border border-accent-synthesis bg-accent-synthesis rounded-md p-2.5">
          {error}
        </div>
      )}
      {message && (
        <div className="text-xs accent-econ border border-accent-econ bg-accent-econ rounded-md p-2.5">
          {message}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Please wait
          </>
        ) : mode === 'signup' ? (
          'Create account'
        ) : (
          'Sign in'
        )}
      </button>
    </form>
  );
}
