
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calculator, Upload, FileText, CheckCircle, Clock, Download, Trash2 } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'activity' | 'answer_key';
  file_name: string;
  file_url: string;
  created_at: string;
  area?: string;
  subject?: string;
}

const AdminMatematica = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [uploadingAtividade, setUploadingAtividade] = useState(false);
  const [uploadingGabarito, setUploadingGabarito] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [answerKeys, setAnswerKeys] = useState<Activity[]>([]);

  if (!isAdmin) {
    navigate('/admin/login');
    return null;
  }

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('area', 'matematica')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Type cast and filter the data properly
      const typedData = data?.map(item => ({
        ...item,
        type: item.type as 'activity' | 'answer_key'
      })) || [];

      const activitiesData = typedData.filter(item => item.type === 'activity');
      const answerKeysData = typedData.filter(item => item.type === 'answer_key');

      setActivities(activitiesData);
      setAnswerKeys(answerKeysData);
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      toast.error('Erro ao carregar atividades');
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleUploadAtividade = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadingAtividade(true);
    
    const formData = new FormData(e.currentTarget);
    const title = formData.get('atividade-titulo') as string;
    const description = formData.get('atividade-descricao') as string;
    const tipo = formData.get('tipo') as 'activity' | 'answer_key';
    const file = formData.get('atividade-arquivo') as File;

    if (!file) {
      toast.error('Por favor, selecione um arquivo');
      setUploadingAtividade(false);
      return;
    }

    try {
      // Upload do arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `matematica/${tipo === 'activity' ? 'atividades' : 'gabaritos'}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('activity-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('activity-files')
        .getPublicUrl(fileName);

      // Salvar no banco
      const { error: dbError } = await supabase
        .from('activities')
        .insert({
          title,
          description,
          area: 'matematica',
          subject: 'matematica',
          type: tipo,
          file_name: file.name,
          file_url: urlData.publicUrl
        });

      if (dbError) throw dbError;

      toast.success(`${tipo === 'activity' ? 'Atividade' : 'Gabarito'} criado com sucesso!`);
      fetchActivities();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Erro ao enviar:', error);
      toast.error('Erro ao criar item');
    } finally {
      setUploadingAtividade(false);
    }
  };

  const handleUploadGabarito = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadingGabarito(true);
    
    const formData = new FormData(e.currentTarget);
    const title = formData.get('gabarito-titulo') as string;
    const description = formData.get('gabarito-descricao') as string;
    const file = formData.get('gabarito-arquivo') as File;

    if (!file) {
      toast.error('Por favor, selecione um arquivo');
      setUploadingGabarito(false);
      return;
    }

    try {
      // Upload do arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `matematica/gabaritos/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('activity-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('activity-files')
        .getPublicUrl(fileName);

      // Salvar no banco - incluindo subject obrigatório
      const { error: dbError } = await supabase
        .from('activities')
        .insert({
          title,
          description,
          area: 'matematica',
          subject: 'matematica', // Campo obrigatório
          type: 'answer_key',
          file_name: file.name,
          file_url: urlData.publicUrl
        });

      if (dbError) throw dbError;

      toast.success('Gabarito enviado com sucesso!');
      fetchActivities();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Erro ao enviar gabarito:', error);
      toast.error('Erro ao enviar gabarito');
    } finally {
      setUploadingGabarito(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Item excluído com sucesso!');
      fetchActivities();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir item');
    }
  };

  const ActivityList = ({ items, title }: { items: Activity[], title: string }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Histórico de {title.toLowerCase()} de Matemática
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum item enviado ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(item.file_url, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => navigate('/admin/dashboard')}
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
              <h1 className="text-xl font-bold text-foreground">Matemática - Admin</h1>
              <p className="text-sm text-muted-foreground">Gerenciar atividades e gabaritos</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Criar Atividade</TabsTrigger>
            <TabsTrigger value="manage">Gerenciar Atividades</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload de Atividade</span>
                </CardTitle>
                <CardDescription>
                  Envie atividades de Matemática para os alunos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadAtividade} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="atividade-titulo">Título da Atividade</Label>
                    <Input
                      id="atividade-titulo"
                      name="atividade-titulo"
                      placeholder="Ex: Exercícios de Função Quadrática"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="atividade-descricao">Descrição</Label>
                    <Textarea
                      id="atividade-descricao"
                      name="atividade-descricao"
                      placeholder="Descreva a atividade..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <select
                      id="tipo"
                      name="tipo"
                      className="w-full p-2 border border-input rounded-md"
                      required
                    >
                      <option value="activity">Atividade</option>
                      <option value="answer_key">Gabarito</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="atividade-arquivo">Arquivo da Atividade</Label>
                    <Input
                      id="atividade-arquivo"
                      name="atividade-arquivo"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={uploadingAtividade}
                  >
                    {uploadingAtividade ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Criar Atividade
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Atividades Criadas ({activities.length + answerKeys.length})
                </CardTitle>
                <CardDescription>
                  Gerencie todas as atividades de Matemática
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Atividades ({activities.length})</h3>
                    <ActivityList items={activities} title="Atividades" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Gabaritos ({answerKeys.length})</h3>
                    <ActivityList items={answerKeys} title="Gabaritos" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminMatematica;
