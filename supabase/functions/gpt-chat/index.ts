import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const geminiApiKey = Deno.env.get('GOOGLE_AI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  service?: 'openai' | 'gemini';
  messages?: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  prompt?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

const callOpenAI = async (messages: any[], model: string, temperature: number, max_tokens: number) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0]?.message?.content || 'Erro na resposta',
    usage: data.usage,
    model: data.model
  };
};

const callGemini = async (prompt: string, model: string, temperature: number, max_tokens: number) => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature,
        maxOutputTokens: max_tokens,
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  return {
    content: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Erro na resposta Gemini',
    usage: { total_tokens: max_tokens },
    model: model
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      service = 'openai', 
      messages, 
      prompt, 
      model = 'gpt-4.1-2025-04-14', 
      temperature = 0.7, 
      max_tokens = 1000 
    }: ChatRequest = await req.json();

    console.log(`Processando ${service} - Model: ${model}`);

    let result: any;

    if (service === 'gemini') {
      if (!geminiApiKey) {
        throw new Error('GOOGLE_AI_API_KEY não está configurada');
      }
      // Para Gemini, converter messages em prompt ou usar prompt direto
      const promptText = prompt || messages?.map(m => `${m.role}: ${m.content}`).join('\n') || '';
      result = await callGemini(promptText, model, temperature, max_tokens);
    } else {
      if (!openAIApiKey) {
        throw new Error('OPENAI_API_KEY não está configurada');
      }
      // Para OpenAI, usar messages ou converter prompt
      const messagesArray = messages || [{ role: 'user' as const, content: prompt || '' }];
      if (!messagesArray.length) {
        throw new Error('Messages ou prompt são obrigatórios');
      }
      result = await callOpenAI(messagesArray, model, temperature, max_tokens);
    }

    console.log(`Resposta ${service} recebida - Tokens: ${result.usage?.total_tokens || 'N/A'}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na edge function gpt-chat:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Erro interno na função de chat'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});