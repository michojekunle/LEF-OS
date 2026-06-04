import Link from 'next/link';
import { Download, FileText, FileSpreadsheet, Lock } from 'lucide-react';
import { redirect } from 'next/navigation';
import { hasSupabaseConfig } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';

export const metadata = { title: 'Export — LEF' };
export const dynamic = 'force-dynamic';

export default async function ExportPage() {
  if (!hasSupabaseConfig()) redirect('/');
  const sb = await supabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) redirect('/login?next=/export');

  return (
    <div className="mx-auto max-w-content space-y-8 px-5 py-10 md:px-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.32em] text-text-secondary">Your archive</p>
        <h1 className="font-display text-3xl tracking-tight md:text-4xl">
          Export everything you've written.
        </h1>
        <p className="max-w-2xl text-sm text-text-secondary md:text-base">
          Download a portable copy of your daily entries, notes, and answered questions. Use
          Markdown for a human-readable archive, or CSV for spreadsheets and analytics.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <ExportCard
          href="/export/markdown"
          Icon={FileText}
          title="Markdown bundle"
          description="One .md file grouped by day, with notes and answered questions inline. Great for backups and journaling apps."
        />
        <ExportCard
          href="/export/csv"
          Icon={FileSpreadsheet}
          title="CSV"
          description="One row per daily entry with completion flags, depth rating, journal, and insight."
        />
      </div>

      <div className="card flex items-start gap-3 p-5 text-xs text-text-secondary">
        <Lock size={14} className="mt-0.5 shrink-0 text-text-muted" />
        <p>
          Exports include private content (notes, journal text). They're generated on the server
          using your session — never cached, never shared.
        </p>
      </div>

      <div>
        <Link href="/dashboard" className="text-xs text-text-secondary hover:text-text-primary">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}

function ExportCard({
  href,
  Icon,
  title,
  description,
}: {
  href: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      download
      className="card hover:border-gold/40 group flex flex-col gap-3 p-5 transition-colors"
    >
      <div className="flex items-center justify-between">
        <Icon size={18} className="text-gold" />
        <Download
          size={14}
          className="text-text-muted transition-colors group-hover:text-text-primary"
        />
      </div>
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
    </a>
  );
}
