
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, subscription, checkSubscription } = useAuth();

  const handleRefreshSubscription = async () => {
    await checkSubscription();
  };

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80">
        <CardHeader 
          className="cursor-pointer flex flex-row items-center justify-between py-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <CardTitle className="text-sm">Debug Panel</CardTitle>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CardHeader>
        {isOpen && (
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-semibold">Usuário:</p>
              <p className="text-xs">{user ? user.email : 'Não logado'}</p>
              {user && (
                <Badge variant={user.email_confirmed_at ? "default" : "secondary"} className="text-xs">
                  {user.email_confirmed_at ? "Email confirmado" : "Email não confirmado"}
                </Badge>
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold">Assinatura:</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleRefreshSubscription}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs">Status:</span>
                  <Badge variant={subscription.isSubscribed ? "default" : "secondary"} className="text-xs">
                    {subscription.isSubscribed ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <p className="text-xs">Plano: {subscription.plan || 'Nenhum'}</p>
                <p className="text-xs">Tier: {subscription.tier || 'Nenhum'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold">Variáveis de Ambiente:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs">Supabase URL:</span>
                  <Badge variant={import.meta.env.VITE_SUPABASE_URL ? "default" : "destructive"} className="text-xs">
                    {import.meta.env.VITE_SUPABASE_URL ? "OK" : "Missing"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">Supabase Key:</span>
                  <Badge variant={import.meta.env.VITE_SUPABASE_ANON_KEY ? "default" : "destructive"} className="text-xs">
                    {import.meta.env.VITE_SUPABASE_ANON_KEY ? "OK" : "Missing"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default DebugPanel;
