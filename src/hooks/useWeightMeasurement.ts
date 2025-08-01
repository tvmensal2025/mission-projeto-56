import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WeightMeasurement {
  id: string;
  peso_kg: number;
  gordura_corporal_percent?: number;
  gordura_visceral?: number;
        massa_muscular_kg?: number;
        agua_corporal_percent?: number;
        osso_kg?: number;
  metabolismo_basal_kcal?: number;
  idade_metabolica?: number;
  risco_metabolico?: string;
  imc?: number;
  circunferencia_abdominal_cm?: number;
  circunferencia_braco_cm?: number;
  circunferencia_perna_cm?: number;
  device_type: string;
  notes?: string;
  measurement_date: string;
  created_at: string;
}

export interface UserPhysicalData {
  id: string;
  user_id: string;
  altura_cm: number;
  idade: number;
  sexo: string;
  nivel_atividade: string;
  created_at: string;
  updated_at: string;
}

export interface WeeklyAnalysis {
  id: string;
  user_id: string;
  semana_inicio: string;
  semana_fim: string;
  peso_inicial?: number;
  peso_final?: number;
  variacao_peso?: number;
  tendencia?: string;
  created_at: string;
}

export const useWeightMeasurement = () => {
  const [measurements, setMeasurements] = useState<WeightMeasurement[]>([]);
  const [physicalData, setPhysicalData] = useState<UserPhysicalData | null>(null);
  const [weeklyAnalyses, setWeeklyAnalyses] = useState<WeeklyAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataFreshness, setDataFreshness] = useState<Date>(new Date());
  const { toast } = useToast();

  // Buscar dados físicos do usuário com cache
  const fetchPhysicalData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado');
        return;
      }

      console.log('Buscando dados físicos para usuário:', user.id);
      
      const { data, error } = await supabase
        .from('user_physical_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Usuário não possui dados físicos cadastrados');
          setPhysicalData(null);
          return;
        }
        throw error;
      }
      
      console.log('Dados físicos encontrados:', data);
      setPhysicalData(data);
    } catch (err: any) {
      console.error('Erro ao buscar dados físicos:', err);
      setError(err.message);
    }
  }, []);

  // Salvar dados físicos do usuário
  const savePhysicalData = async (data: Omit<UserPhysicalData, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('Salvando dados físicos:', { user_id: user.id, ...data });

      const { data: result, error } = await supabase
        .from('user_physical_data')
        .upsert({
          user_id: user.id,
          ...data
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar dados físicos:', error);
        throw error;
      }
      
      console.log('Dados físicos salvos com sucesso:', result);
      setPhysicalData(result);
      toast({
        title: "Dados salvos!",
        description: "Seus dados físicos foram salvos com sucesso.",
      });
      return result;
    } catch (err: any) {
      console.error('Erro ao salvar dados físicos:', err);
      setError(err.message);
      toast({
        title: "Erro",
        description: "Erro ao salvar dados físicos: " + err.message,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Salvar medição de peso
  const saveMeasurement = async (measurement: Omit<WeightMeasurement, 'id' | 'measurement_date' | 'created_at'>) => {
    try {
      // Prevenir salvamento duplo
      if (loading) {
        console.log('Salvamento já em andamento, ignorando...');
        throw new Error('Salvamento já em andamento');
      }
      
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('Iniciando salvamento de medição:', { user_id: user.id, ...measurement });

      // Verificar se dados físicos existem
      if (!physicalData) {
        console.log('Dados físicos não encontrados, buscando...');
        await fetchPhysicalData();
        
        if (!physicalData) {
          throw new Error('Você precisa cadastrar seus dados físicos primeiro (altura, idade, sexo)');
        }
      }

      // Validar dados obrigatórios
      if (!measurement.peso_kg || measurement.peso_kg <= 0) {
        throw new Error('Peso é obrigatório e deve ser maior que zero');
      }

      const measurementData = {
        user_id: user.id,
        ...measurement,
        measurement_date: new Date().toISOString()
      };

      console.log('Dados da medição para salvar:', measurementData);

      const { data, error } = await supabase
        .from('weight_measurements')
        .insert(measurementData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar medição:', error);
        throw error;
      }
      
      console.log('Medição salva com sucesso:', data);
      
      // ATUALIZAÇÃO OTIMIZADA: Adicionar nova medição sem re-fetch completo
      setMeasurements(prev => {
        const newMeasurements = [data, ...prev];
        // Manter apenas as últimas 30 medições para performance
        return newMeasurements.slice(0, 30);
      });
      
      // Marcar dados como atualizados
      setDataFreshness(new Date());
      
      // Buscar análises semanais de forma não-bloqueante
      fetchWeeklyAnalysis().catch(console.error);
      
      const riskMessages = {
        'baixo_peso': 'Seu IMC indica baixo peso. Considere consultar um profissional.',
        'normal': 'Parabéns! Seu IMC está dentro do ideal.',
        'sobrepeso': 'Seu IMC indica sobrepeso. Continue se cuidando!',
        'obesidade_grau1': 'Seu IMC indica obesidade grau I. Busque orientação profissional.',
        'obesidade_grau2': 'Seu IMC indica obesidade grau II. Recomendamos acompanhamento médico.',
        'obesidade_grau3': 'Seu IMC indica obesidade grau III. Procure acompanhamento médico urgente.'
      };

      toast({
        title: "Pesagem salva!",
        description: `Peso: ${data.peso_kg}kg | IMC: ${data.imc?.toFixed(1)} | ${riskMessages[data.risco_metabolico as keyof typeof riskMessages] || 'Pesagem registrada com sucesso'}`,
        duration: 5000, // 5 segundos
      });

      return data;
    } catch (err: any) {
      console.error('Erro ao salvar medição:', err);
      setError(err.message);
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Buscar histórico de pesagens com cache inteligente
  const fetchMeasurements = useCallback(async (limit = 30, forceRefresh = false) => {
    try {
      // Se dados são recentes e não é refresh forçado, não buscar novamente
      if (!forceRefresh && measurements.length > 0) {
        const lastFetch = dataFreshness.getTime();
        const now = new Date().getTime();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (now - lastFetch < fiveMinutes) {
          console.log('Dados ainda são frescos, não buscando novamente');
          return; // Dados ainda são frescos
        }
      }

      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado para buscar medições');
        return;
      }

      console.log('Buscando medições para usuário:', user.id);

      const { data, error } = await supabase
        .from('weight_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('measurement_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar medições:', error);
        throw error;
      }
      
      console.log('Medições encontradas:', data?.length || 0);
      setMeasurements(data || []);
      setDataFreshness(new Date());
    } catch (err: any) {
      console.error('Erro ao buscar medições:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar análise semanal
  const fetchWeeklyAnalysis = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('weekly_analyses')
        .select('id, user_id, semana_inicio, semana_fim, peso_inicial, peso_final, variacao_peso, tendencia, created_at')
        .eq('user_id', user.id)
        .order('semana_inicio', { ascending: false })
        .limit(8);

      if (error) throw error;
      setWeeklyAnalyses(data || []);
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  }, []);

  // Calcular estatísticas com memoização
  const stats = useMemo(() => {
    if (measurements.length === 0) return null;

    const latest = measurements[0];
    const previous = measurements[1];
    
    return {
      currentWeight: latest.peso_kg,
      currentIMC: latest.imc,
      weightChange: previous ? latest.peso_kg - previous.peso_kg : 0,
      trend: previous 
        ? latest.peso_kg > previous.peso_kg 
          ? 'increasing' 
          : latest.peso_kg < previous.peso_kg 
            ? 'decreasing' 
            : 'stable'
        : 'stable',
      riskLevel: latest.risco_metabolico,
      totalMeasurements: measurements.length,
      averageWeight: measurements.reduce((sum, m) => sum + m.peso_kg, 0) / measurements.length
    };
  }, [measurements]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchPhysicalData();
    fetchMeasurements();
    fetchWeeklyAnalysis();
  }, []);

  return {
    measurements,
    physicalData,
    weeklyAnalyses,
    loading,
    error,
    stats,
    saveMeasurement,
    savePhysicalData,
    fetchMeasurements,
    fetchPhysicalData,
    fetchWeeklyAnalysis
  };
};