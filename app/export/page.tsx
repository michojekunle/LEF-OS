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
    <div className="mx-auto max-w-content px-5 md:px-6 py-10 space-y-8">
      <header className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.32em] text-text-secondary">
          Your archive
        </p>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight">
          Export everything you've written.
        </h1>
        <p className="text-text-secondary max-w-2xl text-sm md:text-base">
          Download a portable copy of your daily entries, notes, and answered questions.
          Use Markdown for a human-readable archive, or CSV for spreadsheets and analytics.
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

      <div className="card p-5 flex items-start gap-3 text-xs text-text-secondary">
        <Lock size={14} className="text-text-muted mt-0.5 shrink-0" />
        <p>
          Exports include private content (notes, journal text). They're generated on the
          server using your session — never cached, never shared.
        </p>
      </div>

      <div>
        <Link
          href="/dashboard"
          className="text-xs text-text-secondary hover:text-text-primary"
        >
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
      className="card p-5 flex flex-col gap-3 hover:border-gold/40 transition-colors group"
    >
      <div className="flex items-center justify-between">
        <Icon size={18} className="text-gold" />
        <Download
          size={14}
          className="text-text-muted group-hover:text-text-primary transition-colors"
        />
      </div>
      <h2 className="font-display text-lg">{title}</h2>
      <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
    </a>
  );
}
