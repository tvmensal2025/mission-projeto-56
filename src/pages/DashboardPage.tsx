
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Heart, LogOut, Trophy, Target, Calendar, Activity, Smartphone, Bell, Users, BookOpen, TestTube, MessageCircle } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import SessionsPage from "@/components/SessionsPage";


import RankingPage from "@/components/RankingPage";
import { HealthChatBot } from "@/components/HealthChatBot";
import { CommunityButton } from "@/components/health-feed/CommunityButton";
import { HealthFeedPage } from "@/pages/HealthFeedPage";
import { CommunitySidebar } from "@/components/community/CommunitySidebar";
import { SofiaAnalysisDashboard } from "@/components/dashboard/SofiaAnalysisDashboard";
import { SmartTrackingWidget } from "@/components/tracking/SmartTrackingWidget";



const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

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

  if (!user) {
    return null; // Will redirect to auth
  }

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário";

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Responsivo */}
      <header className="border-b border-border/20 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Instituto dos Sonhos</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationBell />
            <Button onClick={handleLogout} variant="outline" size="sm" className="text-xs sm:text-sm">
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Responsivo */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Bem-vindo à sua jornada de transformação!</p>
        </div>

        {/* Community Button */}
        <CommunityButton />

        {/* Anamnesis Notification */}
        

        {/* Welcome Card - Responsivo */}
        <Card className="health-card mb-6 sm:mb-8">
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">🎉 Bem-vindo ao Instituto dos Sonhos!</h2>
              <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                Sua jornada de transformação começa agora. Estamos aqui para apoiá-lo em cada passo do caminho.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button className="bg-primary hover:bg-primary/90 text-sm sm:text-base">
                  Começar Primeira Missão
                </Button>
                <Button variant="outline" className="text-sm sm:text-base">
                  Ver Meu Progresso
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats - Grid Responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Dias no Instituto</CardTitle>
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                +1 desde ontem
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Missões Concluídas</CardTitle>
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Primeira missão aguardando
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card sm:col-span-2 md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Posição no Ranking</CardTitle>
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Complete missões para ranquear
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Layout Principal com Sofia Analysis */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8">
          {/* Conteúdo Principal */}
          <div className="xl:col-span-3 space-y-6 sm:space-y-8">


          {/* Quick Actions - Grid Responsivo */}
          <Card className="health-card">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <Button variant="outline" className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm">
                  <Target className="h-4 w-4 sm:h-6 sm:w-6" />
                  <span>Missões</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm"
                  onClick={() => navigate('/google-fit-test')}
                >
                  <TestTube className="h-4 w-4 sm:h-6 sm:w-6" />
                  <span>Teste Google Fit</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm"
                  onClick={() => navigate('/ranking')}
                >
                  <Trophy className="h-4 w-4 sm:h-6 sm:w-6" />
                  <span>Ranking</span>
                </Button>
                
                <Button variant="outline" className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm">
                  <Calendar className="h-4 w-4 sm:h-6 sm:w-6" />
                  <span>Progresso</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm"
                  onClick={() => navigate('/app/courses')}
                >
                  <BookOpen className="h-4 w-4 sm:h-6 sm:w-6" />
                  <span>Cursos</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Plataforma dos Sonhos */}
          <Card className="health-card">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                🌟 Plataforma dos Sonhos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative group cursor-pointer" onClick={() => navigate('/app/courses')}>
                <div className="relative h-48 w-full overflow-hidden rounded-lg">
                  <img 
                    src="https://institutodossonhos.com.br/wp-content/uploads/2025/07/imgi_17_img_0_7-CHAVES-CAPA_247f4babde0e42c996d2506c79facbf6.jpg" 
                    alt="Plataforma dos Sonhos"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold mb-2">Plataforma dos Sonhos</h3>
                    <p className="text-sm opacity-90">Desenvolvimento pessoal e bem-estar através de práticas transformadoras</p>
                  </div>
                  <Badge className="absolute top-3 right-3 bg-yellow-500 text-black">
                    Premium
                  </Badge>
                </div>
                <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Acessar Cursos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sessões */}
          <Card className="health-card">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Suas Sessões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SessionsPage user={user} />
            </CardContent>
          </Card>


           {/* Comunidade */}
           <Card className="health-card">
             <CardHeader>
               <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                 <Users className="h-5 w-5" />
                 Comunidade
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="flex gap-6">
                 <div className="flex-1">
                   <HealthFeedPage />
                 </div>
                 <div className="hidden xl:block">
                   <CommunitySidebar />
                 </div>
               </div>
             </CardContent>
           </Card>
          </div>

          {/* Sofia Analysis Sidebar */}
          <div className="xl:col-span-1">
            <div className="sticky top-24 space-y-4">
              <SmartTrackingWidget user={user} />
              <SofiaAnalysisDashboard user={user} className="max-h-[800px] overflow-y-auto" />
            </div>
          </div>
        </div>
      </main>
      
      {/* Health ChatBot - Floating Assistant */}
      <HealthChatBot />
      
      {/* Botão para abrir WhatsApp Chat */}
      <Link to="/whatsapp-chat">
        <Button 
          className="fixed bottom-20 right-4 lg:bottom-24 lg:right-6 h-12 w-12 lg:h-14 lg:w-14 rounded-full shadow-lg bg-green-500 hover:bg-green-600 z-40"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </Link>
    </div>
  );
};

export default DashboardPage;
