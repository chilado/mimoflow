import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Subscription {
  id: string;
  user_id: string;
  plan: 'trial' | 'monthly' | 'quarterly' | 'semiannual' | 'annual';
  status: 'active' | 'cancelled' | 'expired';
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  created_at: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadSubscription = async () => {
      try {
        // Verificar se o usuário está bloqueado no profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_blocked')
          .eq('user_id', user.id)
          .single();

        if (profileData?.is_blocked) {
          setIsBlocked(true);
          setLoading(false);
          return;
        }

        // Carregar assinatura mais recente
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (subData) {
          setSubscription(subData as Subscription);
          
          // Verificar se a assinatura está expirada
          if (subData.expires_at) {
            const expiresAt = new Date(subData.expires_at);
            const now = new Date();
            
            if (now > expiresAt && subData.status === 'active') {
              // Atualizar status para expirado
              await supabase
                .from('subscriptions')
                .update({ status: 'expired' })
                .eq('id', subData.id);
              
              setSubscription({ ...subData, status: 'expired' } as Subscription);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar assinatura:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();

    // Recarregar a cada 5 minutos para verificar expiração
    const interval = setInterval(loadSubscription, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const hasActiveSubscription = () => {
    if (isBlocked) return false;
    if (!subscription) return false;
    return subscription.status === 'active';
  };

  const isSubscriptionExpired = () => {
    if (!subscription) return true;
    return subscription.status === 'expired' || subscription.status === 'cancelled';
  };

  return {
    subscription,
    loading,
    isBlocked,
    hasActiveSubscription: hasActiveSubscription(),
    isSubscriptionExpired: isSubscriptionExpired(),
  };
}
