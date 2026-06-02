import { Suspense } from 'react';
import Link from 'next/link';
import { AuthForm } from '../auth/AuthForm';

export const metadata = { title: 'Sign in — LEF' };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <p className="text-[10px] uppercase tracking-[0.32em] text-text-secondary mb-3">
        Continue your journey
      </p>
      <h1 className="font-display text-3xl md:text-4xl tracking-tight mb-6">Sign in</h1>
      <Suspense fallback={<div className="card p-6 skeleton h-64" />}>
        <AuthForm mode="signin" />
      </Suspense>
      <div className="mt-6 flex items-center justify-between text-xs text-text-secondary">
        <Link href="/signup" className="hover:text-text-primary">
          Create an account →
        </Link>
        <Link href="/roadmap" className="hover:text-text-primary">
          Continue as guest →
        </Link>
      </div>
    </div>
  );
}
