import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  vitamins: string[];
  minerals: string[];
  healthScore: number;
  glycemicIndex?: number;
  allergens: string[];
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  quantity: number;
  unit: string;
  timestamp: Date;
}

interface NutritionAnalysis {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  mealBalance: {
    protein: number;
    carbs: number;
    fat: number;
  };
  healthScore: number;
  recommendations: string[];
  warnings: string[];
  insights: string[];
}

interface SofiaFoodAnalysis {
  personality: string;
  analysis: string;
  recommendations: string[];
  mood: string;
  energy: string;
  nextMeal: string;
  emotionalInsights: string[];
  habitAnalysis: string[];
  motivationalMessage: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { foodItems, mealType, userId, userContext } = await req.json();

    if (!foodItems || !Array.isArray(foodItems)) {
      throw new Error('foodItems é obrigatório e deve ser um array');
    }

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados do usuário
    const [
      { data: profile },
      { data: measurements },
      { data: healthDiary },
      { data: goals },
      { data: anamnesis }
    ] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
      supabase.from('weight_measurements').select('*').eq('user_id', userId).order('measurement_date', { ascending: false }).limit(5),
      supabase.from('health_diary').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(7),
      supabase.from('user_goals').select('*').eq('user_id', userId),
      supabase.from('user_anamnesis').select('*').eq('user_id', userId).single()
    ]);

    // Calcular análise nutricional
    const nutritionAnalysis = calculateNutritionAnalysis(foodItems);
    
    // Gerar análise da Sofia com IA
    const sofiaAnalysis = await generateSofiaAnalysis(
      foodItems, 
      nutritionAnalysis, 
      mealType, 
      userContext,
      profile,
      measurements,
      healthDiary,
      goals,
      anamnesis
    );

    // Salvar análise no banco
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('food_analysis')
      .insert({
        user_id: userId,
        meal_type: mealType,
        food_items: foodItems,
        nutrition_analysis: nutritionAnalysis,
        sofia_analysis: sofiaAnalysis,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('Erro ao salvar análise:', saveError);
      throw saveError;
    }

    console.log(`✅ Análise de comida gerada para usuário ${userId} - Refeição: ${mealType}`);

    return new Response(JSON.stringify({
      success: true,
      analysis_id: savedAnalysis.id,
      nutrition_analysis: nutritionAnalysis,
      sofia_analysis: sofiaAnalysis,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na análise de comida:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateNutritionAnalysis(foodItems: FoodItem[]): NutritionAnalysis {
  if (foodItems.length === 0) {
    return {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      totalSugar: 0,
      totalSodium: 0,
      mealBalance: { protein: 0, carbs: 0, fat: 0 },
      healthScore: 0,
      recommendations: [],
      warnings: [],
      insights: []
    };
  }

  const totals = foodItems.reduce((acc, item) => ({
    calories: acc.calories + (item.calories * item.quantity),
    protein: acc.protein + (item.protein * item.quantity),
    carbs: acc.carbs + (item.carbs * item.quantity),
    fat: acc.fat + (item.fat * item.quantity),
    fiber: acc.fiber + (item.fiber * item.quantity),
    sugar: acc.sugar + (item.sugar * item.quantity),
    sodium: acc.sodium + (item.sodium * item.quantity)
  }), {
    calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0
  });

  const totalCalories = totals.calories;
  const mealBalance = {
    protein: totalCalories > 0 ? (totals.protein * 4 / totalCalories) * 100 : 0,
    carbs: totalCalories > 0 ? (totals.carbs * 4 / totalCalories) * 100 : 0,
    fat: totalCalories > 0 ? (totals.fat * 9 / totalCalories) * 100 : 0
  };

  const avgHealthScore = foodItems.reduce((sum, item) => sum + item.healthScore, 0) / foodItems.length;

  const recommendations = [];
  const warnings = [];
  const insights = [];

  // Análise de proteína
  if (mealBalance.protein < 15) {
    recommendations.push('Considere adicionar mais proteínas para melhor saciedade');
  } else if (mealBalance.protein > 35) {
    warnings.push('Alto teor de proteína - mantenha hidratação adequada');
  }

  // Análise de carboidratos
  if (mealBalance.carbs > 65) {
    recommendations.push('Considere reduzir carboidratos e adicionar mais proteínas');
  }

  // Análise de fibras
  if (totals.fiber < 5) {
    recommendations.push('Adicione mais fibras para melhor digestão');
  }

  // Análise de açúcar
  if (totals.sugar > 25) {
    warnings.push('Alto teor de açúcar - considere opções mais naturais');
  }

  // Análise de sódio
  if (totals.sodium > 500) {
    warnings.push('Alto teor de sódio - evite sal adicional');
  }

  // Insights positivos
  if (avgHealthScore > 80) {
    insights.push('Excelente escolha de alimentos nutritivos!');
  }
  if (totals.fiber > 8) {
    insights.push('Ótima quantidade de fibras para saúde digestiva');
  }

  return {
    ...totals,
    mealBalance,
    healthScore: avgHealthScore,
    recommendations,
    warnings,
    insights
  };
}

async function generateSofiaAnalysis(
  foodItems: FoodItem[],
  nutritionAnalysis: NutritionAnalysis,
  mealType: string,
  userContext: any,
  profile: any,
  measurements: any[],
  healthDiary: any[],
  goals: any[],
  anamnesis: any
): Promise<SofiaFoodAnalysis> {
  
  // Buscar configuração de IA
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY não configurada');
  }

  // Preparar contexto para IA
  const userContextStr = JSON.stringify({
    profile: profile || {},
    latestMeasurements: measurements || [],
    recentHealthDiary: healthDiary || [],
    goals: goals || [],
    anamnesis: anamnesis || {}
  });

  const foodItemsStr = JSON.stringify(foodItems);
  const nutritionStr = JSON.stringify(nutritionAnalysis);

  const systemPrompt = `Você é a Sofia, uma nutricionista virtual amigável e empática especializada em análise de alimentos e bem-estar.

PERSONALIDADE DA SOFIA:
- Carinhosa e motivacional
- Foca em educação nutricional
- Considera aspectos emocionais da alimentação
- Sempre encorajadora, mesmo quando há pontos a melhorar
- Usa linguagem acessível e calorosa

CONTEXTO DO USUÁRIO:
${userContextStr}

ALIMENTOS ANALISADOS:
${foodItemsStr}

ANÁLISE NUTRICIONAL:
${nutritionStr}

TIPO DE REFEIÇÃO: ${mealType}

SUA TAREFA:
1. Analise os alimentos e a composição nutricional
2. Considere o contexto do usuário (peso, objetivos, histórico)
3. Forneça insights personalizados e motivacionais
4. Identifique padrões alimentares e emocionais
5. Dê recomendações práticas e acionáveis
6. Mantenha o tom amigável e encorajador da Sofia

FORMATO DA RESPOSTA (JSON):
{
  "personality": "nutricionista_amigavel",
  "analysis": "Análise principal em linguagem calorosa",
  "recommendations": ["rec1", "rec2"],
  "mood": "muito_feliz|otimista|preocupada",
  "energy": "alta|moderada|baixa",
  "nextMeal": "recomenda_lanche|recomenda_aguardar",
  "emotionalInsights": ["insight1", "insight2"],
  "habitAnalysis": ["padrao1", "padrao2"],
  "motivationalMessage": "Mensagem motivacional personalizada"
}

Seja sempre positiva e encorajadora, mesmo quando há pontos a melhorar.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: "Analise esta refeição com a personalidade da Sofia"
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    
    if (!reply) {
      throw new Error('Nenhuma resposta gerada pela OpenAI');
    }

    // Tentar parsear JSON da resposta
    try {
      const sofiaResponse = JSON.parse(reply);
      return sofiaResponse as SofiaFoodAnalysis;
    } catch (parseError) {
      // Se não conseguir parsear JSON, criar resposta padrão
      console.warn('Erro ao parsear resposta da IA, usando resposta padrão');
      return {
        personality: 'nutricionista_amigavel',
        analysis: `Olá! Analisei sua refeição ${mealType} e tenho algumas observações interessantes para compartilhar com você!`,
        recommendations: nutritionAnalysis.recommendations,
        mood: nutritionAnalysis.healthScore > 80 ? 'muito_feliz' : nutritionAnalysis.healthScore > 60 ? 'otimista' : 'preocupada',
        energy: nutritionAnalysis.totalCalories > 400 ? 'alta' : nutritionAnalysis.totalCalories > 200 ? 'moderada' : 'baixa',
        nextMeal: nutritionAnalysis.totalCalories < 300 ? 'recomenda_lanche' : 'recomenda_aguardar',
        emotionalInsights: ['Continue observando seus padrões alimentares'],
        habitAnalysis: ['Bom trabalho em registrar sua refeição'],
        motivationalMessage: 'Cada refeição é uma oportunidade de cuidar de você!'
      };
    }

  } catch (error) {
    console.error('Erro na geração da análise da Sofia:', error);
    // Retornar resposta padrão em caso de erro
    return {
      personality: 'nutricionista_amigavel',
      analysis: `Olá! Analisei sua refeição ${mealType} e tenho algumas observações interessantes para compartilhar com você!`,
      recommendations: nutritionAnalysis.recommendations,
      mood: nutritionAnalysis.healthScore > 80 ? 'muito_feliz' : nutritionAnalysis.healthScore > 60 ? 'otimista' : 'preocupada',
      energy: nutritionAnalysis.totalCalories > 400 ? 'alta' : nutritionAnalysis.totalCalories > 200 ? 'moderada' : 'baixa',
      nextMeal: nutritionAnalysis.totalCalories < 300 ? 'recomenda_lanche' : 'recomenda_aguardar',
      emotionalInsights: ['Continue observando seus padrões alimentares'],
      habitAnalysis: ['Bom trabalho em registrar sua refeição'],
      motivationalMessage: 'Cada refeição é uma oportunidade de cuidar de você!'
    };
  }
} 