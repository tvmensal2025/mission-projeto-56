import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  Brain, 
  Settings, 
  Save, 
  RotateCcw, 
  Zap, 
  TrendingUp, 
  DollarSign,
  TestTube,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Monitor,
  Activity,
  PlayCircle,
  Clock,
  MessageSquare,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAITesting } from '@/hooks/useAITesting';
import { toast } from 'sonner';

interface AIConfig {
  id?: string;
  functionality: string;
  service: string;
  model: string;
  max_tokens: number;
  temperature: number;
  is_enabled: boolean;
  preset_level: string;
  system_prompt?: string;
  cost_per_request?: number;
  priority?: number;
}

interface AITemplate {
  id: string;
  name: string;
  description: string;
  configurations: {
    default_service: string;
    default_model: string;
    default_tokens: number;
    default_temperature: number;
  };
}

export function AIControlPanelUnified() {
  const { toast: toastHook } = useToast();
  const { isLoading: testingLoading, results, runFullAITest, testSpecificModel, clearResults } = useAITesting();
  
  // States
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [selectedConfig, setSelectedConfig] = useState<AIConfig | null>(null);
  const [customMessage, setCustomMessage] = useState('Olá! Como você pode me ajudar?');
  const [selectedService, setSelectedService] = useState<'openai' | 'gemini' | 'sofia'>('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4.1-2025-04-14');
  
  // Templates predefinidos
  const templates: AITemplate[] = [
    {
      id: 'performance',
      name: 'Máxima Performance',
      description: 'Configuração otimizada para máxima qualidade',
      configurations: {
        default_service: 'openai',
        default_model: 'o3-2025-04-16',
        default_tokens: 8192,
        default_temperature: 0.7
      }
    },
    {
      id: 'balanced',
      name: 'Balanceado',
      description: 'Equilibrio entre qualidade e custo',
      configurations: {
        default_service: 'openai',
        default_model: 'gpt-4.1-2025-04-14',
        default_tokens: 4096,
        default_temperature: 0.8
      }
    },
    {
      id: 'economy',
      name: 'Econômico',
      description: 'Configuração de baixo custo',
      configurations: {
        default_service: 'openai',
        default_model: 'gpt-4o-mini',
        default_tokens: 2000,
        default_temperature: 0.7
      }
    }
  ];

  // Funcionalidades disponíveis
  const functionalities = [
    { key: 'chat_daily', name: 'Chat Diário', icon: MessageSquare, description: 'Conversas do dia a dia' },
    { key: 'weekly_report', name: 'Relatório Semanal', icon: TrendingUp, description: 'Relatórios automatizados' },
    { key: 'monthly_report', name: 'Relatório Mensal', icon: TrendingUp, description: 'Análises mensais' },
    { key: 'medical_analysis', name: 'Análise Médica', icon: Activity, description: 'Análises médicas especializadas' },
    { key: 'preventive_analysis', name: 'Análise Preventiva', icon: AlertTriangle, description: 'Prevenção de saúde' },
    { key: 'sofia_enhanced', name: 'Sofia Chat', icon: Bot, description: 'Assistente virtual Sofia' }
  ];

  // Modelos disponíveis
  const models = {
    openai: [
      { value: 'gpt-4.1-2025-04-14', label: 'GPT-4.1 (Recomendado)', cost: 0.03 },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini', cost: 0.005 },
      { value: 'o3-2025-04-16', label: 'O3 (Premium)', cost: 0.06 },
      { value: 'gpt-4o', label: 'GPT-4o', cost: 0.015 }
    ],
    gemini: [
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', cost: 0.0035 },
      { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', cost: 0.0007 },
      { value: 'gemini-pro', label: 'Gemini Pro', cost: 0.0025 }
    ]
  };

  // Carregar configurações
  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ai_configurations')
        .select('*')
        .order('functionality');

      if (error) throw error;

      setConfigs(data || []);
      calculateTotalCost(data || []);
    } catch (error) {
      toastHook({
        title: 'Erro',
        description: 'Falha ao carregar configurações',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalCost = (configurations: AIConfig[]) => {
    const cost = configurations.reduce((total, config) => {
      if (!config.is_enabled) return total;
      
      const modelInfo = models[config.service as keyof typeof models]?.find(m => m.value === config.model);
      const costPerToken = modelInfo?.cost || 0.01;
      const dailyUsage = config.max_tokens * 10; // Estimativa
      return total + (costPerToken * dailyUsage / 1000);
    }, 0);
    
    setTotalCost(cost);
  };

  const saveConfiguration = async (config: AIConfig) => {
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('ai_configurations')
        .upsert({
          functionality: config.functionality,
          service: config.service,
          model: config.model,
          max_tokens: config.max_tokens,
          temperature: config.temperature,
          is_enabled: config.is_enabled,
          preset_level: config.preset_level,
          system_prompt: config.system_prompt
        });

      if (error) throw error;

      await loadConfigurations();
      toast.success('Configuração salva com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configuração');
    } finally {
      setIsSaving(false);
    }
  };

  const testConfiguration = async (config: AIConfig) => {
    try {
      setIsTesting(true);
      
      const testMessage = 'Teste de configuração de IA. Responda brevemente.';
      const result = await testSpecificModel(
        config.service as any,
        config.model,
        testMessage
      );

      if (result.success) {
        toast.success(`✅ ${config.functionality} funcionando!`);
      } else {
        toast.error(`❌ Erro em ${config.functionality}`);
      }
    } catch (error) {
      toast.error('Erro no teste');
    } finally {
      setIsTesting(false);
    }
  };

  const applyTemplate = async (template: AITemplate) => {
    try {
      setIsSaving(true);
      
      for (const config of configs) {
        await saveConfiguration({
          ...config,
          service: template.configurations.default_service,
          model: template.configurations.default_model,
          max_tokens: template.configurations.default_tokens,
          temperature: template.configurations.default_temperature,
          preset_level: template.id
        });
      }
      
      toast.success(`Template "${template.name}" aplicado a todas as configurações!`);
    } catch (error) {
      toast.error('Erro ao aplicar template');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = async () => {
    try {
      setIsSaving(true);
      
      const defaultConfigs = functionalities.map(func => ({
        functionality: func.key,
        service: 'openai',
        model: 'gpt-4.1-2025-04-14',
        max_tokens: 2000,
        temperature: 0.7,
        is_enabled: true,
        preset_level: 'balanced'
      }));

      for (const config of defaultConfigs) {
        await saveConfiguration(config);
      }
      
      toast.success('Configurações resetadas para padrão!');
    } catch (error) {
      toast.error('Erro ao resetar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFullTest = async () => {
    toast.info('Iniciando teste completo das IAs...');
    const testResults = await runFullAITest();
    
    const successCount = testResults.filter(r => r.success).length;
    const totalCount = testResults.length;
    
    if (successCount === totalCount) {
      toast.success(`✅ Todas as ${totalCount} IAs estão funcionando!`);
    } else {
      toast.warning(`⚠️ ${successCount}/${totalCount} IAs funcionando`);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Carregando configurações...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6" />
              Controle Unificado de IA
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                ${totalCost.toFixed(2)}/dia
              </Badge>
              <Badge variant={configs.filter(c => c.is_enabled).length > 0 ? 'default' : 'secondary'}>
                {configs.filter(c => c.is_enabled).length} de {configs.length} ativas
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={handleFullTest} disabled={testingLoading} className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              {testingLoading ? 'Testando...' : 'Teste Completo'}
            </Button>
            <Button variant="outline" onClick={resetToDefaults} disabled={isSaving}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Padrão
            </Button>
            <Button variant="outline" onClick={clearResults}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Testes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="configurations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configurations">⚙️ Configurações</TabsTrigger>
          <TabsTrigger value="templates">📚 Templates</TabsTrigger>
          <TabsTrigger value="testing">🧪 Testes</TabsTrigger>
          <TabsTrigger value="monitoring">📊 Monitoramento</TabsTrigger>
        </TabsList>

        {/* Aba de Configurações */}
        <TabsContent value="configurations" className="space-y-4">
          <div className="grid gap-4">
            {functionalities.map((func) => {
              const config = configs.find(c => c.functionality === func.key);
              const IconComponent = func.icon;
              
              return (
                <Card key={func.key}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5" />
                        <div>
                          <h3 className="font-medium">{func.name}</h3>
                          <p className="text-sm text-muted-foreground">{func.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={config?.is_enabled || false}
                          onCheckedChange={(checked) => {
                            if (config) {
                              saveConfiguration({ ...config, is_enabled: checked });
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => config && testConfiguration(config)}
                          disabled={isTesting}
                        >
                          <TestTube className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {config && (
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Serviço</Label>
                          <Select
                            value={config.service}
                            onValueChange={(value) => saveConfiguration({ ...config, service: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="openai">OpenAI</SelectItem>
                              <SelectItem value="gemini">Google Gemini</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Modelo</Label>
                          <Select
                            value={config.model}
                            onValueChange={(value) => saveConfiguration({ ...config, model: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {models[config.service as keyof typeof models]?.map((model) => (
                                <SelectItem key={model.value} value={model.value}>
                                  {model.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Tokens Máximos</Label>
                          <Input
                            type="number"
                            value={config.max_tokens}
                            onChange={(e) => saveConfiguration({ ...config, max_tokens: parseInt(e.target.value) })}
                            min={100}
                            max={8192}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Temperature: {config.temperature}</Label>
                          <Slider
                            value={[config.temperature]}
                            onValueChange={([value]) => saveConfiguration({ ...config, temperature: value })}
                            min={0}
                            max={1}
                            step={0.1}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Aba de Templates */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Serviço:</strong> {template.configurations.default_service}</p>
                    <p><strong>Modelo:</strong> {template.configurations.default_model}</p>
                    <p><strong>Tokens:</strong> {template.configurations.default_tokens}</p>
                    <p><strong>Temperature:</strong> {template.configurations.default_temperature}</p>
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => applyTemplate(template)}
                    disabled={isSaving}
                  >
                    Aplicar Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Aba de Testes */}
        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teste Personalizado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Serviço</Label>
                  <Select value={selectedService} onValueChange={(value: any) => setSelectedService(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="gemini">Google Gemini</SelectItem>
                      <SelectItem value="sofia">Sofia Chat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedService !== 'sofia' && models[selectedService]?.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                      {selectedService === 'sofia' && (
                        <SelectItem value="sofia-chat">Sofia Chat</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mensagem de Teste</Label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Digite sua mensagem de teste..."
                  className="min-h-[80px]"
                />
              </div>

              <Button
                onClick={() => testSpecificModel(selectedService, selectedModel, customMessage)}
                disabled={testingLoading}
                className="w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                Testar {selectedService === 'sofia' ? 'Sofia' : selectedModel}
              </Button>
            </CardContent>
          </Card>

          {/* Resultados dos Testes */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resultados dos Testes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {result.success ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{result.model}</p>
                            <p className="text-sm text-muted-foreground">
                              {result.service === 'openai' ? 'OpenAI' : 'Google Gemini'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={result.success ? 'default' : 'destructive'}>
                            {result.success ? 'Sucesso' : 'Erro'}
                          </Badge>
                          
                          {result.duration && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {result.duration}ms
                            </Badge>
                          )}
                        </div>
                      </div>

                      {result.response && (
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm">{result.response}</p>
                        </div>
                      )}

                      {result.error && (
                        <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
                          <p className="text-sm text-destructive">{result.error}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Aba de Monitoramento */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Status Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {configs.filter(c => c.is_enabled).length}/{configs.length}
                  </div>
                  <p className="text-sm text-muted-foreground">IAs Ativas</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Custo Estimado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    ${totalCost.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">por dia</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  Testes Realizados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {results.filter(r => r.success).length}/{results.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Sucessos</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance por Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>OpenAI</span>
                    <span>{results.filter(r => r.service === 'openai' && r.success).length}/{results.filter(r => r.service === 'openai').length}</span>
                  </div>
                  <Progress value={
                    results.filter(r => r.service === 'openai').length > 0
                      ? (results.filter(r => r.service === 'openai' && r.success).length / results.filter(r => r.service === 'openai').length) * 100
                      : 0
                  } />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Google Gemini</span>
                    <span>{results.filter(r => r.service === 'gemini' && r.success).length}/{results.filter(r => r.service === 'gemini').length}</span>
                  </div>
                  <Progress value={
                    results.filter(r => r.service === 'gemini').length > 0
                      ? (results.filter(r => r.service === 'gemini' && r.success).length / results.filter(r => r.service === 'gemini').length) * 100
                      : 0
                  } />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}