
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Microscope, Download, FileText, MessageSquare, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import StudentQuestions from '@/components/StudentQuestions';

const CienciasDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="bg-gradient-to-r from-primary to-accent p-2 rounded-lg">
              <Microscope className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Ciências</h1>
              <p className="text-sm text-muted-foreground">Ciências da Natureza e suas Tecnologias</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="activities" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activities">
              <FileText className="h-4 w-4 mr-2" />
              Atividades
            </TabsTrigger>
            <TabsTrigger value="gabarito">
              <CheckCircle className="h-4 w-4 mr-2" />
              Gabarito
            </TabsTrigger>
            <TabsTrigger value="questions">
              <MessageSquare className="h-4 w-4 mr-2" />
              Perguntas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Atividades de Ciências
                </CardTitle>
                <CardDescription>
                  Acesse as atividades disponibilizadas pelo professor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Microscope className="h-16 w-16 text-accent/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Em breve!</h3>
                  <p className="text-muted-foreground mb-4">
                    As atividades de Ciências estarão disponíveis em breve.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Enquanto isso, use a aba "Perguntas" para tirar suas dúvidas!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gabarito">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Gabarito - Ciências
                </CardTitle>
                <CardDescription>
                  Acesse os gabaritos e correções disponibilizados pelo professor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-accent/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Em breve!</h3>
                  <p className="text-muted-foreground mb-4">
                    Os gabaritos de Ciências estarão disponíveis em breve.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Aqui você encontrará as correções e respostas das atividades.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <StudentQuestions 
              subject="ciencias" 
              subjectName="Ciências" 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CienciasDashboard;
