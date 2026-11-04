
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calculator, Globe, Microscope, FileText, GraduationCap, LogOut, Settings, Users, File } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

const AdminDashboard = () => {
  const { adminSignOut } = useAdmin();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await adminSignOut();
    navigate('/admin/login');
  };

  const subjects = [
    {
      id: 'matematica',
      name: 'Matemática',
      description: 'Matemática e suas Tecnologias',
      icon: Calculator,
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      route: '/admin/matematica'
    },
    {
      id: 'portugues',
      name: 'Português',
      description: 'Linguagens, Códigos e suas Tecnologias',
      icon: BookOpen,
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      route: '/admin/portugues'
    },
    {
      id: 'ciencias',
      name: 'Ciências',
      description: 'Ciências da Natureza e suas Tecnologias',
      icon: Microscope,
      color: 'bg-teal-100 text-teal-700 hover:bg-teal-200',
      route: '/admin/ciencias'
    },
    {
      id: 'humanas',
      name: 'Humanas',
      description: 'Ciências Humanas e suas Tecnologias',
      icon: Globe,
      color: 'bg-green-100 text-green-700 hover:bg-green-200',
      route: '/admin/humanas'
    },
    {
      id: 'provas-anteriores',
      name: 'Provas Anteriores',
      description: 'Provas Anteriores do ENEM',
      icon: File,
      color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
      route: '/admin/provas-anteriores'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-slate-600 to-blue-600 p-2 rounded-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-600 to-blue-600 bg-clip-text text-transparent">
                Plantão Enem - Admin
              </h1>
              <p className="text-sm text-gray-600">Painel do Professor</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">Olá, Professor!</p>
              <Badge className="bg-slate-100 text-slate-800">
                Administrador
              </Badge>
            </div>
            <Button 
              onClick={() => navigate('/admin/settings')}
              variant="outline"
              size="sm"
              className="text-gray-600"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Bem-vindo ao painel administrativo!
          </h2>
          <p className="text-lg text-gray-600">
            Gerencie atividades, gabaritos e temas para seus alunos
          </p>
        </div>

        {/* Subject Areas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {subjects.map((subject) => {
            const IconComponent = subject.icon;
            return (
              <Card 
                key={subject.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(subject.route)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto p-4 rounded-full w-fit mb-4 transition-colors ${subject.color}`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-bold">{subject.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {subject.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full group-hover:scale-105 transition-transform">
                    Gerenciar
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Redação Section */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 mb-8">
          <CardHeader className="text-center">
            <div className="mx-auto bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-full w-fit mb-4">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Gerenciar Redação</CardTitle>
            <CardDescription className="text-lg">
              Crie e gerencie temas de redação para os alunos
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => navigate('/admin/redacao')}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              Gerenciar Temas
            </Button>
          </CardContent>
        </Card>

        {/* Settings Section */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="text-center">
            <div className="mx-auto bg-gradient-to-r from-slate-500 to-gray-500 p-4 rounded-full w-fit mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Configurações Gerais</CardTitle>
            <CardDescription className="text-lg">
              Gerencie usuários e configurações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => navigate('/admin/settings')}
              className="bg-gradient-to-r from-slate-500 to-gray-500 hover:from-slate-600 hover:to-gray-600"
            >
              Acessar Configurações
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
