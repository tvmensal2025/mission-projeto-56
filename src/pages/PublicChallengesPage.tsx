import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getUserAvatar } from '@/lib/avatar-utils';
import { 
  Trophy, Users, Camera, Share2, Heart, MessageCircle, 
  Crown, Medal, Star, TrendingUp, Target, Calendar,
  Upload, Image, Smile, Flame, Award, Users2
} from 'lucide-react';

interface PublicChallenge {
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
  daily_log_type: string;
  daily_log_unit: string;
  daily_log_target: number;
  is_active: boolean;
  is_featured: boolean;
  is_group_challenge: boolean;
  max_participants?: number;
  current_participants: number;
  created_at: string;
  created_by: string;
  creator_name: string;
  creator_avatar: string;
}

interface ChallengeParticipation {
  id: string;
  challenge_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  progress: number;
  is_completed: boolean;
  started_at: string;
  completed_at?: string;
  current_streak: number;
  points_earned: number;
  last_activity: string;
  photo_url?: string;
  notes?: string;
}

interface CommunityPost {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  challenge_id: string;
  challenge_title: string;
  photo_url: string;
  message: string;
  likes: number;
  comments: number;
  created_at: string;
  is_liked_by_current_user: boolean;
}

export default function PublicChallengesPage({ user }: { user: User | null }) {
  const [challenges, setChallenges] = useState<PublicChallenge[]>([]);
  const [participations, setParticipations] = useState<ChallengeParticipation[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('challenges');
  const [selectedChallenge, setSelectedChallenge] = useState<PublicChallenge | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [photoMessage, setPhotoMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPublicChallenges(),
        loadParticipations(),
        loadCommunityPosts()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPublicChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          profiles!challenges_created_by_fkey(full_name, avatar_url)
        `)
        .eq('is_group_challenge', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const publicChallenges = data?.map(challenge => ({
        ...challenge,
        current_participants: Math.floor(Math.random() * 50) + 5, // Mock data
        creator_name: challenge.profiles?.full_name || 'Admin',
        creator_avatar: challenge.profiles?.avatar_url || ''
      })) || [];

      setChallenges(publicChallenges);
    } catch (error) {
      console.error('Erro ao carregar desafios públicos:', error);
    }
  };

  const loadParticipations = async () => {
    try {
      const { data, error } = await supabase
        .from('challenge_participations')
        .select(`
          *,
          profiles!challenge_participations_user_id_fkey(full_name, avatar_url),
          challenges(title)
        `)
        .eq('challenge_id', selectedChallenge?.id)
        .order('progress', { ascending: false });

      if (error) throw error;

      const participations = data?.map(participation => ({
        ...participation,
        user_name: participation.profiles?.full_name || 'Usuário',
        user_avatar: participation.profiles?.avatar_url || '',
        challenge_title: participation.challenges?.title || ''
      })) || [];

      setParticipations(participations);
    } catch (error) {
      console.error('Erro ao carregar participações:', error);
    }
  };

  const loadCommunityPosts = async () => {
    try {
      // Mock data para demonstração
      const mockPosts: CommunityPost[] = [
        {
          id: '1',
          user_id: 'user1',
          user_name: 'Maria Silva',
          user_avatar: '',
          challenge_id: 'challenge1',
          challenge_title: 'Exercício Diário',
          photo_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
          message: 'Consegui fazer 30 minutos de corrida hoje! 💪',
          likes: 24,
          comments: 5,
          created_at: new Date().toISOString(),
          is_liked_by_current_user: false
        },
        {
          id: '2',
          user_id: 'user2',
          user_name: 'João Santos',
          user_avatar: '',
          challenge_id: 'challenge2',
          challenge_title: 'Hidratação Perfeita',
          photo_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
          message: '2 litros de água consumidos! 💧',
          likes: 18,
          comments: 3,
          created_at: new Date().toISOString(),
          is_liked_by_current_user: true
        }
      ];

      setCommunityPosts(mockPosts);
    } catch (error) {
      console.error('Erro ao carregar posts da comunidade:', error);
    }
  };

  const joinPublicChallenge = async (challengeId: string) => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para participar",
        variant: "destructive"
      });
      return;
    }

    try {
      // Verificar se já está participando
      const { data: existingParticipation, error: checkError } = await supabase
        .from('challenge_participations')
        .select('id, progress, is_completed')
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId)
        .maybeSingle();

      if (checkError) {
        console.error('Erro ao verificar participação:', checkError);
        throw checkError;
      }

      if (existingParticipation) {
        toast({
          title: "Já participando",
          description: `Você já está participando deste desafio (${existingParticipation.progress}% concluído)`,
        });
        return;
      }

      // Buscar dados do desafio
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) {
        throw new Error("Desafio não encontrado");
      }

      const { data: joinResult, error } = await supabase
        .from('challenge_participations')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          target_value: challenge.daily_log_target || 1,
          progress: 0,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir participação:', error);
        
        // Se for erro de chave duplicada, buscar a participação existente
        if (error.code === '23505' && error.message.includes('challenge_participations_challenge_id_user_id_key')) {
          const { data: existingParticipation, error: fetchError } = await supabase
            .from('challenge_participations')
            .select('id, progress, is_completed')
            .eq('user_id', user.id)
            .eq('challenge_id', challengeId)
            .single();

          if (!fetchError && existingParticipation) {
            toast({
              title: "Já participando",
              description: `Você já está participando deste desafio (${existingParticipation.progress}% concluído)`,
            });
            return;
          }
        }
        
        throw error;
      }

      toast({
        title: "Participação confirmada! 🎉",
        description: "Você agora está participando do desafio público!"
      });

      loadParticipations();
    } catch (error: any) {
      console.error('❌ Erro ao participar do desafio:', error);
      
      // Mensagem de erro mais amigável
      let errorMessage = 'Não foi possível participar do desafio';
      
      if (error.code === '23505') {
        errorMessage = 'Você já está participando deste desafio';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handlePhotoUpload = async () => {
    if (!uploadedPhoto || !selectedChallenge) return;

    try {
      // Upload da foto para o storage
      const fileExt = uploadedPhoto.name.split('.').pop();
      const fileName = `${user?.id}_${Date.now()}.${fileExt}`;
      const filePath = `challenge-photos/${selectedChallenge.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('community-uploads')
        .upload(filePath, uploadedPhoto);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('community-uploads')
        .getPublicUrl(filePath);

      // Criar post na comunidade
      const { error: postError } = await supabase
        .from('community_posts')
        .insert({
          user_id: user?.id,
          challenge_id: selectedChallenge.id,
          photo_url: publicUrl,
          message: photoMessage,
          likes: 0,
          comments: 0
        });

      if (postError) throw postError;

      toast({
        title: "Foto compartilhada! 📸",
        description: "Sua conquista foi compartilhada na comunidade!"
      });

      setIsPhotoModalOpen(false);
      setUploadedPhoto(null);
      setPhotoMessage('');
      loadCommunityPosts();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Não foi possível compartilhar a foto",
        variant: "destructive"
      });
    }
  };

  const likePost = async (postId: string) => {
    try {
      // Mock - em produção seria uma atualização real
      setCommunityPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1, is_liked_by_current_user: true }
          : post
      ));

      toast({
        title: "Curtido! ❤️",
        description: "Post curtido com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao curtir:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'bg-green-100 text-green-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'dificil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'exercicio': return '🏃‍♂️';
      case 'hidratacao': return '💧';
      case 'nutricao': return '🥗';
      case 'sono': return '😴';
      case 'mindfulness': return '🧘';
      default: return '🎯';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando desafios públicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Desafios Públicos</h1>
          <p className="text-muted-foreground">Participe de desafios com a comunidade</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Users2 className="h-4 w-4" />
          {challenges.length} Desafios Ativos
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="challenges">🏆 Desafios</TabsTrigger>
          <TabsTrigger value="participants">👥 Participantes</TabsTrigger>
          <TabsTrigger value="community">💬 Comunidade</TabsTrigger>
        </TabsList>

        {/* Desafios Públicos */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{challenge.badge_icon}</span>
                      <div>
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                    </div>
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>🎯 {challenge.points_reward} pontos</span>
                    <span>⏱️ {challenge.duration_days} dias</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>👥 {challenge.current_participants} participantes</span>
                    <span>📊 {challenge.daily_log_target} {challenge.daily_log_unit}/dia</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={challenge.creator_avatar} />
                      <AvatarFallback>{challenge.creator_name[0]}</AvatarFallback>
                    </Avatar>
                    <span>Criado por {challenge.creator_name}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => joinPublicChallenge(challenge.id)}
                      className="flex-1"
                    >
                      Participar
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedChallenge(challenge);
                        setIsPhotoModalOpen(true);
                      }}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Participantes */}
        <TabsContent value="participants" className="space-y-6">
          {selectedChallenge ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Participantes - {selectedChallenge.title}</h2>
                <Button variant="outline" onClick={() => setSelectedChallenge(null)}>
                  Ver Todos os Desafios
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {participations.map((participation, index) => (
                  <Card key={participation.id} className="relative">
                    {index < 3 && (
                      <div className="absolute -top-2 -right-2">
                        {index === 0 && <Crown className="h-6 w-6 text-yellow-500" />}
                        {index === 1 && <Medal className="h-6 w-6 text-gray-400" />}
                        {index === 2 && <Award className="h-6 w-6 text-amber-600" />}
                      </div>
                    )}
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar>
                          <AvatarImage src={participation.user_avatar} />
                          <AvatarFallback>{participation.user_name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{participation.user_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {participation.current_streak} dias seguidos
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso</span>
                          <span>{participation.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${participation.progress}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span>Pontos</span>
                          <span>{participation.points_earned}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Selecione um Desafio</h3>
              <p className="text-muted-foreground">
                Clique em um desafio para ver os participantes
              </p>
            </div>
          )}
        </TabsContent>

        {/* Comunidade */}
        <TabsContent value="community" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Comunidade</h2>
            <Button onClick={() => setIsShareModalOpen(true)}>
              <Camera className="h-4 w-4 mr-2" />
              Compartilhar Conquista
            </Button>
          </div>

          <div className="space-y-4">
            {communityPosts.map((post) => (
              <Card key={post.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar>
                      <AvatarImage src={post.user_avatar} />
                      <AvatarFallback>{post.user_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{post.user_name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {post.challenge_title}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <img 
                      src={post.photo_url} 
                      alt="Conquista"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    
                    <p className="text-sm">{post.message}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <button 
                        onClick={() => likePost(post.id)}
                        className={`flex items-center gap-1 ${
                          post.is_liked_by_current_user ? 'text-red-500' : ''
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${
                          post.is_liked_by_current_user ? 'fill-current' : ''
                        }`} />
                        {post.likes}
                      </button>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Upload de Foto */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Compartilhar Conquista</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUploadedPhoto(e.target.files?.[0] || null)}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Clique para selecionar uma foto
                </p>
              </label>
            </div>

            {uploadedPhoto && (
              <div className="text-center">
                <img 
                  src={URL.createObjectURL(uploadedPhoto)}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}

            <Textarea
              placeholder="Compartilhe sua conquista..."
              value={photoMessage}
              onChange={(e) => setPhotoMessage(e.target.value)}
            />

            <Button onClick={handlePhotoUpload} className="w-full">
              Compartilhar na Comunidade
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 