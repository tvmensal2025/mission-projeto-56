import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/integrations/supabase/client-local';

interface UserPoints {
  total_points: number;
  current_streak: number;
  level: number;
  experience: number;
}

export const useUserPoints = () => {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserPoints();
  }, []);

  const fetchUserPoints = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('points, level, experience')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar pontos do usuário:', error);
        } else {
          setUserPoints({
            total_points: profileData?.points || 0,
            current_streak: 0, // Implementar lógica de streak
            level: profileData?.level || 1,
            experience: profileData?.experience || 0
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar pontos do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserPoints = async (pointsToAdd: number) => {
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          points: (userPoints?.total_points || 0) + pointsToAdd
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualizar estado local
      setUserPoints(prev => prev ? {
        ...prev,
        total_points: prev.total_points + pointsToAdd
      } : null);
    } catch (error) {
      console.error('Erro ao atualizar pontos:', error);
      throw error;
    }
  };

  return {
    userPoints,
    loading,
    updateUserPoints,
    fetchUserPoints
  };
}; 