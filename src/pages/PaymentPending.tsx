import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Home, RefreshCw } from 'lucide-react';

const PaymentPending = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl text-yellow-800">
                Pagamento Pendente
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Seu pagamento está sendo processado. Isso pode levar alguns minutos para boletos ou até 2 dias úteis.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">O que fazer agora:</h4>
                <div className="text-sm text-yellow-700 space-y-1 text-left">
                  <p>• Aguarde a confirmação do pagamento</p>
                  <p>• Você receberá um e-mail quando for aprovado</p>
                  <p>• Para boletos, o prazo é de até 2 dias úteis</p>
                  <p>• Guarde o comprovante do pagamento</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/dashboard')}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Ir para Dashboard
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Verificar Status
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Assim que o pagamento for confirmado, seu plano será ativado automaticamente.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;