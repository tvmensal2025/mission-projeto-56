import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Activity, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const GoogleFitTestPage = () => {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();

  const testGoogleFitConnection = async () => {
    setStatus('testing');
    try {
      // Testar se os tokens estão salvos
      const accessToken = localStorage.getItem('google_fit_access_token');
      const refreshToken = localStorage.getItem('google_fit_refresh_token');
      const authState = localStorage.getItem('google_fit_auth_state');

      console.log('=== TESTE GOOGLE FIT ===');
      console.log('Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'VAZIO');
      console.log('Refresh Token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'VAZIO');
      console.log('Auth State:', authState);

      // Teste básico de conectividade
      const testResults: any = {
        tokensFound: !!accessToken,
        refreshTokenFound: !!refreshToken,
        accessTokenLength: accessToken?.length || 0,
        authState: authState,
        currentUrl: window.location.href,
        isLocalhost: window.location.hostname === 'localhost',
        redirectUri: window.location.hostname === 'localhost' 
          ? 'http://localhost:3000/google-fit-callback'
          : 'https://eb451b44-5d36-4bf7-8628-481a619af74a.lovableproject.com/google-fit-callback'
      };

      // Se temos token, teste chamada para Google Fit API
      if (accessToken) {
        try {
          console.log('Testando API do Google Fit...');
          const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataSources', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          testResults.apiTest = {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
          };

          if (response.ok) {
            const data = await response.json();
            testResults.apiTest.dataSourcesCount = data.dataSource?.length || 0;
            console.log('API Test Success:', testResults.apiTest);
          } else {
            const errorText = await response.text();
            testResults.apiTest.error = errorText;
            console.error('API Test Failed:', errorText);
          }
        } catch (apiError) {
          testResults.apiTest = { error: apiError.message };
          console.error('API Test Exception:', apiError);
        }
      }

      setTestResults(testResults);
      setStatus(accessToken ? 'success' : 'error');
      
      toast({
        title: accessToken ? 'Teste Concluído' : 'Tokens Ausentes',
        description: accessToken ? 'Tokens encontrados e testados' : 'Conecte-se primeiro ao Google Fit',
        variant: accessToken ? 'default' : 'destructive'
      });

    } catch (error: any) {
      console.error('Erro no teste:', error);
      setStatus('error');
      setTestResults({ error: error.message });
      toast({
        title: 'Erro no Teste',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const clearTokens = () => {
    localStorage.removeItem('google_fit_access_token');
    localStorage.removeItem('google_fit_refresh_token');
    localStorage.removeItem('google_fit_auth_state');
    setTestResults(null);
    setStatus('idle');
    console.log('🧹 Tokens e estado limpos');
    toast({
      title: 'Reset Completo',
      description: 'Todos os dados foram limpos. Pronto para nova tentativa OAuth.',
    });
  };

  const startOAuth = () => {
    console.log('🚀 Iniciando OAuth...');
    
    // Limpar estado anterior completamente
    localStorage.removeItem('google_fit_access_token');
    localStorage.removeItem('google_fit_refresh_token');
    localStorage.removeItem('google_fit_auth_state');
    
    const redirectUri = 'https://eb451b44-5d36-4bf7-8628-481a619af74a.lovableproject.com/google-fit-callback';
    
    const scopes = [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.body.read', 
      'https://www.googleapis.com/auth/fitness.heart_rate.read',
      'https://www.googleapis.com/auth/fitness.sleep.read'
    ].join(' ');
    
    const clientId = '705908448787-n6pu6jsbr97d23no0vqhkqqaepf5unsm.apps.googleusercontent.com';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `include_granted_scopes=true`;
    
    console.log('🔧 Configuração OAuth:');
    console.log('- Client ID:', clientId);
    console.log('- Redirect URI:', redirectUri);
    console.log('- Scopes:', scopes);
    console.log('- URL completa:', authUrl);
    
    // Testar se a URL do callback existe
    fetch('/google-fit-callback')
      .then(response => console.log('🔍 Teste callback route:', response.status))
      .catch(err => console.log('🔍 Teste callback route erro:', err.message));
    
    localStorage.setItem('google_fit_auth_state', 'starting');
    localStorage.setItem('google_fit_debug', JSON.stringify({
      timestamp: new Date().toISOString(),
      clientId,
      redirectUri,
      authUrl
    }));
    
    toast({
      title: 'Iniciando OAuth',
      description: 'Redirecionando para Google...',
    });
    
    window.location.href = authUrl;
  };

  const testEdgeFunction = async () => {
    console.log('🧪 Testando edge function diretamente...');
    setStatus('testing');
    
    try {
      // Teste 1: Verificar secrets
      console.log('🔐 Teste 1: Verificando secrets...');
      const { data: secretsData, error: secretsError } = await supabase.functions.invoke('google-fit-token', {
        body: { testSecrets: true }
      });
      
      console.log('🔐 Resultado do teste de secrets:', { 
        hasData: !!secretsData, 
        hasError: !!secretsError,
        errorMessage: secretsError?.message,
        data: secretsData
      });

      // Teste 2: Simular OAuth com código fake
      console.log('📡 Teste 2: Simulando OAuth...');
      const { data: oauthData, error: oauthError } = await supabase.functions.invoke('google-fit-token', {
        body: { code: '4/0AeanS0b1234567890_fake_code_for_testing' }
      });
      
      console.log('📡 Resultado do teste OAuth:', { 
        hasData: !!oauthData, 
        hasError: !!oauthError,
        errorMessage: oauthError?.message,
        data: oauthData
      });

      const functionUrl = `https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/google-fit-token`;
      console.log('🔗 URL da função:', functionUrl);
      
      setTestResults({
        edgeFunctionTest: {
          accessible: true,
          secretsTest: secretsData,
          secretsError: secretsError?.message,
          oauthTest: oauthData,
          oauthError: oauthError?.message,
          functionUrl
        }
      });
      
      setStatus('success');
      
      toast({
        title: 'Teste Edge Function Completo',
        description: 'Verificação de secrets e OAuth concluída. Veja o console para detalhes.',
        variant: 'default'
      });
      
    } catch (err: any) {
      console.error('❌ Erro crítico no teste edge function:', err);
      setStatus('error');
      setTestResults({
        edgeFunctionTest: {
          accessible: false,
          error: err.message,
          criticalError: true
        }
      });
      
      toast({
        title: 'Erro Crítico',
        description: `Não foi possível acessar a edge function: ${err.message}`,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Teste Google Fit OAuth</h1>
            <p className="text-muted-foreground">Página para testar a integração com Google Fit</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {status === 'testing' && <Loader2 className="h-5 w-5 animate-spin" />}
                {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                Status da Integração
              </CardTitle>
              <CardDescription>
                Verificar se os tokens do Google Fit estão configurados corretamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={testGoogleFitConnection}
                  disabled={status === 'testing'}
                  className="flex items-center gap-2"
                >
                  {status === 'testing' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <Activity className="h-4 w-4" />
                      Testar Conexão
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={clearTokens}
                  variant="outline"
                  disabled={status === 'testing'}
                >
                  Limpar Tokens
                </Button>

                <Button 
                  onClick={startOAuth}
                  disabled={status === 'testing'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  🔗 Conectar OAuth
                </Button>

                <Button 
                  onClick={testEdgeFunction}
                  disabled={status === 'testing'}
                  variant="secondary"
                >
                  🧪 Testar Edge Function
                </Button>
              </div>

              {testResults && (
                <Alert className={status === 'error' ? 'border-red-200' : 'border-green-200'}>
                  <AlertDescription>
                    <pre className="text-sm">{JSON.stringify(testResults, null, 2)}</pre>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Disponíveis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/google-fit-oauth">
                  <Button className="w-full" variant="outline">
                    Conectar Google Fit
                  </Button>
                </Link>
                
                <Link to="/app/progress">
                  <Button className="w-full" variant="outline">
                    Ver Progresso
                  </Button>
                </Link>
                
                <Link to="/dashboard">
                  <Button className="w-full" variant="outline">
                    Voltar ao Dashboard
                  </Button>
                </Link>
                
                <Button 
                  onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  Google Cloud Console
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Debug Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>URL Atual:</strong> {window.location.href}</p>
                <p><strong>Host:</strong> {window.location.hostname}</p>
                <p><strong>Client ID:</strong> 705908448787-n6pu6jsbr97d23no0vqhkqqaepf5unsm.apps.googleusercontent.com</p>
                <p><strong>Redirect URI (Local):</strong> http://localhost:3000/google-fit-callback</p>
                <p><strong>Redirect URI (Produção):</strong> https://eb451b44-5d36-4bf7-8628-481a619af74a.lovableproject.com/google-fit-callback</p>
                
                {/* Mostrar tokens atuais */}
                <div className="mt-4 p-3 bg-muted rounded">
                  <p className="font-semibold mb-2">Status dos Tokens:</p>
                  <p><strong>Access Token:</strong> {localStorage.getItem('google_fit_access_token') ? '✅ Presente' : '❌ Ausente'}</p>
                  <p><strong>Refresh Token:</strong> {localStorage.getItem('google_fit_refresh_token') ? '✅ Presente' : '❌ Ausente'}</p>
                  <p><strong>Auth State:</strong> {localStorage.getItem('google_fit_auth_state') || 'Não definido'}</p>
                </div>
                
                {/* Botão para iniciar OAuth diretamente */}
                <div className="mt-4">
                  <Button 
                    onClick={() => {
                      const isLocalhost = window.location.hostname === 'localhost';
                      const redirectUri = isLocalhost 
                        ? 'http://localhost:3000/google-fit-callback'
                        : 'https://eb451b44-5d36-4bf7-8628-481a619af74a.lovableproject.com/google-fit-callback';
                      
                      const scopes = [
                        'https://www.googleapis.com/auth/fitness.activity.read',
                        'https://www.googleapis.com/auth/fitness.body.read', 
                        'https://www.googleapis.com/auth/fitness.heart_rate.read',
                        'https://www.googleapis.com/auth/fitness.sleep.read'
                      ].join(' ');
                      
                      const clientId = '705908448787-n6pu6jsbr97d23no0vqhkqqaepf5unsm.apps.googleusercontent.com';
                      
                      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                        `client_id=${clientId}&` +
                        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                        `scope=${encodeURIComponent(scopes)}&` +
                        `response_type=code&` +
                        `access_type=offline&` +
                        `prompt=consent&` +
                        `include_granted_scopes=true`;
                      
                      console.log('OAuth URL:', authUrl);
                      localStorage.setItem('google_fit_auth_state', 'connecting');
                      window.location.href = authUrl;
                    }}
                    className="w-full"
                    variant="secondary"
                  >
                    🔗 Teste OAuth Direto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GoogleFitTestPage;