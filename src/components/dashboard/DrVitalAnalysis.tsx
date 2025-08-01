import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Stethoscope, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Activity,
  Heart,
  Brain
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface PreventiveAnalysis {
  id: string;
  analysis_type: string;
  user_id: string;
  risk_level?: string;
  analysis_data?: any;
  recommendations?: string[];
  created_at: string;
  updated_at?: string;
  // Campos adicionais extraídos de analysis_data
  dr_vital_analysis?: string;
  risk_score?: number;
  health_risks?: string[];
  positive_points?: string[];
  urgent_warnings?: string[];
  metrics?: any;
}

const DrVitalAnalysis: React.FC = () => {
  const [analysis, setAnalysis] = useState<PreventiveAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadLatestAnalysis();
  }, []);

  const loadLatestAnalysis = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // const { data, error } = await supabase
      //   .from('preventive_health_analyses')
      //   .select('*')
      //   .eq('user_id', user.id)
      //   .order('created_at', { ascending: false })
      //   .limit(1)
      //   .maybeSingle();
      const data = null;
      const error = null;

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar análise:', error);
        return;
      }

      setAnalysis({
        ...data,
        analysis_type: 'preventive'
      } as PreventiveAnalysis);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewAnalysis = async (type: 'quinzenal' | 'mensal') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('preventive-health-analysis', {
        body: {
          userId: user.id,
          analysisType: type
        }
      });

      if (error) {
        console.error('Erro ao gerar análise:', error);
        return;
      }

      // Recarregar análise após geração
      setTimeout(() => {
        loadLatestAnalysis();
      }, 2000);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'BAIXO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MODERADO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ALTO':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CRÍTICO':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (level?: string) => {
    switch (level) {
      case 'BAIXO':
        return Shield;
      case 'MODERADO':
        return Activity;
      case 'ALTO':
        return AlertTriangle;
      case 'CRÍTICO':
        return Heart;
      default:
        return Shield;
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center overflow-hidden">
              <img 
                src="https://imagensids.s3.us-east-1.amazonaws.com/Dr.Vital%20sem%20fundo.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZAQZCSRHV5K7MS7O%2F20250729%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250729T200051Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEIT%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIBFpp9P9nyy0xlESYSxV4Z%2FymQHW%2BhIUJ9HXlJI1D72vAiEA5ccWYy4XzckCwpWwIAFof7Pa3%2FTm6nI%2BQSRifUzZg0wq3wIIrf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2MTk2MDE2MzAyODciDKsyck27ENGIU8gzwCqzAu9Cdy0FdXVIJElVCyEGZ9d%2FQqo06MGKRp0n0xJoBq62X7QTy5A6nTLmGOmuEuTiQnungEvV4%2F0vOtBYeKvhyGa4CDoqAOJvBaOISJwC8oli79Cd4WFWed%2B27rNMER4qucvKXi9IRgwdWUAFUcSgtWxH3nQ74j%2FS3YSiWmdChjGjrvP1dblsS0M%2B2jP5iZBZhF1p2RMmy9HvZkzHL6mOh8rHlXZoUWvOK4upxXN7B7wS3QA%2F6IzQq45U4I9P0lqpDrvixU5Z9Qglss87fFJRRFrCu1vdlyOokZnK4oy3n%2Foi9WjUzxhoogiZ88xomS%2Fjo6PEObH8MOVQDoj97hnuXOaiiSwVYKrYGrWp0vL6Gj%2BfdjUwta6t20SJ%2BgpMWJKF7q2aynIVZOaOHab47xjw5y1dQxEw%2FMykxAY6rQIqV5W7Xc%2F8Hs5m7Yi3ZNSgwr35KbSAw1olbthR3EnJwYxZZLWcoHI50g3Mc9uTKx%2Fy5ESiTC2VYiw9ChUslgbq8zFfEsjpbcodYfpy1JZBlG82naacDCnndd1BbAwmJwarddvgBHi9ABHnR2ZsSuiTsEgmwRvThvDsZeNgEuE%2FmLxBhSTWfHzcTy%2FUoU6Q5sOMDnvxAKv7c5crHxtLlSJ68WdN1k2kWXjCCEao1Vnij8FLExbKVFcdMQEsfNYCR4At4nh1APeKVh%2Bfa%2Bjsly1%2F7JbTGJB%2BqILAlmLPCUwxk0AqSoX14u%2FGJlCZ4Yu68EXdi8zrYqTBzmO%2F%2FH9oR4gab3LQjuTHrQaCGhgkU6gQlS%2FtAyjE8HgA%2Ba5JYJj4Y%2F4hmX7NhWiru0Ym%2B2sT&X-Amz-Signature=e65aa3995d2c7cdb4a8153e9e52d029fcf60421c3ef8e24f22911a6e93f1e99f&X-Amz-SignedHeaders=host&response-content-disposition=inline"
                alt="Dr. Vital"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <CardTitle className="text-lg">Dr. Vital - Análise Preventiva</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="w-full border-dashed">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center overflow-hidden">
              <img 
                src="https://imagensids.s3.us-east-1.amazonaws.com/Dr.Vital%20sem%20fundo.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZAQZCSRHV5K7MS7O%2F20250729%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250729T200051Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEIT%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIBFpp9P9nyy0xlESYSxV4Z%2FymQHW%2BhIUJ9HXlJI1D72vAiEA5ccWYy4XzckCwpWwIAFof7Pa3%2FTm6nI%2BQSRifUzZg0wq3wIIrf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2MTk2MDE2MzAyODciDKsyck27ENGIU8gzwCqzAu9Cdy0FdXVIJElVCyEGZ9d%2FQqo06MGKRp0n0xJoBq62X7QTy5A6nTLmGOmuEuTiQnungEvV4%2F0vOtBYeKvhyGa4CDoqAOJvBaOISJwC8oli79Cd4WFWed%2B27rNMER4qucvKXi9IRgwdWUAFUcSgtWxH3nQ74j%2FS3YSiWmdChjGjrvP1dblsS0M%2B2jP5iZBZhF1p2RMmy9HvZkzHL6mOh8rHlXZoUWvOK4upxXN7B7wS3QA%2F6IzQq45U4I9P0lqpDrvixU5Z9Qglss87fFJRRFrCu1vdlyOokZnK4oy3n%2Foi9WjUzxhoogiZ88xomS%2Fjo6PEObH8MOVQDoj97hnuXOaiiSwVYKrYGrWp0vL6Gj%2BfdjUwta6t20SJ%2BgpMWJKF7q2aynIVZOaOHab47xjw5y1dQxEw%2FMykxAY6rQIqV5W7Xc%2F8Hs5m7Yi3ZNSgwr35KbSAw1olbthR3EnJwYxZZLWcoHI50g3Mc9uTKx%2Fy5ESiTC2VYiw9ChUslgbq8zFfEsjpbcodYfpy1JZBlG82naacDCnndd1BbAwmJwarddvgBHi9ABHnR2ZsSuiTsEgmwRvThvDsZeNgEuE%2FmLxBhSTWfHzcTy%2FUoU6Q5sOMDnvxAKv7c5crHxtLlSJ68WdN1k2kWXjCCEao1Vnij8FLExbKVFcdMQEsfNYCR4At4nh1APeKVh%2Bfa%2Bjsly1%2F7JbTGJB%2BqILAlmLPCUwxk0AqSoX14u%2FGJlCZ4Yu68EXdi8zrYqTBzmO%2F%2FH9oR4gab3LQjuTHrQaCGhgkU6gQlS%2FtAyjE8HgA%2Ba5JYJj4Y%2F4hmX7NhWiru0Ym%2B2sT&X-Amz-Signature=e65aa3995d2c7cdb4a8153e9e52d029fcf60421c3ef8e24f22911a6e93f1e99f&X-Amz-SignedHeaders=host&response-content-disposition=inline"
                alt="Dr. Vital"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <CardTitle className="text-lg">Dr. Vital - Análise Preventiva</CardTitle>
          </div>
          <CardDescription>
            Nenhuma análise disponível ainda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            O Dr. Vital ainda não realizou uma análise preventiva dos seus dados de saúde.
            Gere sua primeira análise para receber insights personalizados.
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={() => generateNewAnalysis('quinzenal')}
              variant="outline"
              size="sm"
            >
              <Brain className="w-4 h-4 mr-2" />
              Análise Quinzenal
            </Button>
            <Button 
              onClick={() => generateNewAnalysis('mensal')}
              variant="outline"
              size="sm"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Análise Mensal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const RiskIcon = getRiskIcon(analysis.risk_level);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center overflow-hidden">
              <img 
                src="https://imagensids.s3.us-east-1.amazonaws.com/Dr.Vital%20sem%20fundo.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZAQZCSRHV5K7MS7O%2F20250729%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250729T200051Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEIT%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIBFpp9P9nyy0xlESYSxV4Z%2FymQHW%2BhIUJ9HXlJI1D72vAiEA5ccWYy4XzckCwpWwIAFof7Pa3%2FTm6nI%2BQSRifUzZg0wq3wIIrf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2MTk2MDE2MzAyODciDKsyck27ENGIU8gzwCqzAu9Cdy0FdXVIJElVCyEGZ9d%2FQqo06MGKRp0n0xJoBq62X7QTy5A6nTLmGOmuEuTiQnungEvV4%2F0vOtBYeKvhyGa4CDoqAOJvBaOISJwC8oli79Cd4WFWed%2B27rNMER4qucvKXi9IRgwdWUAFUcSgtWxH3nQ74j%2FS3YSiWmdChjGjrvP1dblsS0M%2B2jP5iZBZhF1p2RMmy9HvZkzHL6mOh8rHlXZoUWvOK4upxXN7B7wS3QA%2F6IzQq45U4I9P0lqpDrvixU5Z9Qglss87fFJRRFrCu1vdlyOokZnK4oy3n%2Foi9WjUzxhoogiZ88xomS%2Fjo6PEObH8MOVQDoj97hnuXOaiiSwVYKrYGrWp0vL6Gj%2BfdjUwta6t20SJ%2BgpMWJKF7q2aynIVZOaOHab47xjw5y1dQxEw%2FMykxAY6rQIqV5W7Xc%2F8Hs5m7Yi3ZNSgwr35KbSAw1olbthR3EnJwYxZZLWcoHI50g3Mc9uTKx%2Fy5ESiTC2VYiw9ChUslgbq8zFfEsjpbcodYfpy1JZBlG82naacDCnndd1BbAwmJwarddvgBHi9ABHnR2ZsSuiTsEgmwRvThvDsZeNgEuE%2FmLxBhSTWfHzcTy%2FUoU6Q5sOMDnvxAKv7c5crHxtLlSJ68WdN1k2kWXjCCEao1Vnij8FLExbKVFcdMQEsfNYCR4At4nh1APeKVh%2Bfa%2Bjsly1%2F7JbTGJB%2BqILAlmLPCUwxk0AqSoX14u%2FGJlCZ4Yu68EXdi8zrYqTBzmO%2F%2FH9oR4gab3LQjuTHrQaCGhgkU6gQlS%2FtAyjE8HgA%2Ba5JYJj4Y%2F4hmX7NhWiru0Ym%2B2sT&X-Amz-Signature=e65aa3995d2c7cdb4a8153e9e52d029fcf60421c3ef8e24f22911a6e93f1e99f&X-Amz-SignedHeaders=host&response-content-disposition=inline"
                alt="Dr. Vital"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <CardTitle className="text-lg">Dr. Vital - Análise Preventiva</CardTitle>
              <CardDescription className="flex items-center space-x-2 mt-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {analysis.created_at ? (
                    format(new Date(analysis.created_at), 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })
                  ) : (
                    'Data não disponível'
                  )}
                  {' '}({analysis.analysis_type})
                </span>
              </CardDescription>
            </div>
          </div>
          {analysis.risk_level && (
            <Badge className={getRiskColor(analysis.risk_level)}>
              <RiskIcon className="w-4 h-4 mr-1" />
              Risco {analysis.risk_level}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Score de Risco */}
        {analysis.risk_score && (
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-blue-900">Score de Risco</p>
              <p className="text-2xl font-bold text-blue-600">{analysis.risk_score}/100</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        )}

        {/* Análise do Dr. Vital */}
        {analysis.dr_vital_analysis && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-blue-600" />
              <h4 className="font-semibold">Análise do Dr. Vital</h4>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
              <p className="text-blue-900 italic leading-relaxed">
                "{analysis.dr_vital_analysis}"
              </p>
            </div>
          </div>
        )}

        {/* Pontos Positivos */}
        {analysis.positive_points && analysis.positive_points.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-green-700 flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Pontos Positivos</span>
            </h4>
            <div className="space-y-1">
              {analysis.positive_points.map((point, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700">{point}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Avisos Urgentes */}
        {analysis.urgent_warnings && analysis.urgent_warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-orange-700 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Recomendações Importantes</span>
            </h4>
            <div className="space-y-1">
              {analysis.urgent_warnings.map((warning, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-orange-700">{warning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detalhes Expandíveis */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              Ver detalhes completos
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Métricas */}
            {analysis.metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Adesão</p>
                  <p className="text-lg font-bold text-primary">{analysis.metrics.compliance_score || 0}%</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Exercício</p>
                  <p className="text-lg font-bold text-primary">{analysis.metrics.exercise_frequency || 0}x</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Sono</p>
                  <p className="text-lg font-bold text-primary">{analysis.metrics.sleep_quality || 0}/10</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Nutrição</p>
                  <p className="text-lg font-bold text-primary">{analysis.metrics.nutrition_score || 0}%</p>
                </div>
              </div>
            )}

            {/* Riscos Identificados */}
            {analysis.health_risks && analysis.health_risks.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-red-700 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Riscos Identificados</span>
                </h4>
                <div className="space-y-1">
                  {analysis.health_risks.map((risk, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-red-700">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Ação para Nova Análise */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => generateNewAnalysis('quinzenal')}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Brain className="w-4 h-4 mr-2" />
            Nova Análise
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DrVitalAnalysis;