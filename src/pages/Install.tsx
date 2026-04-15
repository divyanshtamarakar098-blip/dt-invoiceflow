import { useState, useEffect } from 'react';
import { Download, CheckCircle, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  if (isStandalone || installed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <CheckCircle className="w-16 h-16 text-success" />
        <h1 className="text-2xl font-bold text-foreground">App Installed!</h1>
        <p className="text-muted-foreground">InvoiceFlow is installed on your device.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Smartphone className="w-10 h-10 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Install InvoiceFlow</h1>
        <p className="text-muted-foreground max-w-md">
          Add InvoiceFlow to your home screen for quick access, a full-screen experience, and faster loading.
        </p>
      </div>

      {deferredPrompt ? (
        <Button size="lg" onClick={handleInstall} className="gap-2">
          <Download className="w-5 h-5" /> Install App
        </Button>
      ) : (
        <div className="space-y-4 max-w-sm">
          <p className="text-sm font-medium text-foreground">To install manually:</p>
          <div className="text-sm text-muted-foreground text-left space-y-2">
            <p><strong>iPhone/iPad:</strong> Tap the Share button → "Add to Home Screen"</p>
            <p><strong>Android:</strong> Tap the browser menu (⋮) → "Add to Home Screen" or "Install App"</p>
            <p><strong>Desktop Chrome:</strong> Click the install icon in the address bar</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Install;
