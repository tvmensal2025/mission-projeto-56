import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';

export default function TestDataGenerator() {
  console.log('TestDataGenerator rendering...'); // Debug log
  
  const { toast } = useToast();

  const checkData = async () => {
    console.log('Checking data...'); // Debug log
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user found'); // Debug log
        toast({
          title: "Erro",
          description: "Usuário não encontrado. Por favor, faça login novamente.",
          variant: "destructive"
        });
        return;
      }

      console.log('User found:', user.id); // Debug log

      // Verificar dados físicos
      const { data: physicalData, error: physicalError } = await supabase
        .from('user_physical_data')
        .select('*')
        .eq('user_id', user.id);

      if (physicalError) {
        console.error('Erro ao buscar dados físicos:', physicalError);
      } else {
        console.log('Dados físicos encontrados:', physicalData);
        toast({
          title: "Dados Físicos",
          description: `Encontrados ${physicalData?.length || 0} registros de dados físicos.`,
        });
      }

      // Verificar pesagens
      const { data: measurements, error: measurementsError } = await supabase
        .from('weight_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('measurement_date', { ascending: false });

      if (measurementsError) {
        console.error('Erro ao buscar pesagens:', measurementsError);
      } else {
        console.log('Pesagens encontradas:', measurements);
        toast({
          title: "Pesagens",
          description: `Encontradas ${measurements?.length || 0} pesagens.`,
        });
      }

      // Verificar metas
      const { data: goals, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id);

      if (goalsError) {
        console.error('Erro ao buscar metas:', goalsError);
      } else {
        console.log('Metas encontradas:', goals);
        toast({
          title: "Metas",
          description: `Encontradas ${goals?.length || 0} metas.`,
        });
      }

    } catch (error) {
      console.error('Erro ao verificar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar dados. Verifique o console para mais detalhes.",
        variant: "destructive"
      });
    }
  };

  const generateTestData = async () => {
    console.log('Generating test data...'); // Debug log
    try {
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user found for data generation'); // Debug log
        toast({
          title: "Erro",
          description: "Usuário não encontrado. Por favor, faça login novamente.",
          variant: "destructive"
        });
        return;
      }

      console.log('Generating data for user:', user.id); // Debug log

      // Gerar dados físicos do usuário
      const { data: physicalData, error: physicalError } = await supabase
        .from('user_physical_data')
        .insert({
          user_id: user.id,
          altura_cm: 175,
          idade: 30,
          sexo: 'masculino',
          nivel_atividade: 'moderado'
        })
        .select();

      if (physicalError) {
        console.error('Erro ao inserir dados físicos:', physicalError);
        toast({
          title: "Erro",
          description: "Erro ao gerar dados físicos.",
          variant: "destructive"
        });
      } else {
        console.log('Dados físicos gerados:', physicalData);
        toast({
          title: "Sucesso",
          description: "Dados físicos gerados com sucesso!",
        });
      }

      // Gerar metas
      const { data: goalData, error: goalError } = await supabase
        .from('user_goals')
        .insert({
          user_id: user.id,
          title: 'Meta de Peso',
          description: 'Atingir peso ideal',
          category: 'saude',
          target_value: 70,
          unit: 'kg',
          difficulty: 'medio',
          target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'aprovada'
        })
        .select();

      if (goalError) {
        console.error('Erro ao inserir meta:', goalError);
        toast({
          title: "Erro",
          description: "Erro ao gerar meta.",
          variant: "destructive"
        });
      } else {
        console.log('Meta gerada:', goalData);
        toast({
          title: "Sucesso",
          description: "Meta gerada com sucesso!",
        });
      }

      // Gerar medições de peso (últimos 30 dias)
      const measurements = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Simular perda gradual de peso
        const weight = 75 - (i * 0.1) + (Math.random() * 0.2 - 0.1);
        const bodyFat = 20 - (i * 0.05) + (Math.random() * 0.1 - 0.05);
        const muscleMass = 35 + (i * 0.02) + (Math.random() * 0.1 - 0.05);
        
        measurements.push({
          user_id: user.id,
          measurement_date: date.toISOString().split('T')[0],
          peso_kg: weight,
          gordura_corporal_percent: bodyFat,
          massa_muscular_kg: muscleMass,
          imc: weight / Math.pow(1.75, 2),
          idade_metabolica: 30 - (i * 0.1),
          agua_corporal_percent: 60 + (Math.random() * 5 - 2.5),
          osso_kg: 3.5 + (Math.random() * 0.5 - 0.25),
          gordura_visceral: 8 + (Math.random() * 2 - 1),
          metabolismo_basal_kcal: 1800 + (Math.random() * 200 - 100)
        });
      }

      const { data: measurementData, error: measurementError } = await supabase
        .from('weight_measurements')
        .insert(measurements)
        .select();

      if (measurementError) {
        console.error('Erro ao inserir medições:', measurementError);
        toast({
          title: "Erro",
          description: "Erro ao gerar medições.",
          variant: "destructive"
        });
      } else {
        console.log('Medições geradas:', measurementData);
        toast({
          title: "Sucesso",
          description: "30 dias de medições gerados com sucesso!",
        });
      }

      // Recarregar a página para mostrar os dados
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Erro ao gerar dados de teste:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar dados de teste. Verifique o console para mais detalhes.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6">
      <Card className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Nenhum dado encontrado</h2>
        <p className="text-muted-foreground mb-6">
          Para testar o sistema, você pode gerar alguns dados de exemplo
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={checkData}
            className="flex items-center gap-2"
          >
            Verificar Dados
          </Button>
          
          <Button 
            onClick={generateTestData}
            className="flex items-center gap-2"
          >
            Gerar Dados de Teste
          </Button>
        </div>
        
        <div className="mt-6 text-sm text-muted-foreground">
          <p>Isso irá gerar:</p>
          <ul className="list-disc list-inside mt-2">
            <li>Dados físicos do usuário</li>
            <li>Meta de peso (70kg)</li>
            <li>30 dias de medições com progresso simulado</li>
          </ul>
        </div>
      </Card>
    </div>
  );
} 