import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { GameBadge } from '@/components/gamification/BadgeSystem';
import type { DailyChallenge } from '@/components/gamification/DailyChallenge';

// Este hook está sendo substituído pelo useEnhancedGamification
// Mantido para compatibilidade com componentes existentes

interface GamificationData {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  currentStreak: number;
  bestStreak: number;
  badges: GameBadge[];
  dailyChallenges: DailyChallenge[];
  achievements: number;
  rank: string;
}

export const useGamification = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar dados de gamificação do usuário
  const { data: gamificationData, isLoading } = useQuery({
    queryKey: ['user-gamification'],
    queryFn: async (): Promise<GamificationData> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar XP e nível
      const { data: userStats, error: statsError } = await supabase
        .from('user_goals')
        .select('estimated_points')
        .eq('user_id', user.id)
        .eq('status', 'concluida');

      if (statsError) throw statsError;

      const totalXP = userStats?.reduce((sum, goal) => sum + (goal.estimated_points || 0), 0) || 0;
      const currentLevel = totalXP === 0 ? 1 : Math.floor(totalXP / 1000) + 1;
      const currentXP = totalXP % 1000;
      const xpToNextLevel = 1000 - currentXP;

      // Para novos usuários, streak inicia em 0
      const currentStreak = 0;
      const bestStreak = 0;

      // Badges simulados
      const badges: GameBadge[] = [
        {
          id: '1',
          name: 'Primeira Meta',
          description: 'Complete sua primeira meta',
          icon: 'target',
          color: 'bronze',
          tier: 'bronze',
          requirement: 'Complete 1 meta',
          earned: totalXP > 0,
          earnedAt: totalXP > 0 ? new Date() : undefined
        },
        {
          id: '2',
          name: 'Sequência de Fogo',
          description: 'Mantenha uma sequência de 7 dias',
          icon: 'flame',
          color: 'gold',
          tier: 'gold',
          requirement: 'Sequência de 7 dias',
          earned: currentStreak >= 7,
          progress: currentStreak,
          maxProgress: 7
        },
        {
          id: '3',
          name: 'Mestre dos Pontos',
          description: 'Acumule 5000 pontos de experiência',
          icon: 'crown',
          color: 'platinum',
          tier: 'platinum',
          requirement: '5000 XP',
          earned: totalXP >= 5000,
          progress: totalXP,
          maxProgress: 5000
        },
        {
          id: '4',
          name: 'Lenda',
          description: 'Alcance o nível 10',
          icon: 'gem',
          color: 'diamond',
          tier: 'diamond',
          requirement: 'Nível 10',
          earned: currentLevel >= 10,
          progress: currentLevel,
          maxProgress: 10
        }
      ];

      // Desafios diários simulados
      const dailyChallenges: DailyChallenge[] = [
        {
          id: '1',
          title: 'Progresso Diário',
          description: 'Atualize o progresso de pelo menos uma meta',
          type: 'individual',
          difficulty: 'easy',
          category: 'Disciplina',
          target_value: 1,
          current: 0,
          unit: 'meta',
          xp_reward: 50,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          completed: false
        },
        {
          id: '2',
          title: 'Comunidade Ativa',
          description: 'Participe do feed da comunidade',
          type: 'community',
          difficulty: 'medium',
          category: 'Social',
          target_value: 5,
          current: 2,
          unit: 'interações',
          xp_reward: 100,
          specialReward: 'Badge exclusivo da comunidade',
          expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
          completed: false,
          participants: 342,
          completedBy: 128
        }
      ];

      return {
        currentLevel,
        currentXP,
        xpToNextLevel,
        totalXP,
        currentStreak,
        bestStreak,
        badges,
        dailyChallenges,
        achievements: badges.filter(b => b.earned).length,
        rank: currentLevel >= 10 ? 'Diamond' : currentLevel >= 6 ? 'Gold' : currentLevel >= 3 ? 'Silver' : 'Bronze'
      };
    }
  });

  // Atualizar XP
  const addXPMutation = useMutation({
    mutationFn: async ({ amount, reason }: { amount: number; reason: string }) => {
      // Aqui você pode implementar a lógica para salvar no banco
      console.log(`Adicionando ${amount} XP por: ${reason}`);
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true, newXP: (gamificationData?.totalXP || 0) + amount };
    },
    onSuccess: (data, variables) => {
      toast({
        title: `+${variables.amount} XP!`,
        description: variables.reason,
      });
      
      queryClient.invalidateQueries({ queryKey: ['user-gamification'] });
    }
  });

  // Completar desafio
  const completeChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const challenge = gamificationData?.dailyChallenges.find(c => c.id === challengeId);
      if (!challenge) throw new Error('Desafio não encontrado');

      // Simular conclusão
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { challenge, xpEarned: challenge.xp_reward };
    },
    onSuccess: (data) => {
      toast({
        title: 'Desafio Concluído! 🎉',
        description: `Você ganhou ${data.xpEarned} XP!`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['user-gamification'] });
    }
  });

  return {
    gamificationData,
    isLoading,
    addXP: addXPMutation.mutate,
    isAddingXP: addXPMutation.isPending,
    completeChallenge: completeChallengeMutation.mutate,
    isCompletingChallenge: completeChallengeMutation.isPending
  };
};