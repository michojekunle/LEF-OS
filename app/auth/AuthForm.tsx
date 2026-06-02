'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase';

type Props = { mode: 'signin' | 'signup' };

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard';
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
        const redirectTo = typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : undefined;
        const { data, error: signErr } = await sb.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTo,
          },
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
        router.push(next);
        router.refresh();
      } else {
        const { error: signErr } = await sb.auth.signInWithPassword({
          email,
          password,
        });
        if (signErr) throw signErr;
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    try {
      const sb = supabaseBrowser();
      const redirectTo = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : undefined;
      const { error: oAuthErr } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });
      if (oAuthErr) throw oAuthErr;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign in failed';
      setError(msg);
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

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-border"></div>
        <span className="flex-shrink mx-4 text-[10px] text-text-muted uppercase tracking-[0.18em]">or</span>
        <div className="flex-grow border-t border-border"></div>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={handleGoogleSignIn}
        className="btn btn-secondary w-full flex items-center justify-center gap-2 border border-border bg-transparent text-text-primary hover:border-gold hover:text-gold"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        Continue with Google
      </button>
    </form>
  );
}
