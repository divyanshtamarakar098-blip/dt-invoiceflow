import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

type SubscriptionTier = 'free' | 'pro';

interface SubscriptionContextType {
  tier: SubscriptionTier;
  isPro: boolean;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [loading, setLoading] = useState(true);

  const refreshSubscription = useCallback(async () => {
    if (!user) {
      setTier('free');
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('subscriptions')
      .select('tier, is_active')
      .eq('user_id', user.id)
      .single();

    if (data?.is_active && data.tier === 'pro') {
      setTier('pro');
    } else {
      setTier('free');
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  return (
    <SubscriptionContext.Provider value={{ tier, isPro: tier === 'pro', loading, refreshSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
};
