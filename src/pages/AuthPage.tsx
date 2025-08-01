import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, ArrowLeft, User, Phone, Calendar, MapPin, Ruler } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(true); // Padrão true para lembrar senha
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Signup form state - EXPANDIDO com novos campos
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "",
    city: "",
    state: "",
    height: "",
    password: "",
    confirmPassword: "",
  });



  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        toast({
          title: "Erro no login",
          description: "Email ou senha incorretos",
          variant: "destructive",
        });
        return;
      }

      // Verificar se o usuário tem role de admin após login bem-sucedido
      if (data.user) {
        try {
          // Usar RPC para verificar se é admin (evita problemas de tipos)
          // Check if user is admin by checking profiles table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .maybeSingle();
          
          const isAdmin = (profileData as any)?.role === 'admin';

          if (isAdmin) {
            toast({
              title: "Acesso administrativo concedido",
              description: "Bem-vindo, administrador",
            });
            navigate("/admin");
          } else {
            toast({
              title: "Login realizado!",
              description: "Bem-vindo de volta ao Instituto dos Sonhos",
            });
            navigate("/dashboard");
          }
        } catch (roleError) {
          console.log('Erro ao verificar role, assumindo usuário comum:', roleError);
          // Se não conseguir verificar role, assume usuário comum
          toast({
            title: "Login realizado!",
            description: "Bem-vindo de volta ao Instituto dos Sonhos",
          });
          navigate("/dashboard");
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    // Validação de campos obrigatórios
    if (!signupData.fullName || !signupData.email || !signupData.phone || 
        !signupData.birthDate || !signupData.gender || !signupData.city || 
        !signupData.state || !signupData.height || !signupData.password || !signupData.confirmPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: "Erro",
        description: "Você precisa aceitar os termos de uso",
        variant: "destructive",
      });
      return;
    }

    // Validar altura
    const height = parseFloat(signupData.height);
    if (height < 100 || height > 250) {
      toast({
        title: "Erro",
        description: "Altura deve estar entre 100cm e 250cm",
        variant: "destructive",
      });
      return;
    }

    // Validar data de nascimento
    const birthDate = new Date(signupData.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 13 || age > 120) {
      toast({
        title: "Erro",
        description: "Idade deve estar entre 13 e 120 anos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: signupData.fullName,
            phone: signupData.phone,
            birth_date: signupData.birthDate,
            gender: signupData.gender,
            city: signupData.city,
            state: signupData.state,
            height: height,
          },
        },
      });

      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // O perfil é criado automaticamente pelo trigger
        if (data.user) {

          // Criar dados físicos automaticamente
          const { error: physicalError } = await supabase
            .from('user_physical_data')
            .insert({
              user_id: data.user.id,
              altura_cm: height,
              idade: age,
              sexo: signupData.gender === 'male' ? 'masculino' : 'feminino',
              nivel_atividade: 'moderado'
            });

          if (physicalError) {
            console.error('Erro ao criar dados físicos:', physicalError);
          }

          toast({
            title: "Conta criada com sucesso!",
            description: "Bem-vindo ao Instituto dos Sonhos. Seus dados foram salvos.",
          });
          navigate("/dashboard");
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      toast({
        title: "Erro",
        description: "Por favor, digite seu email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        forgotPasswordEmail,
        {
          redirectTo: `${window.location.origin}/auth`,
        }
      );

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada para redefinir a senha",
        });
        setShowForgotPassword(false);
        setForgotPasswordEmail("");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };





  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 border-b border-border/10 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <div className="relative">
                <Heart className="h-8 w-8 text-primary" />
                <div className="absolute inset-0 h-8 w-8 text-primary/20 animate-pulse" />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Instituto dos Sonhos
            </h1>
          </Link>
        </div>
      </header>

      <div className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md space-y-8">
          {/* Header Text */}
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">
                Comece sua
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {" "}transformação
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Faça login ou crie sua conta gratuita
              </p>
            </div>
          </div>

          {/* Main Auth Card */}
          <Card className="border-0 shadow-2xl shadow-primary/5 bg-card/50 backdrop-blur-xl">
            <CardContent className="p-8">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50">
                  <TabsTrigger value="login" className="data-[state=active]:bg-background data-[state=active]:shadow-md">
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-background data-[state=active]:shadow-md">
                    Criar Conta
                  </TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm font-medium">Senha</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Sua senha"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="remember" 
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked === true)}
                        />
                        <Label htmlFor="remember" className="text-sm text-muted-foreground">Lembrar de mim</Label>
                      </div>
                      <button 
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-primary hover:underline">
                        Esqueceu a senha?
                      </button>
                    </div>
                  </div>

                  <Button 
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium shadow-lg shadow-primary/25 transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                        Entrando...
                      </div>
                    ) : (
                      "Entrar"
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Ainda não tem conta?{" "}
                      <span className="text-primary font-medium cursor-pointer hover:underline">
                        Crie uma agora
                      </span>
                    </p>
                    
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        💡 <strong>Para testes rápidos:</strong> 
                        <br />Email: <code className="bg-background px-1 rounded">teste@institutodossonhos.com</code>
                        <br />Senha: <code className="bg-background px-1 rounded">123456</code>
                        <br />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            setLoginData({
                              email: "teste@institutodossonhos.com",
                              password: "123456"
                            });
                          }}
                        >
                          Preencher dados de teste
                        </Button>
                      </p>
                    </div>
                  </div>
                </TabsContent>

                {/* Modal Esqueci Senha */}
                {showForgotPassword && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl border">
                      <h3 className="text-lg font-semibold mb-4">Recuperar Senha</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Digite seu email para receber as instruções de recuperação
                      </p>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="forgot-email">Email</Label>
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowForgotPassword(false);
                              setForgotPasswordEmail("");
                            }}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleForgotPassword}
                            disabled={isLoading}
                            className="flex-1"
                          >
                            {isLoading ? "Enviando..." : "Enviar"}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          💡 <strong>Para testes:</strong> Use o email <code>teste@institutodossonhos.com</code> com senha <code>123456</code>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Signup Tab */}
                <TabsContent value="signup" className="space-y-6">
                  {/* Dados Pessoais */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-semibold text-foreground">Dados Pessoais</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-sm font-medium">Nome completo *</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Digite seu nome completo"
                          value={signupData.fullName}
                          onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                          className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-phone" className="text-sm font-medium flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            Celular *
                          </Label>
                          <Input
                            id="signup-phone"
                            type="tel"
                            placeholder="(11) 99999-9999"
                            value={signupData.phone}
                            onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                            className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-email" className="text-sm font-medium">Email *</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={signupData.email}
                            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                            className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <Label htmlFor="signup-birth" className="text-sm font-medium flex items-center gap-2">
                             <Calendar className="h-3 w-3" />
                             Data de Nascimento *
                           </Label>
                           <Input
                             id="signup-birth"
                             type="date"
                             value={signupData.birthDate}
                             onChange={(e) => setSignupData({ ...signupData, birthDate: e.target.value })}
                             className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                             required
                           />
                         </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-gender" className="text-sm font-medium">Gênero *</Label>
                          <Select 
                            value={signupData.gender} 
                            onValueChange={(value) => {
                              console.log('Gender selected:', value);
                              setSignupData({ ...signupData, gender: value });
                            }}
                          >
                            <SelectTrigger className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20">
                              <SelectValue placeholder="Selecione seu gênero" />
                            </SelectTrigger>
                            <SelectContent className="z-50">
                              <SelectItem value="male">Masculino</SelectItem>
                              <SelectItem value="female">Feminino</SelectItem>
                              <SelectItem value="other">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="space-y-2">
                           <Label htmlFor="signup-city" className="text-sm font-medium flex items-center gap-2">
                             <MapPin className="h-3 w-3" />
                             Cidade *
                           </Label>
                           <Input
                             id="signup-city"
                             type="text"
                             placeholder="Sua cidade"
                             value={signupData.city}
                             onChange={(e) => setSignupData({ ...signupData, city: e.target.value })}
                             className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                             required
                           />
                         </div>

                         <div className="space-y-2">
                           <Label htmlFor="signup-state" className="text-sm font-medium">Estado *</Label>
                           <Input
                             id="signup-state"
                             type="text"
                             placeholder="SP"
                             value={signupData.state}
                             onChange={(e) => setSignupData({ ...signupData, state: e.target.value })}
                             className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                             required
                           />
                         </div>

                         <div className="space-y-2">
                           <Label htmlFor="signup-height" className="text-sm font-medium flex items-center gap-2">
                             <Ruler className="h-3 w-3" />
                             Altura (cm) *
                           </Label>
                           <Input
                             id="signup-height"
                             type="number"
                             placeholder="175"
                             min="100"
                             max="250"
                             value={signupData.height}
                             onChange={(e) => setSignupData({ ...signupData, height: e.target.value })}
                             className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                             required
                           />
                         </div>
                       </div>
                    </div>
                  </div>

                  {/* Segurança */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Heart className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-semibold text-foreground">Segurança</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm font-medium">Senha *</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Crie uma senha forte"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-sm font-medium">Confirmar senha *</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirme sua senha"
                          value={signupData.confirmPassword}
                          onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                          className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-muted/20 rounded-lg border border-border/50">
                    <Checkbox 
                      id="terms" 
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                      Aceito os{" "}
                      <span className="text-primary hover:underline cursor-pointer font-medium">
                        termos de uso
                      </span>{" "}
                      e{" "}
                      <span className="text-primary hover:underline cursor-pointer font-medium">
                        política de privacidade
                      </span>
                    </Label>
                  </div>

                  <Button 
                    onClick={handleSignup}
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-medium shadow-lg shadow-green-500/25 transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Criando conta...
                      </div>
                    ) : (
                      "Criar minha conta"
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Social Proof */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Mais de <span className="font-semibold text-primary">10.000 pessoas</span> já transformaram suas vidas
              </p>
            </div>
            
            <Card className="border-0 bg-gradient-to-r from-primary/5 to-green-500/5 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Heart key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg font-medium mb-2">
                  "Transformei minha vida em 30 dias!"
                </p>
                <p className="text-sm text-muted-foreground">
                  Maria S. • Perdeu 8kg
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;