
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, BookOpen, Users, Target, Zap, Trophy, Star, CreditCard } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">EnemPrep</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/plans">
              <Button variant="outline">Ver Planos</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline">Entrar</Button>
            </Link>
            <Link to="/register">
              <Button>Cadastrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            Sua aprovação no <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">ENEM</span> começa aqui
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Plataforma completa de estudos com IA, professores especializados e material atualizado para você conquistar sua vaga na universidade dos seus sonhos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-3">
                Começar Agora - Grátis
              </Button>
            </Link>
            <Link to="/plans">
              <Button size="lg" variant="outline" className="px-8 py-3">
                Ver Planos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Tudo que você precisa para ser aprovado
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nossa plataforma oferece uma experiência completa de estudos com recursos inovadores e metodologia comprovada.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="bg-blue-100 p-3 rounded-lg w-fit">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Material Completo</CardTitle>
              <CardDescription>
                Acesso a todas as matérias do ENEM com conteúdo atualizado e organizado por especialistas.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="bg-green-100 p-3 rounded-lg w-fit">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>IA Educacional</CardTitle>
              <CardDescription>
                Correção automática de questões e redações com feedback personalizado e explicações detalhadas.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="bg-purple-100 p-3 rounded-lg w-fit">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Professores Especialistas</CardTitle>
              <CardDescription>
                Aulas ao vivo e suporte direto com professores experientes e aprovados no ENEM.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="bg-orange-100 p-3 rounded-lg w-fit">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Simulados Realistas</CardTitle>
              <CardDescription>
                Pratique com simulados no formato oficial do ENEM e acompanhe sua evolução em tempo real.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="bg-red-100 p-3 rounded-lg w-fit">
                <Trophy className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Provas Anteriores</CardTitle>
              <CardDescription>
                Acesso completo ao histórico de provas do ENEM com gabaritos e resoluções comentadas.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="bg-indigo-100 p-3 rounded-lg w-fit">
                <Star className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Plano Personalizado</CardTitle>
              <CardDescription>
                Cronograma de estudos adaptado ao seu perfil e tempo disponível para maximizar seus resultados.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-500 to-green-500 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Comece sua jornada rumo à aprovação
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de estudantes que já estão usando nossa plataforma para conquistar suas vagas na universidade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
                Criar Conta Grátis
              </Button>
            </Link>
            <Link to="/plans">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3">
                <CreditCard className="h-4 w-4 mr-2" />
                Ver Todos os Planos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">EnemPrep</span>
          </div>
          <p className="text-gray-400">
            © 2024 EnemPrep. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
