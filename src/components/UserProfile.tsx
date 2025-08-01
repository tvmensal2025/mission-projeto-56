import { useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { 
  User as UserIcon, 
  Camera, 
  Edit, 
  Save, 
  X, 
  Upload,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Heart,
  Trophy,
  Target,
  Activity
} from 'lucide-react';
import { SofiaBiography } from './SofiaBiography';

interface UserProfileProps {
  user: User | null;
  onUpdateProfile: (data: any) => void;
}

export const UserProfile = ({ user, onUpdateProfile }: UserProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { profileData, loading, saving, updateProfile, uploadAvatar } = useUserProfile(user);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem (JPG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "Por favor, selecione uma imagem menor que 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      toast({
        title: "Processando imagem...",
        description: "Aguarde enquanto sua foto é processada",
      });

      // Converter para base64 (solução mais confiável)
      const avatarUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      if (avatarUrl) {
        await updateProfile({ avatarUrl });
        
        toast({
          title: "Foto atualizada!",
          description: "Sua foto de perfil foi atualizada com sucesso",
        });
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      
      toast({
        title: "Erro no processamento",
        description: "Não foi possível processar a imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Limpar o input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileData);
      onUpdateProfile(profileData);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header do Perfil */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profileData.avatarUrl} alt={profileData.fullName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                {getInitials(profileData.fullName)}
              </AvatarFallback>
            </Avatar>
            
            {/* Botão de upload de foto */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  className="absolute -bottom-2 -right-2 h-8 w-8 bg-blue-600 hover:bg-blue-700"
                  disabled={isUploading}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Alterar Foto do Perfil</DialogTitle>
                  <DialogDescription>
                    Escolha uma nova imagem para seu perfil (máximo 5MB)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-center">
                    <Avatar className="h-32 w-32 mx-auto mb-4">
                      <AvatarImage src={profileData.avatarUrl} alt={profileData.fullName} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                        {getInitials(profileData.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? 'Enviando...' : 'Escolher Nova Foto'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white">{profileData.fullName}</h2>
            <p className="text-gray-400">{profileData.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-green-600">Online</Badge>
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                Membro desde {new Date(user?.created_at || '').toLocaleDateString('pt-BR')}
              </Badge>
            </div>
          </div>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Perfil</DialogTitle>
              <DialogDescription>
                Atualize suas informações pessoais e preferências
              </DialogDescription>
            </DialogHeader>
            
             <div className="space-y-6">
               {/* Avatar Section */}
               <div className="text-center">
                 <Avatar className="h-24 w-24 mx-auto mb-4">
                   <AvatarImage src={profileData.avatarUrl} alt={profileData.fullName} />
                   <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                     {getInitials(profileData.fullName)}
                   </AvatarFallback>
                 </Avatar>
                 <Button
                   onClick={() => fileInputRef.current?.click()}
                   disabled={isUploading}
                   variant="outline"
                   size="sm"
                 >
                   <Upload className="h-4 w-4 mr-2" />
                   {isUploading ? 'Enviando...' : 'Alterar Foto'}
                 </Button>
               </div>
               
               {/* Informações Básicas */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <Label>Nome Completo</Label>
                   <Input 
                     value={profileData.fullName}
                     onChange={(e) => updateProfile({ fullName: e.target.value })}
                     placeholder="Seu nome completo"
                   />
                 </div>
                 <div>
                   <Label>Email</Label>
                   <Input 
                     value={profileData.email}
                     disabled
                     className="bg-muted"
                   />
                 </div>
                 <div>
                   <Label>Telefone</Label>
                   <Input 
                     value={profileData.phone}
                     onChange={(e) => updateProfile({ phone: e.target.value })}
                     placeholder="(11) 99999-9999"
                   />
                 </div>
                 <div>
                   <Label>Data de Nascimento</Label>
                   <Input 
                     type="date"
                     value={profileData.birthDate}
                     onChange={(e) => updateProfile({ birthDate: e.target.value })}
                   />
                 </div>
                 <div>
                   <Label>Cidade</Label>
                   <Input 
                     value={profileData.city}
                     onChange={(e) => updateProfile({ city: e.target.value })}
                     placeholder="Sua cidade"
                   />
                 </div>
                 <div>
                   <Label>Estado</Label>
                   <Input 
                     value={profileData.state}
                     onChange={(e) => updateProfile({ state: e.target.value })}
                     placeholder="Seu estado"
                   />
                 </div>
               </div>
              
                             <div>
                 <Label>Biografia</Label>
                 <textarea 
                   value={profileData.bio}
                   onChange={(e) => updateProfile({ bio: e.target.value })}
                   className="w-full p-3 border border-gray-300 rounded-md resize-none h-24"
                   placeholder="Conte um pouco sobre você..."
                 />
               </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Biografia da Sof.ia */}
      <SofiaBiography user={user} />

      {/* Cards de Informações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Informações Pessoais */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-blue-400" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300">{profileData.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300">{profileData.phone || 'Não informado'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300">
                {profileData.birthDate ? new Date(profileData.birthDate).toLocaleDateString('pt-BR') : 'Não informado'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300">
                {profileData.city && profileData.state ? `${profileData.city}, ${profileData.state}` : 'Não informado'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metas */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-green-400" />
              Minhas Metas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profileData.goals.map((goal, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">{goal}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conquistas */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profileData.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  <span className="text-gray-300">{achievement}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-400" />
              Estatísticas do Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="mobile-stat-number text-blue-400">127</div>
                <div className="mobile-text-lg text-gray-400">Dias Ativo</div>
              </div>
              <div className="text-center">
                <div className="mobile-stat-number text-green-400">23</div>
                <div className="mobile-text-lg text-gray-400">Metas Alcançadas</div>
              </div>
              <div className="text-center">
                <div className="mobile-stat-number text-yellow-400">15</div>
                <div className="mobile-text-lg text-gray-400">Conquistas</div>
              </div>
              <div className="text-center">
                <div className="mobile-stat-number text-purple-400">89%</div>
                <div className="mobile-text-lg text-gray-400">Progresso Geral</div>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}; 