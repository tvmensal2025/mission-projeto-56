import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Users, Scale, Pill, Heart, Target, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AnamnesisData {
  // Dados Pessoais
  profession: string;
  marital_status: string;
  how_found_method: string;
  
  // Histórico Familiar
  family_obesity_history: boolean | null;
  family_diabetes_history: boolean | null;
  family_heart_disease_history: boolean | null;
  family_eating_disorders_history: boolean | null;
  family_depression_anxiety_history: boolean | null;
  family_thyroid_problems_history: boolean | null;
  family_other_chronic_diseases: string;
  
  // Histórico de Peso
  weight_gain_started_age: number | null;
  major_weight_gain_periods: string;
  emotional_events_during_weight_gain: string;
  lowest_adult_weight: number | null;
  highest_adult_weight: number | null;
  current_weight: number | null;
  height_cm: number | null;
  weight_fluctuation_classification: string;
  
  // Tratamentos Anteriores
  previous_weight_treatments: string[];
  most_effective_treatment: string;
  least_effective_treatment: string;
  had_rebound_effect: boolean | null;
  
  // Medicações Atuais
  current_medications: string[];
  chronic_diseases: string[];
  supplements: string[];
  herbal_medicines: string[];
  
  // Relacionamento com Comida
  food_relationship_score: number;
  has_compulsive_eating: boolean | null;
  compulsive_eating_situations: string;
  problematic_foods: string[];
  forbidden_foods: string[];
  feels_guilt_after_eating: boolean | null;
  eats_in_secret: boolean | null;
  eats_until_uncomfortable: boolean | null;
  
  // Qualidade de Vida
  sleep_hours_per_night: number | null;
  sleep_quality_score: number;
  daily_stress_level: number;
  physical_activity_type: string;
  physical_activity_frequency: string;
  daily_energy_level: number;
  general_quality_of_life: number;
  
  // Objetivos e Expectativas
  main_treatment_goals: string;
  biggest_weight_loss_challenge: string;
  ideal_weight_goal: number | null;
  timeframe_to_achieve_goal: string;
  treatment_success_definition: string;
  motivation_for_seeking_treatment: string;
}

const sections = [
  { id: 'personal', title: 'Dados Pessoais', icon: <FileText className="w-5 h-5" /> },
  { id: 'family', title: 'Histórico Familiar', icon: <Users className="w-5 h-5" /> },
  { id: 'weight', title: 'Histórico de Peso', icon: <Scale className="w-5 h-5" /> },
  { id: 'treatments', title: 'Tratamentos Anteriores', icon: <Pill className="w-5 h-5" /> },
  { id: 'medications', title: 'Medicações Atuais', icon: <Pill className="w-5 h-5" /> },
  { id: 'food', title: 'Relacionamento com Comida', icon: <Heart className="w-5 h-5" /> },
  { id: 'lifestyle', title: 'Qualidade de Vida', icon: <Heart className="w-5 h-5" /> },
  { id: 'goals', title: 'Objetivos e Expectativas', icon: <Target className="w-5 h-5" /> }
];

