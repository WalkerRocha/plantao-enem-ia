
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, PenTool, Upload, FileText, Trash2, Edit3, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EssayTheme {
  id: string;
  title: string;
  description: string;
  instructions: string;
  theme_text: string;
  pdf_url: string;
  created_at: string;
}

const AdminRedacao = () => {
  const navigate = useNavigate();
  const [themes, setThemes] = useState<EssayTheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTheme, setEditingTheme] = useState<EssayTheme | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [themeText, setThemeText] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const { data, error } = await supabase
        .from('essay_themes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setThemes(data || []);
    } catch (error) {
      console.error('Erro ao buscar temas:', error);
      toast.error('Erro ao carregar temas de redação');
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
      let pdfUrl = '';

      if (pdfFile) {
        const fileExt = pdfFile.name.split('.').pop();
        const uniqueFileName = `redacao_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        console.log('Fazendo upload do PDF:', uniqueFileName);
        
        const { error: uploadError } = await supabase.storage
          .from('essay-pdfs')
          .upload(uniqueFileName, pdfFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Erro no upload do PDF:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('essay-pdfs')
          .getPublicUrl(uniqueFileName);

        pdfUrl = publicUrl;
        console.log('Upload do PDF realizado com sucesso:', pdfUrl);
      }

      if (editingTheme) {
        const updateData: any = {
          title: title.trim(),
          description: description.trim() || null,
          instructions: instructions.trim() || null,
          theme_text: themeText.trim() || null,
        };

        if (pdfUrl) {
          updateData.pdf_url = pdfUrl;
        }

        const { error } = await supabase
          .from('essay_themes')
          .update(updateData)
          .eq('id', editingTheme.id);

        if (error) {
          console.error('Erro ao atualizar tema:', error);
          throw error;
        }
        toast.success('Tema de redação atualizado com sucesso');
      } else {
        const insertData = {
          title: title.trim(),
          description: description.trim() || null,
          instructions: instructions.trim() || null,
          theme_text: themeText.trim() || null,
          pdf_url: pdfUrl || null
        };

        console.log('Inserindo tema:', insertData);

        const { error } = await supabase
          .from('essay_themes')
          .insert(insertData);

        if (error) {
          console.error('Erro ao inserir tema:', error);
          throw error;
        }
        toast.success('Tema de redação criado com sucesso');
      }

      resetForm();
      fetchThemes();
    } catch (error: any) {
      console.error('Erro ao salvar tema:', error);
      toast.error(error.message || 'Erro ao salvar tema de redação');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (theme: EssayTheme) => {
    setEditingTheme(theme);
    setTitle(theme.title);
    setDescription(theme.description || '');
    setInstructions(theme.instructions || '');
    setThemeText(theme.theme_text || '');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este tema?')) return;

    try {
      const { error } = await supabase
        .from('essay_themes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Tema excluído com sucesso');
      fetchThemes();
    } catch (error) {
      console.error('Erro ao excluir tema:', error);
      toast.error('Erro ao excluir tema');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setInstructions('');
    setThemeText('');
    setPdfFile(null);
    setEditingTheme(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-200 sticky top-0 z-50">
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
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
              <PenTool className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-orange-800">Redação - Admin</h1>
              <p className="text-sm text-gray-600">Gerenciar temas de redação</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">
              {editingTheme ? 'Editar' : 'Criar'} Tema
            </TabsTrigger>
            <TabsTrigger value="manage">Gerenciar Temas</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  {editingTheme ? 'Editar Tema' : 'Novo Tema de Redação'}
                </CardTitle>
                <CardDescription>
                  {editingTheme ? 'Edite os dados do tema' : 'Crie um novo tema de redação'}
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
                      placeholder="Digite o título do tema"
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
                      placeholder="Descreva o tema"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label htmlFor="instructions" className="block text-sm font-medium mb-2">
                      Instruções
                    </label>
                    <Textarea
                      id="instructions"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Instruções para a redação"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label htmlFor="themeText" className="block text-sm font-medium mb-2">
                      Texto do Tema
                    </label>
                    <Textarea
                      id="themeText"
                      value={themeText}
                      onChange={(e) => setThemeText(e.target.value)}
                      placeholder="Texto completo do tema da redação"
                      rows={5}
                    />
                  </div>

                  <div>
                    <label htmlFor="pdf" className="block text-sm font-medium mb-2">
                      Arquivo PDF (opcional)
                    </label>
                    <Input
                      id="pdf"
                      type="file"
                      onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                      accept=".pdf"
                    />
                    {pdfFile && (
                      <p className="text-sm text-gray-600 mt-1">
                        Arquivo selecionado: {pdfFile.name}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Salvando...' : editingTheme ? 'Atualizar' : 'Criar'} Tema
                    </Button>
                    {editingTheme && (
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
                  Temas Criados ({themes.length})
                </CardTitle>
                <CardDescription>
                  Gerencie todos os temas de redação
                </CardDescription>
              </CardHeader>
              <CardContent>
                {themes.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum tema criado ainda
                  </p>
                ) : (
                  <div className="space-y-4">
                    {themes.map((theme) => (
                      <div key={theme.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{theme.title}</h3>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(theme)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(theme.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {theme.description && (
                          <p className="text-gray-600 mb-2">{theme.description}</p>
                        )}
                        {theme.pdf_url && (
                          <div className="flex items-center space-x-2 mb-2">
                            <p className="text-sm text-blue-600">📄 PDF anexado</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(theme.pdf_url, '_blank')}
                            >
                              Ver PDF
                            </Button>
                          </div>
                        )}
                        <p className="text-xs text-gray-400">
                          Criado em: {new Date(theme.created_at).toLocaleDateString('pt-BR')}
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

export default AdminRedacao;
