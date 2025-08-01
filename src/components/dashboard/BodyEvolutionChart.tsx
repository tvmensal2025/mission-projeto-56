import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  Tooltip, Legend, Area, AreaChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import PersonagemCorporal3D from '@/components/PersonagemCorporal3D';

interface BodyEvolutionChartProps {
  weightData: Array<{
    date: string;
    time: string;
    value: number;
    type: 'peso' | 'imc' | 'gordura';
  }>;
  bodyCompositionData: {
    gordura: number;
    musculo: number;
    agua: number;
    osso: number;
  };
  userGender?: string | null;
  className?: string;
}

export const BodyEvolutionChart: React.FC<BodyEvolutionChartProps> = ({
  weightData,
  bodyCompositionData,
  userGender,
  className = ''
}) => {
  // Ordenar dados do mais recente para o mais antigo
  const sortedData = [...weightData].reverse();
  
  // Calcular tendência
  const getTrendIcon = () => {
    if (sortedData.length < 2) return <Minus className="h-4 w-4 text-gray-400" />;
    const first = sortedData[0].value;
    const last = sortedData[sortedData.length - 1].value;
    if (first > last) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (first < last) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendText = () => {
    if (sortedData.length < 2) return 'Estável';
    const first = sortedData[0].value;
    const last = sortedData[sortedData.length - 1].value;
    if (first > last) return 'Aumentando';
    if (first < last) return 'Diminuindo';
    return 'Estável';
  };

  return (
    <Card className={`bg-black text-white border-gray-800 ${className}`}>
      <CardHeader>
        <CardTitle className="text-yellow-400 text-center flex items-center justify-center gap-2">
          Evolução Corporal
          {getTrendIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna da Esquerda - Silhueta com Composição */}
          <div className="relative">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-yellow-400">Composição Corporal</h3>
              <p className="text-sm text-gray-400">Distribuição atual dos componentes</p>
            </div>
            
            {/* Modelo 3D sem controles */}
            <div className="relative flex flex-col gap-4">
              <div className="relative flex justify-center items-center">
                {/* Modelo 3D baseado no gênero do usuário */}
                <div className="relative">
                  <PersonagemCorporal3D 
                    genero={userGender === 'male' ? 'masculino' : 'feminino'}
                    className="w-48 h-72"
                  />
                  
                  {/* Números flutuando em volta do personagem 3D - COM FUNDO PRETO */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Gordura - Canto superior direito */}
                    <div className="absolute top-2 right-2 flex flex-col items-center bg-black/90 p-2 rounded-lg backdrop-blur-sm border border-yellow-500/30">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mb-1"></div>
                      <span className="text-yellow-400 text-lg font-bold">{bodyCompositionData.gordura}%</span>
                      <span className="text-yellow-400 text-xs">Gordura</span>
                    </div>
                    
                    {/* Músculo - Canto superior esquerdo */}
                    <div className="absolute top-2 left-2 flex flex-col items-center bg-black/90 p-2 rounded-lg backdrop-blur-sm border border-green-500/30">
                      <div className="w-3 h-3 bg-green-500 rounded-full mb-1"></div>
                      <span className="text-green-400 text-lg font-bold">{bodyCompositionData.musculo}%</span>
                      <span className="text-green-400 text-xs">Músculo</span>
                    </div>
                    
                    {/* Água - Canto inferior direito */}
                    <div className="absolute bottom-2 right-2 flex flex-col items-center bg-black/90 p-2 rounded-lg backdrop-blur-sm border border-blue-500/30">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mb-1"></div>
                      <span className="text-blue-400 text-lg font-bold">{bodyCompositionData.agua}%</span>
                      <span className="text-blue-400 text-xs">Água</span>
                    </div>
                    
                    {/* Osso - Canto inferior esquerdo */}
                    <div className="absolute bottom-2 left-2 flex flex-col items-center bg-black/90 p-2 rounded-lg backdrop-blur-sm border border-purple-500/30">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mb-1"></div>
                      <span className="text-purple-400 text-lg font-bold">{bodyCompositionData.osso}%</span>
                      <span className="text-purple-400 text-xs">Osso</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna da Direita - Gráfico de Evolução */}
          <div>
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-yellow-400">Evolução do Peso</h3>
              <p className="text-sm text-gray-400">Tendência temporal das medições</p>
            </div>
            
            {/* Gráfico de linha */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sortedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                    labelStyle={{ color: '#F9FAFB' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#F97316" 
                    fill="#F97316" 
                    fillOpacity={0.3}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Informações da evolução */}
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Peso Atual:</span>
                <span className="text-lg font-bold text-yellow-400">
                  {sortedData[0]?.value.toFixed(1)} kg
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Tendência:</span>
                <span className="text-sm font-medium text-gray-300">
                  {getTrendText()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Última medição:</span>
                <span className="text-sm text-gray-300">
                  {sortedData[0]?.date} às {sortedData[0]?.time}
                </span>
              </div>
            </div>

            {/* Pontos de dados destacados */}
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Histórico Recente</h4>
              <div className="space-y-2">
                {sortedData.slice(0, 3).map((d, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-yellow-400' : 'bg-gray-500'}`}
                      ></div>
                      <span className={`text-xs ${i === 0 ? 'text-yellow-400 font-bold' : 'text-gray-400'}`}>
                        {d.date} às {d.time}
                      </span>
                    </div>
                    <span className={`text-xs font-medium ${i === 0 ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {d.value.toFixed(1)} kg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 