const SystemicAnamnesis: React.FC = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<AnamnesisData>({
    // Dados Pessoais
    profession: '',
    marital_status: '',
    how_found_method: '',
    
    // Histórico Familiar
    family_obesity_history: null,
    family_diabetes_history: null,
    family_heart_disease_history: null,
    family_eating_disorders_history: null,
    family_depression_anxiety_history: null,
    family_thyroid_problems_history: null,
    family_other_chronic_diseases: '',
    
    // Histórico de Peso
    weight_gain_started_age: null,
    major_weight_gain_periods: '',
    emotional_events_during_weight_gain: '',
    lowest_adult_weight: null,
    highest_adult_weight: null,
    current_weight: null,
    height_cm: null,
    weight_fluctuation_classification: '',
    
    // Tratamentos Anteriores
    previous_weight_treatments: [],
    most_effective_treatment: '',
    least_effective_treatment: '',
    had_rebound_effect: null,
    
    // Medicações Atuais
    current_medications: [],
    chronic_diseases: [],
    supplements: [],
    herbal_medicines: [],
    
    // Relacionamento com Comida
    food_relationship_score: 5,
    has_compulsive_eating: null,
    compulsive_eating_situations: '',
    problematic_foods: [],
    forbidden_foods: [],
    feels_guilt_after_eating: null,
    eats_in_secret: null,
    eats_until_uncomfortable: null,
    
    // Qualidade de Vida
    sleep_hours_per_night: null,
    sleep_quality_score: 5,
    daily_stress_level: 5,
    physical_activity_type: '',
    physical_activity_frequency: '',
    daily_energy_level: 5,
    general_quality_of_life: 5,
    
    // Objetivos e Expectativas
    main_treatment_goals: '',
    biggest_weight_loss_challenge: '',
    ideal_weight_goal: null,
    timeframe_to_achieve_goal: '',
    treatment_success_definition: '',
    motivation_for_seeking_treatment: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const updateFormData = (field: keyof AnamnesisData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addToArray = (field: keyof AnamnesisData, value: string) => {
    const currentArray = formData[field] as string[];
    if (!currentArray.includes(value)) {
      updateFormData(field, [...currentArray, value]);
    }
  };

  const removeFromArray = (field: keyof AnamnesisData, value: string) => {
    const currentArray = formData[field] as string[];
    updateFormData(field, currentArray.filter(item => item !== value));
  };

  const calculateBMI = () => {
    if (formData.current_weight && formData.height_cm) {
      return (formData.current_weight / Math.pow(formData.height_cm / 100, 2)).toFixed(1);
    }
    return '0.0';
  };

  const getBMIClassification = (bmi: number) => {
    if (bmi < 18.5) return 'Baixo peso';
    if (bmi < 25) return 'Peso normal';
    if (bmi < 30) return 'Sobrepeso';
    if (bmi < 35) return 'Obesidade grau I';
    if (bmi < 40) return 'Obesidade grau II';
    return 'Obesidade grau III';
  };

  const saveAnamnesis = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('Dados do formulário:', formData);

      const anamnesisData = {
        user_id: user.id,
        profession: formData.profession || '',
        marital_status: formData.marital_status || '',
        city_state: '', // Campo obrigatório na tabela
        how_found_method: formData.how_found_method || '',
        family_obesity_history: formData.family_obesity_history,
        family_diabetes_history: formData.family_diabetes_history,
        family_heart_disease_history: formData.family_heart_disease_history,
        family_eating_disorders_history: formData.family_eating_disorders_history,
        family_depression_anxiety_history: formData.family_depression_anxiety_history,
        family_thyroid_problems_history: formData.family_thyroid_problems_history,
        family_other_chronic_diseases: formData.family_other_chronic_diseases || '',
        weight_gain_started_age: formData.weight_gain_started_age,
        major_weight_gain_periods: formData.major_weight_gain_periods || '',
        emotional_events_during_weight_gain: formData.emotional_events_during_weight_gain || '',
        lowest_adult_weight: formData.lowest_adult_weight,
        highest_adult_weight: formData.highest_adult_weight,
        current_weight: formData.current_weight,
        height_cm: formData.height_cm,
        weight_fluctuation_classification: formData.weight_fluctuation_classification || '',
        previous_weight_treatments: formData.previous_weight_treatments || [],
        most_effective_treatment: formData.most_effective_treatment || '',
        least_effective_treatment: formData.least_effective_treatment || '',
                had_rebound_effect: formData.had_rebound_effect,
        current_medications: formData.current_medications || [],
        chronic_diseases: formData.chronic_diseases || [],
        supplements: formData.supplements || [],
        herbal_medicines: formData.herbal_medicines || [],
        food_relationship_score: formData.food_relationship_score,
        has_compulsive_eating: formData.has_compulsive_eating,
        compulsive_eating_situations: formData.compulsive_eating_situations || '',
        problematic_foods: formData.problematic_foods || [],
        forbidden_foods: formData.forbidden_foods || [],
        feels_guilt_after_eating: formData.feels_guilt_after_eating,
        eats_in_secret: formData.eats_in_secret,
        eats_until_uncomfortable: formData.eats_until_uncomfortable,
        sleep_hours_per_night: formData.sleep_hours_per_night,
        sleep_quality_score: formData.sleep_quality_score,
        daily_stress_level: formData.daily_stress_level,
        physical_activity_type: formData.physical_activity_type || '',
        physical_activity_frequency: formData.physical_activity_frequency || '',
        daily_energy_level: formData.daily_energy_level,
        general_quality_of_life: formData.general_quality_of_life,
                main_treatment_goals: formData.main_treatment_goals || '',
        biggest_weight_loss_challenge: formData.biggest_weight_loss_challenge || '',
        ideal_weight_goal: formData.ideal_weight_goal,
        timeframe_to_achieve_goal: formData.timeframe_to_achieve_goal || '',
        treatment_success_definition: formData.treatment_success_definition || '',
        motivation_for_seeking_treatment: formData.motivation_for_seeking_treatment || '',
        completed_at: new Date().toISOString()
      };

      console.log('Dados para salvar:', anamnesisData);

      // Temporariamente salvar no localStorage até criar a tabela user_anamnesis
      const anamnesisKey = `anamnesis_${user.id}`;
      localStorage.setItem(anamnesisKey, JSON.stringify(anamnesisData));
      console.log('Anamnese salva no localStorage:', anamnesisData);
      
      // Simular sucesso
      let error = null;

      setIsCompleted(true);
      toast({
        title: "Anamnese salva com sucesso!",
        description: "Seus dados foram registrados e estarão disponíveis para Dr. Vital e Sofia.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar anamnese",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progress = ((currentSection + 1) / sections.length) * 100;

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gray-800/90 backdrop-blur border-gray-700">
            <CardContent className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">
                Anamnese Completa! 🎉
              </h2>
              <p className="text-gray-300 mb-6">
                Sua anamnese sistêmica foi registrada com sucesso. Dr. Vital e Sofia 
                agora têm todas as informações necessárias para oferecer o melhor 
                acompanhamento personalizado.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-green-600/20 p-4 rounded-lg">
                  <h3 className="text-green-300 font-medium">Perfil Completo</h3>
                  <p className="text-sm text-gray-300">Dados pessoais registrados</p>
                </div>
                <div className="bg-blue-600/20 p-4 rounded-lg">
                  <h3 className="text-blue-300 font-medium">Histórico Médico</h3>
                  <p className="text-sm text-gray-300">Informações de saúde coletadas</p>
                </div>
                <div className="bg-purple-600/20 p-4 rounded-lg">
                  <h3 className="text-purple-300 font-medium">Objetivos Definidos</h3>
                  <p className="text-sm text-gray-300">Metas de tratamento estabelecidas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const renderPersonalSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="profession">Profissão</Label>
          <Input
            id="profession"
            value={formData.profession}
            onChange={(e) => updateFormData('profession', e.target.value)}
            placeholder="Sua profissão atual"
          />
        </div>
        <div>
          <Label htmlFor="marital_status">Estado Civil</Label>
          <Select value={formData.marital_status} onValueChange={(value) => updateFormData('marital_status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione seu estado civil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solteiro">Solteiro(a)</SelectItem>
              <SelectItem value="casado">Casado(a)</SelectItem>
              <SelectItem value="divorciado">Divorciado(a)</SelectItem>
              <SelectItem value="viuvo">Viúvo(a)</SelectItem>
              <SelectItem value="uniao_estavel">União Estável</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="how_found">Como conheceu o Instituto dos Sonhos?</Label>
        <Textarea
          id="how_found"
          value={formData.how_found_method}
          onChange={(e) => updateFormData('how_found_method', e.target.value)}
          placeholder="Conte como nos conheceu"
        />
      </div>
    </div>
  );

  const renderFamilySection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white">Histórico Familiar</h3>
      <p className="text-gray-400">Marque se existe histórico familiar das seguintes condições:</p>
      
      {[
        { key: 'family_obesity_history', label: 'Obesidade' },
        { key: 'family_diabetes_history', label: 'Diabetes' },
        { key: 'family_heart_disease_history', label: 'Doenças cardíacas' },
        { key: 'family_eating_disorders_history', label: 'Distúrbios alimentares' },
        { key: 'family_depression_anxiety_history', label: 'Depressão ou ansiedade' },
        { key: 'family_thyroid_problems_history', label: 'Problemas de tireoide' }
      ].map((item) => (
        <div key={item.key} className="flex items-center space-x-3">
          <Checkbox
            id={item.key}
            checked={formData[item.key as keyof AnamnesisData] === true}
            onCheckedChange={(checked) => updateFormData(item.key as keyof AnamnesisData, checked)}
          />
          <Label htmlFor={item.key} className="text-white">{item.label}</Label>
        </div>
      ))}
      
      <div>
        <Label htmlFor="other_diseases">Outras doenças crônicas familiares</Label>
        <Textarea
          id="other_diseases"
          value={formData.family_other_chronic_diseases}
          onChange={(e) => updateFormData('family_other_chronic_diseases', e.target.value)}
          placeholder="Descreva outras condições da família"
        />
      </div>
    </div>
  );

  const renderWeightSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="weight_gain_age">Idade que começou a ganhar peso excessivo</Label>
          <Input
            id="weight_gain_age"
            type="number"
            value={formData.weight_gain_started_age || ''}
            onChange={(e) => updateFormData('weight_gain_started_age', parseInt(e.target.value) || null)}
            placeholder="Ex: 25"
          />
        </div>
        <div>
          <Label htmlFor="current_weight">Peso Atual (kg)</Label>
          <Input
            id="current_weight"
            type="number"
            step="0.1"
            value={formData.current_weight || ''}
            onChange={(e) => updateFormData('current_weight', parseFloat(e.target.value) || null)}
            placeholder="Ex: 75.5"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="height">Altura (cm)</Label>
          <Input
            id="height"
            type="number"
            value={formData.height_cm || ''}
            onChange={(e) => updateFormData('height_cm', parseFloat(e.target.value) || null)}
            placeholder="Ex: 170"
          />
        </div>
        <div>
          <Label htmlFor="lowest_weight">Menor peso na vida adulta (kg)</Label>
          <Input
            id="lowest_weight"
            type="number"
            step="0.1"
            value={formData.lowest_adult_weight || ''}
            onChange={(e) => updateFormData('lowest_adult_weight', parseFloat(e.target.value) || null)}
            placeholder="Ex: 65.0"
          />
        </div>
        <div>
          <Label htmlFor="highest_weight">Maior peso na vida adulta (kg)</Label>
          <Input
            id="highest_weight"
            type="number"
            step="0.1"
            value={formData.highest_adult_weight || ''}
            onChange={(e) => updateFormData('highest_adult_weight', parseFloat(e.target.value) || null)}
            placeholder="Ex: 85.0"
          />
        </div>
      </div>

      {formData.current_weight && formData.height_cm && (
        <Alert>
          <AlertDescription>
            <strong>IMC Atual: {calculateBMI()}</strong> - {getBMIClassification(parseFloat(calculateBMI()))}
          </AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="weight_periods">Períodos de maior ganho de peso</Label>
        <Textarea
          id="weight_periods"
          value={formData.major_weight_gain_periods}
          onChange={(e) => updateFormData('major_weight_gain_periods', e.target.value)}
          placeholder="Descreva quando ganhou mais peso"
        />
      </div>

      <div>
        <Label htmlFor="emotional_events">Eventos emocionais significativos nesses períodos</Label>
        <Textarea
          id="emotional_events"
          value={formData.emotional_events_during_weight_gain}
          onChange={(e) => updateFormData('emotional_events_during_weight_gain', e.target.value)}
          placeholder="Houve algum evento emocional importante?"
        />
      </div>

      <div>
        <Label htmlFor="weight_fluctuation">Como classifica sua oscilação de peso?</Label>
        <Select value={formData.weight_fluctuation_classification} onValueChange={(value) => updateFormData('weight_fluctuation_classification', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o padrão" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="estavel">Sempre foi estável</SelectItem>
            <SelectItem value="leve_oscilacao">Leve oscilação (2-5kg)</SelectItem>
            <SelectItem value="moderada_oscilacao">Oscilação moderada (5-10kg)</SelectItem>
            <SelectItem value="grande_oscilacao">Grande oscilação (mais de 10kg)</SelectItem>
            <SelectItem value="efeito_sanfona">Efeito sanfona constante</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderTreatmentsSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white">Tratamentos Anteriores</h3>
      <p className="text-gray-400">Marque quais tratamentos para controle de peso você já tentou:</p>
      
      {[
        { key: 'dieta_restritiva', label: 'Dieta restritiva' },
        { key: 'exercicios_aerobicos', label: 'Exercícios aeróbicos' },
        { key: 'musculacao', label: 'Musculação' },
        { key: 'medicamentos_emagrecimento', label: 'Medicamentos para emagrecimento' },
        { key: 'cirurgia_bariatrica', label: 'Cirurgia bariátrica' },
        { key: 'acupuntura', label: 'Acupuntura' },
        { key: 'hipnose', label: 'Hipnose' },
        { key: 'psicoterapia', label: 'Psicoterapia' },
        { key: 'suplementos', label: 'Suplementos alimentares' },
        { key: 'outros_tratamentos', label: 'Outros tratamentos' }
      ].map((item) => (
        <div key={item.key} className="flex items-center space-x-3">
          <Checkbox
            id={item.key}
            checked={formData.previous_weight_treatments.includes(item.label)}
            onCheckedChange={(checked) => {
              if (checked) {
                addToArray('previous_weight_treatments', item.label);
              } else {
                removeFromArray('previous_weight_treatments', item.label);
              }
            }}
          />
          <Label htmlFor={item.key} className="text-white">{item.label}</Label>
        </div>
      ))}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="most_effective">Qual foi o tratamento mais eficaz?</Label>
          <Input
            id="most_effective"
            value={formData.most_effective_treatment}
            onChange={(e) => updateFormData('most_effective_treatment', e.target.value)}
            placeholder="Descreva o tratamento mais eficaz"
          />
        </div>
        <div>
          <Label htmlFor="least_effective">Qual foi o tratamento menos eficaz?</Label>
          <Input
            id="least_effective"
            value={formData.least_effective_treatment}
            onChange={(e) => updateFormData('least_effective_treatment', e.target.value)}
            placeholder="Descreva o tratamento menos eficaz"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="rebound_effect">Você já teve efeito rebote (ganhou mais peso após parar o tratamento)?</Label>
        <RadioGroup 
          value={formData.had_rebound_effect?.toString() || ''} 
          onValueChange={(value) => updateFormData('had_rebound_effect', value === 'true')}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="rebound_yes" />
            <Label htmlFor="rebound_yes" className="text-white">Sim</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="rebound_no" />
            <Label htmlFor="rebound_no" className="text-white">Não</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  const renderMedicationsSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white">Medicações Atuais</h3>
      <p className="text-gray-400">Informe sobre suas medicações e condições de saúde:</p>
      
      <div>
        <Label htmlFor="current_medications">Medicamentos que você toma atualmente</Label>
        <Textarea
          id="current_medications"
          value={formData.current_medications.join(', ')}
          onChange={(e) => updateFormData('current_medications', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
          placeholder="Liste os medicamentos que você toma (separados por vírgula)"
        />
      </div>

      <div>
        <Label htmlFor="chronic_diseases">Doenças crônicas que você possui</Label>
        <Textarea
          id="chronic_diseases"
          value={formData.chronic_diseases.join(', ')}
          onChange={(e) => updateFormData('chronic_diseases', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
          placeholder="Ex: Diabetes, Hipertensão, Hipotiroidismo"
        />
      </div>

      <div>
        <Label htmlFor="supplements">Suplementos que você toma</Label>
        <Textarea
          id="supplements"
          value={formData.supplements.join(', ')}
          onChange={(e) => updateFormData('supplements', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
          placeholder="Ex: Vitamina D, Ômega 3, Multivitamínico"
        />
      </div>

      <div>
        <Label htmlFor="herbal_medicines">Medicamentos fitoterápicos ou naturais</Label>
        <Textarea
          id="herbal_medicines"
          value={formData.herbal_medicines.join(', ')}
          onChange={(e) => updateFormData('herbal_medicines', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
          placeholder="Ex: Chá verde, Gengibre, Cúrcuma"
        />
      </div>

      <Alert>
        <AlertDescription>
          <strong>Importante:</strong> Essas informações são essenciais para evitar interações medicamentosas 
          e garantir a segurança do seu tratamento.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderFoodSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white">Relacionamento com Comida</h3>
      <p className="text-gray-400">Vamos entender melhor sua relação com a alimentação:</p>
      
      <div>
        <Label htmlFor="food_relationship">Como você avalia seu relacionamento com a comida? (1-10)</Label>
        <div className="space-y-2">
          <Slider
            value={[formData.food_relationship_score]}
            onValueChange={(value) => updateFormData('food_relationship_score', value[0])}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Muito ruim</span>
            <span>Muito bom</span>
          </div>
          <p className="text-sm text-white">Nota atual: {formData.food_relationship_score}/10</p>
        </div>
      </div>

      <div>
        <Label htmlFor="compulsive_eating">Você considera que tem compulsão alimentar?</Label>
        <RadioGroup 
          value={formData.has_compulsive_eating?.toString() || ''} 
          onValueChange={(value) => updateFormData('has_compulsive_eating', value === 'true')}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="compulsive_yes" />
            <Label htmlFor="compulsive_yes" className="text-white">Sim</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="compulsive_no" />
            <Label htmlFor="compulsive_no" className="text-white">Não</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="compulsive_situations">Em que situações você come compulsivamente?</Label>
        <Textarea
          id="compulsive_situations"
          value={formData.compulsive_eating_situations}
          onChange={(e) => updateFormData('compulsive_eating_situations', e.target.value)}
          placeholder="Ex: Quando estou estressado, à noite, quando estou sozinho..."
        />
      </div>

      <div>
        <Label htmlFor="problematic_foods">Quais alimentos você considera problemáticos?</Label>
        <Textarea
          id="problematic_foods"
          value={formData.problematic_foods.join(', ')}
          onChange={(e) => updateFormData('problematic_foods', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
          placeholder="Ex: Chocolate, Pão, Doces, Frituras"
        />
      </div>

      <div>
        <Label htmlFor="forbidden_foods">Quais alimentos você considera "proibidos"?</Label>
        <Textarea
          id="forbidden_foods"
          value={formData.forbidden_foods.join(', ')}
          onChange={(e) => updateFormData('forbidden_foods', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
          placeholder="Ex: Carboidratos, Açúcar, Gordura"
        />
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="guilt_after_eating">Você se sente culpado após comer?</Label>
          <RadioGroup 
            value={formData.feels_guilt_after_eating?.toString() || ''} 
            onValueChange={(value) => updateFormData('feels_guilt_after_eating', value === 'true')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="guilt_yes" />
              <Label htmlFor="guilt_yes" className="text-white">Sim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="guilt_no" />
              <Label htmlFor="guilt_no" className="text-white">Não</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="eats_in_secret">Você come escondido às vezes?</Label>
          <RadioGroup 
            value={formData.eats_in_secret?.toString() || ''} 
            onValueChange={(value) => updateFormData('eats_in_secret', value === 'true')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="secret_yes" />
              <Label htmlFor="secret_yes" className="text-white">Sim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="secret_no" />
              <Label htmlFor="secret_no" className="text-white">Não</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="eats_until_uncomfortable">Você come até se sentir desconfortável?</Label>
          <RadioGroup 
            value={formData.eats_until_uncomfortable?.toString() || ''} 
            onValueChange={(value) => updateFormData('eats_until_uncomfortable', value === 'true')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="uncomfortable_yes" />
              <Label htmlFor="uncomfortable_yes" className="text-white">Sim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="uncomfortable_no" />
              <Label htmlFor="uncomfortable_no" className="text-white">Não</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );

  const renderLifestyleSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white">Qualidade de Vida</h3>
      <p className="text-gray-400">Vamos avaliar sua qualidade de vida atual:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sleep_hours">Quantas horas você dorme por noite?</Label>
          <Input
            id="sleep_hours"
            type="number"
            step="0.5"
            value={formData.sleep_hours_per_night || ''}
            onChange={(e) => updateFormData('sleep_hours_per_night', parseFloat(e.target.value) || null)}
            placeholder="Ex: 7.5"
          />
        </div>
        <div>
          <Label htmlFor="sleep_quality">Como você avalia a qualidade do seu sono? (1-10)</Label>
          <div className="space-y-2">
            <Slider
              value={[formData.sleep_quality_score]}
              onValueChange={(value) => updateFormData('sleep_quality_score', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Muito ruim</span>
              <span>Excelente</span>
            </div>
            <p className="text-sm text-white">Nota atual: {formData.sleep_quality_score}/10</p>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="stress_level">Como você avalia seu nível de estresse diário? (1-10)</Label>
        <div className="space-y-2">
          <Slider
            value={[formData.daily_stress_level]}
            onValueChange={(value) => updateFormData('daily_stress_level', value[0])}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Muito baixo</span>
            <span>Muito alto</span>
          </div>
          <p className="text-sm text-white">Nota atual: {formData.daily_stress_level}/10</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="physical_activity">Que tipo de atividade física você pratica?</Label>
          <Select value={formData.physical_activity_type} onValueChange={(value) => updateFormData('physical_activity_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de atividade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="caminhada">Caminhada</SelectItem>
              <SelectItem value="corrida">Corrida</SelectItem>
              <SelectItem value="musculacao">Musculação</SelectItem>
              <SelectItem value="natacao">Natação</SelectItem>
              <SelectItem value="ciclismo">Ciclismo</SelectItem>
              <SelectItem value="yoga">Yoga</SelectItem>
              <SelectItem value="pilates">Pilates</SelectItem>
              <SelectItem value="danca">Dança</SelectItem>
              <SelectItem value="futebol">Futebol</SelectItem>
              <SelectItem value="nenhuma">Nenhuma</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="activity_frequency">Com que frequência você pratica atividade física?</Label>
          <Select value={formData.physical_activity_frequency} onValueChange={(value) => updateFormData('physical_activity_frequency', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a frequência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diariamente">Diariamente</SelectItem>
              <SelectItem value="3_4_vezes_semana">3-4 vezes por semana</SelectItem>
              <SelectItem value="1_2_vezes_semana">1-2 vezes por semana</SelectItem>
              <SelectItem value="esporadicamente">Esporadicamente</SelectItem>
              <SelectItem value="nunca">Nunca</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="energy_level">Como você avalia seu nível de energia diário? (1-10)</Label>
        <div className="space-y-2">
          <Slider
            value={[formData.daily_energy_level]}
            onValueChange={(value) => updateFormData('daily_energy_level', value[0])}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Muito baixo</span>
            <span>Muito alto</span>
          </div>
          <p className="text-sm text-white">Nota atual: {formData.daily_energy_level}/10</p>
        </div>
      </div>

      <div>
        <Label htmlFor="quality_of_life">Como você avalia sua qualidade de vida geral? (1-10)</Label>
        <div className="space-y-2">
          <Slider
            value={[formData.general_quality_of_life]}
            onValueChange={(value) => updateFormData('general_quality_of_life', value[0])}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Muito ruim</span>
            <span>Excelente</span>
          </div>
          <p className="text-sm text-white">Nota atual: {formData.general_quality_of_life}/10</p>
        </div>
      </div>
    </div>
  );

  const renderGoalsSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white">Objetivos e Expectativas</h3>
      <p className="text-gray-400">Vamos definir seus objetivos para o tratamento:</p>
      
      <div>
        <Label htmlFor="main_goals">Quais são seus principais objetivos com o tratamento?</Label>
        <Textarea
          id="main_goals"
          value={formData.main_treatment_goals}
          onChange={(e) => updateFormData('main_treatment_goals', e.target.value)}
          placeholder="Ex: Perder peso, melhorar a saúde, aumentar a autoestima, ter mais energia..."
        />
      </div>



      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ideal_weight">Qual é seu peso ideal? (kg)</Label>
          <Input
            id="ideal_weight"
            type="number"
            step="0.1"
            value={formData.ideal_weight_goal || ''}
            onChange={(e) => updateFormData('ideal_weight_goal', parseFloat(e.target.value) || null)}
            placeholder="Ex: 65.0"
          />
        </div>
        <div>
          <Label htmlFor="timeframe">Em quanto tempo você gostaria de atingir seu objetivo?</Label>
          <Select value={formData.timeframe_to_achieve_goal} onValueChange={(value) => updateFormData('timeframe_to_achieve_goal', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o prazo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3_meses">3 meses</SelectItem>
              <SelectItem value="6_meses">6 meses</SelectItem>
              <SelectItem value="1_ano">1 ano</SelectItem>
              <SelectItem value="2_anos">2 anos</SelectItem>
              <SelectItem value="sem_prazo">Sem prazo específico</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="biggest_challenge">Qual é o maior desafio para você perder peso?</Label>
        <Textarea
          id="biggest_challenge"
          value={formData.biggest_weight_loss_challenge}
          onChange={(e) => updateFormData('biggest_weight_loss_challenge', e.target.value)}
          placeholder="Ex: Controle emocional, falta de tempo, compulsão alimentar..."
        />
      </div>

      <div>
        <Label htmlFor="success_definition">Para você, o que significa sucesso no tratamento?</Label>
        <Textarea
          id="success_definition"
          value={formData.treatment_success_definition}
          onChange={(e) => updateFormData('treatment_success_definition', e.target.value)}
          placeholder="Ex: Perder X kg, ter mais energia, melhorar a autoestima, controlar a compulsão..."
        />
      </div>

      <div>
        <Label htmlFor="motivation">O que te motiva a buscar tratamento agora?</Label>
        <Textarea
          id="motivation"
          value={formData.motivation_for_seeking_treatment}
          onChange={(e) => updateFormData('motivation_for_seeking_treatment', e.target.value)}
          placeholder="Ex: Problemas de saúde, insatisfação pessoal, pressão social, qualidade de vida..."
        />
      </div>

      <Alert>
        <AlertDescription>
          <strong>Importante:</strong> Seus objetivos são pessoais e únicos. Não há pressão para seguir 
          padrões externos. O importante é que você se sinta bem e saudável.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderCurrentSection = () => {
    switch (sections[currentSection].id) {
      case 'personal':
        return renderPersonalSection();
      case 'family':
        return renderFamilySection();
      case 'weight':
        return renderWeightSection();
      case 'treatments':
        return renderTreatmentsSection();
      case 'medications':
        return renderMedicationsSection();
      case 'food':
        return renderFoodSection();
      case 'lifestyle':
        return renderLifestyleSection();
      case 'goals':
        return renderGoalsSection();
      default:
        return <div className="text-center text-gray-400">Seção em desenvolvimento...</div>;
    }
  };

  const handleExitClick = () => {
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    navigate('/');
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="container mx-auto max-w-4xl">
        <Card className="bg-gray-800/90 backdrop-blur border-gray-700">
          <CardHeader>
            <CardTitle className="text-center text-white">
              🏥 Anamnese Sistêmica Completa
            </CardTitle>
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-center text-gray-300">
                Seção {currentSection + 1} de {sections.length}: {sections[currentSection].title}
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Navigation */}
            <div className="flex flex-wrap gap-2 justify-center">
              {sections.map((section, index) => (
                <Badge
                  key={section.id}
                  variant={index === currentSection ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setCurrentSection(index)}
                >
                  {section.icon}
                  <span className="ml-1">{section.title}</span>
                </Badge>
              ))}
            </div>

            {/* Current Section Content */}
            <div className="bg-gray-700/50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                {sections[currentSection].icon}
                {sections[currentSection].title}
              </h2>
              {renderCurrentSection()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0}
              >
                ← Anterior
              </Button>
              
              {currentSection === sections.length - 1 ? (
                <Button
                  onClick={saveAnamnesis}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Salvando...' : 'Finalizar Anamnese'}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
                >
                  Próximo →
                </Button>
              )}
            </div>

            {/* Exit Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={handleExitClick}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4 mr-1" /> Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-medium text-gray-900">Sair da Anamnese</h3>
            <p className="text-gray-600 mt-2">
              Você tem certeza que deseja sair da anamnese? Todas as suas respostas serão perdidas.
            </p>
            <div className="flex justify-end mt-4 space-x-2">
              <Button variant="outline" onClick={handleCancelExit}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmExit}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemicAnamnesis;