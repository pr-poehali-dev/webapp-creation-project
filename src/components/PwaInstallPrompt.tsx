import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isIos = () => {
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua);
  };

  const isInStandaloneMode = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone);

  useEffect(() => {
    if (isInStandaloneMode()) return;

    const wasDismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (wasDismissed) {
      const dismissedAt = parseInt(wasDismissed, 10);
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true);
        return;
      }
    }

    if (isIos()) {
      const timer = setTimeout(() => setShowIosPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDeferredPrompt(null);
    setShowIosPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  if (dismissed || isInStandaloneMode()) return null;

  if (deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[90] sm:left-auto sm:right-4 sm:max-w-sm animate-fab-appear">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
              <Icon name="Download" size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Установить TechSale</p>
              <p className="text-xs text-muted-foreground mt-0.5">Быстрый доступ с главного экрана</p>
            </div>
            <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground p-1">
              <Icon name="X" size={16} />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleDismiss}>
              Позже
            </Button>
            <Button size="sm" className="flex-1 gradient-primary" onClick={handleInstall}>
              Установить
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showIosPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[90] animate-fab-appear">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
              <Icon name="Smartphone" size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Установить TechSale</p>
              <p className="text-xs text-muted-foreground mt-1">
                Нажмите <Icon name="Share" size={12} className="inline mx-0.5" /> внизу экрана, затем «На экран Домой»
              </p>
            </div>
            <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground p-1">
              <Icon name="X" size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PwaInstallPrompt;
