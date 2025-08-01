import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Trophy, 
  Users, 
  Star, 
  Target, 
  Zap, 
  Scale, 
  TrendingUp, 
  Award, 
  Play,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Activity,
  Brain,
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Heart className="h-8 w-8 text-primary animate-pulse" />
              <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Instituto dos Sonhos</h1>
              <p className="text-xs text-muted-foreground">Transformação Real</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/auth">
              <Button variant="outline" className="hover:bg-muted">
                Entrar
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-primary hover:bg-primary/90 shadow-lg">
                Começar Agora
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10"></div>
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
            <Sparkles className="h-3 w-3 mr-1" />
            Metodologia Comprovada
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-up">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Transforme sua vida
            </span>
            <br />
            <span className="text-foreground">em 30 dias</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-up">
            Plataforma completa de saúde e bem-estar com gamificação, 
            <br className="hidden md:block" />
            <span className="text-primary font-semibold">integração com balança inteligente</span> e análise preditiva
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/auth">
              <Button 
                size="lg" 
                className="text-xl px-12 py-6 bg-primary hover:bg-primary/90 shadow-glow animate-scale-in"
              >
                <Play className="mr-2 h-5 w-5" />
                COMEÇAR JORNADA
              </Button>
            </Link>
            <Link to="/app/scale-test">
              <Button 
                variant="outline" 
                size="lg" 
                className="text-xl px-8 py-6 border-2 hover:bg-muted"
              >
                <Scale className="mr-2 h-5 w-5" />
                Testar Balança
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">10k+</div>
              <div className="text-sm text-muted-foreground">Usuários Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">15+</div>
              <div className="text-sm text-muted-foreground">Profissionais</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">30</div>
              <div className="text-sm text-muted-foreground">Dias para Resultados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">24/7</div>
              <div className="text-sm text-muted-foreground">Suporte Disponível</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Por que escolher o Instituto?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tecnologia de ponta combinada com metodologia científica para resultados reais
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="health-card hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Metodologia Científica</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Sistema baseado em evidências científicas para emagrecimento saudável e duradouro
                </p>
                <div className="flex items-center text-sm text-primary">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Comprovado por especialistas
                </div>
              </CardContent>
            </Card>
            
            <Card className="health-card hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-secondary/20 rounded-lg">
                    <Scale className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold">Balança Inteligente</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Integração com Xiaomi Scale 2 para medições precisas e análise corporal completa
                </p>
                <div className="flex items-center text-sm text-secondary">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Sincronização automática
                </div>
              </CardContent>
            </Card>
            
            <Card className="health-card hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-accent/20 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold">Análise Preditiva</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  IA avançada que prevê seu progresso e sugere otimizações personalizadas
                </p>
                <div className="flex items-center text-sm text-accent">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Recomendações inteligentes
                </div>
              </CardContent>
            </Card>
            
            <Card className="health-card hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Award className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold">Gamificação</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Sistema de conquistas e pontuação que torna sua jornada divertida e motivadora
                </p>
                <div className="flex items-center text-sm text-green-500">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Progresso gamificado
                </div>
              </CardContent>
            </Card>
            
            <Card className="health-card hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Brain className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold">Psicologia Positiva</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Abordagem focada em bem-estar mental e mudança de hábitos sustentável
                </p>
                <div className="flex items-center text-sm text-purple-500">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mindset transformador
                </div>
              </CardContent>
            </Card>
            
            <Card className="health-card hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Shield className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold">Privacidade Total</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Seus dados são protegidos com criptografia de ponta e nunca compartilhados
                </p>
                <div className="flex items-center text-sm text-blue-500">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Dados seguros
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Como Funciona?</h2>
            <p className="text-xl text-muted-foreground">
              Três passos simples para transformar sua vida
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Cadastre-se</h3>
              <p className="text-muted-foreground">
                Crie sua conta gratuitamente e configure seu perfil inicial
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-secondary">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Conecte sua Balança</h3>
              <p className="text-muted-foreground">
                Sincronize sua Xiaomi Scale 2 para medições automáticas
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-accent">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Acompanhe o Progresso</h3>
              <p className="text-muted-foreground">
                Visualize sua evolução com gráficos e análises detalhadas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para transformar sua vida?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já transformaram suas vidas com o Instituto dos Sonhos
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button 
                size="lg" 
                className="text-xl px-12 py-6 bg-primary hover:bg-primary/90 shadow-glow"
              >
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/app/scale-test">
              <Button 
                variant="outline" 
                size="lg" 
                className="text-xl px-8 py-6 border-2"
              >
                Testar Balança
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/20">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Instituto dos Sonhos</span>
          </div>
          <p className="text-muted-foreground">
            Transformando vidas através da tecnologia e ciência
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;