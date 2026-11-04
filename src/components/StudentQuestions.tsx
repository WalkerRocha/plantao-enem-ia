import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Send, RefreshCw } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface StudentQuestion {
  id: string;
  question_text: string | null;
  image_url: string | null;
  ai_response: string | null;
  status: string;
  created_at: string;
  subject: string;
  user_id: string;
}

interface Props {
  subject: string;
  subjectName: string;
}

const StudentQuestions: React.FC<Props> = ({ subject, subjectName }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<StudentQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [questionImage, setQuestionImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Buscando perguntas para:', { user: user.id, subject });
      
      const { data, error } = await supabase
        .from('student_questions')
        .select('*')
        .eq('user_id', user.id)
        .eq('subject', subject)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar perguntas:', error);
        toast.error('Erro ao carregar perguntas');
        return;
      }

      console.log('Perguntas encontradas:', data);
      setQuestions(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao carregar perguntas');
    } finally {
      setLoading(false);
    }
  }, [user, subject]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const processWithAI = async (questionId: string): Promise<boolean> => {
    try {
      console.log('Processando pergunta com IA:', questionId);
      
      const { data, error } = await supabase.functions.invoke('answer-question', {
        body: { questionId }
      });

      if (error) {
        console.error('Erro na função IA:', error);
        throw error;
      }

      if (data?.success) {
        console.log('Pergunta processada com sucesso!');
        return true;
      } else {
        throw new Error(data?.error || 'Erro desconhecido na IA');
      }
    } catch (error) {
      console.error('Erro ao processar com IA:', error);
      
      // Marcar como erro no banco
      await supabase
        .from('student_questions')
        .update({ status: 'error' })
        .eq('id', questionId);
      
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newQuestion.trim() && !questionImage) {
      toast.error('Digite uma pergunta ou envie uma imagem');
      return;
    }

    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    try {
      setSubmitting(true);
      
      console.log('Inserindo pergunta no banco...');
      const { data: insertedQuestion, error: insertError } = await supabase
        .from('student_questions')
        .insert({
          user_id: user.id,
          question_text: newQuestion.trim() || null,
          image_url: questionImage || null,
          subject: subject,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError || !insertedQuestion) {
        console.error('Erro ao inserir pergunta:', insertError);
        toast.error('Erro ao salvar pergunta');
        return;
      }

      console.log('Pergunta inserida com sucesso:', insertedQuestion);
      
      // Limpar formulário
      setNewQuestion('');
      setQuestionImage('');
      
      // Recarregar perguntas
      await fetchQuestions();
      
      toast.success('Pergunta enviada! Processando resposta...');
      
      // Processar com IA
      console.log('Iniciando processamento com IA para:', insertedQuestion.id);
      const success = await processWithAI(insertedQuestion.id);
      
      if (success) {
        await fetchQuestions(); // Recarregar para mostrar a resposta
        toast.success('Resposta recebida!');
      } else {
        toast.error('Erro ao processar pergunta. Tente novamente.');
        await fetchQuestions(); // Recarregar para mostrar o status de erro
      }
      
    } catch (error) {
      console.error('Erro ao enviar pergunta:', error);
      toast.error('Erro ao enviar pergunta');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Você precisa estar logado para fazer perguntas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Tire suas dúvidas de {subjectName}
            <Button
              onClick={fetchQuestions}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Atualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            onPaste={(e) => {
              // Permitir que o ImageUpload handle o paste se não houver texto selecionado
              const selection = window.getSelection();
              if (!selection || selection.toString().length === 0) {
                const items = Array.from(e.clipboardData.items);
                const imageItem = items.find(item => item.type.startsWith('image/'));
                if (imageItem && imageItem.getAsFile()) {
                  e.preventDefault();
                  // O ImageUpload vai lidar com isso
                }
              }
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Textarea
                  placeholder="Digite sua dúvida aqui ou envie apenas uma imagem..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="min-h-24"
                  disabled={submitting}
                />
              </div>

              <div>
                <ImageUpload 
                  onImageUpload={setQuestionImage}
                  disabled={submitting}
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={submitting || (!newQuestion.trim() && !questionImage)}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Pergunta
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          <p className="mt-2 text-muted-foreground">Carregando perguntas...</p>
        </div>
      ) : questions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Nenhuma pergunta ainda. Faça sua primeira pergunta sobre {subjectName}!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                      Sua pergunta:
                    </h4>
                    {question.question_text && (
                      <p className="text-foreground whitespace-pre-wrap mb-3">
                        {question.question_text}
                      </p>
                    )}
                    {question.image_url && (
                      <div className="mb-3">
                        <img 
                          src={question.image_url} 
                          alt="Questão enviada" 
                          className="max-w-full max-h-96 rounded-lg border"
                        />
                      </div>
                    )}
                    {!question.question_text && !question.image_url && (
                      <p className="text-muted-foreground italic">
                        Pergunta sem conteúdo
                      </p>
                    )}
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                      Resposta:
                    </h4>
                    {question.status === 'pending' && (
                      <div className="flex items-center text-yellow-600">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processando sua pergunta...
                      </div>
                    )}
                    {question.status === 'error' && (
                      <div className="text-red-600">
                        Erro ao processar a pergunta. Tente reenviar.
                      </div>
                    )}
                    {question.status === 'answered' && question.ai_response && (
                      <div className="prose prose-sm max-w-none">
                        <div className="text-foreground whitespace-pre-wrap">
                          {question.ai_response}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {new Date(question.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentQuestions;