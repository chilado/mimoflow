import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export function PWAUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg);

      // Check for updates every hour
      const interval = setInterval(() => {
        reg.update();
      }, 60 * 60 * 1000);

      return () => clearInterval(interval);
    });

    // Listen for new service worker
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      setShowPrompt(true);
    });

    // Listen for waiting service worker
    const handleWaiting = () => {
      setShowPrompt(true);
    };

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'UPDATE_AVAILABLE') {
        handleWaiting();
      }
    });
  }, []);

  const handleUpdate = () => {
    if (!registration?.waiting) return;

    // Tell the waiting service worker to activate
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    toast.success('Atualizando...', {
      description: 'A página será recarregada'
    });

    // Reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm animate-fade-up">
      <Card className="p-4 shadow-lg border-2 border-info/20 bg-info/5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
            <RefreshCw className="h-5 w-5 text-info" aria-hidden="true" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              Atualização Disponível
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Uma nova versão do MimoFlow está disponível
            </p>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleUpdate}
                className="flex-1"
                aria-label="Atualizar agora"
              >
                Atualizar
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleDismiss}
                aria-label="Atualizar depois"
              >
                Depois
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
