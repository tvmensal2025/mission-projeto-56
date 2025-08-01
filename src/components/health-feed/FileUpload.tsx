import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Upload, X, Image as ImageIcon, Video } from 'lucide-react';

interface FileUploadProps {
  onFilesChange: (files: string[]) => void;
  maxFiles?: number;
  accept?: string;
  currentFiles?: string[];
}

export function FileUpload({ 
  onFilesChange, 
  maxFiles = 5, 
  accept = "image/*,video/*",
  currentFiles = []
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('community-uploads')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('community-uploads')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload do arquivo",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;
    
    if (currentFiles.length + files.length > maxFiles) {
      toast({
        title: "Limite excedido",
        description: `Você pode enviar no máximo ${maxFiles} arquivos`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      const uploadPromises = files.map(uploadFile);
      const uploadedUrls = await Promise.all(uploadPromises);
      
      const successfulUploads = uploadedUrls.filter(url => url !== null) as string[];
      
      if (successfulUploads.length > 0) {
        onFilesChange([...currentFiles, ...successfulUploads]);
        toast({
          title: "Upload concluído",
          description: `${successfulUploads.length} arquivo(s) enviado(s) com sucesso`
        });
      }
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload dos arquivos",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const newFiles = currentFiles.filter((_, index) => index !== indexToRemove);
    onFilesChange(newFiles);
  };

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  const isVideo = (url: string) => {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || currentFiles.length >= maxFiles}
        >
          {uploading ? (
            <Upload className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
          {uploading ? 'Enviando...' : 'Adicionar foto/vídeo'}
        </Button>
        
        <span className="text-sm text-muted-foreground self-center">
          {currentFiles.length}/{maxFiles}
        </span>
      </div>

      {/* Preview dos arquivos */}
      {currentFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {currentFiles.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                {isImage(url) ? (
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : isVideo(url) ? (
                  <video
                    src={url}
                    className="w-full h-full object-cover"
                    controls={false}
                    muted
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              {/* Botão de remover */}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveFile(index)}
              >
                <X className="w-3 h-3" />
              </Button>
              
              {/* Indicador de tipo de arquivo */}
              <div className="absolute bottom-1 left-1">
                {isVideo(url) && (
                  <div className="bg-black/50 rounded px-1 py-0.5">
                    <Video className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}