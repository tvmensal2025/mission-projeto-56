import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

interface GoogleFitData {
  id: string;
  user_id: string;
  data_date: string;
  steps_count?: number;
  distance_meters?: number;
  calories_burned?: number;
  active_minutes?: number;
  heart_rate_avg?: number;
  heart_rate_max?: number;
  heart_rate_resting?: number;
  sleep_duration_minutes?: number;
  sleep_quality_score?: number;
  workout_type?: string;
  workout_duration_minutes?: number;
  workout_intensity?: string;
  sync_timestamp: string;
  created_at: string;
}

interface GoogleFitStats {
  totalSteps: number;
  totalDistance: number;
  totalCalories: number;
  avgHeartRate: number;
  totalActiveMinutes: number;
  avgSleepDuration: number;
  workoutFrequency: number;
}

export function useGoogleFitData() {
  const [loading, setLoading] = useState(false); // Simulado como conectado
  const [error, setError] = useState<string | null>(null);
  const [isConnected] = useState(true); // Sempre conectado para simulação

  // Gerar dados simulados realistas
  const generateRealisticData = () => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        steps_count: Math.floor(Math.random() * 5000) + 6000,
        calories_burned: Math.floor(Math.random() * 300) + 150,
        distance_meters: (Math.random() * 8 + 2) * 1000,
        active_minutes: Math.floor(Math.random() * 60) + 30,
        heart_rate_avg: Math.floor(Math.random() * 15) + 65,
        heart_rate_max: Math.floor(Math.random() * 30) + 140,
        heart_rate_resting: Math.floor(Math.random() * 10) + 55,
        sleep_duration_minutes: (6.5 + Math.random() * 2) * 60,
        sleep_quality_score: Math.floor(Math.random() * 30) + 70,
      };
    });
    return days.reverse();
  };

  const data = generateRealisticData();

  const calculateStats = (data: any[]): GoogleFitStats => {
    if (!data.length) {
      return {
        totalSteps: 0,
        totalDistance: 0,
        totalCalories: 0,
        avgHeartRate: 0,
        totalActiveMinutes: 0,
        avgSleepDuration: 0,
        workoutFrequency: 0
      };
    }

    return {
      totalSteps: data.reduce((sum, d) => sum + (d.steps_count || 0), 0),
      totalDistance: data.reduce((sum, d) => sum + (d.distance_meters || 0), 0) / 1000,
      totalCalories: data.reduce((sum, d) => sum + (d.calories_burned || 0), 0),
      avgHeartRate: data.reduce((sum, d) => sum + (d.heart_rate_avg || 0), 0) / data.length,
      totalActiveMinutes: data.reduce((sum, d) => sum + (d.active_minutes || 0), 0),
      avgSleepDuration: data.reduce((sum, d) => sum + (d.sleep_duration_minutes || 0), 0) / data.length / 60,
      workoutFrequency: Math.floor(Math.random() * 3) + 3
    };
  };

  const weeklyStats = calculateStats(data.slice(-7));
  const monthlyStats = {
    totalSteps: weeklyStats.totalSteps * 4.2,
    totalDistance: weeklyStats.totalDistance * 4.2,
    totalCalories: weeklyStats.totalCalories * 4.2,
    avgHeartRate: weeklyStats.avgHeartRate,
    totalActiveMinutes: weeklyStats.totalActiveMinutes * 4.2,
    avgSleepDuration: weeklyStats.avgSleepDuration,
    workoutFrequency: 18
  };

  const getChartData = () => {
    return {
      stepsData: data.map(d => ({
        date: d.date,
        value: d.steps_count || 0,
        formatted: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      })),
      caloriesData: data.map(d => ({
        date: d.date,
        value: d.calories_burned || 0,
        formatted: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      })),
      heartRateData: data.map(d => ({
        date: d.date,
        avg: d.heart_rate_avg || 0,
        max: d.heart_rate_max || 0,
        resting: d.heart_rate_resting || 0,
        formatted: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      })),
      sleepData: data.map(d => ({
        date: d.date,
        duration: (d.sleep_duration_minutes || 0) / 60,
        quality: d.sleep_quality_score || 0,
        formatted: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      })),
      activityData: data.map(d => ({
        date: d.date,
        minutes: d.active_minutes || 0,
        distance: (d.distance_meters || 0) / 1000,
        formatted: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      }))
    };
  };

  return {
    data,
    loading,
    error,
    weeklyStats,
    monthlyStats,
    isConnected,
    chartData: getChartData(),
    refetch: () => {},
    checkConnection: () => {}
  };
}