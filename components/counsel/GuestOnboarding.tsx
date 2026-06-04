'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function GuestOnboarding() {
  return (
    <div className="my-auto flex h-full flex-col items-center justify-center space-y-4 p-6 text-center">
      <div className="bg-gold/10 border-gold/30 flex h-12 w-12 items-center justify-center rounded-full border">
        <Sparkles size={20} className="text-gold" />
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
          Consult LEF Counsel
        </h3>
        <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-text-secondary">
          Sign in to consult LEF Counsel, get personalised study help, practice with interactive
          quizzes, and save your academic notes.
        </p>
      </div>
      <Link href="/login" className="btn btn-primary mt-4 w-full py-2 text-center text-xs font-semibold">
        Sign In to Start
      </Link>
    </div>
  );
}
