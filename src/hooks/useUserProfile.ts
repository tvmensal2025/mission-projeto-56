import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  city: string;
  state: string;
  avatarUrl: string;
  bio: string;
  goals: string[];
  achievements: string[];
}

export const useUserProfile = (user: User | null) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
    city: '',
    state: '',
    avatarUrl: '',
    bio: '',
    goals: [],
    achievements: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carregar dados do perfil
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Buscar da tabela profiles unificada
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        // Usar dados da tabela profiles
        setProfileData({
          fullName: data.full_name || user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: data.phone || user.user_metadata?.phone || '',
          birthDate: data.birth_date || user.user_metadata?.birth_date || '',
          city: data.city || user.user_metadata?.city || '',
          state: user.user_metadata?.state || '',
          avatarUrl: data.avatar_url || user.user_metadata?.avatar_url || '',
          bio: user.user_metadata?.bio || 'Transformando minha vida através da saúde e bem-estar.',
          goals: user.user_metadata?.goals || ['Perder peso', 'Melhorar condicionamento', 'Adotar hábitos saudáveis'],
          achievements: user.user_metadata?.achievements || ['Primeira semana completa', 'Primeira pesagem registrada']
        });
      } else {
        // Dados padrão se não existir perfil (não deve acontecer com o trigger)
        setProfileData({
          fullName: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
          birthDate: user.user_metadata?.birth_date || '',
          city: user.user_metadata?.city || '',
          state: user.user_metadata?.state || '',
          avatarUrl: user.user_metadata?.avatar_url || '',
          bio: user.user_metadata?.bio || 'Transformando minha vida através da saúde e bem-estar.',
          goals: user.user_metadata?.goals || ['Perder peso', 'Melhorar condicionamento', 'Adotar hábitos saudáveis'],
          achievements: user.user_metadata?.achievements || ['Primeira semana completa', 'Primeira pesagem registrada']
        });
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar perfil:', error);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (newData: Partial<ProfileData>) => {
    if (!user) return;

    try {
      setSaving(true);
      
      const updatedData = { ...profileData, ...newData };
      
      // Atualizar no Supabase usando tabela profiles unificada
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updatedData.fullName,
          phone: updatedData.phone,
          birth_date: updatedData.birthDate,
          city: updatedData.city,
          state: updatedData.state,
          avatar_url: updatedData.avatarUrl,
          bio: updatedData.bio,
          goals: updatedData.goals,
          achievements: updatedData.achievements,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao salvar perfil:', error);
        throw error;
      }

      // Atualizar estado local
      setProfileData(updatedData);
      
      // Atualizar metadata do usuário
      await supabase.auth.updateUser({
        data: {
          full_name: updatedData.fullName,
          phone: updatedData.phone,
          birth_date: updatedData.birthDate,
          city: updatedData.city,
          state: updatedData.state,
          avatar_url: updatedData.avatarUrl,
          bio: updatedData.bio,
          goals: updatedData.goals,
          achievements: updatedData.achievements
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return null;

    try {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Apenas arquivos de imagem são permitidos');
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Máximo 5MB permitido');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log('Iniciando upload do avatar...', { fileName, filePath });

      // Upload para Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        
        // Se for erro de política, tentar com nome mais simples
        if (uploadError.message.includes('policy') || uploadError.message.includes('403')) {
          console.log('Tentando upload com nome simplificado...');
          const simpleFileName = `${user.id}.${fileExt}`;
          const simpleFilePath = `avatars/${simpleFileName}`;
          
          const { error: retryError } = await supabase.storage
            .from('avatars')
            .upload(simpleFilePath, file, {
              cacheControl: '3600',
              upsert: true
            });

          if (retryError) {
            console.error('Erro no retry:', retryError);
            throw new Error('Não foi possível fazer upload da imagem. Tente novamente.');
          }

          // Obter URL pública
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(simpleFilePath);

          return publicUrl;
        }
        
        throw new Error('Erro ao fazer upload da imagem: ' + uploadError.message);
      }

      console.log('Upload realizado com sucesso:', data);

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('URL pública gerada:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      
      // Se for erro de bucket não existir, criar um fallback
      if (error.message.includes('bucket') || error.message.includes('not found')) {
        console.log('Bucket não encontrado, usando URL temporária...');
        return URL.createObjectURL(file);
      }
      
      throw error;
    }
  };

  return {
    profileData,
    loading,
    saving,
    updateProfile,
    uploadAvatar,
    loadProfile
  };
}; 