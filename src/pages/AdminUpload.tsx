
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, FileText, Image, Video } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const AdminUpload = () => {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    contentType: '',
    difficulty: '',
    file: null as File | null
  });

  if (!isAdmin) {
    navigate('/admin/login');
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error('Por favor, selecione um arquivo');
      return;
    }

    setLoading(true);
    try {
      // Upload do arquivo para o Supabase Storage
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('content')
        .upload(fileName, formData.file);

      if (uploadError) throw uploadError;

      // Salvar metadados no banco (seria necessário criar uma tabela 'contents')
      const { error: dbError } = await supabase
        .from('contents')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            subject: formData.subject,
            content_type: formData.contentType,
            difficulty: formData.difficulty,
            file_path: uploadData.path,
            file_name: formData.file.name,
            file_size: formData.file.size,
            uploaded_by: (await supabase.auth.getUser()).data.user?.id
          }
        ]);

      if (dbError) {
        console.error('Erro ao salvar no banco:', dbError);
        // Se não existir a tabela, apenas mostra sucesso do upload
        toast.success('Arquivo enviado com sucesso! (Criar tabela contents no Supabase)');
      } else {
        toast.success('Conteúdo adicionado com sucesso!');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        subject: '',
        contentType: '',
        difficulty: '',
        file: null
      });
      
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast.error(error.message || 'Erro ao fazer upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Upload de Conteúdo
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-6 w-6" />
              <span>Adicionar Novo Conteúdo</span>
            </CardTitle>
            <CardDescription>
              Faça upload de materiais de estudo para a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Conteúdo</Label>
                <Input
                  id="title"
                  placeholder="Ex: Questões de Matemática - Função Quadrática"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição detalhada do conteúdo..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Matéria</Label>
                  <Select 
                    value={formData.subject} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a matéria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="matematica">Matemática</SelectItem>
                      <SelectItem value="portugues">Português</SelectItem>
                      <SelectItem value="fisica">Física</SelectItem>
                      <SelectItem value="quimica">Química</SelectItem>
                      <SelectItem value="biologia">Biologia</SelectItem>
                      <SelectItem value="historia">História</SelectItem>
                      <SelectItem value="geografia">Geografia</SelectItem>
                      <SelectItem value="filosofia">Filosofia</SelectItem>
                      <SelectItem value="sociologia">Sociologia</SelectItem>
                      <SelectItem value="redacao">Redação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Conteúdo</Label>
                  <Select 
                    value={formData.contentType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, contentType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="questoes">Questões</SelectItem>
                      <SelectItem value="teoria">Teoria</SelectItem>
                      <SelectItem value="videoaula">Videoaula</SelectItem>
                      <SelectItem value="simulado">Simulado</SelectItem>
                      <SelectItem value="exercicios">Exercícios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nível de Dificuldade</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facil">Fácil</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="dificil">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Arquivo</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mp3"
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    <div className="space-y-2">
                      {formData.file ? (
                        <>
                          <FileText className="h-8 w-8 mx-auto text-green-600" />
                          <p className="text-sm font-medium">{formData.file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto text-gray-400" />
                          <p className="text-sm text-gray-600">Clique para selecionar um arquivo</p>
                          <p className="text-xs text-gray-500">
                            PDF, DOC, Imagens, Vídeos (máx. 50MB)
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Fazer Upload'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUpload;
