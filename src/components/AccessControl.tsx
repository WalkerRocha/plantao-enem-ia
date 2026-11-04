import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, ArrowLeft } from 'lucide-react';
import { useSubscription, PlanFeatures } from '@/hooks/useSubscription';

interface AccessControlProps {
  feature: keyof PlanFeatures;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AccessControl: React.FC<AccessControlProps> = ({ 
  feature, 
  children, 
  fallback 
}) => {
  const { canAccess, getPlanName, getActivePlan } = useSubscription();
  const navigate = useNavigate();
  
  const access = canAccess(feature);
  
  if (access.allowed) {
    return <>{children}</>;
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto bg-gradient-to-r from-red-500 to-orange-500 p-4 rounded-full w-fit mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            Acesso Restrito
          </CardTitle>
          <CardDescription className="text-lg">
            {access.reason}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Seu plano atual:</p>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {getPlanName(getActivePlan())}
            </Badge>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-center">Desbloqueie esta funcionalidade:</h3>
            
            {feature === 'redacao' && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">💎 Correção de Redação</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Disponível nos planos Gold e Platina
                </p>
                <ul className="text-sm space-y-1">
                  <li>✅ <strong>Plano Gold:</strong> 8 correções de redação por mês</li>
                  <li>✅ <strong>Plano Platina:</strong> Correções ilimitadas</li>
                  <li>✅ Análise detalhada com notas simuladas</li>
                  <li>✅ Acesso a redações nota 1000</li>
                </ul>
              </div>
            )}
            
            {feature === 'chatTutor' && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">🤖 Chat Tutor IA 24/7</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Disponível a partir do Plano Silver
                </p>
                <ul className="text-sm space-y-1">
                  <li>✅ Tire dúvidas a qualquer hora</li>
                  <li>✅ Explicações personalizadas</li>
                  <li>✅ Apoio em todas as matérias</li>
                </ul>
              </div>
            )}
            
            {feature === 'simulados' && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">🎯 Simulados ENEM</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Disponível nos planos Simulado e Platina
                </p>
                <ul className="text-sm space-y-1">
                  <li>✅ Ambiente realista da prova</li>
                  <li>✅ Cronômetro oficial</li>
                  <li>✅ Relatórios detalhados</li>
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button 
              onClick={() => navigate('/plans')}
              className="flex-1 bg-gradient-to-r from-primary to-accent"
            >
              <Crown className="h-4 w-4 mr-2" />
              Ver Planos Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface FeatureLockedProps {
  feature: keyof PlanFeatures;
  title: string;
  description: string;
}

export const FeatureLocked: React.FC<FeatureLockedProps> = ({ 
  feature, 
  title, 
  description 
}) => {
  const navigate = useNavigate();
  
  return (
    <Card className="border-2 border-dashed border-muted-foreground/20">
      <CardContent className="text-center py-8">
        <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        <Button 
          onClick={() => navigate('/plans')}
          variant="outline"
          size="sm"
        >
          <Crown className="h-4 w-4 mr-2" />
          Fazer Upgrade
        </Button>
      </CardContent>
    </Card>
  );
};