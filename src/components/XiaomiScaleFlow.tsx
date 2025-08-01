import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Scale, 
  Search, 
  Bluetooth, 
  Settings, 
  User, 
  CheckCircle, 
  Activity,
  Save,
  BarChart3,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
  Timer,
  Play,
  Pause,
  RefreshCw,
  Wifi,
  Battery,
  Heart,
  Droplets,
  Bone,
  Activity as ActivityIcon,
  AlertCircle,
  X,
  XCircle,
  Edit3
} from 'lucide-react';

interface ScaleData {
  weight: number;
  bmi: number;
  bodyFat: number;
  muscleMass: number;
  waterPercentage: number;
  boneMass: number;
  visceralFat: number;
  metabolicAge: number;
  timestamp: Date;
}

interface BluetoothDevice {
  id: string;
  name: string;
  isConnected: boolean;
  isXiaomi: boolean;
}

type FlowStep = 
  | 'initial'
  | 'searching'
  | 'devices'
  | 'connecting'
  | 'calibrating'
  | 'measuring'
  | 'confirming'
  | 'saving'
  | 'completed'
  | 'error'
  | 'manual';

export const XiaomiScaleFlow: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<FlowStep>('initial');
  const [countdown, setCountdown] = useState(5);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null);
  const [scaleData, setScaleData] = useState<ScaleData | null>(null);
  const [abdominalCircumference, setAbdominalCircumference] = useState('');
  const [manualWeight, setManualWeight] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [bluetoothDevice, setBluetoothDevice] = useState<BluetoothDevice | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [device, setDevice] = useState<any>(null);
  const [server, setServer] = useState<any>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [lastWeight, setLastWeight] = useState<ScaleData | null>(null);
  const [isWeighing, setIsWeighing] = useState(false);
  const { toast } = useToast();

  // Verificar se Web Bluetooth API está disponível
  const isBluetoothSupported = () => {
    return 'bluetooth' in navigator;
  };

  // Remover simulação - usaremos dados reais da balança
  const generateScaleData = (): ScaleData => {
    // Esta função não será mais usada - dados virão da balança real
    return {
      weight: 0,
      bmi: 0,
      bodyFat: 0,
      muscleMass: 0,
      waterPercentage: 0,
      boneMass: 0,
      visceralFat: 0,
      metabolicAge: 0,
      timestamp: new Date()
    };
  };

  // Conectar com Xiaomi Scale 2 real
  const connectToScale = async () => {
    try {
      setIsConnecting(true);
      setCurrentStep('searching');
      setError('');
      
      console.log('Iniciando busca por balança Xiaomi...');
      
      // Verificar se Bluetooth está disponível
      if (!navigator.bluetooth) {
        throw new Error('Bluetooth não está disponível neste navegador');
      }
      
      toast({
        title: "🔍 Procurando balança...",
        description: "Certifique-se que a balança está ligada e próxima",
      });
      
      // Primeira etapa: Pareamento com a balança
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { name: 'MI_SCALE' },
          { namePrefix: 'MIBFS' },
          { namePrefix: 'MI' },
        ],
        optionalServices: [
          '0000181d-0000-1000-8000-00805f9b34fb', // Weight Scale Service
          '0000180f-0000-1000-8000-00805f9b34fb', // Battery Service
          '0000181b-0000-1000-8000-00805f9b34fb', // Body Composition Service
          '0000ffe0-0000-1000-8000-00805f9b34fb', // Xiaomi Custom Service
          '0000fff0-0000-1000-8000-00805f9b34fb', // Xiaomi Alternative Service
          '00001530-0000-3512-2118-0009af100700', // Xiaomi Service
        ]
      });

      console.log('Dispositivo selecionado:', device.name || 'Dispositivo sem nome');
      setCurrentStep('connecting');

      if (device && device.gatt) {
        console.log('Conectando ao GATT...');
        const server = await device.gatt.connect();
        
        if (server) {
          console.log('Conectado ao GATT server');
          setDevice(device);
          setServer(server);
          setIsConnected(true);
          
          toast({
            title: "Balança conectada!",
            description: `Conectado com ${device.name || 'Balança'}`,
          });

          // Tentar configurar notificações
          try {
            await setupNotifications(server);
          } catch (notifyError) {
            console.log('Erro ao configurar notificações:', notifyError);
            // Continue mesmo se as notificações falharem
          }
          
          // Verificar bateria (opcional)
          try {
            await checkBatteryLevel(server);
          } catch (batteryError) {
            console.log('Erro ao verificar bateria:', batteryError);
            // Continue mesmo se falhar
          }

          // Balança pareada com sucesso - aguardar pesagem
          toast({
            title: "✅ Balança pareada!",
            description: "Agora pise na balança para fazer a pesagem",
          });
          
          setCurrentStep('measuring');
          setIsWeighing(true);
          
          // Timeout de 30 segundos para receber dados
          setTimeout(() => {
            if (isWeighing) {
              console.log('Timeout de 30s - dados não recebidos, indo para pesagem manual');
              setCurrentStep('manual');
              setIsWeighing(false);
              toast({
                title: "⏰ Tempo esgotado",
                description: 'Pise na balança ou use a pesagem manual.',
                variant: "default"
              });
            }
          }, 30000); // 30 segundos para dar tempo da pesagem
        }
      }
    } catch (error: any) {
      console.error('Erro ao conectar:', error);
      
      if (error.name === 'NotFoundError' || error.message.includes('User cancelled')) {
        setError('Nenhum dispositivo selecionado ou conexão cancelada.');
        toast({
          title: "Conexão cancelada",
          description: 'Nenhum dispositivo foi selecionado. Tente novamente.',
          variant: "destructive"
        });
      } else if (error.name === 'NotSupportedError') {
        setError('Bluetooth não é suportado ou não está habilitado.');
        toast({
          title: "Bluetooth não suportado",
          description: 'Verifique se o Bluetooth está habilitado no seu dispositivo.',
          variant: "destructive"
        });
      } else {
        setError(`Erro de conexão: ${error.message}`);
        toast({
          title: "Erro de conexão",
          description: error.message,
          variant: "destructive"
        });
      }
      
      setCurrentStep('error');
    } finally {
      setIsConnecting(false);
    }
  };

  const setupNotifications = async (server: any) => {
    try {
      const weightService = await server.getPrimaryService('0000181d-0000-1000-8000-00805f9b34fb');
      const weightCharacteristic = await weightService.getCharacteristic('00002a98-0000-1000-8000-00805f9b34fb');
      
      await weightCharacteristic.startNotifications();
      weightCharacteristic.addEventListener('characteristicvaluechanged', handleWeightData);
      
    } catch (error) {
      console.log('Erro ao configurar notificações:', error);
    }
  };

  const handleWeightData = (event: any) => {
    const value = event.target.value;
    const data = decodeWeightData(value);
    
    console.log('Dados recebidos da balança:', data);
    
    if (data.weight > 0) {
      setScaleData(data);
      setLastWeight(data);
      setIsWeighing(false);
      
      toast({
        title: "Peso registrado da balança!",
        description: `${data.weight}kg - IMC: ${data.bmi?.toFixed(1)}`,
      });
      
      // Ir para confirmação com dados reais
      setCurrentStep('confirming');
    }
  };

  const decodeWeightData = (value: DataView): ScaleData => {
    const data = new Uint8Array(value.buffer);
    
    console.log('Dados recebidos da balança:', Array.from(data).map(b => b.toString(16)).join(' '));
    
    // Protocolo da Xiaomi Scale 2 - decodificação real
    let weight = 0;
    let bodyFat = 0;
    let muscleMass = 0;
    let waterPercentage = 0;
    let boneMass = 0;
    let visceralFat = 0;
    let metabolicAge = 0;
    
    if (data.length >= 13) {
      // Xiaomi Scale 2 formato de dados
      weight = ((data[12] << 8) | data[11]) / 200.0; // Peso em kg
      
      if (data.length >= 20) {
        // Dados de composição corporal (só disponíveis após identificação do usuário)
        bodyFat = ((data[18] << 8) | data[17]) / 100.0; // Gordura corporal %
        waterPercentage = ((data[20] << 8) | data[19]) / 100.0; // Água %
        muscleMass = ((data[14] << 8) | data[13]) / 200.0; // Massa muscular kg
        boneMass = data[16] / 10.0; // Massa óssea kg
        visceralFat = data[15]; // Gordura visceral
        metabolicAge = data[21]; // Idade metabólica
      }
    } else if (data.length >= 10) {
      // Formato alternativo - apenas peso
      weight = ((data[2] << 8) | data[1]) / 200.0;
    }
    
    // Obter altura do usuário para calcular IMC
    const height = 1.70; // 170cm padrão - deve ser obtido dos dados do usuário
    const bmi = weight > 0 ? Math.round((weight / (height * height)) * 10) / 10 : 0;
    
    const result = {
      weight: Math.round(weight * 10) / 10,
      bodyFat: Math.round(bodyFat * 10) / 10,
      muscleMass: Math.round(muscleMass * 10) / 10,
      waterPercentage: Math.round(waterPercentage * 10) / 10,
      boneMass: Math.round(boneMass * 10) / 10,
      bmi,
      visceralFat,
      metabolicAge,
      timestamp: new Date()
    };
    
    console.log('Dados decodificados:', result);
    return result;
  };

  const checkBatteryLevel = async (server: any) => {
    try {
      const batteryService = await server.getPrimaryService('0000180f-0000-1000-8000-00805f9b34fb');
      const batteryCharacteristic = await batteryService.getCharacteristic('00002a19-0000-1000-8000-00805f9b34fb');
      const value = await batteryCharacteristic.readValue();
      const level = value.getUint8(0);
      setBatteryLevel(level);
    } catch (error) {
      console.log('Erro ao verificar bateria:', error);
    }
  };

  const startCalibration = () => {
    let calibCountdown = 5;
    const calibInterval = setInterval(() => {
      calibCountdown--;
      setCountdown(calibCountdown);
      
      if (calibCountdown <= 0) {
        clearInterval(calibInterval);
        setCurrentStep('measuring');
        startMeasurement();
      }
    }, 1000);
  };

  const startMeasurement = () => {
    let measureCountdown = 5;
    const measureInterval = setInterval(() => {
      measureCountdown--;
      setCountdown(measureCountdown);
      
      if (measureCountdown <= 0) {
        clearInterval(measureInterval);
        const data = generateScaleData();
        setScaleData(data);
        setCurrentStep('confirming');
      }
    }, 1000);
  };

  const confirmAndSave = async () => {
    if (!scaleData) return;
    
    // Prevenir salvamento duplo
    if (isProcessing) return;
    
    setCurrentStep('saving');
    setIsProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Salvar dados físicos se não existirem
      const { data: physicalData } = await supabase
        .from('user_physical_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!physicalData) {
        await supabase
          .from('user_physical_data')
          .upsert({
            user_id: user.id,
            altura_cm: 170, // Altura padrão
            idade: 30,
            sexo: 'masculino',
            nivel_atividade: 'moderado'
          });
      }

      // Salvar pesagem
      const { data, error } = await supabase
        .from('weight_measurements')
        .insert({
          user_id: user.id,
          peso_kg: scaleData.weight,
          gordura_corporal_percent: scaleData.bodyFat,
          massa_muscular_kg: scaleData.muscleMass,
          agua_corporal_percent: scaleData.waterPercentage,
          osso_kg: scaleData.boneMass,
          gordura_visceral: scaleData.visceralFat,
          idade_metabolica: scaleData.metabolicAge,
          circunferencia_abdominal_cm: abdominalCircumference ? parseFloat(abdominalCircumference) : undefined,
          imc: scaleData.bmi,
          risco_metabolico: scaleData.bmi < 18.5 ? 'baixo_peso' : 
                           scaleData.bmi >= 25 && scaleData.bmi < 30 ? 'sobrepeso' :
                           scaleData.bmi >= 30 ? 'obesidade' : 'normal',
          device_type: 'xiaomi_scale',
          notes: `Pesagem automática - Gordura: ${scaleData.bodyFat}%, Músculo: ${scaleData.muscleMass}kg, Água: ${scaleData.waterPercentage}%`,
          measurement_date: scaleData.timestamp.toISOString()
        })
        .select('id, user_id, peso_kg, imc, measurement_date')
        .single();

      if (error) throw error;

      toast({
        title: "Pesagem salva com sucesso!",
        description: `Peso: ${scaleData.weight}kg | IMC: ${scaleData.bmi.toFixed(1)}. A página será atualizada em 10 segundos.`,
      });
      
      // Aguardar 10 segundos antes de recarregar
      setTimeout(() => {
        window.location.reload();
      }, 10000);

    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar pesagem",
        description: error.message || 'Erro desconhecido ao salvar dados',
        variant: "destructive"
      });
      setCurrentStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetFlow = () => {
    setCurrentStep('initial');
    setCountdown(5);
    setDevices([]);
    setSelectedDevice(null);
    setScaleData(null);
    setAbdominalCircumference('');
    setManualWeight('');
    setIsProcessing(false);
    setError('');
    setBluetoothDevice(null);
    setIsConnected(false);
    setIsConnecting(false);
    setDevice(null);
    setServer(null);
    setBatteryLevel(null);
    setLastWeight(null);
    setIsWeighing(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'initial':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">⚖️</div>
            <h2 className="text-2xl font-bold">Faça Sua Pesagem</h2>
            <p className="text-muted-foreground">
              Escolha como deseja fazer sua pesagem
            </p>
            
            {!isBluetoothSupported() && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 mb-2">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Bluetooth não suportado</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Use Chrome ou Edge para conectar com sua balança Bluetooth
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
              <Button 
                onClick={connectToScale}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 text-lg shadow-lg"
                disabled={!isBluetoothSupported() || isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Activity className="mr-2 h-5 w-5 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Bluetooth className="mr-2 h-5 w-5" />
                    <span>PESAGEM AUTOMÁTICA</span>
                  </>
                )}
              </Button>
              
              <Button 
                onClick={() => setCurrentStep('manual')}
                size="lg"
                variant="outline"
                className="w-full border-2 border-primary/20 hover:bg-primary/5 font-semibold py-4 px-8 text-lg"
              >
                <Edit3 className="mr-2 h-5 w-5" />
                <span>PESAGEM MANUAL</span>
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/google-fit-oauth'}
                size="lg"
                variant="outline"
                className="w-full border-2 border-green-500/20 hover:bg-green-500/5 font-semibold py-4 px-8 text-lg text-green-600 hover:text-green-700"
              >
                <Activity className="mr-2 h-5 w-5" />
                <span>CONECTAR GOOGLE FIT</span>
              </Button>
            </div>
          </div>
        );

      case 'manual':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">✏️</div>
              <h2 className="text-2xl font-bold">Pesagem Manual</h2>
              <p className="text-muted-foreground">Digite seus dados de pesagem</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  Dados de Pesagem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg):</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="Ex: 70.5"
                      step="0.1"
                      min="0"
                      max="500"
                      value={manualWeight || ''}
                      onChange={(e) => {
                        const weight = parseFloat(e.target.value);
                        setManualWeight(e.target.value);
                        if (weight > 0) {
                          setScaleData(prev => prev ? { ...prev, weight } : generateScaleData());
                        }
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="abdominal">Perímetro Abdominal (cm):</Label>
                    <Input
                      id="abdominal"
                      type="number"
                      placeholder="Ex: 85"
                      step="0.1"
                      min="0"
                      max="200"
                      value={abdominalCircumference}
                      onChange={(e) => setAbdominalCircumference(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    if (manualWeight && abdominalCircumference) {
                      // Criar dados de pesagem manual
                      const weight = parseFloat(manualWeight);
                      const height = 170; // Altura padrão
                      const heightInMeters = height / 100;
                      const bmi = weight / (heightInMeters * heightInMeters);
                      
                      const manualData: ScaleData = {
                        weight: weight,
                        bmi: bmi,
                        bodyFat: 20, // Valor padrão
                        muscleMass: weight * 0.4, // Estimativa
                        waterPercentage: 60, // Valor padrão
                        boneMass: weight * 0.15, // Estimativa
                        visceralFat: 10, // Valor padrão
                        metabolicAge: 30, // Valor padrão
                        timestamp: new Date()
                      };
                      
                      setScaleData(manualData);
                      confirmAndSave();
                    } else {
                      // Ir para confirmação se não temos todos os dados
                      const manualData = generateScaleData();
                      setScaleData(manualData);
                      setCurrentStep('confirming');
                    }
                  }}
                  className="w-full"
                  size="lg"
                  disabled={!manualWeight || !abdominalCircumference}
                >
                  <Save className="mr-2 h-4 w-4" />
                  💾 SALVAR PESAGEM
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'searching':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold">Procurando Balança</h2>
            <p className="text-muted-foreground">📱 Procurando balança...</p>
            
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Search className="h-6 w-6 animate-pulse" />
                    <span className="text-lg font-medium">PROCURANDO...</span>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">⚖️ BALANÇA</div>
                    <div className="text-6xl mb-4">🔍</div>
                    <div className="text-sm text-muted-foreground">[CLICAR AQUI]</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <p className="text-center text-sm text-muted-foreground">
              🔍 "Procurando balança..."
            </p>
          </div>
        );

      case 'devices':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🔗</div>
              <h2 className="text-2xl font-bold">Conexão Bluetooth</h2>
              <p className="text-muted-foreground">⏱️ Tempo total: 10 segundos</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  Dispositivos Encontrados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {devices.map((device) => (
                    <div
                      key={device.id}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedDevice?.id === device.id 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => connectToScale()}
                    >
                      <div className="flex items-center gap-3">
                        {device.isXiaomi ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                        )}
                        <span className="font-medium">{device.name}</span>
                        {device.isConnected && (
                          <Badge variant="secondary" className="ml-2">Conectado</Badge>
                        )}
                      </div>
                      {selectedDevice?.id === device.id && (
                        <Badge variant="secondary">Selecionado</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <p className="text-center text-sm text-muted-foreground">
              🎯 "Selecione sua balança"
            </p>
          </div>
        );

      case 'connecting':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🔗</div>
            <h2 className="text-2xl font-bold">Conectando...</h2>
            <div className="flex items-center justify-center gap-2">
              <Activity className="h-5 w-5 animate-spin" />
              <span>Estabelecendo conexão com balança</span>
            </div>
            <Progress value={66} className="w-full" />
          </div>
        );

      case 'calibrating':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">⚙️</div>
            <h2 className="text-2xl font-bold">Calibração da Balança</h2>
            <p className="text-muted-foreground">⏱️ Tempo: 5 segundos</p>
            
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span className="text-lg font-medium">CALIBRANDO...</span>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {countdown}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {countdown > 0 ? `${countdown}... ${countdown - 1 > 0 ? countdown - 1 : ''} ${countdown - 2 > 0 ? countdown - 2 : ''} ${countdown - 3 > 0 ? countdown - 3 : ''} ${countdown - 4 > 0 ? countdown - 4 : ''}` : '✅ CALIBRAÇÃO CONCLUÍDA!'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <p className="text-center text-sm text-muted-foreground">
              📢 "Suba na balança agora!"
            </p>
          </div>
        );

      case 'measuring':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-2xl font-bold">Aguardando Dados da Balança</h2>
            <p className="text-muted-foreground">⏱️ Timeout em 10 segundos</p>
            
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">⚖️ BALANÇA CONECTADA</div>
                    <div className="text-6xl mb-4">📡</div>
                    <div className="text-sm text-muted-foreground">[AGUARDANDO DADOS...]</div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <Activity className="h-5 w-5 animate-spin" />
                    <span className="text-lg font-medium">RECEBENDO DADOS...</span>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">
                      Suba na balança para registrar seu peso
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setCurrentStep('manual')}
                variant="outline"
                className="flex-1"
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Ir para Manual
              </Button>
              <Button 
                onClick={resetFlow}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reconectar
              </Button>
            </div>
            
            <p className="text-center text-sm text-muted-foreground">
              📡 "Aguardando dados da balança... (máx 10s)"
            </p>
          </div>
        );

      case 'confirming':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold">Confirmação Manual</h2>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Dados Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scaleData && (
                  <>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        ⚖️ {scaleData.weight} kg
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span>IMC:</span>
                        <span className="font-medium">{scaleData.bmi}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gordura:</span>
                        <span className="font-medium">{scaleData.bodyFat}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Músculo:</span>
                        <span className="font-medium">{scaleData.muscleMass} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Água:</span>
                        <span className="font-medium">{scaleData.waterPercentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Metabolismo:</span>
                        <span className="font-medium">{1650} kcal</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Visceral:</span>
                        <span className="font-medium">{scaleData.visceralFat}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Idade Corporal:</span>
                        <span className="font-medium">{scaleData.metabolicAge} anos</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Massa Óssea:</span>
                        <span className="font-medium">{scaleData.boneMass} kg</span>
                      </div>
                    </div>
                    

                    
                    <Button 
                      onClick={confirmAndSave}
                      className="w-full"
                      size="lg"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      💾 SALVAR PESAGEM
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
            
            <p className="text-center text-sm text-muted-foreground">
              📝 "Clique para confirmar"
            </p>
          </div>
        );

      case 'saving':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">💾</div>
            <h2 className="text-2xl font-bold">Salvando Dados</h2>
            <p className="text-muted-foreground">⏳ PROCESSANDO...</p>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Tabela Pesagens
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scaleData && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Peso: {scaleData.weight} kg</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>IMC: {scaleData.bmi}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Gordura: {scaleData.bodyFat}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Músculo: {scaleData.muscleMass} kg</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Água: {scaleData.waterPercentage}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Metabolismo: 1650 kcal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Visceral: {scaleData.visceralFat}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Idade Corporal: {scaleData.metabolicAge} anos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Massa Óssea: {scaleData.boneMass} kg</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <p className="text-center text-sm text-muted-foreground">
              ✅ "Dados salvos com sucesso!"
            </p>
          </div>
        );



      case 'error':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600">Erro de Conexão</h2>
            
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-red-800 mb-4">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Problema Detectado</span>
                </div>
                <p className="text-red-700 mb-4">{error}</p>
                
                <div className="space-y-2 text-sm text-red-600">
                  <p>• Verifique se sua balança está ligada</p>
                  <p>• Certifique-se de que está próxima ao computador</p>
                  <p>• Use Chrome ou Edge para melhor compatibilidade</p>
                  <p>• Permita o acesso ao Bluetooth quando solicitado</p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={resetFlow}
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Button>
              <Button 
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Fechar
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-9 text-sm border-primary/20 hover:bg-primary/5 mt-auto font-semibold">
          <Scale className="h-4 w-4 text-primary mr-2" />
          <span className="font-semibold">FAÇA SUA PESAGEM</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Balança Xiaomi - Fluxo de Pesagem
          </DialogTitle>
          <DialogDescription>
            Conecte sua balança Xiaomi e faça sua pesagem automática
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {renderStep()}
          
          {currentStep !== 'initial' && currentStep !== 'completed' && currentStep !== 'error' && (
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={resetFlow}
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reiniciar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 