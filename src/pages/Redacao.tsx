import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Send, MessageSquare, CheckCircle, BookOpen, File } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import StudentQuestions from '@/components/StudentQuestions';
import { AccessControl } from '@/components/AccessControl';

interface EssayTheme {
  id: string;
  title: string;
  description: string;
  instructions: string;
  theme_text: string;
  pdf_url?: string;
  created_at: string;
}

interface EssayCorrection {
  id: string;
  essay_text: string;
  ai_correction: any;
  status: 'pending' | 'corrected';
  created_at: string;
  theme_id: string;
  essay_themes?: {
    title: string;
    description: string;
  };
}

const Redacao = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [essayText, setEssayText] = useState('');
  const [corrections, setCorrections] = useState<EssayCorrection[]>([]);
  const [themes, setThemes] = useState<EssayTheme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<EssayTheme | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchThemes();
    fetchCorrections();
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
      toast.error('Erro ao carregar temas');
    }
  };

  const fetchCorrections = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('essay_corrections')
        .select(`
          *,
          essay_themes (
            title,
            description
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const correctionsData = (data || []).map(item => ({
        ...item,
        status: item.status as 'pending' | 'corrected',
        theme_id: item.theme_id || '',
        essay_themes: item.essay_themes ? {
          title: item.essay_themes.title,
          description: item.essay_themes.description || ''
        } : undefined
      }));
      
      setCorrections(correctionsData);
    } catch (error) {
      console.error('Erro ao buscar correções:', error);
      toast.error('Erro ao carregar correções');
    }
  };

  const handleSubmitEssay = async () => {
    if (!user || !essayText.trim() || !selectedTheme) {
      toast.error('Selecione um tema e digite sua redação');
      return;
    }

    if (essayText.trim().length < 200) {
      toast.error('Sua redação deve ter pelo menos 200 caracteres');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('essay_corrections')
        .insert({
          user_id: user.id,
          essay_text: essayText.trim(),
          theme_id: selectedTheme.id
        })
        .select()
        .single();

      if (error) throw error;

      // Chamar função para correção com IA
      const { error: functionError } = await supabase.functions
        .invoke('correct-essay', {
          body: { essayId: data.id }
        });

      if (functionError) {
        console.error('Erro na função IA:', functionError);
      }

      setEssayText('');
      setSelectedTheme(null);
      fetchCorrections();
      toast.success('Redação enviada! A IA está corrigindo sua redação...');
    } catch (error) {
      console.error('Erro ao enviar redação:', error);
      toast.error('Erro ao enviar redação');
    } finally {
      setLoading(false);
    }
  };

  const renderScore = (score: number) => {
    const color = score >= 160 ? 'text-green-600' : score >= 120 ? 'text-yellow-600' : 'text-red-600';
    return <span className={`font-bold ${color}`}>{score}/200</span>;
  };

  return (
    <AccessControl feature="redacao">
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-orange-200 sticky top-0 z-50">
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
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-orange-800">Redação ENEM</h1>
                <p className="text-sm text-gray-600">Correção IA - Padrão Dissertativo-Argumentativo</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="themes" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="themes">Escolher Tema</TabsTrigger>
              <TabsTrigger value="submit" disabled={!selectedTheme}>Escrever Redação</TabsTrigger>
              <TabsTrigger value="feedback">Minhas Correções</TabsTrigger>
              <TabsTrigger value="questions">Perguntas</TabsTrigger>
            </TabsList>

            <TabsContent value="themes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Temas Disponíveis
                  </CardTitle>
                  <CardDescription>
                    Escolha um tema para sua redação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {themes.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Nenhum tema disponível no momento
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {themes.map((theme) => (
                        <div
                          key={theme.id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedTheme?.id === theme.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                          onClick={() => setSelectedTheme(theme)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">{theme.title}</h3>
                            {selectedTheme?.id === theme.id && (
                              <Badge className="bg-orange-500">Selecionado</Badge>
                            )}
                          </div>
                          {theme.description && (
                            <p className="text-gray-600 mb-3">{theme.description}</p>
                          )}
                          <div className="bg-gray-100 p-3 rounded text-sm">
                            <p className="font-medium mb-2">Proposta:</p>
                            <p>{theme.theme_text.substring(0, 150)}...</p>
                          </div>
                          {theme.pdf_url && (
                            <div className="mt-2">
                              <a 
                                href={theme.pdf_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <File className="h-4 w-4 mr-1" />
                                Ver PDF completo do tema
                              </a>
                            </div>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            Criado em: {new Date(theme.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedTheme && (
                    <div className="mt-6 flex justify-center">
                      <Button
                        onClick={() => {
                          const submitTab = document.querySelector('[value="submit"]') as HTMLButtonElement;
                          submitTab?.click();
                        }}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      >
                        Continuar para Redação
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="submit" className="space-y-4">
              {selectedTheme ? (
                <>
                  <Card className="mb-4">
                    <CardHeader>
                      <CardTitle className="text-lg">{selectedTheme.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-orange-50 p-4 rounded mb-4">
                        <h4 className="font-semibold mb-2">Proposta de Redação:</h4>
                        <p className="whitespace-pre-wrap">{selectedTheme.theme_text}</p>
                      </div>
                      {selectedTheme.instructions && (
                        <div className="bg-blue-50 p-4 rounded mb-4">
                          <h4 className="font-semibold mb-2">Instruções Específicas:</h4>
                          <p className="whitespace-pre-wrap">{selectedTheme.instructions}</p>
                        </div>
                      )}
                      {selectedTheme.pdf_url && (
                        <div className="bg-green-50 p-4 rounded">
                          <h4 className="font-semibold mb-2">Material Complementar:</h4>
                          <a 
                            href={selectedTheme.pdf_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-700 hover:text-green-900 flex items-center"
                          >
                            <File className="h-4 w-4 mr-2" />
                            Abrir PDF completo do tema
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Sua Redação
                      </CardTitle>
                      <CardDescription>
                        Escreva sua redação seguindo o padrão dissertativo-argumentativo do ENEM
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Instruções gerais:</p>
                        <ul className="text-sm text-gray-600 space-y-1 mb-4">
                          <li>• Mínimo de 200 caracteres</li>
                          <li>• Máximo de 30 linhas</li>
                          <li>• Estrutura: Introdução, Desenvolvimento e Conclusão</li>
                          <li>• Inclua proposta de intervenção na conclusão</li>
                        </ul>
                      </div>
                      
                      <Textarea
                        placeholder="Digite sua redação aqui..."
                        value={essayText}
                        onChange={(e) => setEssayText(e.target.value)}
                        rows={20}
                        className="min-h-[400px] font-mono"
                      />
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          {essayText.length} caracteres
                        </p>
                        <Button
                          onClick={handleSubmitEssay}
                          disabled={loading || !essayText.trim() || essayText.length < 200}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        >
                          {loading ? (
                            'Enviando...'
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Enviar para Correção
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">Selecione um tema primeiro para começar a escrever</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="feedback" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Histórico de Correções
                  </CardTitle>
                  <CardDescription>
                    Suas redações corrigidas pela IA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {corrections.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Você ainda não enviou nenhuma redação para correção
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {corrections.map((correction) => (
                        <Card key={correction.id} className="border-l-4 border-l-orange-500">
                          <CardContent className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Badge variant={correction.status === 'corrected' ? 'default' : 'secondary'}>
                                    {correction.status === 'corrected' ? 'Corrigida' : 'Corrigindo...'}
                                  </Badge>
                                  {correction.essay_themes && (
                                    <Badge variant="outline">
                                      {correction.essay_themes.title}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400">
                                  {new Date(correction.created_at).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-sm text-gray-700 mb-2">Sua Redação:</h4>
                                <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                                  {correction.essay_text.substring(0, 200)}...
                                </div>
                              </div>
                              
                              {correction.ai_correction && (
                                <div className="space-y-4">
                                  <div className="bg-orange-50 p-4 rounded">
                                    <h4 className="font-bold text-orange-800 mb-3 flex items-center">
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Correção IA - Padrão ENEM
                                    </h4>
                                    
                                    {/* Nota Final */}
                                    <div className="mb-4">
                                      <h5 className="font-semibold text-sm">Nota Final:</h5>
                                      <p className="text-2xl font-bold text-orange-700">
                                        {renderScore(correction.ai_correction.notaFinal || 0)}
                                      </p>
                                    </div>

                                    {/* Competências */}
                                    {correction.ai_correction.competencias && (
                                      <div className="mb-4">
                                        <h5 className="font-semibold text-sm mb-2">Avaliação por Competências:</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                          {Object.entries(correction.ai_correction.competencias).map(([comp, nota]) => (
                                            <div key={comp} className="flex justify-between">
                                              <span>{comp}:</span>
                                              <span className="font-medium">{renderScore(nota as number)}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Comentários */}
                                    {correction.ai_correction.comentarios && (
                                      <div>
                                        <h5 className="font-semibold text-sm mb-2">Comentários Detalhados:</h5>
                                        <div className="text-sm space-y-2">
                                          {Object.entries(correction.ai_correction.comentarios).map(([aspecto, comentario]) => (
                                            <div key={aspecto} className="bg-white p-3 rounded border-l-4 border-l-orange-400">
                                              <strong className="text-orange-700">{aspecto}:</strong>
                                              <p className="mt-1">{comentario as string}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions" className="space-y-4">
              <StudentQuestions subject="redacao" subjectName="Redação" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AccessControl>
  );
};

export default Redacao;