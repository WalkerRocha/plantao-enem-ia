import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';

const PaymentFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-800">
                Pagamento Não Aprovado
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Não foi possível processar seu pagamento. Isso pode acontecer por diversos motivos.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                <h4 className="font-medium text-red-800 mb-2">Possíveis causas:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Dados de pagamento incorretos</li>
                  <li>• Limite insuficiente</li>
                  <li>• Problema temporário no sistema</li>
                  <li>• Pagamento cancelado pelo usuário</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/plans')}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/dashboard')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground"
                  onClick={() => navigate('/contact')}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Preciso de Ajuda
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;