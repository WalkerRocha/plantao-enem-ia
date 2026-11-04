import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home, User } from 'lucide-react';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    toast.success('Pagamento aprovado com sucesso!');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">
                Pagamento Aprovado!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Seu plano foi ativado com sucesso. Agora você tem acesso a todos os recursos premium!
              </p>
              
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
                  onClick={() => navigate('/plans')}
                >
                  <User className="h-4 w-4 mr-2" />
                  Ver Meus Planos
                </Button>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>Importante:</strong> Guarde o comprovante do pagamento para seus registros.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;