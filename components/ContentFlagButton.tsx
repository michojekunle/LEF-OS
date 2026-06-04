'use client';

import { useState } from 'react';
import { Flag, X, Send, CheckCircle2 } from 'lucide-react';

type Props = {
  url: string;
  title: string;
  contentType: 'video' | 'article';
  dayNumber?: number;
  domain?: string;
  userId?: string;
};

type Step = 'idle' | 'open' | 'submitting' | 'done' | 'error';

export function ContentFlagButton({ url, title, contentType, dayNumber, domain, userId }: Props) {
  const [step, setStep] = useState<Step>('idle');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  function open(e: React.MouseEvent): void {
    e.preventDefault(); // Don't follow the parent link
    e.stopPropagation();
    setStep('open');
  }

  function cancel(): void {
    setStep('idle');
    setReason('');
    setErrorMsg('');
  }

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setStep('submitting');
    try {
      const res = await fetch('/api/content/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          title,
          content_type: contentType,
          day_number: dayNumber,
          domain,
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
      setErrorMsg('Network error. Try again.');
      setStep('error');
    }
  }

  if (step === 'done') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 text-xs text-success">
        <CheckCircle2 size={11} /> Flagged
      </span>
    );
  }

  return (
    <div className="relative shrink-0">
      {step === 'idle' && (
        <button
          onClick={open}
          title="Flag this link as broken or incorrect"
          aria-label="Flag this resource"
          className="rounded p-1 text-text-muted opacity-0 transition-all group-hover:opacity-100 hover:text-red focus:opacity-100"
        >
          <Flag size={12} />
        </button>
      )}

      {(step === 'open' || step === 'submitting' || step === 'error') && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={cancel}
            aria-hidden="true"
          />

          {/* Popover */}
          <div className="absolute right-0 top-full z-20 mt-1 w-72 rounded-lg border border-[var(--border-subtle)] bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-3 py-2.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
                <Flag size={12} className="text-red" />
                Flag {contentType === 'video' ? 'video' : 'article'}
              </span>
              <button
                onClick={cancel}
                className="rounded p-0.5 text-text-muted hover:text-text-primary"
                aria-label="Cancel"
              >
                <X size={13} />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-3 p-3">
              {/* What's being flagged */}
              <p className="truncate text-xs text-text-secondary" title={title}>
                "{title}"
              </p>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="What's wrong? Broken link, wrong topic, outdated content… (optional)"
                maxLength={300}
                rows={3}
                autoFocus
                className="w-full resize-none rounded border border-[var(--border-subtle)] bg-surface-2 px-2.5 py-2 text-xs text-text-primary outline-none placeholder:text-text-muted focus:border-gold"
              />

              {!userId && (
                <p className="text-xs text-text-muted">
                  Flagging anonymously.{' '}
                  <a href="/login" className="text-gold hover:underline">
                    Sign in
                  </a>{' '}
                  to track your flags.
                </p>
              )}

              {step === 'error' && (
                <p className="text-xs text-red">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={step === 'submitting'}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-red/30 bg-red/10 px-3 py-1.5 text-xs font-semibold text-red transition-colors hover:bg-red/20 disabled:opacity-50"
              >
                {step === 'submitting' ? (
                  'Submitting…'
                ) : (
                  <>
                    <Send size={11} /> Submit flag
                  </>
                )}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
