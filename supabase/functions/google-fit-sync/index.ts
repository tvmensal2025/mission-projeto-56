import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleFitData {
  steps: number;
  calories: number;
  distance: number;
  heartRate: number;
  weight?: number;
  height?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: user } = await supabaseClient.auth.getUser(token);

    if (!user.user) {
      throw new Error('Unauthorized');
    }

    const { access_token, refresh_token, date_range } = await req.json();

    console.log('Sincronizando dados do Google Fit para usuário:', user.user.id);

    // Buscar dados do Google Fit API
    const fitData = await fetchGoogleFitData(access_token, date_range);

    // Salvar dados no Supabase usando a estrutura correta da tabela
    if (fitData.steps > 0) {
      await supabaseClient
        .from('google_fit_data')
        .upsert({
          user_id: user.user.id,
          data_date: new Date().toISOString().split('T')[0],
          steps_count: fitData.steps,
          calories_burned: fitData.calories,
          distance_meters: fitData.distance,
          heart_rate_avg: fitData.heartRate,
          sync_timestamp: new Date().toISOString(),
        });
    }

    console.log('Dados sincronizados com sucesso:', fitData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: fitData,
        message: 'Dados do Google Fit sincronizados com sucesso'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Erro na sincronização do Google Fit:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

async function fetchGoogleFitData(accessToken: string, dateRange: { startDate: string, endDate: string }): Promise<GoogleFitData> {
  const baseUrl = 'https://www.googleapis.com/fitness/v1/users/me';
  
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  // Buscar passos
  const stepsResponse = await fetch(`${baseUrl}/dataset:aggregate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      aggregateBy: [{
        dataTypeName: 'com.google.step_count.delta',
        dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
      }],
      bucketByTime: { durationMillis: 86400000 }, // 1 dia
      startTimeMillis: new Date(dateRange.startDate).getTime(),
      endTimeMillis: new Date(dateRange.endDate).getTime(),
    }),
  });

  // Buscar calorias
  const caloriesResponse = await fetch(`${baseUrl}/dataset:aggregate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      aggregateBy: [{
        dataTypeName: 'com.google.calories.expended',
        dataSourceId: 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended'
      }],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis: new Date(dateRange.startDate).getTime(),
      endTimeMillis: new Date(dateRange.endDate).getTime(),
    }),
  });

  // Buscar distância
  const distanceResponse = await fetch(`${baseUrl}/dataset:aggregate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      aggregateBy: [{
        dataTypeName: 'com.google.distance.delta',
        dataSourceId: 'derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta'
      }],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis: new Date(dateRange.startDate).getTime(),
      endTimeMillis: new Date(dateRange.endDate).getTime(),
    }),
  });

  const stepsData = await stepsResponse.json();
  const caloriesData = await caloriesResponse.json();
  const distanceData = await distanceResponse.json();

  // Processar dados
  const steps = stepsData.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;
  const calories = caloriesData.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal || 0;
  const distance = distanceData.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal || 0;

  return {
    steps,
    calories: Math.round(calories),
    distance: Math.round(distance),
    heartRate: 0, // Google Fit não fornece dados de frequência cardíaca facilmente
  };
}