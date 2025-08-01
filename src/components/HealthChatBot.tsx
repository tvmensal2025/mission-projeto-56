import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  X, 
  User, 
  Bot,
  ChevronDown,
  ChevronUp,
  Camera,
  Image,
  Paperclip
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { getCharacterImageUrl } from '@/lib/character-images';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
}

interface Character {
  name: string;
  avatar: string;
  subtitle?: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

export const HealthChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  // Obter URL da imagem da Sofia
  const sofiaImageUrl = getCharacterImageUrl('sofia');

  const characters: Character[] = [
    {
      name: 'Sof.ia',
      avatar: sofiaImageUrl,
      colors: {
        primary: 'from-purple-500 to-purple-600',
        secondary: 'from-purple-400 to-purple-500'
      }
    },
    {
      name: 'Dr. Vital',
      avatar: getCharacterImageUrl('dr-vital'),
      colors: {
        primary: 'from-blue-500 to-blue-600',
        secondary: 'from-blue-400 to-blue-500'
      }
    }
  ];

  const [currentCharacter, setCurrentCharacter] = useState<Character>(characters[0]);

  // Função para determinar personagem baseado no dia
  const getCurrentCharacter = (): Character => {
    const currentDay = new Date().getDay();
    const isFriday = currentDay === 5;
    
    if (isFriday) {
      return {
        name: 'Dr. Vita',
        avatar: 'DV',
        subtitle: 'Doutor da Vida - Análise Semanal',
        colors: {
          primary: 'from-blue-600 to-blue-800',
          secondary: 'bg-blue-50 text-blue-800'
        }
      };
    } else {
      return {
        name: 'Sof.ia',
        avatar: 'SF',
        subtitle: 'Sua Amiga de Bem-Estar',
        colors: {
          primary: 'from-purple-500 to-pink-600',
          secondary: 'bg-purple-50 text-purple-800'
        }
      };
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Verificar notificações
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        // Smart notifications table doesn't exist yet - return empty data
        const data: any[] = [];

        // setHasNotifications((data?.length || 0) > 0); // This line was removed as per new_code
      } catch (error) {
        console.error('Erro ao verificar notificações:', error);
      }
    };

    checkNotifications();
    
    // Verificar a cada 30 segundos
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const character = getCurrentCharacter();
      setCurrentCharacter(character);
      
      // Verificar se há notificações e criar mensagem apropriada
      const checkNotificationsAndCreateWelcome = async () => {
        try {
          // Smart notifications table doesn't exist yet - return empty data
          const notifications: any[] = [];

          let welcomeContent = '';
          
          if (notifications && notifications.length > 0) {
            // Há notificações pendentes
            const sessionNotifications = notifications.filter((n: any) => n.category === 'sessions');
            const emailNotifications = notifications.filter((n: any) => n.type === 'email_report');
            const challengeNotifications = notifications.filter((n: any) => n.category === 'challenges');
            
            welcomeContent = `🔔 Olá! Tenho algumas novidades importantes para você:\n\n`;
            
            if (sessionNotifications.length > 0) {
              welcomeContent += `📋 **${sessionNotifications.length} nova(s) sessão(ões) disponível(eis)**\n`;
            }
            
            if (emailNotifications.length > 0) {
              welcomeContent += `📧 **Relatório por email disponível**\n`;
            }
            
            if (challengeNotifications.length > 0) {
              welcomeContent += `🎯 **${challengeNotifications.length} novo(s) desafio(s)**\n`;
            }
            
            welcomeContent += `\nJá visualizou todas as novidades? Clique em "✅ Já vi tudo" para parar as notificações.`;
          } else {
            // Mensagem de boas-vindas normal
            if (character.name === 'Dr. Vita') {
              welcomeContent = '👨‍⚕️ Olá! Eu sou o Dr. Vita, Doutor da Vida. É sexta-feira e chegou a hora do seu relatório semanal!\n\nComo você está se sentindo hoje?';
            } else {
              welcomeContent = '💜 Olá! Eu sou a Sof.ia, sua amiga e agente de saúde.\n\nVamos começar? Como foi seu dia hoje?';
            }
          }
          
          const welcomeMessage: Message = {
            id: 'welcome',
            content: welcomeContent,
            isUser: false,
            timestamp: new Date()
          };

          setMessages([welcomeMessage]);
        } catch (error) {
          console.error('Erro ao criar mensagem de boas-vindas:', error);
        }
      };

