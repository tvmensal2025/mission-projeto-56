import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GamificationData {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  currentStreak: number;
  bestStreak: number;
  badges: any[];
  dailyChallenges: DailyChallenge[];
  achievements: number;
  rank: string;
  lastActivityDate: string;
}

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  difficulty: string;
  target_value: number;
  xp_reward: number;
  category: string;
  progress?: number;
  is_completed?: boolean;
  expires_at?: Date;
}

export const useEnhancedGamification = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Temporário - usar dados mock
  const { data: gamificationData, isLoading } = useQuery({
    queryKey: ['enhanced-gamification'],
    queryFn: async (): Promise<GamificationData | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Mock data temporário
      const mockDailyChallenges: DailyChallenge[] = [
        {
          id: '1',
          title: 'Hidratação Diária',
          description: 'Beba 2L de água',
          challenge_type: 'hydration',
          difficulty: 'easy',
          target_value: 2,
          xp_reward: 50,
          category: 'health',
          progress: 0,
          is_completed: false,
          expires_at: new Date(Date.now() + (24 * 60 * 60 * 1000))
        }
      ];

      const badges = [
        {
          id: '1',
          name: 'Primeira Resposta',
          description: 'Complete sua primeira missão diária',
          icon: 'target',
          color: 'bronze',
          tier: 'bronze',
          earned: false,
          progress: 0,
          maxProgress: 1
        }
      ];

      return {
        currentLevel: 1,
        currentXP: 0,
        xpToNextLevel: 1000,
        totalXP: 0,
        currentStreak: 0,
        bestStreak: 0,
        badges,
        dailyChallenges: mockDailyChallenges,
        achievements: 0,
        rank: 'Bronze',
        lastActivityDate: new Date().toISOString()
      };
    },
    refetchInterval: 30000
  });

  // Mock mutations
  const completeChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      console.log('Completing challenge:', challengeId);
      await new Promise(resolve => setTimeout(resolve, 500));
      return { challenge: { title: 'Mock Challenge' }, xpEarned: 50 };
    },
    onSuccess: (data) => {
      toast({
        title: 'Desafio Concluído! 🎉',
        description: `Você ganhou ${data.xpEarned} XP!`,
      });
    }
  });

  const updateChallengeProgressMutation = useMutation({
    mutationFn: async ({ challengeId, progress }: { challengeId: string; progress: number }) => {
      console.log('Updating progress:', challengeId, progress);
      await new Promise(resolve => setTimeout(resolve, 500));
      return { challengeId, progress, isCompleted: progress >= 100, xpEarned: 50 };
    },
    onSuccess: (data) => {
      if (data.isCompleted) {
        toast({
          title: 'Desafio Concluído! 🎉',
          description: `+${data.xpEarned} XP!`,
        });
      }
    }
  });

  const getTrackingProgress = async (type: string): Promise<number> => {
    console.log('Getting tracking progress for:', type);
    return 0;
  };

  return {
    gamificationData,
    isLoading,
    completeChallenge: completeChallengeMutation.mutate,
    isCompletingChallenge: completeChallengeMutation.isPending,
    updateChallengeProgress: updateChallengeProgressMutation.mutate,
    isUpdatingProgress: updateChallengeProgressMutation.isPending,
    getTrackingProgress
  };
};