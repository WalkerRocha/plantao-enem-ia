import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Iniciando função answer-question ===');
    
    const { questionId } = await req.json();
    console.log('Question ID recebido:', questionId);
    
    if (!questionId) {
      throw new Error('questionId é obrigatório');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Buscando pergunta no banco...');
    const { data: question, error: fetchError } = await supabase
      .from('student_questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (fetchError || !question) {
      console.error('Erro ao buscar pergunta:', fetchError);
      throw new Error('Pergunta não encontrada');
    }

    console.log('Pergunta encontrada:', question);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('Chave OpenAI não encontrada nos secrets');
      throw new Error('Chave OpenAI não configurada');
    }

    console.log('Chave OpenAI encontrada');

    let systemPrompt = '';
    switch (question.subject.toLowerCase()) {
      case 'matematica':
        systemPrompt = 'Você é um professor especialista em Matemática do ENEM. Responda de forma didática, explicando passo a passo. Se receber uma imagem, analise a questão e explique detalhadamente a resolução.';
        break;
      case 'portugues':
        systemPrompt = 'Você é um professor especialista em Língua Portuguesa do ENEM. Ajude com gramática, interpretação e literatura. Se receber uma imagem de texto, faça a análise completa.';
        break;
      case 'ciencias':
        systemPrompt = 'Você é um professor especialista em Ciências da Natureza do ENEM. Explique conceitos científicos de forma clara. Se receber uma imagem, analise todos os elementos presentes.';
        break;
      case 'humanas':
        systemPrompt = 'Você é um professor especialista em Ciências Humanas do ENEM. Contextualize eventos históricos e conceitos sociais. Se receber uma imagem, analise o contexto histórico ou social.';
        break;
      case 'redacao':
        systemPrompt = 'Você é um professor especialista em redação do ENEM. Ajude com técnicas de escrita e argumentação. Se receber uma imagem de tema, analise e dê orientações.';
        break;
      default:
        systemPrompt = 'Você é um professor especializado no ENEM. Responda de forma didática e educativa. Se receber uma imagem, analise o conteúdo.';
    }

    // Preparar mensagem do usuário
    let userContent: any;
    
    if (question.image_url) {
      // Se há imagem, usar formato multi-modal
      const contentParts = [];
      
      if (question.question_text) {
        contentParts.push({
          type: 'text',
          text: question.question_text
        });
      } else {
        contentParts.push({
          type: 'text',
          text: 'Por favor, analise esta questão e me ajude a resolvê-la:'
        });
      }
      
      contentParts.push({
        type: 'image_url',
        image_url: {
          url: question.image_url
        }
      });
      
      userContent = contentParts;
    } else {
      // Apenas texto
      userContent = question.question_text || 'Por favor, tire minha dúvida sobre esta matéria.';
    }

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userContent
      }
    ];

    console.log('Enviando pergunta para OpenAI...');

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 2000,
        temperature: 0.3
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('Erro na API OpenAI:', openaiResponse.status, errorText);
      throw new Error(`Erro na API OpenAI: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices?.[0]?.message?.content || 'Desculpe, não consegui processar sua pergunta.';
    
    console.log('Resposta da IA recebida');

    console.log('Atualizando pergunta no banco...');
    const { error: updateError } = await supabase
      .from('student_questions')
      .update({
        ai_response: aiResponse,
        status: 'answered',
        updated_at: new Date().toISOString()
      })
      .eq('id', questionId);

    if (updateError) {
      console.error('Erro ao atualizar pergunta:', updateError);
      throw new Error('Erro ao salvar resposta');
    }

    console.log('Pergunta atualizada com sucesso!');
    
    return new Response(
      JSON.stringify({ 
        success: true,
        response: aiResponse 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});