import React from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import NewHomePage from "./pages/NewHomePage";
import InstitutoHomePage from "./pages/InstitutoHomePage";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import AutoLoginPage from "./pages/AutoLoginPage";
import DashboardPage from "./pages/DashboardPage";
import CompleteDashboardPage from "./pages/CompleteDashboardPage";
import EnhancedDashboardPage from "./pages/EnhancedDashboardPage";
import AdminPage from "./pages/AdminPage";
import { CoursePlatform } from "./components/CoursePlatform";
import MissionSystem from "./components/MissionSystem";
import ProgressPage from "./pages/ProgressPage";
import NotFound from "./pages/NotFound";
import MyProgress from "./components/MyProgress";
import ColorTest from "./components/ColorTest";
import CSSDebug from "./components/CSSDebug";
import BodyChartsPage from "./pages/BodyChartsPage";
// Páginas comentadas temporariamente - não existem
// import GraficosDemoPage from "./pages/GraficosDemoPage";
// import GraficosTestePage from "./pages/GraficosTestePage";
// import CharacterDemoPage from "./pages/CharacterDemoPage";
// import DemoVendaPage from "./pages/DemoVendaPage";
import UserSessions from "./components/UserSessions";
// import QuestionBuilderPage from "./pages/QuestionBuilderPage";
// import { SabotadoresDemo } from "./pages/SabotadoresDemo";
// import SessionDetailPage from "./pages/SessionDetailPage";
// import ToolsManagementPage from "./pages/ToolsManagementPage";
// Challenges pages removed - functionality integrated into dashboard
import SaboteurTest from "./components/SaboteurTest";
import ScaleTestPage from "./pages/ScaleTestPage";
import { HealthChatBot } from "./components/HealthChatBot";
import WhatsAppChatPage from "./pages/WhatsAppChatPage";
import GoogleFitOAuthPage from "./pages/GoogleFitOAuthPage";
import { GoogleFitCallback } from "./pages/GoogleFitCallback";
import GoogleFitTestPage from "./pages/GoogleFitTestPage";
import GoalsPage from "./pages/GoalsPage";
import { HealthFeedPage } from "./pages/HealthFeedPage";
import RankingPage from "./components/RankingPage";
import TermsPage from "./pages/TermsPage";
import DashboardWithDraggableWidgets from "./components/DashboardWithDraggableWidgets";
import LimitingBeliefsWheel from "./components/LimitingBeliefsWheel";
import HealthPyramidMapping from "./components/HealthPyramidMapping";
import EmotionalTraumaMapping from "./components/EmotionalTraumaMapping";

import { AbundanceWheelPage } from "./pages/AbundanceWheelPage";
import { CompetencyWheelPage } from "./pages/CompetencyWheelPage";
import { GalileuChartsPage } from "./pages/GalileuChartsPage";
import ChallengeDetailPage from "./pages/ChallengeDetailPage";

// Componente para lidar com autenticação na rota de sessões
const SessionRoute = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <UserSessions user={user} />;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Home page - nova página inicial */}
            <Route path="/home" element={<HomePage />} />
            
            {/* Nova página inicial principal - Instituto dos Sonhos */}
            <Route path="/" element={<InstitutoHomePage />} />
            
            {/* Landing page alternativa */}
            <Route path="/landing" element={<LandingPage />} />
            
            {/* Auth page - standalone without layout */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/auto-login" element={<AutoLoginPage />} />
            
            {/* Dashboard - standalone without layout */}
            <Route path="/dashboard" element={<CompleteDashboardPage />} />
            <Route path="/enhanced-dashboard" element={<EnhancedDashboardPage />} />
            <Route path="/dashboard/progress" element={<MyProgress />} />
            
            {/* Admin - standalone without layout */}
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/health-feed" element={<HealthFeedPage />} />
            <Route path="/ranking" element={<RankingPage user={null} />} />
            
            {/* Challenge functionality moved to dashboard */}
            <Route path="/app/missions" element={<MissionSystem />} />
            <Route path="/app/goals" element={<GoalsPage />} />
            <Route path="/app/courses" element={<CoursePlatform viewMode="courses" />} />
            <Route path="/app/sessions" element={<SessionRoute />} />
            <Route path="/app/saboteur-test" element={<SaboteurTest />} />
            <Route path="/app/progress" element={<ProgressPage />} />
            <Route path="/app/scale-test" element={<ScaleTestPage />} />
            <Route path="/google-fit-oauth" element={<GoogleFitOAuthPage />} />
            <Route path="/google-fit-callback" element={<GoogleFitCallback />} />
            <Route path="/google-fit-test" element={<GoogleFitTestPage />} />
            <Route path="/app/abundance-wheel" element={<AbundanceWheelPage />} />
            <Route path="/app/competency-wheel" element={<CompetencyWheelPage />} />
            <Route path="/challenge/:challengeId" element={<ChallengeDetailPage />} />
            
            {/* Standalone pages */}
            <Route path="/index" element={<Index />} />
            <Route path="/dashboard-page" element={<DashboardPage />} />
            <Route path="/progress-page" element={<ProgressPage />} />
            <Route path="/color-test" element={<ColorTest />} />
            <Route path="/css-debug" element={<CSSDebug />} />
            <Route path="/body-charts" element={<BodyChartsPage />} />
            <Route path="/galileu-charts" element={<GalileuChartsPage />} />
            <Route path="/limiting-beliefs" element={<LimitingBeliefsWheel />} />
            <Route path="/health-pyramid" element={<HealthPyramidMapping />} />
            <Route path="/trauma-mapping" element={<EmotionalTraumaMapping />} />

            {/* Rotas comentadas - páginas não existem */}
            {/* <Route path="/graficos-demo" element={<GraficosDemoPage />} /> */}
            {/* <Route path="/graficos-teste" element={<GraficosTestePage />} /> */}
            {/* <Route path="/character-demo" element={<CharacterDemoPage />} /> */}
            {/* <Route path="/demo-venda" element={<DemoVendaPage />} /> */}
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Chat Bot Global */}
          <HealthChatBot />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
