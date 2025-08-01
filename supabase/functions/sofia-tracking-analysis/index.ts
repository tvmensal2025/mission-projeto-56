import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrackingData {
  daily_advanced_tracking: any[];
  water_tracking: any[];
  sleep_tracking: any[];
  mood_tracking: any[];
  exercise_tracking: any[];
  weight_measurements: any[];
  food_analysis: any[];
  user_profile: any;
}

interface AnalysisResult {
  patterns: {
    sleep_patterns: string;
    water_patterns: string;
    mood_patterns: string;
    exercise_patterns: string;
    weight_patterns: string;
    food_patterns: string;
  };
  insights: string[];
  recommendations: string[];
  anomalies: string[];
  predictions: {
    weight_trend: string;
    energy_forecast: string;
    goal_likelihood: string;
  };
  personalized_tips: string[];
  sofia_learning: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, analysis_type = 'complete' } = await req.json();

    if (!user_id) {
      throw new Error('User ID is required');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    console.log(`Starting Sofia analysis for user: ${user_id}`);

    // Collect comprehensive tracking data
    const trackingData = await collectTrackingData(supabaseClient, user_id);
    
    // Perform AI analysis
    const analysis = await performSofiaAnalysis(trackingData, analysis_type);
    
    // Save analysis results
    await saveAnalysisResults(supabaseClient, user_id, analysis);
    
    // Update Sofia's knowledge about the user
    await updateSofiaKnowledge(supabaseClient, user_id, analysis);

    return new Response(JSON.stringify({
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in Sofia tracking analysis:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function collectTrackingData(supabase: any, userId: string): Promise<TrackingData> {
  console.log('Collecting comprehensive tracking data...');
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Collect all tracking data in parallel
  const [
    dailyAdvanced,
    waterData,
    sleepData,
    moodData,
    exerciseData,
    weightData,
    foodData,
    userProfile
  ] = await Promise.all([
    supabase.from('daily_advanced_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false }),
    
    supabase.from('water_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false }),
    
    supabase.from('sleep_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false }),
    
    supabase.from('mood_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false }),
    
    supabase.from('exercise_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false }),
    
    supabase.from('weight_measurements')
      .select('*')
      .eq('user_id', userId)
      .gte('measurement_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('measurement_date', { ascending: false }),
    
    supabase.from('food_analysis')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false }),
    
    supabase.from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
  ]);

  return {
    daily_advanced_tracking: dailyAdvanced.data || [],
    water_tracking: waterData.data || [],
    sleep_tracking: sleepData.data || [],
    mood_tracking: moodData.data || [],
    exercise_tracking: exerciseData.data || [],
    weight_measurements: weightData.data || [],
    food_analysis: foodData.data || [],
    user_profile: userProfile.data || {}
  };
}

async function performSofiaAnalysis(data: TrackingData, analysisType: string): Promise<AnalysisResult> {
  console.log('Performing Sofia AI analysis...');
  
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Create comprehensive analysis prompt
  const systemPrompt = `Você é Sofia, uma IA especialista em saúde e bem-estar que analisa dados de tracking de usuários.

MISSÃO: Analisar padrões complexos de saúde e comportamento para fornecer insights personalizados e detectar anomalias.

CAPACIDADES ANALÍTICAS:
- Análise de padrões temporais e sazonais
- Correlações entre diferentes métricas de saúde
- Detecção de anomalias e desvios
- Previsões baseadas em tendências
- Sugestões personalizadas de melhoria
- Aprendizado contínuo sobre o usuário

DIRETRIZES:
- Seja empática e encorajadora
- Use linguagem acessível e motivadora
- Identifique conexões não óbvias entre métricas
- Foque em insights acionáveis
- Detecte padrões sutis que o usuário pode não perceber
- Sempre considere o contexto pessoal do usuário`;

  const analysisPrompt = `Analise os dados de tracking do usuário e forneça uma análise completa:

DADOS DO USUÁRIO:
${JSON.stringify(data, null, 2)}

FORNEÇA UMA ANÁLISE ESTRUTURADA EM JSON COM:

{
  "patterns": {
    "sleep_patterns": "Análise detalhada dos padrões de sono",
    "water_patterns": "Análise dos padrões de hidratação",
    "mood_patterns": "Análise dos padrões de humor e energia",
    "exercise_patterns": "Análise dos padrões de exercício",
    "weight_patterns": "Análise das tendências de peso",
    "food_patterns": "Análise dos padrões alimentares"
  },
  "insights": [
    "Insight 1: Conexão específica encontrada",
    "Insight 2: Padrão temporal identificado",
    "Insight 3: Correlação entre métricas"
  ],
  "recommendations": [
    "Recomendação específica baseada nos dados",
    "Ajuste personalizado para melhorar métricas",
    "Estratégia para otimizar resultados"
  ],
  "anomalies": [
    "Anomalia 1: Desvio significativo detectado",
    "Anomalia 2: Padrão atípico identificado"
  ],
  "predictions": {
    "weight_trend": "Previsão da tendência de peso baseada nos dados",
    "energy_forecast": "Previsão dos níveis de energia futuros",
    "goal_likelihood": "Probabilidade de atingir metas atuais"
  },
  "personalized_tips": [
    "Dica específica para este usuário",
    "Sugestão baseada nos padrões únicos",
    "Estratégia personalizada de melhoria"
  ],
  "sofia_learning": "O que Sofia aprendeu sobre este usuário específico para futuras interações"
}

IMPORTANTE: 
- Seja específica e use dados reais
- Identifique padrões únicos deste usuário
- Detecte correlações não óbvias
- Forneça insights acionáveis
- Use tom encorajador e empático`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const analysisText = result.choices[0].message.content;
    
    // Parse JSON response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }
    
    return JSON.parse(jsonMatch[0]);
    
  } catch (error) {
    console.error('Error in AI analysis:', error);
    throw error;
  }
}

async function saveAnalysisResults(supabase: any, userId: string, analysis: AnalysisResult) {
  console.log('Saving analysis results...');
  
  try {
    // Save in preventive_health_analyses table
    const { error } = await supabase
      .from('preventive_health_analyses')
      .insert({
        user_id: userId,
        analysis_type: 'sofia_tracking_analysis',
        analysis_data: {
          patterns: analysis.patterns,
          insights: analysis.insights,
          recommendations: analysis.recommendations,
          anomalies: analysis.anomalies,
          predictions: analysis.predictions,
          personalized_tips: analysis.personalized_tips,
          analysis_date: new Date().toISOString()
        },
        recommendations: analysis.recommendations,
        risk_factors: analysis.anomalies,
        risk_score: analysis.anomalies.length * 10 // Basic risk scoring
      });

    if (error) {
      console.error('Error saving analysis:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in saveAnalysisResults:', error);
  }
}

async function updateSofiaKnowledge(supabase: any, userId: string, analysis: AnalysisResult) {
  console.log('Updating Sofia knowledge base...');
  
  try {
    // Save Sofia's learning in sofia_conversations table for context
    const { error } = await supabase
      .from('sofia_conversations')
      .insert({
        user_id: userId,
        message_type: 'analysis_learning',
        sofia_response: analysis.sofia_learning,
        context_data: {
          learning_type: 'tracking_analysis',
          patterns_discovered: analysis.patterns,
          insights_count: analysis.insights.length,
          anomalies_detected: analysis.anomalies.length,
          timestamp: new Date().toISOString()
        }
      });

    if (error) {
      console.error('Error updating Sofia knowledge:', error);
    }
  } catch (error) {
    console.error('Error in updateSofiaKnowledge:', error);
  }
}