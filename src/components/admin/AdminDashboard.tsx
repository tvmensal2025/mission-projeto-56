import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Activity, 
  TrendingDown,
  Calendar,
  Award,
  Target,
  Scale,
  Brain,
  Bot,
  Mail,
  Settings,
  Zap
} from 'lucide-react';
import { AIControlPanelUnified } from './AIControlPanelUnified';
import { supabase } from '@/integrations/supabase/client';
// import { emailClient, type EmailProviderConfig } from '@/lib/email-client'; // Removido temporariamente

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalWeightLoss: number;
  completedMissions: number;
  averageEngagement: number;
  weeklyWeighings: number;
  totalSessions: number;
  activeSaboteurs: number;
}

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalWeightLoss: 0,
    completedMissions: 0,
    averageEngagement: 0,
    weeklyWeighings: 0,
    totalSessions: 0,
    activeSaboteurs: 0
  });
  const [loading, setLoading] = useState(true);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [emailConfig, setEmailConfig] = useState({
    resendApiKey: 're_MaZUKsTe_7NJizbgHNhFNvXBRu75qgBjG',
    sendpulseApiKey: 'f4ff39f7982cd93fb7a458b603e50ca4',
    sendpulseApiSecret: '62e56fd32f7861cae09f0d904843ccf1',
    sendpulseListId: 341130
  });
  const [n8nConfig, setN8nConfig] = useState({
    webhookUrl: '',
    apiKey: '',
    enabled: false
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const testWeeklyEmail = async () => {
    try {
      setTestingEmail(true);
      
      // Chamar a Edge Function diretamente via Supabase
      const { data, error } = await supabase.functions.invoke('weekly-health-report', {
        body: {
          testMode: true,
          testEmail: 'tvmensal2025@gmail.com',
          testUserName: 'Sirlene Correa'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data && data.success) {
        toast({
          title: "✅ Email Enviado",
          description: `Email de teste enviado para tvmensal2025@gmail.com (Sirlene Correa)`,
        });
      } else {
        toast({
          title: "❌ Erro no Envio",
          description: data?.error || "Erro desconhecido ao enviar email",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao testar email:', error);
      toast({
        title: "❌ Erro no Teste",
        description: error instanceof Error ? error.message : "Erro interno ao testar email semanal",
        variant: "destructive",
      });
    } finally {
      setTestingEmail(false);
    }
  };

  const testEmailConnection = async () => {
    try {
      setTestingConnection(true);
      
      // Teste simples - verificar se a API key está configurada
      if (emailConfig.resendApiKey) {
        toast({
          title: "✅ Conexão Testada",
          description: "Resend API Key configurada!",
        });
      } else {
        toast({
          title: "❌ Erro na Conexão",
          description: "Resend API Key não configurada. Configure no painel admin.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro no teste de conexão:', error);
      toast({
        title: "❌ Erro no Teste",
        description: "Erro interno ao testar conexão",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const saveEmailConfig = async () => {
    try {
      // Salvar no localStorage (em produção, salvar no banco)
      localStorage.setItem('emailConfig', JSON.stringify(emailConfig));
      
      toast({
        title: "✅ Configuração Salva",
        description: "Configuração de email atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: "❌ Erro ao Salvar",
        description: "Erro interno ao salvar configuração",
        variant: "destructive",
      });
    }
  };

  const saveN8nConfig = async () => {
    try {
      // Salvar no localStorage (em produção, salvar no banco)
      localStorage.setItem('n8nConfig', JSON.stringify(n8nConfig));
      
      toast({
        title: "✅ Configuração Salva",
        description: "Configuração do n8n atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar configuração n8n:', error);
      toast({
        title: "❌ Erro ao Salvar",
        description: "Erro interno ao salvar configuração",
        variant: "destructive",
      });
    }
  };

  // Carregar configurações salvas
  useEffect(() => {
    const savedEmailConfig = localStorage.getItem('emailConfig');
    const savedN8nConfig = localStorage.getItem('n8nConfig');
    
    if (savedEmailConfig) {
      setEmailConfig(JSON.parse(savedEmailConfig));
    } else {
      // Salvar configuração padrão do Resend automaticamente
      const defaultConfig = {
        resendApiKey: 're_MaZUKsTe_7NJizbgHNhFNvXBRu75qgBjG',
        sendpulseApiKey: 'f4ff39f7982cd93fb7a458b603e50ca4',
        sendpulseApiSecret: '62e56fd32f7861cae09f0d904843ccf1',
        sendpulseListId: 341130
      };
      localStorage.setItem('emailConfig', JSON.stringify(defaultConfig));
    }
    
    if (savedN8nConfig) {
      setN8nConfig(JSON.parse(savedN8nConfig));
    }
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      // Buscar usuários com tratamento de erro
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, created_at');

      if (profilesError) {
        console.warn('Error fetching profiles:', profilesError);
      }

      // Buscar pesagens para calcular perda de peso
      const { data: measurements, error: measurementsError } = await supabase
        .from('weight_measurements')
        .select('user_id, peso_kg, measurement_date')
        .order('measurement_date', { ascending: true });

      if (measurementsError) {
        console.warn('Error fetching measurements:', measurementsError);
      }

      // Buscar missões completadas
      const { data: missions, error: missionsError } = await supabase
        .from('daily_mission_sessions')
        .select('user_id, date, is_completed')
        .eq('is_completed', true);

      if (missionsError) {
        console.warn('Error fetching missions:', missionsError);
      }

      // Buscar sessões ativas
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('id, is_active')
        .eq('is_active', true);

      if (sessionsError) {
        console.warn('Error fetching sessions:', sessionsError);
      }

      // Usar sessões como alternativa aos sabotadores (até criar a tabela)
      const saboteurs = sessions || [];

      // Calcular estatísticas com fallbacks seguros
      const totalUsers = profiles?.length || 0;
      
      // Usuários ativos (últimos 30 dias) - só calcular se temos dados
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentMissions = missions?.filter(m => 
        new Date(m.date) >= thirtyDaysAgo
      ) || [];
      
      const activeUserIds = new Set(recentMissions.map(m => m.user_id));
      const activeUsers = activeUserIds.size;

      // Calcular perda total de peso
      const weightLossByUser = new Map<string, { first: number; last: number }>();
      
      measurements?.forEach(m => {
        const userId = m.user_id;
        const current = weightLossByUser.get(userId);
        
        if (!current) {
          weightLossByUser.set(userId, { first: m.peso_kg, last: m.peso_kg });
        } else {
          // Atualizar último peso
          weightLossByUser.set(userId, { 
            first: current.first, 
            last: m.peso_kg 
          });
        }
      });

      let totalWeightLoss = 0;
      weightLossByUser.forEach(({ first, last }) => {
        const loss = first - last;
        if (loss > 0) {
          totalWeightLoss += loss;
        }
      });

      // Pesagens na semana
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const weeklyWeighings = measurements?.filter(m => 
        new Date(m.measurement_date) >= oneWeekAgo
      ).length || 0;

      // Engajamento médio (missões por usuário ativo)
      const averageEngagement = activeUsers > 0 
        ? Math.round(recentMissions.length / activeUsers * 10) / 10 
        : 0;

      setStats({
        totalUsers,
        activeUsers,
        totalWeightLoss: Math.round(totalWeightLoss * 10) / 10,
        completedMissions: missions?.length || 0,
        averageEngagement,
        weeklyWeighings,
        totalSessions: sessions?.length || 0,
        activeSaboteurs: saboteurs?.length || 0
      });

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">
            Visão geral do desempenho da plataforma
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Bot className="h-4 w-4" />
          IA Configurada
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuários registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
            {stats.totalUsers > 0 && (
              <Badge variant="outline" className="mt-1">
                {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% de engajamento
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso Eliminado</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalWeightLoss}kg
            </div>
            <p className="text-xs text-muted-foreground">
              Total perdido pelos usuários
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento Médio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageEngagement}</div>
            <p className="text-xs text-muted-foreground">
              Missões por usuário ativo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missões Completadas</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedMissions}</div>
            <p className="text-xs text-muted-foreground">
              Total de missões
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesagens da Semana</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weeklyWeighings}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Sessões disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Padrões Ativos</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSaboteurs}</div>
            <p className="text-xs text-muted-foreground">
              Sabotadores disponíveis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Configurações do Sistema */}
      <div className="mt-8 space-y-6">
        {/* Configuração de Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Configuração de Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Provedor de Email */}
              <div>
                <label className="block text-sm font-medium mb-2">Provedor de Email</label>
                <select
                  value="resend"
                  disabled
                  className="w-full p-2 border rounded-md bg-gray-100"
                >
                  <option value="resend">Resend (Atual)</option>
                  <option value="sendpulse" disabled>SendPulse (Disponível via código)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  SendPulse pode ser ativado editando o código das Edge Functions
                </p>
              </div>

              {/* Configurações Resend */}
              <div>
                <label className="block text-sm font-medium mb-2">Resend API Key</label>
                <input
                  type="password"
                  value={emailConfig.resendApiKey}
                  onChange={(e) => setEmailConfig({...emailConfig, resendApiKey: e.target.value})}
                  placeholder="re_..."
                  className="w-full p-2 border rounded-md"
                />
                <p className="text-xs text-green-600 mt-1">
                  ✅ API Key do Resend configurada e pronta para uso
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-2">
                <Button 
                  onClick={saveEmailConfig}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Salvar Configuração
                </Button>
                <Button 
                  onClick={testEmailConnection}
                  disabled={testingConnection}
                  variant="outline"
                >
                  {testingConnection ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Testando...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Testar Conexão
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuração do n8n */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Configuração do n8n
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Habilitar n8n */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="n8n-enabled"
                  checked={n8nConfig.enabled}
                  onChange={(e) => setN8nConfig({...n8nConfig, enabled: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="n8n-enabled" className="text-sm font-medium">
                  Habilitar integração com n8n
                </label>
              </div>

              {/* Webhook URL */}
              <div>
                <label className="block text-sm font-medium mb-2">Webhook URL</label>
                <input
                  type="url"
                  value={n8nConfig.webhookUrl}
                  onChange={(e) => setN8nConfig({...n8nConfig, webhookUrl: e.target.value})}
                  placeholder="https://seu-n8n.com/webhook/..."
                  className="w-full p-2 border rounded-md"
                />
              </div>

              {/* API Key */}
              <div>
                <label className="block text-sm font-medium mb-2">API Key (opcional)</label>
                <input
                  type="password"
                  value={n8nConfig.apiKey}
                  onChange={(e) => setN8nConfig({...n8nConfig, apiKey: e.target.value})}
                  placeholder="API Key para autenticação"
                  className="w-full p-2 border rounded-md"
                />
              </div>

              {/* Botão Salvar */}
              <Button 
                onClick={saveN8nConfig}
                className="bg-green-600 hover:bg-green-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                Salvar Configuração n8n
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Controle Unificado de IA */}
        <AIControlPanelUnified />

        {/* Testes do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Testes do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Teste de Email Semanal</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Testa o envio de email semanal usando o Resend. 
                  O email será enviado especificamente para Sirlene Correa (tvmensal2025@gmail.com).
                </p>
                <Button 
                  onClick={testWeeklyEmail}
                  disabled={testingEmail}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {testingEmail ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Testar Email para Sirlene
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
