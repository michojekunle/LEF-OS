'use client';

import { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandaloneState, setIsStandaloneState] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already running in standalone mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    
    setIsStandaloneState(standalone);
    if (standalone) return;

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Event listener for Android/Chrome/Desktop
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      const dismissed = localStorage.getItem('lef-pwa-dismissed');
      if (dismissed !== 'true') {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    const appInstalledHandler = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', appInstalledHandler);

    // Command palette trigger listener
    const forceShowHandler = () => {
      setShowPrompt(true);
    };
    window.addEventListener('show-install-prompt', forceShowHandler);

    // Auto-show logic (only runs if not already dismissed)
    const dismissed = localStorage.getItem('lef-pwa-dismissed');
    let timer: NodeJS.Timeout | null = null;
    let fallbackTimer: NodeJS.Timeout | null = null;

    if (dismissed !== 'true') {
      if (ios) {
        timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      } else {
        fallbackTimer = setTimeout(() => {
          setShowPrompt((prev) => {
            if (prev) return prev;
            if (localStorage.getItem('lef-pwa-dismissed') === 'true') return false;
            return true;
          });
        }, 8000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', appInstalledHandler);
      window.removeEventListener('show-install-prompt', forceShowHandler);
      if (timer) clearTimeout(timer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('lef-pwa-dismissed', 'true');
  };

  if (!showPrompt || isStandaloneState) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-80 z-50 card p-4 shadow-xl border-border bg-surface flex flex-col gap-3 reveal">
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Install LEF OS</h4>
          </div>
          <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed">
            Add LEF to your home screen for quick offline access, full-screen study, and streak protection.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-text-secondary hover:text-text-primary p-0.5 rounded transition-colors"
          aria-label="Dismiss prompt"
        >
          <X size={14} />
        </button>
      </div>

      <div className="border-t border-[var(--border-dim)] my-0.5" />

      {deferredPrompt ? (
        <button
          onClick={handleInstallClick}
          className="btn btn-primary text-xs w-full flex items-center justify-center gap-1.5 py-1.5"
        >
          <Download size={12} /> Install Web App
        </button>
      ) : isIOS ? (
        <div className="text-[10px] text-text-secondary bg-surface-2/50 rounded-md p-2.5 border border-[var(--border-dim)] flex items-start gap-2">
          <Share size={14} className="text-gold shrink-0 mt-0.5" />
          <div className="leading-normal">
            To install: tap <span className="font-semibold text-text-primary">Share</span> in Safari, then select <span className="font-semibold text-text-primary">Add to Home Screen</span>.
          </div>
        </div>
      ) : (
        <div className="text-[10px] text-text-secondary bg-surface-2/50 rounded-md p-2.5 border border-[var(--border-dim)] leading-normal">
          To install: tap your browser menu (usually <span className="font-semibold text-text-primary">⋮</span> or <span className="font-semibold text-text-primary">⋯</span>) and select <span className="font-semibold text-text-primary">Install App</span> or <span className="font-semibold text-text-primary">Add to Home Screen</span>.
        </div>
      )}
    </div>
  );
}
