import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Lock, CreditCard } from 'lucide-react';

interface SubscriptionGuardProps {
  children: ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { hasActiveSubscription, isBlocked, loading, isSubscriptionExpired } = useSubscription();
  const location = useLocation();

  // Permitir acesso à página de planos sempre
  if (location.pathname === '/plan') {
    return <>{children}</>;
  }

  // Mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Verificando assinatura...</div>
      </div>
    );
  }

  // Usuário bloqueado pelo admin
  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full border-destructive">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-destructive/10">
                <Lock className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-xl">Acesso Bloqueado</CardTitle>
            <CardDescription>
              Sua conta foi bloqueada pelo administrador
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Entre em contato com o suporte para mais informações sobre o bloqueio da sua conta.
            </p>
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = 'mailto:suporte@mimoflow.com'}
              >
                Contatar Suporte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Assinatura expirada ou cancelada
  if (!hasActiveSubscription || isSubscriptionExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full border-warning">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-warning/10">
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
            </div>
            <CardTitle className="text-xl">Assinatura Inativa</CardTitle>
            <CardDescription>
              Sua assinatura está {isSubscriptionExpired ? 'expirada' : 'inativa'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Para continuar usando o MimoFlow, você precisa renovar sua assinatura ou escolher um novo plano.
            </p>
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={() => window.location.href = '/plan'}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Ver Planos e Renovar
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = 'mailto:suporte@mimoflow.com'}
              >
                Contatar Suporte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Assinatura ativa - permitir acesso
  return <>{children}</>;
}
