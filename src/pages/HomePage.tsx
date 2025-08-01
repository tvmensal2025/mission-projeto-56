import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Activity, 
  Target, 
  TrendingUp, 
  Users, 
  Award,
  ChevronRight,
  Play,
  Star,
  Calendar,
  BarChart3,
  Zap,
  ArrowRight,
  User
} from "lucide-react";

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const features = [
    {
      icon: Activity,
      title: "Missões Diárias",
      description: "Desenvolva hábitos saudáveis com missões personalizadas",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: TrendingUp,
      title: "Análise de Progresso",
      description: "Acompanhe sua evolução com gráficos detalhados",
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      icon: Users,
      title: "Comunidade",
      description: "Conecte-se com outros usuários e mantenha a motivação",
      color: "text-health-steps",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Award,
      title: "Sistema de Ranking",
      description: "Compete com amigos e alcance novos níveis",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      icon: Target,
      title: "Metas Personalizadas",
      description: "Defina objetivos específicos e alcance seus sonhos",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    }
  ];

  const stats = [
    { label: "Profissionais", value: "15+", icon: Users },
    { label: "Especialidades", value: "8", icon: Target },
    { label: "Anos de Experiência", value: "10+", icon: TrendingUp },
    { label: "Satisfação", value: "100%", icon: Star }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/20 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Health Platform</h1>
              <p className="text-xs text-muted-foreground">Instituto dos Sonhos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Button onClick={() => navigate("/dashboard")} variant="default">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    {user.email?.split("@")[0]}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button onClick={() => navigate("/auth")} variant="outline">
                  Entrar
                </Button>
                <Button onClick={() => navigate("/auth")} variant="default">
                  Começar Agora
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 text-sm px-4 py-2">
              🚀 Sua jornada de transformação começa aqui
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
              Transforme sua vida com a Health Platform
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              A plataforma completa para monitorar sua saúde, alcançar metas e transformar seus hábitos. 
              Junte-se a milhares de pessoas que já mudaram suas vidas.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleGetStarted} 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-transform"
              >
                <Play className="h-5 w-5 mr-2" />
                {user ? "Ir para Dashboard" : "Começar Gratuitamente"}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Funcionalidades Poderosas</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Descubra todas as ferramentas que nossa plataforma oferece para transformar sua jornada de saúde
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="group hover:scale-105 transition-all duration-300 cursor-pointer border-border/20 hover:border-primary/30 bg-gradient-to-br from-card to-card/50"
                  onClick={() => user ? navigate("/dashboard") : navigate("/auth")}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground group-hover:text-foreground transition-colors">
                      {feature.description}
                    </CardDescription>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-4" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <Zap className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-6">Pronto para Começar sua Transformação?</h2>
            <p className="text-xl text-muted-foreground mb-10">
              Junte-se a milhares de pessoas que já estão transformando suas vidas com nossa plataforma. 
              Comece hoje mesmo, é completamente gratuito!
            </p>
            
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="text-lg px-12 py-6 bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-transform"
            >
              <Heart className="h-5 w-5 mr-2" />
              {user ? "Voltar ao Dashboard" : "Começar Minha Jornada"}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-12 px-4 bg-card/20">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold">Health Platform</span>
          </div>
          
          <p className="text-muted-foreground mb-4">
            © 2024 Instituto dos Sonhos. Transformando vidas através da tecnologia.
          </p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span>Termos de Uso</span>
            <span>•</span>
            <span>Política de Privacidade</span>
            <span>•</span>
            <span>Suporte</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;