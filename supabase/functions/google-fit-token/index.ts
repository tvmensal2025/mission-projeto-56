import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let requestBody;
    
    try {
      requestBody = await req.json();
    } catch (jsonError) {
      console.error('❌ Erro ao fazer parse do JSON:', jsonError);
      throw new Error('Body da requisição inválido');
    }
    
    const { code, testSecrets } = requestBody;
    
    console.log('🔄 Request recebido:', { 
      hasCode: !!code, 
      isTestSecrets: !!testSecrets,
      bodyKeys: Object.keys(requestBody || {})
    });

    // Teste especial para verificar secrets
    if (testSecrets) {
      const clientId = Deno.env.get('GOOGLE_FIT_CLIENT_ID');
      const clientSecret = Deno.env.get('GOOGLE_FIT_CLIENT_SECRET');
      
      console.log('🔧 Teste de secrets:');
      console.log('- Client ID definido:', !!clientId);
      console.log('- Client Secret definido:', !!clientSecret);
      console.log('- Client ID (primeiros 10 chars):', clientId ? clientId.substring(0, 10) + '...' : 'UNDEFINED');
      
      const result = {
        secretsTest: true,
        clientIdDefined: !!clientId,
        clientSecretDefined: !!clientSecret,
        clientIdPreview: clientId ? clientId.substring(0, 10) + '...' : 'UNDEFINED',
        timestamp: new Date().toISOString(),
        environment: 'edge-function'
      };
      
      console.log('✅ Retornando resultado do teste de secrets:', result);
      
      return new Response(
        JSON.stringify(result),
        {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
        }
      );
    }

    console.log('🔄 Código de autorização:', code ? 'PRESENTE' : 'AUSENTE');

    if (!code) {
      console.error('❌ Código de autorização ausente');
      throw new Error('Código de autorização é obrigatório');
    }

    // Pegar secrets do Supabase (configurados no painel)
    const clientId = Deno.env.get('GOOGLE_FIT_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_FIT_CLIENT_SECRET');
    
    console.log('🔧 Configuração OAuth:');
    console.log('- Client ID configurado:', !!clientId);
    console.log('- Client Secret configurado:', !!clientSecret);
    
    if (!clientId || !clientSecret) {
      console.error('❌ Credenciais não configuradas:', { clientId: !!clientId, clientSecret: !!clientSecret });
      throw new Error('Credenciais do Google não configuradas no Supabase');
    }
    
    // Detectar automaticamente o redirect URI baseado no referrer ou origin
    const referer = req.headers.get('referer') || req.headers.get('origin') || '';
    const isLocalhost = referer.includes('localhost') || referer.includes('127.0.0.1');
    
    // URLs de callback corretas
    const redirectUri = isLocalhost 
      ? 'http://localhost:3000/google-fit-callback'
      : 'https://eb451b44-5d36-4bf7-8628-481a619af74a.lovableproject.com/google-fit-callback';
    
    console.log('🔗 Usando redirect URI:', redirectUri);
    console.log('🆔 Client ID (primeiros 20 chars):', clientId.substring(0, 20) + '...');

    // Trocar código por token de acesso
    console.log('📡 Iniciando troca de token com Google...');
    
    const tokenBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });
    
    console.log('🔧 Body da requisição preparado');
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenBody,
    });

    console.log('📊 Status da resposta Google:', tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('❌ Falha na troca de token:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorData,
        clientIdUsed: clientId.substring(0, 20) + '...',
        redirectUriUsed: redirectUri
      });
      throw new Error(`Falha na troca de token: ${errorData}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Troca de token bem-sucedida');

    return new Response(
      JSON.stringify({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        scope: tokenData.scope,
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );

  } catch (error) {
    console.error('💥 Erro na função google-fit-token:', error);
    
    const errorResponse = {
      error: error.message,
      timestamp: new Date().toISOString(),
      type: 'edge-function-error'
    };
    
    console.log('📤 Retornando erro:', errorResponse);
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});
