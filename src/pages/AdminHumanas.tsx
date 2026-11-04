
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Globe, Upload, FileText, Trash2, Edit3, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Activity {
  id: string;
  title: string;
  description: string;
  subject: string;
  type: string;
  file_url: string;
  file_name: string;
  created_at: string;
}

const AdminHumanas = () => {
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
        .eq('subject', 'humanas')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      toast.error('Erro ao carregar atividades');
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
        const fileName_upload = `${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('activities')
          .upload(fileName_upload, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('activities')
          .getPublicUrl(fileName_upload);

        fileUrl = publicUrl;
        fileName = file.name;
      }

      if (editingActivity) {
        const { error } = await supabase
          .from('activities')
          .update({
            title: title.trim(),
            description: description.trim(),
            type: activityType,
            ...(fileUrl && { file_url: fileUrl, file_name: fileName })
          })
          .eq('id', editingActivity.id);

        if (error) throw error;
        toast.success('Atividade atualizada com sucesso');
      } else {
        const { error } = await supabase
          .from('activities')
          .insert({
            title: title.trim(),
            description: description.trim(),
            subject: 'humanas',
            type: activityType,
            file_url: fileUrl,
            file_name: fileName
          });

        if (error) throw error;
        toast.success('Atividade criada com sucesso');
      }

      resetForm();
      fetchActivities();
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
      toast.error('Erro ao salvar atividade');
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
    if (!confirm('Tem certeza que deseja excluir esta atividade?')) return;

    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Atividade excluída com sucesso');
      fetchActivities();
    } catch (error) {
      console.error('Erro ao excluir atividade:', error);
      toast.error('Erro ao excluir atividade');
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-50">
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
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-lg">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-green-800">Humanas - Admin</h1>
              <p className="text-sm text-gray-600">Gerenciar atividades e gabaritos</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">
              {editingActivity ? 'Editar' : 'Criar'} Atividade
            </TabsTrigger>
            <TabsTrigger value="manage">Gerenciar Atividades</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  {editingActivity ? 'Editar Atividade' : 'Nova Atividade'}
                </CardTitle>
                <CardDescription>
                  {editingActivity ? 'Edite os dados da atividade' : 'Crie uma nova atividade ou gabarito'}
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
                      placeholder="Digite o título da atividade"
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
                      placeholder="Descreva a atividade"
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
                      <option value="activity">Atividade</option>
                      <option value="answer_key">Gabarito</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="file" className="block text-sm font-medium mb-2">
                      Arquivo (PDF, DOC, etc.)
                    </label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Salvando...' : editingActivity ? 'Atualizar' : 'Criar'} Atividade
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
                  Atividades Criadas
                </CardTitle>
                <CardDescription>
                  Gerencie todas as atividades de Humanas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhuma atividade criada ainda
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{activity.title}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant={activity.type === 'activity' ? 'default' : 'secondary'}>
                              {activity.type === 'activity' ? 'Atividade' : 'Gabarito'}
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
                          <p className="text-sm text-blue-600">
                            📎 {activity.file_name}
                          </p>
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

export default AdminHumanas;
