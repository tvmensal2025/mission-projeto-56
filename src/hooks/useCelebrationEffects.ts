import { useState, useCallback } from 'react';

export type CelebrationEffect = 'confetti' | 'fireworks' | 'balloons';

export const useCelebrationEffects = () => {
  const [activeCelebration, setActiveCelebration] = useState<{
    type: CelebrationEffect;
    trigger: boolean;
  } | null>(null);

  const celebrate = useCallback((type: CelebrationEffect = 'confetti') => {
    setActiveCelebration({ type, trigger: true });
    
    // Reset após um pequeno delay para permitir re-trigger
    setTimeout(() => {
      setActiveCelebration(null);
    }, 100);
  }, []);

  const celebrateGoalCompletion = useCallback(() => {
    celebrate('confetti');
  }, [celebrate]);

  const celebrateChallengeCompletion = useCallback(() => {
    celebrate('fireworks');
  }, [celebrate]);

  const celebrateSpecialAchievement = useCallback(() => {
    celebrate('balloons');
  }, [celebrate]);

  return {
    activeCelebration,
    celebrate,
    celebrateGoalCompletion,
    celebrateChallengeCompletion,
    celebrateSpecialAchievement
  };
};