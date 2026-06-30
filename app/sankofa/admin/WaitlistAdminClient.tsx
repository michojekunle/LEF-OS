'use client';

import { useState, useTransition } from 'react';
import { Cormorant_Garamond, Bebas_Neue } from 'next/font/google';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  style: ['normal', 'italic'],
});
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });

type WaitlistRow = {
  id: string;
  email: string;
  source: string;
  created_at: string;
};

type Props = { rows: WaitlistRow[] };

async function inviteUser(id: string): Promise<string> {
  const res = await fetch('/api/sankofa/admin/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  const data = await res.json();
  if (!res.ok) return data.error ?? 'Failed';
  if (data.message === 'already_invited') return 'already_invited';
  return 'invited';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function WaitlistAdminClient({ rows }: Props) {
  const [search, setSearch] = useState('');
  const [inviteStatus, setInviteStatus] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function handleInvite(id: string) {
    startTransition(async () => {
      const result = await inviteUser(id);
      setInviteStatus((prev) => ({ ...prev, [id]: result }));
    });
  }

  const filtered = search.trim()
    ? rows.filter((r) => r.email.toLowerCase().includes(search.toLowerCase()))
    : rows;

  function exportCsv() {
    const header = 'email,source,signed_up_at';
    const lines = rows.map(
      (r) => `${r.email},${r.source},${new Date(r.created_at).toISOString()}`,
    );
    const csv = [header, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sankofa-waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        color: '#F4F0EA',
        padding: '60px 40px',
        fontFamily: 'monospace',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <div className={`${bebas.className}`} style={{ fontSize: '13px', letterSpacing: '0.3em', color: '#c9ab70', marginBottom: '8px' }}>
          SANKOFA · ADMIN
        </div>
        <h1 className={cormorant.className} style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1, margin: 0 }}>
          Waitlist Archive
        </h1>
        <p style={{ marginTop: '12px', opacity: 0.5, fontSize: '0.85rem', letterSpacing: '0.08em' }}>
          {rows.length} TOTAL ENTRIES
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            background: '#1a1a1a',
            border: '1px solid #333',
            color: '#F4F0EA',
            padding: '10px 16px',
            fontSize: '0.85rem',
            letterSpacing: '0.05em',
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={exportCsv}
          style={{
            background: '#c9ab70',
            color: '#0A0A0A',
            border: 'none',
            padding: '10px 24px',
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            letterSpacing: '0.15em',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          EXPORT CSV
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333' }}>
              {['#', 'EMAIL', 'SOURCE', 'SIGNED UP', 'INVITE'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '10px 16px',
                    letterSpacing: '0.15em',
                    color: '#c9ab70',
                    fontWeight: 400,
                    fontSize: '0.7rem',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '40px 16px', textAlign: 'center', opacity: 0.3 }}>
                  No entries found.
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: '1px solid #1e1e1e',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '#141414')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 16px', opacity: 0.3, width: '48px' }}>{i + 1}</td>
                  <td style={{ padding: '12px 16px', color: '#F4F0EA' }}>{row.email}</td>
                  <td style={{ padding: '12px 16px', opacity: 0.5 }}>{row.source}</td>
                  <td style={{ padding: '12px 16px', opacity: 0.5, whiteSpace: 'nowrap' }}>
                    {formatDate(row.created_at)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {inviteStatus[row.id] === 'invited' || inviteStatus[row.id] === 'already_invited' ? (
                      <span style={{ color: '#c9ab70', fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                        {inviteStatus[row.id] === 'already_invited' ? 'ALREADY INVITED' : 'INVITED ✓'}
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleInvite(row.id)}
                        style={{
                          background: 'transparent',
                          border: '1px solid #333',
                          color: '#F4F0EA',
                          padding: '4px 12px',
                          fontSize: '0.65rem',
                          fontFamily: 'monospace',
                          letterSpacing: '0.15em',
                          cursor: 'pointer',
                          opacity: isPending ? 0.4 : 1,
                        }}
                      >
                        INVITE
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '60px', opacity: 0.2, fontSize: '0.7rem', letterSpacing: '0.15em' }}>
        SANKOFA · PHASE 01 FAPEM · FOUNDATION
      </div>
    </div>
  );
}
