'use client';

import { useState } from 'react';
import { Flag, X, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';

type Props = {
  submissionId: string;
  userId?: string;
};

type Step = 'idle' | 'open' | 'submitting' | 'done' | 'error';

export function FlagButton({ submissionId, userId }: Props) {
  const [step, setStep] = useState<Step>('idle');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function submit(): Promise<void> {
    setStep('submitting');
    try {
      const res = await fetch('/api/resources/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: submissionId,
          reason: reason.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (res.ok) {
        setStep('done');
      } else {
        setErrorMsg(data.error ?? 'Could not submit flag.');
        setStep('error');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStep('error');
    }
  }

  if (step === 'done') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-text-muted">
        <CheckCircle2 size={11} className="text-success" /> Flagged
      </span>
    );
  }

  if (step === 'idle') {
    return (
      <button
        onClick={() => setStep('open')}
        title="Flag this resource as incorrect or inappropriate"
        className="inline-flex items-center gap-1 text-xs text-text-muted opacity-0 transition-all hover:text-red group-hover:opacity-100"
      >
        <Flag size={11} />
        Flag
      </button>
    );
  }

  // Popover form
  return (
    <div className="absolute right-0 top-full z-20 mt-1 w-64 rounded-lg border border-[var(--border-subtle)] bg-surface shadow-xl">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-3 py-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-red">
          <AlertTriangle size={12} />
          Flag resource
        </div>
        <button
          onClick={() => {
            setStep('idle');
            setReason('');
            setErrorMsg('');
          }}
          className="text-text-muted hover:text-text-primary"
          aria-label="Cancel"
        >
          <X size={13} />
        </button>
      </div>

      <div className="space-y-2.5 p-3">
        {!userId && (
          <p className="text-xs text-text-muted">
            You're flagging anonymously.{' '}
            <a href="/login" className="text-gold hover:underline">
              Sign in
            </a>{' '}
            to track your flags.
          </p>
        )}

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why is this resource wrong or inappropriate? (optional)"
          maxLength={300}
          rows={3}
          className="w-full resize-none rounded border border-[var(--border-subtle)] bg-surface-2 px-2.5 py-2 text-xs text-text-primary outline-none placeholder:text-text-muted focus:border-red"
        />

        {step === 'error' && <p className="text-xs text-red">{errorMsg}</p>}

        <button
          onClick={submit}
          disabled={step === 'submitting'}
          className="border-red/30 bg-red/10 hover:bg-red/20 inline-flex w-full items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold text-red transition-colors disabled:opacity-40"
        >
          {step === 'submitting' ? (
            'Submitting…'
          ) : (
            <>
              <Send size={11} /> Submit flag
            </>
          )}
        </button>
      </div>
    </div>
  );
}
