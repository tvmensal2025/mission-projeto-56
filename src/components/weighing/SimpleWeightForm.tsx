import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale, Ruler, Calculator } from 'lucide-react';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SimpleWeightForm: React.FC = () => {
  const { physicalData } = useWeightMeasurement();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    peso_kg: '',
    circunferencia_abdominal_cm: ''
  });

  const [altura, setAltura] = useState(165); // Altura padrão
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Se há dados físicos, usar a altura cadastrada
    if (physicalData?.altura_cm) {
      setAltura(physicalData.altura_cm);
    }
  }, [physicalData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.peso_kg) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe seu peso.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('Iniciando salvamento de pesagem...');
      console.log('Usuário:', user.id);
      console.log('Dados físicos existentes:', physicalData);

      // Se não há dados físicos, criar dados temporários PRIMEIRO
      if (!physicalData) {
        console.log('Criando dados físicos...');
        const { data: newPhysicalData, error: physicalError } = await supabase
          .from('user_physical_data')
          .upsert({
            user_id: user.id,
            altura_cm: altura,
            idade: 30, // Idade padrão
            sexo: 'masculino', // Sexo padrão
            nivel_atividade: 'moderado'
          })
          .select()
          .single();

        if (physicalError) {
          console.error('Erro ao criar dados físicos:', physicalError);
          throw new Error(`Erro ao criar dados físicos: ${physicalError.message}`);
        }

        console.log('Dados físicos criados:', newPhysicalData);
      }

      // Calcular IMC manualmente para preview
      const heightInMeters = altura / 100;
      const bmi = parseFloat(formData.peso_kg) / (heightInMeters * heightInMeters);

      console.log('Salvando pesagem...');
      console.log('Peso:', formData.peso_kg);
      console.log('Altura:', altura);
      console.log('IMC calculado:', bmi);

      // Determinar risco metabólico baseado no IMC
      let risco_metabolico = 'normal';
      if (bmi < 18.5) risco_metabolico = 'baixo_peso';
      else if (bmi >= 25 && bmi < 30) risco_metabolico = 'sobrepeso';
      else if (bmi >= 30 && bmi < 35) risco_metabolico = 'obesidade_grau1';
      else if (bmi >= 35 && bmi < 40) risco_metabolico = 'obesidade_grau2';
      else if (bmi >= 40) risco_metabolico = 'obesidade_grau3';

      // Salvar pesagem diretamente com todos os campos calculados
      const { data, error } = await supabase
        .from('weight_measurements')
        .insert({
          user_id: user.id,
          peso_kg: parseFloat(formData.peso_kg),
          circunferencia_abdominal_cm: formData.circunferencia_abdominal_cm ? parseFloat(formData.circunferencia_abdominal_cm) : undefined,
          imc: bmi,
          risco_metabolico: risco_metabolico,
          device_type: 'manual',
          notes: 'Entrada manual',
          measurement_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar pesagem:', error);
        throw new Error(`Erro ao salvar pesagem: ${error.message}`);
      }

      console.log('Pesagem salva com sucesso:', data);
      
      // Limpar formulário
      setFormData({
        peso_kg: '',
        circunferencia_abdominal_cm: ''
      });

      toast({
        title: "Pesagem salva!",
        description: `Peso: ${data.peso_kg}kg | IMC: ${data.imc?.toFixed(1)} registrado com sucesso. A página será atualizada em 7 segundos.`,
      });

      // Recarregar a página para atualizar os dashboards
      setTimeout(() => {
        window.location.reload();
      }, 7000);

    } catch (err) {
      console.error('Erro completo:', err);
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro ao salvar pesagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = (weight: number) => {
    const heightInMeters = altura / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const getBMIClassification = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Abaixo do peso', color: 'text-blue-500' };
    if (bmi < 25) return { text: 'Peso normal', color: 'text-green-500' };
    if (bmi < 30) return { text: 'Sobrepeso', color: 'text-yellow-500' };
    return { text: 'Obesidade', color: 'text-red-500' };
  };

  const currentBMI = formData.peso_kg ? calculateBMI(parseFloat(formData.peso_kg)) : null;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Nova Pesagem Manual
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Altura */}
          <div className="space-y-2">
            <Label htmlFor="altura" className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Altura (cm)
            </Label>
            <Input
              id="altura"
              type="number"
              step="0.1"
              min="100"
              max="250"
              value={altura}
              onChange={(e) => setAltura(parseFloat(e.target.value) || 165)}
              placeholder="165"
              disabled={!!physicalData?.altura_cm}
            />
            {physicalData?.altura_cm ? (
              <p className="text-xs text-muted-foreground">
                Altura cadastrada: {physicalData.altura_cm}cm
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Altura padrão: 165cm (será salva automaticamente)
              </p>
            )}
          </div>

          {/* Peso obrigatório */}
          <div className="space-y-2">
            <Label htmlFor="peso" className="flex items-center gap-2 text-primary">
              <Scale className="h-4 w-4" />
              Peso (kg) *
            </Label>
            <Input
              id="peso"
              type="number"
              step="0.1"
              min="30"
              max="300"
              value={formData.peso_kg}
              onChange={(e) => setFormData({...formData, peso_kg: e.target.value})}
              placeholder="72.5"
              required
              className="text-lg"
            />
          </div>

          {/* Perímetro da cintura */}
          <div className="space-y-2">
            <Label htmlFor="cintura" className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Perímetro da Cintura (cm)
            </Label>
            <Input
              id="cintura"
              type="number"
              step="0.1"
              min="50"
              max="150"
              value={formData.circunferencia_abdominal_cm}
              onChange={(e) => setFormData({...formData, circunferencia_abdominal_cm: e.target.value})}
              placeholder="85.5"
            />
          </div>

          {/* Preview do IMC */}
          {currentBMI && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4" />
                <span className="font-medium">IMC Calculado</span>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{currentBMI.toFixed(1)}</p>
                <p className={`text-sm ${getBMIClassification(currentBMI).color}`}>
                  {getBMIClassification(currentBMI).text}
                </p>
              </div>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Salvando...' : 'Salvar Pesagem'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SimpleWeightForm; 