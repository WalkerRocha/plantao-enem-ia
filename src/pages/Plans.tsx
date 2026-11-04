
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Crown, Award, Medal, Zap, CheckCircle, Target, BookOpen, PenTool, BarChart3, Clock, FileText, MessageSquare, Brain, TrendingUp, Star } from 'lucide-react';

const Plans = () => {
  const navigate = useNavigate();

  const plans = [
    {
      id: 'simulado',
      name: 'Plano Simulado',
      icon: <Target className="h-8 w-8" />,
      emoji: '🎯',
      color: 'from-amber-600 to-orange-600',
      price: 'R$ 19,90/mês',
      shortDescription: 'Treine como se fosse o dia do ENEM',
      features: [
        { icon: <Clock className="h-4 w-4" />, text: 'Simulados ENEM com cronômetro oficial' },
        { icon: <Target className="h-4 w-4" />, text: 'Ambiente realista da prova' },
        { icon: <BarChart3 className="h-4 w-4" />, text: 'Relatório detalhado por área' },
        { icon: <TrendingUp className="h-4 w-4" />, text: 'Histórico completo de evolução' },
        { icon: <CheckCircle className="h-4 w-4" />, text: 'Gabarito oficial instantâneo' }
      ],
      fullDescription: 'Transforme sua preparação em um treino de verdade! O Plano Simulado oferece a experiência mais próxima do ENEM real, com provas completas, cronômetro oficial e ambiente que simula perfeitamente o dia da prova. Ao final, você recebe análises detalhadas do seu desempenho em cada área do conhecimento, identificando exatamente onde precisa focar seus estudos. Chega de surpresas na prova - treine como um atleta e chegue preparado para conquistar sua vaga!',
      ideal: 'Perfeito para quem quer testar seus conhecimentos periodicamente e se familiarizar com o formato da prova'
    },
    {
      id: 'bronze',
      name: 'Plano Bronze',
      icon: <Medal className="h-8 w-8" />,
      emoji: '🥉',
      color: 'from-amber-700 to-amber-600',
      price: 'R$ 29,90/mês',
      shortDescription: 'Comece pelo essencial',
      features: [
        { icon: <FileText className="h-4 w-4" />, text: 'Todas as provas anteriores do ENEM' },
        { icon: <BookOpen className="h-4 w-4" />, text: 'Banco de questões com resoluções comentadas' },
        { icon: <Brain className="h-4 w-4" />, text: '15 créditos mensais para correção IA' },
        { icon: <BarChart3 className="h-4 w-4" />, text: 'Relatórios básicos de desempenho' },
        { icon: <CheckCircle className="h-4 w-4" />, text: 'Gabaritos organizados por tema' }
      ],
      fullDescription: 'Sua base sólida para conquistar o ENEM! Com o Plano Bronze, você tem acesso ao essencial: todas as provas anteriores organizadas, milhares de questões com resoluções detalhadas e créditos mensais para usar nossa IA de correção. É a forma mais inteligente e econômica de estudar com qualidade, no seu ritmo e com o apoio de tecnologia de ponta. Ideal para quem quer começar a estudar do jeito certo sem complicação.',
      ideal: 'Ferramentas principais para estudar de forma independente com excelente custo-benefício'
    },
    {
      id: 'silver',
      name: 'Plano Silver',
      icon: <Award className="h-8 w-8" />,
      emoji: '🥈',
      color: 'from-slate-400 to-slate-600',
      price: 'R$ 49,90/mês',
      shortDescription: 'Suporte sem limites',
      features: [
        { icon: <CheckCircle className="h-4 w-4" />, text: 'Tudo do Plano Bronze incluído' },
        { icon: <Brain className="h-4 w-4" />, text: 'Correção automática ILIMITADA' },
        { icon: <MessageSquare className="h-4 w-4" />, text: 'Chat tutor IA 24/7 sem limites' },
        { icon: <Target className="h-4 w-4" />, text: 'Plano de estudos personalizado por IA' },
        { icon: <BarChart3 className="h-4 w-4" />, text: 'Relatórios avançados detalhados' },
        { icon: <TrendingUp className="h-4 w-4" />, text: 'Recomendações diárias adaptativas' }
      ],
      fullDescription: 'Estude com total liberdade e apoio inteligente! O Plano Silver remove todas as barreiras: correção ilimitada de questões, chat tutor IA disponível 24 horas para tirar suas dúvidas e um plano de estudos completamente personalizado que se adapta ao seu progresso. Com relatórios detalhados por competência, você sempre sabe exatamente onde está e para onde precisa ir. É como ter um professor particular de ENEM sempre ao seu lado.',
      ideal: 'Para quem quer estudar com estrutura profissional e apoio contínuo e ilimitado'
    },
    {
      id: 'gold',
      name: 'Plano Gold',
      icon: <Crown className="h-8 w-8" />,
      emoji: '🥇',
      color: 'from-yellow-400 to-yellow-600',
      price: 'R$ 79,90/mês',
      shortDescription: 'Foque na redação',
      features: [
        { icon: <CheckCircle className="h-4 w-4" />, text: 'Tudo do Plano Silver incluído' },
        { icon: <PenTool className="h-4 w-4" />, text: '8 correções de redação por mês' },
        { icon: <Star className="h-4 w-4" />, text: 'Acesso a redações nota 1000 comentadas' },
        { icon: <BarChart3 className="h-4 w-4" />, text: 'Análise detalhada de cada redação' },
        { icon: <TrendingUp className="h-4 w-4" />, text: 'Acompanhamento de evolução na escrita' },
        { icon: <Target className="h-4 w-4" />, text: 'Dicas personalizadas de melhoria' }
      ],
      fullDescription: 'Transforme a redação no seu maior diferencial! O Plano Gold inclui tudo do Silver e ainda oferece correções mensais de redação com notas simuladas, comentários detalhados e dicas específicas para cada texto seu. Você também tem acesso exclusivo a redações nota 1000 comentadas pelos melhores professores, aprendendo com os exemplos de excelência. Acompanhe sua evolução mês a mês e chegue ao ENEM dominando completamente a arte da redação perfeita.',
      ideal: 'Foco total em dominar a redação, o diferencial que pode garantir sua aprovação'
    },
    {
      id: 'platina',
      name: 'Plano Platina',
      icon: <Zap className="h-8 w-8" />,
      emoji: '💎',
      color: 'from-purple-500 to-purple-700',
      price: 'R$ 119,90/mês',
      shortDescription: 'Tudo sem limites',
      features: [
        { icon: <CheckCircle className="h-4 w-4" />, text: 'Tudo do Plano Gold incluído' },
        { icon: <Brain className="h-4 w-4" />, text: 'Correções de questões 100% ILIMITADAS' },
        { icon: <PenTool className="h-4 w-4" />, text: 'Correções de redações ILIMITADAS' },
        { icon: <Target className="h-4 w-4" />, text: 'Simulados ENEM ILIMITADOS' },
        { icon: <BarChart3 className="h-4 w-4" />, text: 'Relatórios premium com análise IA avançada' },
        { icon: <TrendingUp className="h-4 w-4" />, text: 'Plano adaptativo que evolui com você' },
        { icon: <MessageSquare className="h-4 w-4" />, text: 'Suporte prioritário 24/7' }
      ],
      fullDescription: 'A experiência mais completa e poderosa para dominar o ENEM! O Plano Platina remove qualquer limite: correções ilimitadas de questões e redações, simulados sem restrições, relatórios com análise de IA avançada e um plano de estudos que se adapta em tempo real ao seu desempenho. Com suporte prioritário e todas as ferramentas premium, você tem tudo para alcançar a nota dos seus sonhos. É a preparação mais completa do mercado, sem barreiras, sem limites.',
      ideal: 'Experiência premium completa para quem quer ter todas as ferramentas sem nenhuma limitação'
    }
  ];

  const PlanModal = ({ plan }: { plan: typeof plans[0] }) => (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center text-2xl font-bold">
          <div className={`bg-gradient-to-r ${plan.color} p-3 rounded-xl mr-4 text-white`}>
            {plan.icon}
          </div>
          <div>
            <span className="text-2xl mr-2">{plan.emoji}</span>
            {plan.name}
          </div>
        </DialogTitle>
        <DialogDescription className="text-lg text-muted-foreground">
          {plan.shortDescription}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-muted/50 to-muted/30 p-6 rounded-xl">
          <h3 className="text-xl font-bold mb-3 text-primary">O que você vai conquistar:</h3>
          <p className="text-foreground leading-relaxed">{plan.fullDescription}</p>
        </div>

        <div className="grid gap-3">
          <h3 className="text-xl font-bold text-primary">Recursos inclusos:</h3>
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center p-3 bg-muted/50 rounded-lg">
              <div className="text-primary mr-3">
                {feature.icon}
              </div>
              <span className="font-medium">{feature.text}</span>
            </div>
          ))}
        </div>

        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl">
          <div className="flex items-center mb-2">
            <CheckCircle className="h-5 w-5 text-primary mr-2" />
            <span className="font-bold text-primary">Ideal para você se:</span>
          </div>
          <p className="text-foreground">{plan.ideal}</p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-3xl font-bold text-primary">{plan.price}</div>
          <Button 
            size="lg" 
            className="px-8"
            onClick={() => {
              console.log('Modal - Navigating to checkout with plan:', plan);
              
              // Create a clean plan object without React elements
              const cleanPlan = {
                id: plan.id,
                name: plan.name,
                emoji: plan.emoji,
                color: plan.color,
                price: plan.price,
                shortDescription: plan.shortDescription,
                features: plan.features.map(feature => ({
                  text: feature.text
                }))
              };
              
              navigate('/checkout', { state: { selectedPlan: cleanPlan } });
            }}
          >
            Assinar Agora
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => navigate(-1)}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="bg-gradient-to-r from-primary to-accent p-2 rounded-lg">
              <Crown className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Planos Premium</h1>
              <p className="text-sm text-muted-foreground">Escolha o plano ideal para sua preparação</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Transforme sua preparação para o ENEM
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Escolha o plano que melhor se adapta ao seu perfil e objetivos. Todos com tecnologia de IA avançada e suporte especializado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${plan.color}`} />
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`bg-gradient-to-r ${plan.color} p-4 rounded-2xl text-white shadow-lg`}>
                    {plan.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold flex items-center justify-center">
                  <span className="text-3xl mr-2">{plan.emoji}</span>
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-lg font-medium">
                  {plan.shortDescription}
                </CardDescription>
                <div className="text-3xl font-bold text-primary mt-2">
                  {plan.price}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className="text-primary mr-2 flex-shrink-0">
                        {feature.icon}
                      </div>
                      <span>{feature.text}</span>
                    </div>
                  ))}
                  {plan.features.length > 3 && (
                    <div className="text-sm text-muted-foreground font-medium">
                      + {plan.features.length - 3} recursos adicionais
                    </div>
                  )}
                </div>

                <div className="pt-4 space-y-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Ver Detalhes Completos
                      </Button>
                    </DialogTrigger>
                    <PlanModal plan={plan} />
                  </Dialog>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Button clicked - plan:', plan);
                      
                      // Create a clean plan object without React elements
                      const cleanPlan = {
                        id: plan.id,
                        name: plan.name,
                        emoji: plan.emoji,
                        color: plan.color,
                        price: plan.price,
                        shortDescription: plan.shortDescription,
                        features: plan.features.map(feature => ({
                          text: feature.text
                        }))
                      };
                      
                      console.log('Clean plan data:', cleanPlan);
                      
                      try {
                        navigate('/checkout', { state: { selectedPlan: cleanPlan } });
                        console.log('Navigation called successfully');
                      } catch (error) {
                        console.error('Navigation error:', error);
                      }
                    }}
                  >
                    Escolher Este Plano
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-primary">Garantia de Satisfação</h3>
            <p className="text-lg text-muted-foreground mb-6">
              Não ficou satisfeito? Oferecemos 7 dias de garantia em todos os planos. 
              Cancele quando quiser, sem burocracias.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-primary mr-2" />
                Sem taxa de cancelamento
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-primary mr-2" />
                Suporte via WhatsApp
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-primary mr-2" />
                Atualizações gratuitas
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
