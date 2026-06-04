'use client';

import { Send } from 'lucide-react';

type Props = {
  input: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function ChatInput({ input, loading, onChange, onSubmit }: Props) {
  return (
    <div className="bg-surface-2/20 flex gap-2 border-t border-border px-4 py-3">
      <input
        type="text"
        value={input}
        disabled={loading}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSubmit()}
        placeholder="Ask LEF Counsel a question…"
        className="flex-1 rounded border border-border bg-transparent px-2.5 py-2 text-xs text-text-primary outline-none placeholder:text-text-muted focus:border-text-primary"
        aria-label="Type your question to LEF Counsel"
      />
      <button
        onClick={onSubmit}
        disabled={loading || !input.trim()}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-text-primary text-bg transition-colors hover:bg-gold hover:text-bg disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Send message"
      >
        <Send size={12} />
      </button>
    </div>
  );
}
