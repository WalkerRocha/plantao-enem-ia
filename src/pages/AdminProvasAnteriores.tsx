
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Upload, Trash2, Edit3, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Activity {
  id: string;
  title: string;
  description: string;
  subject: string;
  area: string;
  type: string;
  file_url: string;
  file_name: string;
  created_at: string;
}

const AdminProvasAnteriores = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [activityType, setActivityType] = useState<'activity' | 'answer_key'>('activity');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('area', 'provas-anteriores')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Erro ao buscar provas anteriores:', error);
      toast.error('Erro ao carregar provas anteriores');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    setLoading(true);
    try {
      let fileUrl = '';
      let fileName = '';

      if (file) {
        const fileExt = file.name.split('.').pop();
        const uniqueFileName = `provas_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        console.log('Fazendo upload do arquivo:', uniqueFileName);
        
        const { error: uploadError } = await supabase.storage
          .from('activity-files')
          .upload(uniqueFileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Erro no upload:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('activity-files')
          .getPublicUrl(uniqueFileName);

        fileUrl = publicUrl;
        fileName = file.name;
        console.log('Upload realizado com sucesso:', { fileUrl, fileName });
      }

      if (editingActivity) {
        const updateData: any = {
          title: title.trim(),
          description: description.trim(),
          type: activityType,
        };

        if (fileUrl) {
          updateData.file_url = fileUrl;
          updateData.file_name = fileName;
        }

        const { error } = await supabase
          .from('activities')
          .update(updateData)
          .eq('id', editingActivity.id);

        if (error) {
          console.error('Erro ao atualizar:', error);
          throw error;
        }
        toast.success('Prova anterior atualizada com sucesso');
      } else {
        const insertData = {
          title: title.trim(),
          description: description.trim(),
          subject: 'provas-anteriores',
          area: 'provas-anteriores',
          type: activityType,
          file_url: fileUrl,
          file_name: fileName
        };

        console.log('Inserindo dados:', insertData);

        const { error } = await supabase
          .from('activities')
          .insert(insertData);

        if (error) {
          console.error('Erro ao inserir:', error);
          throw error;
        }
        toast.success('Prova anterior criada com sucesso');
      }

      resetForm();
      fetchActivities();
    } catch (error: any) {
      console.error('Erro ao salvar prova anterior:', error);
      toast.error(error.message || 'Erro ao salvar prova anterior');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setTitle(activity.title);
    setDescription(activity.description || '');
    setActivityType(activity.type as 'activity' | 'answer_key');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta prova anterior?')) return;

    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Prova anterior excluída com sucesso');
      fetchActivities();
    } catch (error) {
      console.error('Erro ao excluir prova anterior:', error);
      toast.error('Erro ao excluir prova anterior');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setFile(null);
    setActivityType('activity');
    setEditingActivity(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
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
            <div className="bg-gradient-to-r from-gray-600 to-slate-600 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Provas Anteriores - Admin</h1>
              <p className="text-sm text-gray-600">Gerenciar provas anteriores</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">
              {editingActivity ? 'Editar' : 'Criar'} Prova
            </TabsTrigger>
            <TabsTrigger value="manage">Gerenciar Provas</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  {editingActivity ? 'Editar Prova Anterior' : 'Nova Prova Anterior'}
                </CardTitle>
                <CardDescription>
                  {editingActivity ? 'Edite os dados da prova' : 'Adicione uma nova prova anterior ou gabarito'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-2">
                      Título *
                    </label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: ENEM 2023 - 1º Dia"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-2">
                      Descrição
                    </label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreva a prova"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium mb-2">
                      Tipo *
                    </label>
                    <select
                      id="type"
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value as 'activity' | 'answer_key')}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="activity">Prova</option>
                      <option value="answer_key">Gabarito</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="file" className="block text-sm font-medium mb-2">
                      Arquivo (PDF, Word)
                    </label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      accept=".pdf,.doc,.docx"
                    />
                    {file && (
                      <p className="text-sm text-gray-600 mt-1">
                        Arquivo selecionado: {file.name}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Salvando...' : editingActivity ? 'Atualizar' : 'Criar'} Prova
                    </Button>
                    {editingActivity && (
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Provas Criadas ({activities.length})
                </CardTitle>
                <CardDescription>
                  Gerencie todas as provas anteriores
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhuma prova criada ainda
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{activity.title}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant={activity.type === 'activity' ? 'default' : 'secondary'}>
                              {activity.type === 'activity' ? 'Prova' : 'Gabarito'}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(activity)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(activity.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {activity.description && (
                          <p className="text-gray-600 mb-2">{activity.description}</p>
                        )}
                        {activity.file_url && (
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-blue-600">
                              📎 {activity.file_name}
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(activity.file_url, '_blank')}
                            >
                              Ver Arquivo
                            </Button>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Criado em: {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminProvasAnteriores;
