import { Suspense } from 'react';
import Link from 'next/link';
import { AuthForm } from '../auth/AuthForm';

export const metadata = { title: 'Sign up — LEF' };

export default function SignUpPage() {
  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <p className="mb-3 text-[10px] uppercase tracking-[0.32em] text-text-secondary">
        Begin in public
      </p>
      <h1 className="mb-6 font-display text-3xl tracking-tight md:text-4xl">Sign up</h1>
      <Suspense fallback={<div className="card skeleton h-64 p-6" />}>
        <AuthForm mode="signup" />
      </Suspense>
      <div className="mt-6 flex items-center justify-between text-xs text-text-secondary">
        <Link href="/login" className="hover:text-text-primary">
          ← Already have an account?
        </Link>
        <Link href="/roadmap" className="hover:text-text-primary">
          Continue as guest →
        </Link>
      </div>
    </div>
  );
}
