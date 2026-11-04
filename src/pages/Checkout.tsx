
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Shield, CheckCircle, Crown, Award, Medal, Zap, Target, QrCode, FileText, Clock, ExternalLink, Copy, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'pix' | 'boleto' | 'card' | null>(null);
  const [showPaymentBox, setShowPaymentBox] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'checking' | 'success' | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [payerData, setPayerData] = useState({
    name: '',
    cpf: ''
  });
  
  // Get plan from location state or localStorage as fallback
  const [selectedPlan, setSelectedPlan] = useState(() => {
    const locationPlan = location.state?.selectedPlan;
    if (locationPlan) {
      localStorage.setItem('selectedPlan', JSON.stringify(locationPlan));
      return locationPlan;
    }
    const storedPlan = localStorage.getItem('selectedPlan');
    return storedPlan ? JSON.parse(storedPlan) : null;
  });

  console.log('Checkout component - location.state:', location.state);
  console.log('Checkout component - selectedPlan:', selectedPlan);

  useEffect(() => {
    console.log('Checkout useEffect - selectedPlan:', selectedPlan);
    console.log('Checkout useEffect - location.state:', location.state);
    
    // Update localStorage if we get a new plan from location state
    if (location.state?.selectedPlan && !selectedPlan) {
      setSelectedPlan(location.state.selectedPlan);
      localStorage.setItem('selectedPlan', JSON.stringify(location.state.selectedPlan));
    }
  }, [selectedPlan, location.state]);

  // Clear localStorage when navigating away if payment wasn't completed
  useEffect(() => {
    return () => {
      if (paymentStatus !== 'success') {
        // Only clear if not successful - let success case handle its own cleanup
      }
    };
  }, [paymentStatus]);

  // Don't redirect immediately, just show a message if no plan
  if (!selectedPlan) {
    console.log('No plan found in state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Nenhum plano selecionado</h2>
          <p className="text-muted-foreground">Você precisa escolher um plano primeiro.</p>
          <Button onClick={() => navigate('/plans')}>
            Voltar aos Planos
          </Button>
        </div>
      </div>
    );
  }

  const getIcon = (planId: string) => {
    switch (planId) {
      case 'simulado': return <Target className="h-6 w-6" />;
      case 'bronze': return <Medal className="h-6 w-6" />;
      case 'silver': return <Award className="h-6 w-6" />;
      case 'gold': return <Crown className="h-6 w-6" />;
      case 'platina': return <Zap className="h-6 w-6" />;
      default: return <Crown className="h-6 w-6" />;
    }
  };

  const handleContinueToPayment = () => {
    if (!payerData.name || !payerData.cpf) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    setShowPaymentBox(true);
    setPaymentError(null);
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      toast.error('Selecione um método de pagamento');
      return;
    }

    setLoading(true);
    setPaymentError(null);
    
    try {
      console.log('Starting MercadoPago payment process with data:', {
        planData: selectedPlan,
        paymentMethod: selectedPaymentMethod,
        payer: payerData
      });

      const { data, error } = await supabase.functions.invoke('create-mercadopago-payment', {
        body: {
          planData: selectedPlan,
          paymentMethod: selectedPaymentMethod,
          payer: payerData
        }
      });

      console.log('Supabase function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Erro na função: ${error.message}`);
      }

      if (!data) {
        throw new Error('Nenhuma resposta recebida do servidor');
      }

      if (!data.success) {
        console.error('Payment creation failed:', data.error);
        throw new Error(data.error || 'Erro ao processar pagamento');
      }

      console.log('Payment created successfully:', data);
      setPaymentData(data);

      if (selectedPaymentMethod === 'pix') {
        if (data.pixQrCode || data.pixQrCodeBase64) {
          setPaymentStatus('pending');
          toast.success('QR Code PIX gerado com sucesso!');
          // Start checking payment status
          if (data.paymentId) {
            startPaymentStatusCheck(data.paymentId);
          }
        } else {
          throw new Error('QR Code PIX não foi gerado corretamente');
        }
      } else if (selectedPaymentMethod === 'boleto') {
        if (data.initPoint) {
          toast.success('Redirecionando para o boleto...');
          // Open boleto in new tab
          window.open(data.initPoint, '_blank');
        } else {
          throw new Error('Link do boleto não foi gerado corretamente');
        }
      } else if (selectedPaymentMethod === 'card') {
        if (data.initPoint) {
          toast.success('Redirecionando para o pagamento...');
          // Redirect to Mercado Pago checkout for card payments
          window.location.href = data.initPoint;
        } else {
          throw new Error('Link de pagamento não foi gerado corretamente');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setPaymentError(errorMessage);
      toast.error('Erro ao processar pagamento: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyPixCode = () => {
    if (paymentData?.pixQrCode) {
      navigator.clipboard.writeText(paymentData.pixQrCode);
      toast.success('Código PIX copiado!');
    }
  };

  const startPaymentStatusCheck = (paymentId: string) => {
    const checkInterval = setInterval(async () => {
      setPaymentStatus('checking');
      
      try {
        // Check user profile for subscription update
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_plan')
          .eq('id', user?.id)
          .single();

        if (profile?.subscription_status === 'active') {
          setPaymentStatus('success');
          clearInterval(checkInterval);
          // Clear stored plan from localStorage since payment is complete
          localStorage.removeItem('selectedPlan');
          toast.success('Pagamento aprovado! Redirecionando...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 5000); // Check every 5 seconds

    // Stop checking after 10 minutes
    setTimeout(() => {
      clearInterval(checkInterval);
      if (paymentStatus !== 'success') {
        setPaymentStatus('pending');
      }
    }, 600000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => navigate('/plans')}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Planos
            </Button>
            <div className="bg-gradient-to-r from-primary to-accent p-2 rounded-lg">
              <CreditCard className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Checkout</h1>
              <p className="text-sm text-muted-foreground">Finalize sua assinatura</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm text-muted-foreground">Pagamento Seguro</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resumo do Plano */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className={`bg-gradient-to-r ${selectedPlan.color} p-3 rounded-xl mr-3 text-white`}>
                    {getIcon(selectedPlan.id)}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{selectedPlan.emoji}</span>
                      {selectedPlan.name}
                    </div>
                    <p className="text-sm text-muted-foreground font-normal">
                      {selectedPlan.shortDescription}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-primary">Recursos inclusos:</h3>
                  {selectedPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-primary mr-3">
                        {feature.icon}
                      </div>
                      <span className="text-sm">{feature.text}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Plano Mensal</span>
                    <span className="text-2xl font-bold text-primary">{selectedPlan.price}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Taxa de processamento</span>
                    <span>Grátis</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{selectedPlan.price}</span>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center text-green-800">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">7 dias de garantia</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Cancele quando quiser, sem burocracias
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Formulário de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle>Informações de Pagamento</CardTitle>
                <CardDescription>
                  Preencha os dados para finalizar sua assinatura
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!user && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-amber-800 text-sm">
                      <strong>Atenção:</strong> Você precisa estar logado para continuar.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => navigate('/login')}
                    >
                      Fazer Login
                    </Button>
                  </div>
                )}

                {/* Error Display */}
                {paymentError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center text-red-800">
                      <XCircle className="h-4 w-4 mr-2" />
                      <span className="font-medium">Erro no Pagamento</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">{paymentError}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setPaymentError(null);
                        setPaymentData(null);
                        setSelectedPaymentMethod(null);
                        setShowPaymentBox(false);
                      }}
                    >
                      Tentar Novamente
                    </Button>
                  </div>
                )}

                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome completo"
                      value={payerData.name}
                      onChange={(e) => setPayerData({...payerData, name: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={payerData.cpf}
                      onChange={(e) => setPayerData({...payerData, cpf: e.target.value})}
                      required
                    />
                  </div>

                  <Separator />
                  
                  {!showPaymentBox ? (
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleContinueToPayment}
                      disabled={!user}
                    >
                      Continuar para Pagamento
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="font-semibold">Escolha o método de pagamento:</h3>
                      
                      {/* Payment Method Selection */}
                      <div className="grid grid-cols-3 gap-3">
                        <Button
                          variant={selectedPaymentMethod === 'card' ? 'default' : 'outline'}
                          className="h-20 flex flex-col items-center justify-center"
                          onClick={() => setSelectedPaymentMethod('card')}
                          disabled={loading}
                        >
                          <CreditCard className="h-6 w-6 mb-2" />
                          Cartão
                        </Button>
                        
                        <Button
                          variant={selectedPaymentMethod === 'pix' ? 'default' : 'outline'}
                          className="h-20 flex flex-col items-center justify-center"
                          onClick={() => setSelectedPaymentMethod('pix')}
                          disabled={loading}
                        >
                          <QrCode className="h-6 w-6 mb-2" />
                          PIX
                        </Button>
                        
                        <Button
                          variant={selectedPaymentMethod === 'boleto' ? 'default' : 'outline'}
                          className="h-20 flex flex-col items-center justify-center"
                          onClick={() => setSelectedPaymentMethod('boleto')}
                          disabled={loading}
                        >
                          <FileText className="h-6 w-6 mb-2" />
                          Boleto
                        </Button>
                      </div>

                      {selectedPaymentMethod && (
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={handlePayment}
                          disabled={loading}
                        >
                          {loading ? 'Processando...' : `Finalizar Pagamento via ${selectedPaymentMethod.toUpperCase()}`}
                        </Button>
                      )}

                      {/* PIX Payment Display */}
                      {paymentData && paymentData.paymentMethod === 'pix' && (
                        <Card className="border-green-200 bg-green-50">
                          <CardHeader>
                            <CardTitle className="text-green-800 flex items-center">
                              <QrCode className="h-5 w-5 mr-2" />
                              PIX Gerado com Sucesso!
                              {paymentStatus === 'checking' && (
                                <div className="ml-auto flex items-center text-blue-600">
                                  <Clock className="h-4 w-4 mr-1 animate-spin" />
                                  <span className="text-sm">Verificando...</span>
                                </div>
                              )}
                              {paymentStatus === 'success' && (
                                <div className="ml-auto flex items-center text-green-600">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  <span className="text-sm">Aprovado!</span>
                                </div>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {paymentStatus === 'success' ? (
                              <div className="text-center py-8">
                                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-green-800 mb-2">
                                  Pagamento Aprovado!
                                </h3>
                                <p className="text-green-700">
                                  Seu plano foi ativado com sucesso. Redirecionando...
                                </p>
                              </div>
                            ) : (
                              <>
                                {paymentData.pixQrCodeBase64 && (
                                  <div className="flex justify-center">
                                    <img 
                                      src={`data:image/png;base64,${paymentData.pixQrCodeBase64}`} 
                                      alt="QR Code PIX" 
                                      className="max-w-[200px] border rounded-lg"
                                    />
                                  </div>
                                )}
                                
                                {paymentData.pixQrCode && (
                                  <div className="space-y-2">
                                    <Label>Código PIX (Copiar e Colar):</Label>
                                    <div className="flex gap-2">
                                      <Input 
                                        value={paymentData.pixQrCode} 
                                        readOnly 
                                        className="font-mono text-xs"
                                      />
                                      <Button onClick={copyPixCode} variant="outline" size="sm">
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                                
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <div className="flex items-center text-blue-800 mb-2">
                                    <Clock className="h-4 w-4 mr-2" />
                                    <span className="font-medium">Aguardando Pagamento</span>
                                  </div>
                                  <div className="text-sm text-blue-700 space-y-1">
                                    <p>• Abra o app do seu banco</p>
                                    <p>• Escaneie o QR Code ou cole o código PIX</p>
                                    <p>• Confirme o pagamento</p>
                                    <p>• O status será atualizado automaticamente</p>
                                  </div>
                                </div>
                                
                                <div className="text-center">
                                  <p className="text-xs text-muted-foreground mb-2">
                                    PIX expira em 30 minutos
                                  </p>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setPaymentData(null);
                                      setPaymentStatus(null);
                                      setSelectedPaymentMethod(null);
                                      setPaymentError(null);
                                    }}
                                  >
                                    Gerar Novo PIX
                                  </Button>
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Boleto Payment Display */}
                      {paymentData && paymentData.paymentMethod === 'boleto' && (
                        <Card className="border-blue-200 bg-blue-50">
                          <CardHeader>
                            <CardTitle className="text-blue-800 flex items-center">
                              <FileText className="h-5 w-5 mr-2" />
                              Boleto Gerado com Sucesso!
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="text-center">
                              <p className="text-blue-700 mb-4">
                                O boleto foi aberto em uma nova aba. Se não abriu automaticamente, clique no botão abaixo:
                              </p>
                              <Button 
                                onClick={() => window.open(paymentData.initPoint, '_blank')}
                                className="w-full"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Abrir Boleto
                              </Button>
                            </div>
                            
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                              <div className="text-sm text-amber-800 space-y-1">
                                <p className="font-medium">Instruções para pagamento:</p>
                                <p>• O boleto tem vencimento em 3 dias</p>
                                <p>• Pode ser pago em qualquer banco ou lotérica</p>
                                <p>• Após o pagamento, a confirmação leva até 2 dias úteis</p>
                                <p>• Você receberá um email quando o pagamento for confirmado</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Shield className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                      <div className="text-xs text-blue-800">
                        <p className="font-medium">Seus dados estão seguros</p>
                        <p>Pagamentos processados via Mercado Pago com máxima segurança.</p>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Ao finalizar, você concorda com nossos{' '}
                    <button className="underline hover:text-primary">Termos de Uso</button>
                    {' '}e{' '}
                    <button className="underline hover:text-primary">Política de Privacidade</button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
