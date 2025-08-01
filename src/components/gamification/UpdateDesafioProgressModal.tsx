import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Slider } from '@/components/ui/slider';
import { Camera, Plus, Zap, Trophy, Target, Award, Star, Clock, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ProgressRing } from '@/components/gamification/ProgressRing';
import { ConfettiAnimation, useConfetti } from '@/components/gamification/ConfettiAnimation';
import { VisualEffectsManager, useAlternatingEffects } from '@/components/gamification/VisualEffectsManager';
import { useCommunityShare } from '@/hooks/useCommunityShare';
import { useCelebrationEffects } from '@/hooks/useCelebrationEffects';

interface Desafio {
  id: string;
  title: string;
  daily_log_target: number;
  daily_log_unit: string;
  difficulty: string;
  points_reward: number;
  badge_icon: string;
  user_participation?: {
    id: string;
    progress: number;
    is_completed: boolean;
    started_at: string;
  };
}

interface UpdateDesafioProgressModalProps {
  desafio?: Desafio;
  isOpen?: boolean;
  onClose?: () => void;
  onProgressUpdate?: (newProgress: number) => void;
}

const difficultyColors = {
  facil: 'from-green-500 to-green-600',
  medio: 'from-yellow-500 to-orange-500',
  dificil: 'from-orange-500 to-red-500',
  extremo: 'from-red-500 to-pink-500'
};

const difficultyIcons = {
  facil: Star,
  medio: Target,
  dificil: Trophy,
  extremo: Flame
};

export const UpdateDesafioProgressModal = ({ 
  desafio, 
  isOpen,
  onClose,
  onProgressUpdate
}: UpdateDesafioProgressModalProps) => {
  const [newValue, setNewValue] = useState(desafio?.user_participation?.progress || 0);
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [shareToFeed, setShareToFeed] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { trigger, celebrate } = useConfetti();
  const { trigger: effectTrigger, currentEffect, celebrateWithEffects } = useAlternatingEffects();
  const { shareToHealthFeed, generateProgressMessage, suggestTags, isSharing } = useCommunityShare();
  const { celebrateDesafioCompletion } = useCelebrationEffects();

  const effectiveDesafio = desafio || {
    id: '',
    title: '',
    daily_log_target: 100,
    daily_log_unit: 'unidade',
    difficulty: 'medio',
    points_reward: 100,
    badge_icon: '🏆'
  };

  const calculateProgress = (value: number) => {
    if (!effectiveDesafio.daily_log_target || effectiveDesafio.daily_log_target === 0) return 0;
    return Math.min((value / effectiveDesafio.daily_log_target) * 100, 100);
  };

  const progressPercentage = calculateProgress(newValue);
  const isCompleted = newValue >= effectiveDesafio.daily_log_target;
  const isNearComplete = progressPercentage >= 80;
  const DifficultyIcon = difficultyIcons[effectiveDesafio.difficulty as keyof typeof difficultyIcons] || Target;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Proteção contra duplo clique
    if (isLoading) return;
    
    setIsLoading(true);

    try {
      // Buscar usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar participação do usuário
      const { data: participationData, error: participationError } = await supabase
        .from('challenge_participations')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_id', effectiveDesafio.id)
        .single();

      if (participationError) {
        throw new Error('Participação não encontrada. Participe do desafio primeiro.');
      }

      // Atualizar progresso
      const { error: updateError } = await supabase
        .from('challenge_participations')
        .update({
          progress: newValue,
          is_completed: isCompleted,
          updated_at: new Date().toISOString()
        })
        .eq('id', participationData.id);

      if (updateError) {
        throw updateError;
      }

      // Se completou, adicionar pontos ao perfil
      if (isCompleted && !participationData.is_completed) {
        const { error: pointsError } = await supabase
          .from('profiles')
          .update({
            points: (supabase as any).rpc('increment_points', { 
              user_id: user.id, 
              points_to_add: effectiveDesafio.points_reward 
            }),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (pointsError) {
          console.error('Erro ao adicionar pontos:', pointsError);
        }
      }

      // Registrar log diário se fornecido
      if (notes) {
        const { error: logError } = await supabase
          .from('challenge_daily_logs')
          .insert({
            participation_id: participationData.id,
            log_date: new Date().toISOString().split('T')[0],
            value_logged: notes,
            numeric_value: newValue,
            notes: notes
          });

        if (logError) {
          console.error('Erro ao registrar log:', logError);
        }
      }

      // Efeitos de celebração
      if (isCompleted) {
        celebrateWithEffects();
        celebrateDesafioCompletion();
        toast({
          title: "🎉 Desafio Concluído!",
          description: `Parabéns! Você ganhou ${effectiveDesafio.points_reward} pontos!`,
        });
      } else {
        celebrateWithEffects();
        toast({
          title: "💪 Progresso Atualizado!",
          description: `${newValue} ${effectiveDesafio.daily_log_unit} registrados`,
        });
      }

      // Chamar callback se fornecido
      if (onProgressUpdate) {
        onProgressUpdate(progressPercentage);
      }

      onClose?.();
    } catch (error: any) {
      console.error('Erro ao atualizar progresso:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o progresso.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdd = (increment: number) => {
    const newVal = Math.min(newValue + increment, effectiveDesafio.daily_log_target);
    setNewValue(newVal);
  };

  return (
    <>
      <ConfettiAnimation trigger={trigger} />
      <VisualEffectsManager 
        trigger={effectTrigger} 
        effectType={currentEffect}
        duration={3000}
      />
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <motion.div
                className={`p-2 bg-gradient-to-br ${difficultyColors[effectiveDesafio.difficulty as keyof typeof difficultyColors]} rounded-full`}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <DifficultyIcon className="w-5 h-5 text-white" />
              </motion.div>
              Atualizar Progresso - {effectiveDesafio.title}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Progresso Atual */}
            <div className="space-y-2">
              <Label>Progresso Atual</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    type="number"
                    value={newValue}
                    onChange={(e) => setNewValue(Number(e.target.value))}
                    min={0}
                    max={effectiveDesafio.daily_log_target}
                    step={0.1}
                    className="text-center"
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  / {effectiveDesafio.daily_log_target} {effectiveDesafio.daily_log_unit}
                </span>
              </div>
              
              {/* Slider */}
              <Slider
                value={[newValue]}
                onValueChange={(value) => setNewValue(value[0])}
                max={effectiveDesafio.daily_log_target}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Barra de Progresso */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <motion.div
                  className={`h-2.5 rounded-full ${
                    isCompleted ? 'bg-green-500' : 
                    isNearComplete ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Botões Rápidos */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAdd(0.5)}
                disabled={newValue >= effectiveDesafio.daily_log_target}
              >
                +0.5
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAdd(1)}
                disabled={newValue >= effectiveDesafio.daily_log_target}
              >
                +1
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAdd(2)}
                disabled={newValue >= effectiveDesafio.daily_log_target}
              >
                +2
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNewValue(effectiveDesafio.daily_log_target)}
                disabled={newValue >= effectiveDesafio.daily_log_target}
              >
                Completar
              </Button>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Como foi sua experiência hoje?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Compartilhar */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="share"
                checked={shareToFeed}
                onCheckedChange={(checked) => setShareToFeed(checked as boolean)}
              />
              <Label htmlFor="share">Compartilhar na comunidade</Label>
            </div>

            {shareToFeed && (
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem personalizada</Label>
                <Textarea
                  id="message"
                  placeholder="Compartilhe sua conquista!"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={2}
                />
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Salvar Progresso
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}; 