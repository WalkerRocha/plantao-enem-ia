
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calculator, Download, FileText, MessageSquare, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import StudentQuestions from '@/components/StudentQuestions';

interface Activity {
  id: string;
  title: string;
  description: string;
  file_name: string;
  file_url: string;
  created_at: string;
}

const MatematicaDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [answerKeys, setAnswerKeys] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('area', 'matematica')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar atividades:', error);
        return;
      }

      const activitiesData = data?.filter(item => item.type === 'activity') || [];
      const answerKeysData = data?.filter(item => item.type === 'answer_key') || [];

      setActivities(activitiesData);
      setAnswerKeys(answerKeysData);
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const FileList = ({ items, emptyMessage }: { items: Activity[], emptyMessage: string }) => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Em breve!</h3>
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => item.file_url && window.open(item.file_url, '_blank')}
                disabled={!item.file_url}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
            </div>
          ))
        )}
      </div>
    );
  };

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
            <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-lg">
              <Calculator className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Matemática</h1>
              <p className="text-sm text-muted-foreground">Matemática e suas Tecnologias</p>
            </div>
          </div>
          <Button onClick={() => navigate('/plans')} variant="outline">
            Ver Planos
          </Button>
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
                  Atividades de Matemática
                </CardTitle>
                <CardDescription>
                  Acesse as atividades disponibilizadas pelo professor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileList 
                  items={activities} 
                  emptyMessage="As atividades de Matemática estarão disponíveis em breve."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gabarito">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Gabarito - Matemática
                </CardTitle>
                <CardDescription>
                  Acesse os gabaritos e correções disponibilizados pelo professor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileList 
                  items={answerKeys} 
                  emptyMessage="Os gabaritos de Matemática estarão disponíveis em breve."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <StudentQuestions 
              subject="matematica" 
              subjectName="Matemática" 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MatematicaDashboard;
