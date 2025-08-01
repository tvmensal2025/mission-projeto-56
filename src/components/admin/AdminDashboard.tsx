import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Activity, 
  TrendingDown,
  Calendar,
  Award,
  Scale,
  Brain
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas do banco de dados
      const { data: users } = await supabase
        .from('profiles')
        .select('*');

      const { data: weighings } = await supabase
        .from('user_goals')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { data: missions } = await supabase
        .from('daily_mission_sessions')
        .select('*');

      const { data: sessions } = await supabase
        .from('sessions')
        .select('*');

      // Usar sessions como alternativa aos sabotadores (até criar a tabela)
      const saboteurs = sessions || [];

      // Calcular estatísticas
      const totalUsers = users?.length || 0;
      const activeUsers = users?.filter(u => u.created_at)?.length || 0; // Usar created_at como indicador de atividade
      const totalWeightLoss = weighings?.reduce((sum, w) => sum + (w.current_value || 0), 0) || 0;
      const completedMissions = missions?.filter(m => m.is_completed)?.length || 0;
      const averageEngagement = totalUsers > 0 ? Math.round(completedMissions / totalUsers) : 0;
      const weeklyWeighings = weighings?.length || 0;
      const totalSessions = sessions?.length || 0;
      const activeSaboteurs = saboteurs?.length || 0;

      setStats({
        totalUsers,
        activeUsers,
        totalWeightLoss,
        completedMissions,
        averageEngagement,
        weeklyWeighings,
        totalSessions,
        activeSaboteurs
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard Administrativo</h2>
        <p className="text-muted-foreground">
          Visão geral completa do sistema
        </p>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} usuários ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perda de Peso Total</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWeightLoss.toFixed(1)}kg</div>
            <p className="text-xs text-muted-foreground">
              Total acumulado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento Médio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
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
    </div>
  );
};

export default AdminDashboard;