      checkNotificationsAndCreateWelcome();
    }
  }, [isOpen]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 Usuário obtido:', user);
      return user || { id: 'guest-user' };
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return { id: 'guest-user' };
    }
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      const user = await getCurrentUser();
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      return null;
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedImage) || isTyping) return;

    const user = await getCurrentUser();
    console.log('👤 Usuário atual:', user);

    let imageUrl: string | undefined;
    
    // Upload da imagem se houver
    if (selectedImage) {
      console.log('📸 Iniciando upload da imagem...');
      imageUrl = await handleImageUpload(selectedImage);
      console.log('📸 URL da imagem:', imageUrl);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue || '📷 Imagem enviada',
      isUser: true,
      timestamp: new Date(),
      imageUrl
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputValue;
    setInputValue('');
    setSelectedImage(null);
    setImagePreview(null);
    setIsTyping(true);

    try {
      // Preparar histórico da conversa para a IA
      const conversationHistory = messages
        .filter(msg => msg.id !== 'welcome') // Remover mensagem de boas-vindas
        .map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.content
        }));

      console.log('📤 Enviando mensagem para o chatbot...', {
        message: currentMessage,
        userId: user?.id,
        historyLength: conversationHistory.length,
        hasImage: !!imageUrl,
        imageUrl: imageUrl
      });

      // Usar apenas a função health-chat-bot que já tem análise de comida
      const { data, error } = await supabase.functions.invoke('health-chat-bot', {
        body: {
          message: currentMessage || 'Usuário enviou uma imagem',
          userId: user.id,
          conversationHistory,
          imageUrl: imageUrl // Passar a URL da imagem para análise
        }
      });

      console.log('📥 Resposta da função:', { data, error });

      if (error) {
        console.error('❌ Erro da Edge Function:', error);
        throw new Error(error.message || 'Erro na comunicação com o servidor');
      }

      if (!data) {
        console.error('❌ Resposta vazia do servidor');
        throw new Error('Resposta vazia do servidor');
      }

      console.log('✅ Resposta recebida:', data);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || 'Desculpe, não consegui gerar uma resposta.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Atualizar personagem se mudou
      if (data.character) {
        const newCharacter = characters.find(c => c.name === data.character) || characters[0];
        setCurrentCharacter(newCharacter);
      }

    } catch (error: any) {
      console.error('❌ Erro ao enviar mensagem:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, tive um problema técnico. Pode tentar novamente?',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Botão do Chat */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-40 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${currentCharacter?.colors.primary} flex items-center justify-center text-white font-bold overflow-hidden`}>
                  {currentCharacter?.name === 'Sof.ia' ? (
                    <img 
                      src={sofiaImageUrl}
                      alt="Sofia"
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <span className="text-lg">{currentCharacter?.avatar}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{currentCharacter?.name}</h3>
                  <p className="text-xs opacity-90">Online</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.isUser ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-start gap-2 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!message.isUser && (
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${currentCharacter?.colors.primary} flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0`}>
                          {currentCharacter?.name === 'Sof.ia' ? (
                            <img 
                              src={sofiaImageUrl}
                              alt="Sofia"
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : (
                            <span>{currentCharacter?.avatar}</span>
                          )}
                        </div>
                      )}
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          message.isUser
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.imageUrl && (
                          <div className="mb-2">
                            <img 
                              src={message.imageUrl} 
                              alt="Imagem enviada"
                              className="max-w-full h-auto rounded-lg"
                              style={{ maxHeight: '200px' }}
                            />
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                    <span className="text-xs text-gray-500">Digitando...</span>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Image Preview */}
          {imagePreview && (
            <div className="p-4 border-t border-gray-200">
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-w-full h-auto rounded-lg"
                  style={{ maxHeight: '100px' }}
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              {/* Botões de mídia */}
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCameraClick}
                  className="p-2 h-10 w-10"
                  title="Câmera"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleGalleryClick}
                  className="p-2 h-10 w-10"
                  title="Galeria"
                >
                  <Image className="h-4 w-4" />
                </Button>
              </div>
              
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={(!inputValue.trim() && !selectedImage) || isTyping}
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Inputs ocultos para arquivos */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
      )}
    </>
  );
};