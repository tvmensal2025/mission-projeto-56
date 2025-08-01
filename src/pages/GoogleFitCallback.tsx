import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader2, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const GoogleFitCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔥 CALLBACK INICIADO');
        console.log('URL completa:', window.location.href);
        
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const state = urlParams.get('state');

        console.log('Parâmetros OAuth:', { code: !!code, error, state });

        if (error) {
          console.error('❌ OAuth Error:', error);
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code) {
          console.error('❌ Código ausente');
          throw new Error('Código de autorização não encontrado');
        }

        console.log('✅ Código OAuth recebido, iniciando troca por tokens...');
        setMessage('Processando autorização...');

        // Chamar edge function para trocar o código por tokens
        console.log('📡 Chamando edge function...');
        const { data, error: tokenError } = await supabase.functions.invoke('google-fit-token', {
          body: { code }
        });

        console.log('📡 Resposta da edge function:', { data: !!data, error: tokenError });

        if (tokenError) {
          console.error('❌ Erro da edge function:', tokenError);
          throw new Error(tokenError.message);
        }

        if (data && data.access_token) {
          // Salvar tokens no localStorage
          localStorage.setItem('google_fit_access_token', data.access_token);
          if (data.refresh_token) {
            localStorage.setItem('google_fit_refresh_token', data.refresh_token);
          }

          setStatus('success');
          setMessage('Conectado com sucesso! Sincronizando dados...');

          // Sincronizar dados iniciais
          setTimeout(async () => {
            try {
              await supabase.functions.invoke('google-fit-sync', {
                body: {
                  access_token: data.access_token,
                  refresh_token: data.refresh_token,
                  date_range: {
                    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0]
                  }
                }
              });

              toast({
                title: 'Google Fit Conectado!',
                description: 'Dados sincronizados com sucesso. Redirecionando...',
              });

              // Redirecionar para a página de progresso após 3 segundos
              setTimeout(() => {
                window.location.href = '/app/progress';
              }, 3000);

            } catch (syncError) {
              console.error('Erro na sincronização inicial:', syncError);
              toast({
                title: 'Conectado mas erro na sincronização',
                description: 'Você pode sincronizar manualmente na página de progresso.',
                variant: 'destructive',
              });
              
              setTimeout(() => {
                window.location.href = '/app/progress';
              }, 3000);
            }
          }, 1000);

        } else {
          throw new Error('Tokens não recebidos');
        }

      } catch (error: any) {
        console.error('❌ ERRO COMPLETO:', error);
        console.error('Stack trace:', error.stack);
        setStatus('error');
        setMessage(`Erro: ${error.message || 'Erro desconhecido'}`);
        
        // Log detalhado do erro
        console.log('URL da página:', window.location.href);
        console.log('Parâmetros URL:', window.location.search);
        
        toast({
          title: 'Erro na Conexão',
          description: error.message || 'Erro ao conectar com Google Fit',
          variant: 'destructive',
        });
      }
    };

    // Adicionar delay para garantir que a página carregou
    setTimeout(handleCallback, 500);
  }, [toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
            {status === 'success' && <CheckCircle className="h-12 w-12 text-green-500" />}
            {status === 'error' && <AlertCircle className="h-12 w-12 text-red-500" />}
          </div>
          <CardTitle>
            {status === 'loading' && 'Conectando Google Fit...'}
            {status === 'success' && 'Conectado com Sucesso!'}
            {status === 'error' && 'Erro na Conexão'}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <p className="text-sm text-muted-foreground">
              Aguarde enquanto processamos sua autorização...
            </p>
          )}
          
          {status === 'success' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Seus dados do Google Fit foram conectados com sucesso. 
                Você será redirecionado automaticamente.
              </p>
              <Button 
                onClick={() => window.location.href = '/app/progress'}
                className="w-full"
              >
                <Activity className="h-4 w-4 mr-2" />
                Ir para Meu Progresso
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Ocorreu um erro ao conectar com o Google Fit. 
                Você pode tentar novamente.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => window.location.href = '/app/progress'}
                  className="w-full"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Ir para Meu Progresso
                </Button>
                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                  variant="outline"
                  className="w-full"
                >
                  Voltar ao Dashboard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};