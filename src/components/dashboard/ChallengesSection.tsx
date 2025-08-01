import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, Users, Calendar, Target, Dumbbell, 
  Droplets, Brain, Apple, Moon, Scale, Timer, ArrowLeft, 
  Star, Zap, CheckCircle, Plus, Flame
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { UpdateChallengeProgressModal } from '@/components/gamification/UpdateChallengeProgressModal';
import { User } from '@supabase/supabase-js';
import { VisualEffectsManager } from '@/components/gamification/VisualEffectsManager';
import { useCelebrationEffects } from '@/hooks/useCelebrationEffects';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_days: number;
  points_reward: number;
  badge_icon: string;
  badge_name: string;
  instructions: string;
  tips: string[];
  is_active: boolean;
  is_featured: boolean;
  is_group_challenge: boolean;
  target_value?: number;
  user_participation?: {
    id: string;
    progress: number;
    is_completed: boolean;
    started_at: string;
  };
}

interface ChallengesSectionProps {
  user: User | null;
}

const ChallengesSection: React.FC<ChallengesSectionProps> = ({ user }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const { toast } = useToast();
  const { activeCelebration, celebrateChallengeCompletion } = useCelebrationEffects();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      // Temporário - usar dados mock até que os tipos sejam atualizados
      const mockChallenges: Challenge[] = [
        {
          id: '1',
          title: 'Hidratação Diária',
          description: 'Beba 2L de água todos os dias por uma semana',
          category: 'hidratacao',
          difficulty: 'facil',
          duration_days: 7,
          points_reward: 50,
          badge_icon: '💧',
          badge_name: 'Hidratado',
          instructions: 'Beba pelo menos 2 litros de água por dia',
          tips: ['Use um app para lembrar', 'Tenha sempre uma garrafa por perto'],
          is_active: true,
          is_featured: true,
          is_group_challenge: false,
          target_value: 14,
          user_participation: null
        },
        {
          id: '2',
          title: 'Exercício Matinal',
          description: 'Faça 30 minutos de exercício todas as manhãs',
          category: 'exercicio',
          difficulty: 'medio',
          duration_days: 14,
          points_reward: 120,
          badge_icon: '🏃‍♂️',
          badge_name: 'Atleta Matinal',
          instructions: 'Exercite-se por 30 minutos todas as manhãs',
          tips: ['Comece devagar', 'Prepare a roupa na noite anterior'],
          is_active: true,
          is_featured: false,
          is_group_challenge: true,
          target_value: 14,
          user_participation: null
        },
        {
          id: '3',
          title: 'Alimentação Saudável',
          description: 'Coma 5 porções de frutas e vegetais por dia',
          category: 'nutricao',
          difficulty: 'medio',
          duration_days: 21,
          points_reward: 200,
          badge_icon: '🥗',
          badge_name: 'Nutricionista',
          instructions: 'Inclua 5 porções de frutas e vegetais em suas refeições diárias',
          tips: ['Planeje as refeições', 'Varie as cores dos alimentos'],
          is_active: true,
          is_featured: false,
          is_group_challenge: false,
          target_value: 105,
          user_participation: null
        }
      ];
      
      setChallenges(mockChallenges);
    } catch (error) {
      console.error('Erro ao carregar desafios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os desafios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'jejum': return <Timer className="h-5 w-5" />;
      case 'exercicio': return <Dumbbell className="h-5 w-5" />;
      case 'hidratacao': return <Droplets className="h-5 w-5" />;
      case 'mindfulness': return <Brain className="h-5 w-5" />;
      case 'nutricao': return <Apple className="h-5 w-5" />;
      case 'sono': return <Moon className="h-5 w-5" />;
      case 'medicao': return <Scale className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getDifficultyGradient = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'from-green-500 to-green-600';
      case 'medio': return 'from-yellow-500 to-orange-500';
      case 'dificil': return 'from-orange-500 to-red-500';
      case 'extremo': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return Star;
      case 'medio': return Target;
      case 'dificil': return Trophy;
      case 'extremo': return Trophy;
      default: return Target;
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'Fácil';
      case 'medio': return 'Médio';
      case 'dificil': return 'Difícil';
      case 'extremo': return 'Extremo';
      default: return difficulty;
    }
  };

  const handleChallengeClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };

  const joinChallenge = async (challengeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para participar dos desafios",
        variant: "destructive"
      });
      return;
    }

    try {
      // Buscar o desafio para obter o target_value
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) {
        throw new Error("Desafio não encontrado");
      }

      // Inserir participação na tabela challenge_participations
      // Convertemos o challengeId string para UUID válido
      const challengeUuid = challengeId === "1" ? "01234567-89ab-cdef-0123-456789abcdef" :
                            challengeId === "2" ? "11234567-89ab-cdef-0123-456789abcdef" :
                            challengeId === "3" ? "21234567-89ab-cdef-0123-456789abcdef" :
                            crypto.randomUUID();
      
      const { error } = await supabase
        .from('challenge_participations')
        .insert({
          user_id: user.id,
          challenge_id: challengeUuid,
          target_value: challenge.target_value || 100,
          progress: 0,
          started_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Participação confirmada!",
        description: `Você agora está participando do desafio: ${challenge.title}`,
      });

      // Trigger celebration effect for joining challenge
      celebrateChallengeCompletion();

      // Atualizar estado local
      setChallenges(prev => prev.map(c => 
        c.id === challengeId 
          ? {
              ...c,
              user_participation: {
                id: 'temp-id',
                progress: 0,
                is_completed: false,
                started_at: new Date().toISOString()
              }
            }
          : c
      ));

      // Recarregar para sincronizar com o banco
      fetchChallenges();
    } catch (error: any) {
      toast({
        title: "Erro ao participar do desafio",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdateProgress = () => {
    setShowUpdateModal(true);
  };

  const handleProgressUpdate = (newProgress: number) => {
    if (selectedChallenge) {
      // Atualizar o estado local
      setChallenges(prev => prev.map(challenge => 
        challenge.id === selectedChallenge.id 
          ? {
              ...challenge,
              user_participation: challenge.user_participation ? {
                ...challenge.user_participation,
                progress: newProgress,
                is_completed: newProgress >= 100
              } : challenge.user_participation
            }
          : challenge
      ));

      // Atualizar o desafio selecionado
      setSelectedChallenge(prev => prev ? {
        ...prev,
        user_participation: prev.user_participation ? {
          ...prev.user_participation,
          progress: newProgress,
          is_completed: newProgress >= 100
        } : prev.user_participation
      } : null);
    }
    setShowUpdateModal(false);
  };

  const renderChallengesList = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando desafios...</p>
          </div>
        </div>
      );
    }

    if (challenges.length === 0) {
      return (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum desafio disponível</h3>
          <p className="text-muted-foreground">Novos desafios serão adicionados em breve!</p>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Desafios de Saúde</h1>
          <p className="text-lg text-muted-foreground">
            Participe de desafios para melhorar sua saúde e ganhar recompensas
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge, index) => {
            const DifficultyIcon = getDifficultyIcon(challenge.difficulty);
            
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 cursor-pointer h-full">
                  {/* Background Gradient */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${getDifficultyGradient(challenge.difficulty)} opacity-5`}
                    whileHover={{ opacity: 0.1 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Featured Badge */}
                  {challenge.is_featured && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Destaque
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4 relative z-10" onClick={() => handleChallengeClick(challenge)}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <motion.div
                          className={`p-3 bg-gradient-to-br ${getDifficultyGradient(challenge.difficulty)} rounded-full`}
                          whileHover={{ rotate: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <DifficultyIcon className="w-6 h-6 text-white" />
                        </motion.div>
                        
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{challenge.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className={`bg-gradient-to-r ${getDifficultyGradient(challenge.difficulty)} text-white border-0`}>
                              {getDifficultyText(challenge.difficulty)}
                            </Badge>
                            {getCategoryIcon(challenge.category)}
                          </div>
                        </div>
                      </div>

                      <div className="text-3xl ml-3">{challenge.badge_icon}</div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 relative z-10">
                    <CardDescription className="text-sm leading-relaxed">
                      {challenge.description}
                    </CardDescription>

                    {/* Stats Section */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <Calendar className="w-4 h-4 text-primary" />
                        <div>
                          <div className="text-sm font-medium">{challenge.duration_days}</div>
                          <div className="text-xs text-muted-foreground">dias</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <div>
                          <div className="text-sm font-medium">{challenge.points_reward}</div>
                          <div className="text-xs text-muted-foreground">pontos</div>
                        </div>
                      </div>
                    </div>

                    {/* Group Challenge Indicator */}
                    {challenge.is_group_challenge && (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-blue-700 font-medium">Desafio em Grupo</span>
                      </div>
                    )}

                    {/* Action Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="pt-2"
                    >
                      {challenge.user_participation ? (
                        <Button 
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium" 
                          onClick={() => handleChallengeClick(challenge)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Ver Progresso ({Math.round(challenge.user_participation.progress)}%)
                        </Button>
                      ) : (
                        <Button 
                          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium" 
                          onClick={(e) => joinChallenge(challenge.id, e)}
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Participar do Desafio
                        </Button>
                      )}
                    </motion.div>
                  </CardContent>

                  {/* Hover Glow Effect */}
                  <motion.div
                    className={`absolute inset-0 border-2 border-transparent bg-gradient-to-br ${getDifficultyGradient(challenge.difficulty)} opacity-0 rounded-lg`}
                    whileHover={{ opacity: 0.1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Card>
              </motion.div>
            );
          })}
        </div>
        
        {/* Visual Effects */}
        {activeCelebration && (
          <VisualEffectsManager
            trigger={activeCelebration.trigger}
            effectType={activeCelebration.type}
            duration={3000}
          />
        )}
      </div>
    );
  };

  return renderChallengesList();
};

export default ChallengesSection;