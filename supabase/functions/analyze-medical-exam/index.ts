import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Buscar configuração de IA para análise médica
    const { data: aiConfig, error: configError } = await supabase
      .from('ai_configurations')
      .select('service, model, max_tokens, temperature, preset_level')
      .eq('functionality', 'medical_analysis')
      .eq('is_enabled', true)
      .single();

    // Usar configuração padrão se não encontrar
    const config = aiConfig || {
      service: 'gemini',
      model: 'gemini-1.5-flash',
      max_tokens: 2048,
      temperature: 0.3
    };

    console.log(`🔬 Análise médica usando: ${config.service} ${config.model} (${config.max_tokens} tokens, temp: ${config.temperature})`);

    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (config.service === 'gemini' && !GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY não configurada');
    }
    if (config.service === 'openai' && !OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const { imageData, examType, userId } = await req.json();

    // Inicializar Supabase para buscar dados do usuário
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados completos do usuário
    const [
      { data: profile },
      { data: measurements },
      { data: healthDiary },
      { data: missions },
      { data: goals }
    ] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
      supabase.from('weight_measurements').select('*').eq('user_id', userId).order('measurement_date', { ascending: false }).limit(10),
      supabase.from('health_diary').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(7),
      supabase.from('daily_mission_sessions').select('*').eq('user_id', userId).eq('is_completed', true).order('date', { ascending: false }).limit(10),
      supabase.from('user_goals').select('*').eq('user_id', userId)
    ]);

    // Preparar contexto do usuário
    const userContext = {
      profile: profile || {},
      recentMeasurements: measurements || [],
      recentHealthDiary: healthDiary || [],
      recentMissions: missions || [],
      goals: goals || []
    };

    // Preparar prompt para IA
    const systemPrompt = `Você é um assistente médico especializado em análise de exames laboratoriais e integração com dados de saúde pessoais.

IMPORTANTE: Você NÃO é um médico e suas análises são apenas informativas. Sempre recomende consultar um profissional de saúde qualificado.

Contexto do usuário:
- Perfil: ${JSON.stringify(userContext.profile)}
- Últimas pesagens: ${JSON.stringify(userContext.recentMeasurements)}
- Diário de saúde recente: ${JSON.stringify(userContext.recentHealthDiary)}
- Missões completadas: ${JSON.stringify(userContext.recentMissions)}
- Metas: ${JSON.stringify(userContext.goals)}

Tipo de exame: ${examType}

Sua tarefa:
1. Analise o exame médico na imagem fornecida
2. Extraia todos os valores e resultados importantes
3. Compare com valores de referência normais
4. Correlacione com o histórico pessoal do usuário (peso, IMC, hábitos)
5. Identifique tendências preocupantes ou positivas
6. Forneça recomendações práticas baseadas nos dados
7. Sugira quando procurar um médico

Formato da resposta:
- Resumo dos principais achados
- Valores fora da normalidade (se houver)
- Correlação com dados pessoais
- Recomendações práticas
- Alertas importantes
- Disclaimer médico

Seja preciso, didático e sempre inclua disclaimers apropriados.

Analise este exame médico do tipo ${examType} e correlacione com meu histórico de saúde.`;

    // Converter imagem para base64 se necessário
    let imageBase64 = imageData;
    if (imageData.startsWith('http')) {
      const imageResponse = await fetch(imageData);
      const imageBlob = await imageResponse.blob();
      const imageBuffer = await imageBlob.arrayBuffer();
      imageBase64 = `data:${imageBlob.type};base64,${btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))}`;
    }

    // Extrair apenas o base64 sem o prefixo
    const base64Data = imageBase64.split(',')[1];
    const mimeType = imageBase64.split(';')[0].split(':')[1];

    let analysis = '';

    if (config.service === 'gemini') {
      // Analisar exame com Gemini Vision
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${GOOGLE_AI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: systemPrompt
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }],
          generationConfig: {
            temperature: config.temperature,
            topK: 32,
            topP: 1,
            maxOutputTokens: config.max_tokens,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Google AI API error: ${data.error?.message || 'Erro desconhecido'}`);
      }

      analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Não foi possível analisar o exame no momento.';

    } else if (config.service === 'openai') {
      // Analisar exame com OpenAI Vision
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: systemPrompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageBase64
                  }
                }
              ]
            }
          ],
          temperature: config.temperature,
          max_tokens: config.max_tokens,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${data.error?.message || 'Erro desconhecido'}`);
      }

      analysis = data.choices?.[0]?.message?.content || 'Não foi possível analisar o exame no momento.';
    }

    console.log(`✅ Análise médica gerada com sucesso usando ${config.service} ${config.model}`);

    // Salvar análise no banco de dados
    const { error: insertError } = await supabase
      .from('medical_exam_analyses')
      .insert({
        user_id: userId,
        exam_type: examType,
        analysis_result: analysis,
        image_url: imageData.startsWith('data:') ? null : imageData,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Erro ao salvar análise:', insertError);
    }

    return new Response(JSON.stringify({
      analysis,
      userContext: {
        profileSummary: `${profile?.full_name || 'Usuário'}, ${profile?.gender || 'N/A'}, ${profile?.height_cm || 'N/A'}cm`,
        latestWeight: measurements?.[0]?.peso_kg || 'N/A',
        latestIMC: measurements?.[0]?.imc || 'N/A',
        recentMissionsCount: missions?.length || 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na análise de exame:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});