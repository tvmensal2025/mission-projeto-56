import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, AreaChart, Area, ComposedChart, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';
import { Footprints, Heart, Flame, Clock, Moon, Activity, Target, TrendingUp, Zap } from 'lucide-react';

interface GoogleFitChartsProps {
  chartData: {
    stepsData: Array<{ date: string; value: number; formatted: string }>;
    caloriesData: Array<{ date: string; value: number; formatted: string }>;
    heartRateData: Array<{ date: string; avg: number; max: number; resting: number; formatted: string }>;
    sleepData: Array<{ date: string; duration: number; quality: number; formatted: string }>;
    activityData: Array<{ date: string; minutes: number; distance: number; formatted: string }>;
  };
  cardVariants: any;
}

export const GoogleFitCharts: React.FC<GoogleFitChartsProps> = ({ chartData, cardVariants }) => {
  const { stepsData, caloriesData, heartRateData, sleepData, activityData } = chartData;

  // Verificar se há dados disponíveis
  const hasStepsData = stepsData.some(d => d.value > 0);
  const hasCaloriesData = caloriesData.some(d => d.value > 0);
  const hasHeartRateData = heartRateData.some(d => d.avg > 0);
  const hasSleepData = sleepData.some(d => d.duration > 0);
  const hasActivityData = activityData.some(d => d.minutes > 0);

  if (!hasStepsData && !hasCaloriesData && !hasHeartRateData && !hasSleepData && !hasActivityData) {
    return (
      <motion.div variants={cardVariants} whileHover="hover">
        <Card className="p-6">
          <div className="text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Dados do Google Fit Não Disponíveis</h3>
            <p className="text-muted-foreground">
              Conecte-se ao Google Fit para visualizar seus dados de atividade.
            </p>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header dos Gráficos */}
      <div className="flex items-center gap-2 mb-6">
        <Zap className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Análise Detalhada de Atividade</h2>
      </div>

      {/* Grid Principal de Gráficos */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        
        {/* Gráfico de Passos com Metas */}
        <motion.div variants={cardVariants} whileHover="hover" className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Footprints className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Evolução de Passos</h3>
                    <p className="text-sm text-muted-foreground">Últimos 14 dias com meta diária</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {stepsData.reduce((sum, d) => sum + d.value, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total do período</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={stepsData.slice(-14).reverse()}>
                  <defs>
                    <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="formatted"
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                  />
                  <YAxis 
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                  />
                  <Tooltip 
                    formatter={(value: number) => [value.toLocaleString(), 'Passos']}
                    labelFormatter={(label) => `Data: ${label}`}
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <ReferenceLine y={10000} stroke="#22c55e" strokeDasharray="5 5" />
                  <Bar 
                    dataKey="value" 
                    fill="url(#stepsGradient)" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#1d4ed8" 
                    strokeWidth={3}
                    dot={{ fill: '#1d4ed8', strokeWidth: 2, r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground">Meta: 10.000 passos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-muted-foreground">
                    {stepsData.filter(d => d.value >= 10000).length}/{stepsData.length} dias atingidos
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Gráfico de Calorias */}
        <motion.div variants={cardVariants} whileHover="hover">
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Queima de Calorias</h3>
                  <p className="text-sm text-muted-foreground">Progressão diária</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={caloriesData.slice(-14).reverse()}>
                  <defs>
                    <linearGradient id="caloriesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                  <XAxis 
                    dataKey="formatted"
                    tick={{ fontSize: 12 }}
                    stroke="#c2410c"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#c2410c"
                  />
                  <Tooltip 
                    formatter={(value: number) => [value, 'Calorias']}
                    labelFormatter={(label) => `Data: ${label}`}
                    contentStyle={{
                      backgroundColor: '#fff7ed',
                      border: '1px solid #fed7aa',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#f97316" 
                    fill="url(#caloriesGradient)" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-lg font-bold text-orange-600">
                    {Math.round(caloriesData.reduce((sum, d) => sum + d.value, 0) / caloriesData.length)}
                  </div>
                  <div className="text-muted-foreground">Média diária</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">
                    {Math.max(...caloriesData.map(d => d.value))}
                  </div>
                  <div className="text-muted-foreground">Recorde</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Gráfico de Atividade Física */}
        <motion.div variants={cardVariants} whileHover="hover">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Atividade Física</h3>
                  <p className="text-sm text-muted-foreground">Minutos ativos + distância</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={activityData.slice(-14).reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#bbf7d0" />
                  <XAxis 
                    dataKey="formatted"
                    tick={{ fontSize: 12 }}
                    stroke="#059669"
                  />
                  <YAxis 
                    yAxisId="minutes"
                    orientation="left"
                    tickFormatter={(value) => `${value}min`}
                    tick={{ fontSize: 12 }}
                    stroke="#059669"
                  />
                  <YAxis 
                    yAxisId="distance"
                    orientation="right"
                    tickFormatter={(value) => `${value}km`}
                    tick={{ fontSize: 12 }}
                    stroke="#0891b2"
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'minutes' ? `${value} min` : `${value.toFixed(1)} km`,
                      name === 'minutes' ? 'Minutos Ativos' : 'Distância'
                    ]}
                    labelFormatter={(label) => `Data: ${label}`}
                    contentStyle={{
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    yAxisId="minutes"
                    dataKey="minutes" 
                    fill="#10b981" 
                    name="Minutos Ativos"
                    radius={[2, 2, 0, 0]}
                  />
                  <Line 
                    yAxisId="distance"
                    type="monotone" 
                    dataKey="distance" 
                    stroke="#0891b2" 
                    name="Distância (km)"
                    strokeWidth={3}
                    dot={{ fill: '#0891b2', strokeWidth: 2, r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Gráfico de Frequência Cardíaca Completo */}
        <motion.div variants={cardVariants} whileHover="hover" className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Monitoramento Cardíaco</h3>
                    <p className="text-sm text-muted-foreground">Frequência cardíaca em repouso, média e máxima</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">
                    {Math.round(heartRateData.reduce((sum, d) => sum + d.avg, 0) / heartRateData.length)}
                  </div>
                  <div className="text-sm text-muted-foreground">BPM médio</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={heartRateData.slice(-14).reverse()}>
                  <defs>
                    <linearGradient id="heartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fecaca" />
                  <XAxis 
                    dataKey="formatted"
                    tick={{ fontSize: 12 }}
                    stroke="#dc2626"
                  />
                  <YAxis 
                    domain={['dataMin - 10', 'dataMax + 10']}
                    tick={{ fontSize: 12 }}
                    stroke="#dc2626"
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value} bpm`, 
                      name === 'resting' ? 'Repouso' : 
                      name === 'avg' ? 'Média' : 'Máxima'
                    ]}
                    labelFormatter={(label) => `Data: ${label}`}
                    contentStyle={{
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="max"
                    stroke="#ef4444"
                    fill="url(#heartGradient)"
                    fillOpacity={0.2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resting" 
                    stroke="#22c55e" 
                    name="Repouso"
                    strokeWidth={3}
                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avg" 
                    stroke="#3b82f6" 
                    name="Média"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="max" 
                    stroke="#ef4444" 
                    name="Máxima"
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
                  />
                  <ReferenceLine y={180} stroke="#f59e0b" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {Math.round(heartRateData.reduce((sum, d) => sum + d.resting, 0) / heartRateData.length)}
                  </div>
                  <div className="text-muted-foreground">Repouso médio</div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {Math.round(heartRateData.reduce((sum, d) => sum + d.avg, 0) / heartRateData.length)}
                  </div>
                  <div className="text-muted-foreground">Média geral</div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-lg font-bold text-red-600">
                    {Math.max(...heartRateData.map(d => d.max))}
                  </div>
                  <div className="text-muted-foreground">Pico máximo</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Gráfico de Sono */}
        <motion.div variants={cardVariants} whileHover="hover" className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Moon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Qualidade do Sono</h3>
                    <p className="text-sm text-muted-foreground">Duração e qualidade do sono - últimos 14 dias</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {(sleepData.reduce((sum, d) => sum + d.duration, 0) / sleepData.length).toFixed(1)}h
                  </div>
                  <div className="text-sm text-muted-foreground">Média de sono</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={sleepData.slice(-14).reverse()}>
                  <defs>
                    <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d8b4fe" />
                  <XAxis 
                    dataKey="formatted"
                    tick={{ fontSize: 12 }}
                    stroke="#7c3aed"
                  />
                  <YAxis 
                    yAxisId="duration"
                    orientation="left"
                    tickFormatter={(value) => `${value}h`}
                    tick={{ fontSize: 12 }}
                    stroke="#7c3aed"
                  />
                  <YAxis 
                    yAxisId="quality"
                    orientation="right"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fontSize: 12 }}
                    stroke="#06b6d4"
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'duration' ? `${value.toFixed(1)}h` : `${value}%`,
                      name === 'duration' ? 'Duração' : 'Qualidade'
                    ]}
                    labelFormatter={(label) => `Data: ${label}`}
                    contentStyle={{
                      backgroundColor: '#faf5ff',
                      border: '1px solid #d8b4fe',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <ReferenceLine yAxisId="duration" y={8} stroke="#22c55e" strokeDasharray="5 5" />
                  <Bar 
                    yAxisId="duration"
                    dataKey="duration" 
                    fill="url(#sleepGradient)" 
                    name="Duração (h)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line 
                    yAxisId="quality"
                    type="monotone" 
                    dataKey="quality" 
                    stroke="#06b6d4" 
                    name="Qualidade (%)"
                    strokeWidth={3}
                    dot={{ fill: '#06b6d4', strokeWidth: 2, r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {(sleepData.reduce((sum, d) => sum + d.duration, 0) / sleepData.length).toFixed(1)}h
                  </div>
                  <div className="text-muted-foreground">Duração média</div>
                </div>
                <div className="text-center p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                  <div className="text-lg font-bold text-cyan-600">
                    {Math.round(sleepData.reduce((sum, d) => sum + d.quality, 0) / sleepData.length)}%
                  </div>
                  <div className="text-muted-foreground">Qualidade média</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {sleepData.filter(d => d.duration >= 8).length}
                  </div>
                  <div className="text-muted-foreground">Noites 8h+</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};