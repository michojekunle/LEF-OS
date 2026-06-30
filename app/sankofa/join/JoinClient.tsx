'use client';

import { useState } from 'react';
import { Cormorant_Garamond, Bebas_Neue } from 'next/font/google';
import { createClient } from '@supabase/supabase-js';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  style: ['normal', 'italic'],
});
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });

type Status = 'valid' | 'invalid' | 'used';
type Props = { status: Status; email: string | null };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export function JoinClient({ status, email }: Props) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMagicLink() {
    if (!email || loading) return;
    setLoading(true);
    setError('');
    try {
      const sb = createClient(SUPABASE_URL, SUPABASE_ANON);
      const { error: err } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/sankofa/vault` },
      });
      if (err) {
        setError(err.message);
      } else {
        setSent(true);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: '#0A0A0A',
    color: '#F4F0EA',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    textAlign: 'center',
  };

  if (status === 'invalid') {
    return (
      <div style={containerStyle}>
        <div className={bebas.className} style={{ fontSize: '12px', letterSpacing: '0.3em', color: '#c9ab70', marginBottom: '24px' }}>
          SANKOFA · ACCESS
        </div>
        <h1 className={cormorant.className} style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, marginBottom: '16px' }}>
          Invalid Invitation
        </h1>
        <p style={{ opacity: 0.5, maxWidth: '400px', lineHeight: 1.7 }}>
          This invitation link is not valid. It may have already been used or does not exist.
          Return to the archive and join the waitlist.
        </p>
        <a
          href="/sankofa"
          style={{ marginTop: '40px', color: '#c9ab70', textDecoration: 'none', fontSize: '0.85rem', letterSpacing: '0.15em' }}
        >
          ← RETURN TO SANKOFA
        </a>
      </div>
    );
  }

  if (status === 'used') {
    return (
      <div style={containerStyle}>
        <div className={bebas.className} style={{ fontSize: '12px', letterSpacing: '0.3em', color: '#c9ab70', marginBottom: '24px' }}>
          SANKOFA · ACCESS
        </div>
        <h1 className={cormorant.className} style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, marginBottom: '16px' }}>
          Already Claimed
        </h1>
        <p style={{ opacity: 0.5, maxWidth: '400px', lineHeight: 1.7 }}>
          This invitation has already been used. Sign in directly to access the archive.
        </p>
        <a
          href="/login?next=/sankofa/vault"
          style={{
            marginTop: '40px',
            background: '#c9ab70',
            color: '#0A0A0A',
            padding: '12px 32px',
            textDecoration: 'none',
            fontSize: '0.75rem',
            letterSpacing: '0.2em',
            fontFamily: 'monospace',
            fontWeight: 700,
          }}
        >
          SIGN IN
        </a>
      </div>
    );
  }

  // status === 'valid'
  return (
    <div style={containerStyle}>
      <div className={bebas.className} style={{ fontSize: '12px', letterSpacing: '0.3em', color: '#c9ab70', marginBottom: '24px' }}>
        SANKOFA · PHASE 02 KORAE
      </div>
      <h1 className={cormorant.className} style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, marginBottom: '8px', lineHeight: 1.1 }}>
        The Vault
        <br />
        <span style={{ fontStyle: 'italic', fontWeight: 300 }}>is open.</span>
      </h1>
      <p style={{ opacity: 0.6, maxWidth: '420px', lineHeight: 1.8, marginTop: '24px', fontSize: '1rem' }}>
        Your invitation has been verified. We&apos;ll send a sign-in link to{' '}
        <strong style={{ color: '#F4F0EA', opacity: 1 }}>{email}</strong> — click it to enter the
        archive.
      </p>

      {sent ? (
        <div style={{ marginTop: '48px', opacity: 0.7, fontSize: '0.9rem', lineHeight: 1.8 }}>
          Check your inbox. The archive awaits.
        </div>
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={sendMagicLink}
          style={{
            marginTop: '48px',
            background: '#c9ab70',
            color: '#0A0A0A',
            border: 'none',
            padding: '16px 40px',
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            letterSpacing: '0.2em',
            cursor: loading ? 'wait' : 'pointer',
            fontWeight: 700,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'SENDING...' : 'SEND MY ACCESS LINK'}
        </button>
      )}

      {error && (
        <p style={{ marginTop: '16px', color: '#c0392b', fontSize: '0.8rem' }}>{error}</p>
      )}
    </div>
  );
}
