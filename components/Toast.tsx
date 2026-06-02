'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';

type Toast = {
  id: string;
  kind: ToastKind;
  message: string;
  ttl: number;
};

type Ctx = {
  show: (msg: string, kind?: ToastKind, ttlMs?: number) => void;
  success: (msg: string, ttlMs?: number) => void;
  error: (msg: string, ttlMs?: number) => void;
  info: (msg: string, ttlMs?: number) => void;
};

const ToastCtx = createContext<Ctx | null>(null);

export function useToast(): Ctx {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    // Stub for environments where the provider isn't mounted yet (e.g. tests).
    return {
      show: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    const tm = timers.current.get(id);
    if (tm) {
      clearTimeout(tm);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (message: string, kind: ToastKind = 'info', ttlMs = 3200) => {
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      setToasts((t) => [...t, { id, kind, message, ttl: ttlMs }]);
      const tm = setTimeout(() => dismiss(id), ttlMs);
      timers.current.set(id, tm);
    },
    [dismiss],
  );

  useEffect(() => {
    const tm = timers.current;
    return () => {
      tm.forEach((t) => clearTimeout(t));
      tm.clear();
    };
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      show,
      success: (m, t) => show(m, 'success', t),
      error: (m, t) => show(m, 'error', t ?? 5200),
      info: (m, t) => show(m, 'info', t),
    }),
    [show],
  );

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        role="region"
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[80] flex flex-col items-center gap-2 px-4 md:bottom-6"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const { kind, message } = toast;
  const Icon = kind === 'success' ? CheckCircle2 : kind === 'error' ? AlertTriangle : Info;
  const accent =
    kind === 'success' ? 'text-success' : kind === 'error' ? 'accent-synthesis' : 'accent-finance';
  const border =
    kind === 'success'
      ? 'border-[rgba(110,158,124,0.5)]'
      : kind === 'error'
        ? 'border-[rgba(200,110,110,0.5)]'
        : 'border-[rgba(139,158,204,0.5)]';
  return (
    <div
      className={`card-2 pointer-events-auto w-full max-w-sm ${border} reveal flex items-center gap-3 px-4 py-3 shadow-[0_8px_28px_-12px_rgba(0,0,0,0.5)]`}
    >
      <Icon size={16} className={accent} />
      <p className="flex-1 text-sm leading-snug text-text-primary">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="text-text-muted transition-colors hover:text-text-primary"
      >
        <X size={14} />
      </button>
    </div>
  );
}
