import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface UserSubscription {
  plan: string;
  status: string;
  expiresAt: string | null;
}

export interface PlanFeatures {
  redacao: boolean;
  questoes: boolean;
  simulados: boolean;
  chatTutor: boolean;
  relatorios: boolean;
  provasAnteriores: boolean;
  correcaoIlimitada: boolean;
  redacaoIlimitada: boolean;
}

const PLAN_FEATURES: Record<string, PlanFeatures> = {
  free: {
    redacao: false,
    questoes: true, // acesso básico
    simulados: false,
    chatTutor: false,
    relatorios: false,
    provasAnteriores: true, // acesso básico
    correcaoIlimitada: false,
    redacaoIlimitada: false,
  },
  simulado: {
    redacao: false,
    questoes: true,
    simulados: true,
    chatTutor: false,
    relatorios: true,
    provasAnteriores: true,
    correcaoIlimitada: false,
    redacaoIlimitada: false,
  },
  bronze: {
    redacao: false,
    questoes: true,
    simulados: false,
    chatTutor: false,
    relatorios: true,
    provasAnteriores: true,
    correcaoIlimitada: false,
    redacaoIlimitada: false,
  },
  silver: {
    redacao: false,
    questoes: true,
    simulados: false,
    chatTutor: true,
    relatorios: true,
    provasAnteriores: true,
    correcaoIlimitada: true,
    redacaoIlimitada: false,
  },
  gold: {
    redacao: true, // 8 correções por mês
    questoes: true,
    simulados: false,
    chatTutor: true,
    relatorios: true,
    provasAnteriores: true,
    correcaoIlimitada: true,
    redacaoIlimitada: false,
  },
  platina: {
    redacao: true,
    questoes: true,
    simulados: true,
    chatTutor: true,
    relatorios: true,
    provasAnteriores: true,
    correcaoIlimitada: true,
    redacaoIlimitada: true,
  },
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setSubscription({
          plan: 'free',
          status: 'inactive',
          expiresAt: null,
        });
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_plan, subscription_status, subscription_expires_at')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Erro ao buscar assinatura:', error);
          setSubscription({
            plan: 'free',
            status: 'inactive',
            expiresAt: null,
          });
        } else if (data) {
          setSubscription({
            plan: data.subscription_plan || 'free',
            status: data.subscription_status || 'inactive',
            expiresAt: data.subscription_expires_at,
          });
        } else {
          setSubscription({
            plan: 'free',
            status: 'inactive',
            expiresAt: null,
          });
        }
      } catch (error) {
        console.error('Erro ao buscar assinatura:', error);
        setSubscription({
          plan: 'free',
          status: 'inactive',
          expiresAt: null,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const getActivePlan = (): string => {
    if (!subscription) return 'free';
    
    // Se o status é ativo e não expirou, usar o plano atual
    if (subscription.status === 'active') {
      if (!subscription.expiresAt) return subscription.plan;
      
      const expirationDate = new Date(subscription.expiresAt);
      const now = new Date();
      
      if (expirationDate > now) {
        return subscription.plan;
      }
    }
    
    return 'free';
  };

  const hasFeature = (feature: keyof PlanFeatures): boolean => {
    const currentPlan = getActivePlan();
    return PLAN_FEATURES[currentPlan]?.[feature] || false;
  };

  const canAccess = (feature: keyof PlanFeatures): { allowed: boolean; reason?: string } => {
    const hasAccess = hasFeature(feature);
    
    if (!hasAccess) {
      const currentPlan = getActivePlan();
      
      if (currentPlan === 'free') {
        return {
          allowed: false,
          reason: 'Esta funcionalidade requer um plano premium. Faça upgrade para acessar.',
        };
      }
      
      return {
        allowed: false,
        reason: 'Esta funcionalidade não está incluída no seu plano atual. Considere fazer upgrade.',
      };
    }
    
    return { allowed: true };
  };

  const getPlanName = (plan: string): string => {
    const planNames: Record<string, string> = {
      free: 'Plano Gratuito',
      simulado: 'Plano Simulado',
      bronze: 'Plano Bronze',
      silver: 'Plano Silver',
      gold: 'Plano Gold',
      platina: 'Plano Platina',
    };
    
    return planNames[plan] || plan;
  };

  return {
    subscription,
    loading,
    hasFeature,
    canAccess,
    getActivePlan,
    getPlanName,
    features: PLAN_FEATURES[getActivePlan()] || PLAN_FEATURES.free,
  };
};