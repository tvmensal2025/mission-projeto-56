import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useGoogleFitData } from '../hooks/useGoogleFitData';
import { motion } from 'framer-motion';
import { Skeleton } from './ui/skeleton';
import { GoogleFitCharts } from './progress/GoogleFitCharts';
import { OverviewWithGoogleFit } from './progress/OverviewWithGoogleFit';
import { ArrowLeft, Activity, Target, TrendingUp } from 'lucide-react';

const MyProgress: React.FC = () => {
  // Usar dados centralizados do hook
  const {
    loading,
    error,
    weeklyStats,
    monthlyStats,
    isConnected,
    chartData
  } = useGoogleFitData();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1 
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -5, transition: { duration: 0.2 } }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-6 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              Meu Progresso - Google Fit
            </h1>
            <p className="text-muted-foreground text-lg">
              Acompanhe sua atividade física e evolução de saúde integrada
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-700 dark:text-green-400 font-medium">Google Fit Conectado</span>
        </div>
      </div>

      {/* Cards de estatísticas principais */}
      <motion.div
        variants={cardVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="mobile-padding text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="mobile-stat-number text-blue-700 dark:text-blue-300">
              {weeklyStats.totalSteps.toLocaleString()}
            </div>
            <div className="text-xs lg:text-sm text-blue-600 dark:text-blue-400">Passos esta semana</div>
            <div className="text-xs text-muted-foreground mt-1">+12% vs semana anterior</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <CardContent className="mobile-padding text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="mobile-stat-number text-orange-700 dark:text-orange-300">
              {weeklyStats.totalCalories}
            </div>
            <div className="text-xs lg:text-sm text-orange-600 dark:text-orange-400">Calorias queimadas</div>
            <div className="text-xs text-muted-foreground mt-1">+8% vs semana anterior</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="mobile-padding text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="mobile-stat-number text-green-700 dark:text-green-300">
              {weeklyStats.totalDistance.toFixed(1)} km
            </div>
            <div className="text-xs lg:text-sm text-green-600 dark:text-green-400">Distância percorrida</div>
            <div className="text-xs text-muted-foreground mt-1">+15% vs semana anterior</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="mobile-padding text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="mobile-stat-number text-purple-700 dark:text-purple-300">
              {weeklyStats.avgHeartRate}
            </div>
            <div className="text-xs lg:text-sm text-purple-600 dark:text-purple-400">BPM médio</div>
            <div className="text-xs text-muted-foreground mt-1">Zona ideal</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Resumo Semanal Detalhado */}
      <motion.div variants={cardVariants}>
        <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Resumo Semanal Completo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="text-center mobile-padding bg-background rounded-lg border">
                <div className="mobile-text-lg font-bold text-primary">
                  {weeklyStats.totalSteps.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Passos Totais</div>
              </div>
              <div className="text-center mobile-padding bg-background rounded-lg border">
                <div className="mobile-text-lg font-bold text-orange-600">
                  {weeklyStats.totalCalories}
                </div>
                <div className="text-xs text-muted-foreground">Calorias</div>
              </div>
              <div className="text-center mobile-padding bg-background rounded-lg border">
                <div className="mobile-text-lg font-bold text-green-600">
                  {weeklyStats.totalDistance.toFixed(1)} km
                </div>
                <div className="text-xs text-muted-foreground">Distância</div>
              </div>
              <div className="text-center mobile-padding bg-background rounded-lg border">
                <div className="mobile-text-lg font-bold text-red-600">
                  {weeklyStats.avgHeartRate}
                </div>
                <div className="text-xs text-muted-foreground">BPM Médio</div>
              </div>
              <div className="text-center mobile-padding bg-background rounded-lg border">
                <div className="mobile-text-lg font-bold text-purple-600">
                  {weeklyStats.totalActiveMinutes}
                </div>
                <div className="text-xs text-muted-foreground">Min. Ativos</div>
              </div>
              <div className="text-center mobile-padding bg-background rounded-lg border">
                <div className="mobile-text-lg font-bold text-blue-600">
                  {weeklyStats.avgSleepDuration.toFixed(1)}h
                </div>
                <div className="text-xs text-muted-foreground">Sono Médio</div>
              </div>
              <div className="text-center mobile-padding bg-background rounded-lg border">
                <div className="mobile-text-lg font-bold text-indigo-600">
                  {weeklyStats.workoutFrequency}
                </div>
                <div className="text-xs text-muted-foreground">Treinos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Gráficos do Google Fit - Integrados */}
      <GoogleFitCharts 
        chartData={chartData}
        cardVariants={cardVariants}
      />

      {/* Overview com integração dos dados da balança */}
      <OverviewWithGoogleFit 
        score={85}
        currentWeight={75.8}
        weightTrend={-2.3}
        bmi={24.2}
        bodyFat={{ value: 18.5, trend: -1.2 }}
        muscleMass={{ value: 58.2, trend: 0.8 }}
        measurementDays={42}
        weeklyFitStats={weeklyStats}
        isGoogleFitConnected={true}
        getScoreGradient={(score: number) => 
          score >= 80 ? 'from-green-400 to-green-600' :
          score >= 60 ? 'from-yellow-400 to-yellow-600' :
          score >= 40 ? 'from-orange-400 to-orange-600' :
          'from-red-400 to-red-600'
        }
        cardVariants={cardVariants}
        scoreVariants={{
          hidden: { scale: 0.8, opacity: 0 },
          visible: { 
            scale: 1, 
            opacity: 1,
            transition: { 
              duration: 0.5,
              ease: "easeOut"
            }
          }
        }}
      />

      {/* Estatísticas Mensais */}
      <motion.div variants={cardVariants}>
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Evolução Mensal - Últimos 30 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="mobile-stat-number text-primary">
                  {monthlyStats.totalSteps.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Passos Totais</div>
                <div className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                  +18% vs mês anterior
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="mobile-stat-number text-orange-600">
                  {monthlyStats.totalCalories.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Calorias Totais</div>
                <div className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                  +14% vs mês anterior
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="mobile-stat-number text-blue-600">
                  {monthlyStats.totalDistance.toFixed(1)} km
                </div>
                <div className="text-sm text-muted-foreground">Distância Total</div>
                <div className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                  +22% vs mês anterior
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="mobile-stat-number text-purple-600">
                  {monthlyStats.totalActiveMinutes}
                </div>
                <div className="text-sm text-muted-foreground">Minutos Ativos</div>
                <div className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                  +11% vs mês anterior
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default MyProgress;