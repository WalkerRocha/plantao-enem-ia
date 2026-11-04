
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calculator, Globe, Microscope, FileText, GraduationCap, LogOut, User, File, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { subscription, loading: subscriptionLoading, getPlanName, getActivePlan } = useSubscription();

  const getSubscriptionStatus = () => {
    if (subscriptionLoading) return { text: 'Carregando...', color: 'bg-gray-500' };
    
    const currentPlan = getActivePlan();
    
    if (currentPlan === 'free') {
      return { text: 'Sem planos ativos', color: 'bg-red-500' };
    }
    
    return { 
      text: getPlanName(currentPlan), 
      color: 'bg-green-500' 
    };
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const subjects = [
    {
      id: 'matematica',
      name: 'Matemática',
      description: 'Matemática e suas Tecnologias',
      icon: Calculator,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      route: '/matematica'
    },
    {
      id: 'portugues',
      name: 'Português',
      description: 'Linguagens, Códigos e suas Tecnologias',
      icon: BookOpen,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      route: '/portugues'
    },
    {
      id: 'ciencias',
      name: 'Ciências',
      description: 'Ciências da Natureza e suas Tecnologias',
      icon: Microscope,
      color: 'bg-gradient-to-br from-teal-500 to-teal-600',
      route: '/ciencias'
    },
    {
      id: 'humanas',
      name: 'Humanas',
      description: 'Ciências Humanas e suas Tecnologias',
      icon: Globe,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      route: '/humanas'
    },
    {
      id: 'provas-anteriores',
      name: 'Provas Anteriores',
      description: 'Provas Anteriores do ENEM',
      icon: File,
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      route: '/provas-anteriores'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(77,25%,50%)] via-slate-50 to-[hsl(240,75%,35%)]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-[hsl(77,25%,50%)] to-[hsl(240,75%,35%)] p-2 rounded-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[hsl(77,25%,50%)] to-[hsl(240,75%,35%)] bg-clip-text text-transparent">
                Plantão Enem
              </h1>
              <p className="text-sm text-gray-600">Sua jornada rumo ao sucesso</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-sm font-medium">Olá, {user?.email?.split('@')[0]}!</p>
                {(() => {
                  const status = getSubscriptionStatus();
                  return (
                    <Badge className={`${status.color} text-white text-xs`}>
                      {status.text}
                    </Badge>
                  );
                })()}
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-[hsl(120,39%,44%)]/10 text-[hsl(120,39%,44%)]">
                  Estudante
                </Badge>
                {/* Botão Escolher Plano - só aparece se não tem plano ativo */}
                {(() => {
                  const status = getSubscriptionStatus();
                  if (status.text === 'Sem planos ativos') {
                    return (
                      <Button 
                        onClick={() => navigate('/plans')}
                        variant="default"
                        size="sm"
                        className="bg-gradient-to-r from-[hsl(77,25%,50%)] to-[hsl(240,75%,35%)] text-white hover:opacity-90"
                      >
                        <Crown className="h-3 w-3 mr-1" />
                        Escolher Plano
                      </Button>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="text-gray-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Bem-vindo ao seu painel de estudos!
          </h2>
          <p className="text-lg text-gray-600">
            Escolha uma área para começar seus estudos
          </p>
        </div>

        {/* Subject Areas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {subjects.map((subject) => {
            const IconComponent = subject.icon;
            return (
              <Card 
                key={subject.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={() => navigate(subject.route)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto p-4 rounded-full w-fit mb-4 transition-all duration-300 group-hover:scale-110 ${subject.color}`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800">{subject.name}</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {subject.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className={`w-full group-hover:scale-105 transition-transform ${subject.color} text-white border-0`}>
                    Estudar
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Redação Section */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 mb-8 overflow-hidden">
          <CardHeader className="text-center">
            <div className="mx-auto bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-full w-fit mb-4 transition-transform hover:scale-110">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Redação ENEM</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Pratique sua escrita com temas atuais e receba correções personalizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => navigate('/redacao')}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
            >
              Praticar Redação
            </Button>
          </CardContent>
        </Card>

        {/* Plano Gratuito Info - só aparece se não tem plano ativo */}
        {(() => {
          const status = getSubscriptionStatus();
          if (status.text === 'Sem planos ativos') {
            return (
              <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50 mb-8">
                <CardHeader className="text-center">
                  <div className="mx-auto bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-full w-fit mb-4">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-800">Você está no Plano Gratuito</CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    Acesso limitado às funcionalidades básicas da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-700">✅ Você tem acesso a:</h4>
                      <ul className="space-y-1 text-gray-600">
                        <li>• Visualização limitada de questões</li>
                        <li>• Acesso básico às provas anteriores</li>
                        <li>• Navegação pelas áreas de estudo</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-700">❌ Recursos premium:</h4>
                      <ul className="space-y-1 text-gray-600">
                        <li>• Correção automática de questões</li>
                        <li>• Correção de redações com IA</li>
                        <li>• Simulados completos</li>
                        <li>• Relatórios detalhados</li>
                        <li>• Chat tutor 24/7</li>
                      </ul>
                    </div>
                  </div>
                  <div className="text-center pt-4">
                    <Button 
                      onClick={() => navigate('/plans')}
                      className="bg-gradient-to-r from-[hsl(77,25%,50%)] to-[hsl(240,75%,35%)] text-white hover:opacity-90 px-8 py-3"
                      size="lg"
                    >
                      <Crown className="h-5 w-5 mr-2" />
                      Desbloquear Recursos Premium
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      A partir de R$ 19,90/mês • Cancele quando quiser
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          }
          return null;
        })()}
      </div>
    </div>
  );
};

export default Dashboard;
