import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAnamnesisStatus = () => {
  const [hasCompletedAnamnesis, setHasCompletedAnamnesis] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAnamnesisStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setHasCompletedAnamnesis(false);
          setIsLoading(false);
          return;
        }

        // Temporário - simular até tipos serem atualizados
        console.log('Checking anamnesis status for user:', user.id);
        setHasCompletedAnamnesis(false);
        setIsLoading(false);
        return;
      } catch (error) {
        console.error('Erro ao verificar anamnese:', error);
        setHasCompletedAnamnesis(false);
        setIsLoading(false);
      }
    };

    checkAnamnesisStatus();

    // Escutar mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAnamnesisStatus();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { hasCompletedAnamnesis, isLoading };
};