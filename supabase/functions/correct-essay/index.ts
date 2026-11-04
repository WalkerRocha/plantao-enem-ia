
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('=== INICIANDO FUNÇÃO CORRECT-ESSAY ===');
  console.log('Método:', req.method);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { essayId } = await req.json()

    // Buscar a redação
    const { data: essay, error: essayError } = await supabase
      .from('essay_corrections')
      .select('*')
      .eq('id', essayId)
      .maybeSingle()

    if (essayError || !essay) {
      console.error('Erro ao buscar redação:', essayError)
      throw new Error(`Erro ao buscar redação: ${essayError?.message || 'Redação não encontrada'}`)
    }

    // Prompt detalhado para correção de redação ENEM
    const prompt = `Você é um corretor especialista em redações do ENEM. Analise cuidadosamente a redação abaixo seguindo EXATAMENTE os critérios do ENEM.

REDAÇÃO PARA CORREÇÃO:
${essay.essay_text}

Avalie a redação seguindo as 5 competências do ENEM:

COMPETÊNCIA 1 - Domínio da modalidade escrita formal da língua portuguesa (0-200):
- Avalie desvios gramaticais, ortográficos e de concordância
- Considere adequação ao registro formal

COMPETÊNCIA 2 - Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento (0-200):
- Verifique se desenvolveu o tema proposto
- Analise se mobilizou repertório sociocultural

COMPETÊNCIA 3 - Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos (0-200):
- Avalie a seleção e organização dos argumentos
- Verifique coerência e progressão textual

COMPETÊNCIA 4 - Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação (0-200):
- Analise o uso de conectivos e elementos coesivos
- Verifique articulação entre parágrafos

COMPETÊNCIA 5 - Elaborar proposta de intervenção para o problema abordado (0-200):
- Verifique se há proposta de intervenção
- Analise se é detalhada e exequível

IMPORTANTE: 
- Seja rigoroso mas construtivo
- Aponte EXATAMENTE onde estão os problemas
- Forneça exemplos de como melhorar
- Use linguagem didática e encorajadora
- Inclua dicas práticas para próximas redações

Formate sua resposta em JSON com esta estrutura EXATA:
{
  "competencias": {
    "Competência 1": [nota de 0 a 200],
    "Competência 2": [nota de 0 a 200],
    "Competência 3": [nota de 0 a 200],
    "Competência 4": [nota de 0 a 200],
    "Competência 5": [nota de 0 a 200]
  },
  "notaFinal": [soma das 5 competências],
  "feedback": "[feedback detalhado explicando cada competência]",
  "pontosFortes": "[o que o aluno fez bem]",
  "pontosMelhorar": "[o que precisa melhorar com exemplos específicos do texto]",
  "dicas": "[dicas práticas e técnicas para próximas redações]"
}`

    console.log('Iniciando correção da redação:', essayId)

    // Chave da OpenAI lida dos secrets da Edge Function
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }
    console.log('Chave da OpenAI encontrada:', !!openaiApiKey);

    console.log('Chamando API do OpenAI para correção...')
    // Chamar a API do OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um corretor especialista em redações do ENEM com mais de 10 anos de experiência. Seja preciso, didático e sempre forneça feedback construtivo.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2500,
        temperature: 0.3,
      }),
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('Erro na API do OpenAI:', openaiResponse.status, errorText)
      throw new Error(`Erro na API do OpenAI: ${openaiResponse.status} - ${errorText}`)
    }

    const openaiData = await openaiResponse.json()
    console.log('Resposta recebida do OpenAI:', openaiData)
    
    const aiResponse = openaiData.choices?.[0]?.message?.content

    if (!aiResponse) {
      console.error('Resposta vazia da IA:', openaiData)
      throw new Error('Resposta vazia da IA')
    }

    // Parse da resposta JSON
    let correctionData
    try {
      correctionData = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta:', parseError)
      // Fallback se não conseguir fazer parse
      correctionData = {
        feedback: aiResponse,
        notaFinal: 0,
        competencias: {},
        pontosFortes: "Análise em processamento",
        pontosMelhorar: "Análise em processamento",
        dicas: "Análise em processamento"
      }
    }

    // Atualizar a redação com a correção
    const { error: updateError } = await supabase
      .from('essay_corrections')
      .update({
        ai_correction: correctionData,
        status: 'corrected'
      })
      .eq('id', essayId)

    if (updateError) {
      throw new Error(`Erro ao atualizar redação: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({ success: true, correction: correctionData }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro na função correct-essay:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
