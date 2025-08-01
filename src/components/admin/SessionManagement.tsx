import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Edit, Trash2, Send, Clock, Target, 
  BookOpen, Users, CheckCircle, AlertCircle,
  Filter, Search, Calendar, FileText
} from 'lucide-react';

interface Session {
  id: string;
  title: string;
  description: string;
  type: string;
  content: any;
  target_saboteurs: string[];
  difficulty: string;
  estimated_time: number;
  materials_needed: string[];
  follow_up_questions: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface UserSession {
  id: string;
  session_id: string;
  user_id: string;
  status: string;
  assigned_at: string;
  started_at?: string;
  completed_at?: string;
  progress: number;
  feedback?: string;
  sessions: Session;
}

interface Profile {
  user_id: string;
  full_name: string;
  email?: string;
}

interface SessionManagementProps {
  user: User | null;
}

export default function SessionManagement({ user }: SessionManagementProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    assignedSessions: 0,
    completedSessions: 0
  });
  const { toast } = useToast();

  // Form states
const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'saboteur_work',
    difficulty: 'beginner',
    estimated_time: 30,
    content: '{}',
    target_saboteurs: [] as string[],
    materials_needed: [] as string[],
    follow_up_questions: [] as string[]
  });

  // Templates de sessão predefinidos
  const sessionTemplates = {
    roda_vida: {
      title: "🎯 Roda da Vida - Avaliação de Equilíbrio Geral",
      description: "Avalie o equilíbrio das 12 áreas fundamentais da vida através de uma interface interativa. Receba análises personalizadas e um plano de ação para melhorar seu bem-estar geral.",
      type: "life_wheel_assessment",
      difficulty: "beginner",
      estimated_time: 15,
      materials_needed: ["Concentração", "Local tranquilo", "10-15 minutos disponíveis"],
      target_saboteurs: ["Desequilíbrio de vida", "Falta de autoconhecimento", "Negligência com áreas importantes"],
      follow_up_questions: [
        "Quais áreas da sua vida estão mais equilibradas?",
        "Que áreas precisam de mais atenção e cuidado?",
        "Como você pode criar um plano para melhorar as áreas críticas?",
        "Qual seria sua prioridade número 1 para os próximos 30 dias?"
      ],
      content: {
        introduction: "A Roda da Vida avalia o equilíbrio das 12 áreas fundamentais da vida. Para cada área, selecione o emoji que melhor representa sua satisfação atual.",
        wheel_interface: true,
        results_display: "life_wheel_radar",
        track_evolution: true,
        areas: [
          {
            id: "saude_disposicao",
            name: "Saúde e Disposição", 
            question: "Como está sua saúde física e disposição?",
            icon: "💪",
            color: "#FF6B6B",
            emoji_options: [
              { value: 1, emoji: "😞", label: "Muito ruim" },
              { value: 2, emoji: "😕", label: "Ruim" },
              { value: 3, emoji: "😐", label: "Regular" },
              { value: 4, emoji: "🙂", label: "Bom" },
              { value: 5, emoji: "😊", label: "Excelente" }
            ]
          },
          {
            id: "desenvolvimento_intelectual",
            name: "Desenvolvimento Intelectual",
            question: "Como está seu desenvolvimento intelectual e aprendizado?",
            icon: "🧠",
            color: "#4ECDC4",
            emoji_options: [
              { value: 1, emoji: "😞", label: "Muito ruim" },
              { value: 2, emoji: "😕", label: "Ruim" },
              { value: 3, emoji: "😐", label: "Regular" },
              { value: 4, emoji: "🙂", label: "Bom" },
              { value: 5, emoji: "😊", label: "Excelente" }
            ]
          },
          {
            id: "equilibrio_emocional",
            name: "Equilíbrio Emocional",
            question: "Como está seu equilíbrio emocional?",
            icon: "🧘",
            color: "#45B7D1",
            emoji_options: [
              { value: 1, emoji: "😞", label: "Muito ruim" },
              { value: 2, emoji: "😕", label: "Ruim" },
              { value: 3, emoji: "😐", label: "Regular" },
              { value: 4, emoji: "🙂", label: "Bom" },
              { value: 5, emoji: "😊", label: "Excelente" }
            ]
          },
          {
            id: "realizacao_proposito",
            name: "Realização e Propósito",
            question: "Como está sua realização e propósito de vida?",
            icon: "🎯",
            color: "#96CEB4",
            emoji_options: [
              { value: 1, emoji: "😞", label: "Muito ruim" },
              { value: 2, emoji: "😕", label: "Ruim" },
              { value: 3, emoji: "😐", label: "Regular" },
              { value: 4, emoji: "🙂", label: "Bom" },
              { value: 5, emoji: "😊", label: "Excelente" }
            ]
          },
          {
            id: "recursos_financeiros",
            name: "Recursos Financeiros",
            question: "Como estão seus recursos financeiros?",
            icon: "💰",
            color: "#FECA57",
            emoji_options: [
              { value: 1, emoji: "😞", label: "Muito ruim" },
              { value: 2, emoji: "😕", label: "Ruim" },
              { value: 3, emoji: "😐", label: "Regular" },
              { value: 4, emoji: "🙂", label: "Bom" },
              { value: 5, emoji: "😊", label: "Excelente" }
            ]
          },
          {
            id: "contribuicao_social",
            name: "Contribuição Social",
            question: "Como está sua contribuição para a sociedade?",
            icon: "🤝",
            color: "#FF9FF3",
            emoji_options: [
              { value: 1, emoji: "😞", label: "Muito ruim" },
              { value: 2, emoji: "😕", label: "Ruim" },
              { value: 3, emoji: "😐", label: "Regular" },
              { value: 4, emoji: "🙂", label: "Bom" },
              { value: 5, emoji: "😊", label: "Excelente" }
            ]
          },
          {
            id: "familia",
            name: "Família",
            question: "Como está sua vida familiar?",
            icon: "👨‍👩‍👧‍👦",
            color: "#54A0FF",
            emoji_options: [
              { value: 1, emoji: "😞", label: "Muito ruim" },
              { value: 2, emoji: "😕", label: "Ruim" },
              { value: 3, emoji: "😐", label: "Regular" },
              { value: 4, emoji: "🙂", label: "Bom" },
              { value: 5, emoji: "😊", label: "Excelente" }
            ]
          },
          {
            id: "desenvolvimento_amoroso",
            name: "Desenvolvimento Amoroso",
            question: "Como está seu desenvolvimento amoroso?",
            icon: "💕",
            color: "#5F27CD",
            emoji_options: [
              { value: 1, emoji: "😞", label: "Muito ruim" },
              { value: 2, emoji: "😕", label: "Ruim" },
              { value: 3, emoji: "😐", label: "Regular" },
              { value: 4, emoji: "🙂", label: "Bom" },
              { value: 5, emoji: "😊", label: "Excelente" }
            ]
          },
          {
            id: "vida_social",
            name: "Vida Social",
            question: "Como está sua vida social?",
            icon: "👥",
            color: "#00D2D3",
            emoji_options: [
              { value: 1, emoji: "😞", label: "Muito ruim" },
              { value: 2, emoji: "😕", label: "Ruim" },
              { value: 3, emoji: "😐", label: "Regular" },
              { value: 4, emoji: "🙂", label: "Bom" },
              { value: 5, emoji: "😊", label: "Excelente" }
            ]
          },
          {
            id: "hobbies_diversao",
            name: "Hobbies e Diversão",
            question: "Como estão seus hobbies e momentos de diversão?",
            icon: "🎮",
            color: "#FF6348",
            emoji_options: [
              { value: 1, emoji: "😞", label: "Muito ruim" },
              { value: 2, emoji: "😕", label: "Ruim" },
              { value: 3, emoji: "😐", label: "Regular" },
              { value: 4, emoji: "🙂", label: "Bom" },
              { value: 5, emoji: "😊", label: "Excelente" }
            ]
          },
          {
            id: "plenitude_felicidade",
            name: "Plenitude e Felicidade",
            question: "Como está sua sensação de plenitude e felicidade?",
            icon: "✨",
            color: "#48CAE4",
            emoji_options: [
              { value: 1, emoji: "😞", label: "Muito ruim" },
              { value: 2, emoji: "😕", label: "Ruim" },
              { value: 3, emoji: "😐", label: "Regular" },
              { value: 4, emoji: "🙂", label: "Bom" },
              { value: 5, emoji: "😊", label: "Excelente" }
            ]
          },
          {
            id: "espiritualidade",
            name: "Espiritualidade",
            question: "Como está sua espiritualidade?",
            icon: "🙏",
            color: "#A8E6CF",
            emoji_options: [
              { value: 1, emoji: "😞", label: "Muito ruim" },
              { value: 2, emoji: "😕", label: "Ruim" },
              { value: 3, emoji: "😐", label: "Regular" },
              { value: 4, emoji: "🙂", label: "Bom" },
              { value: 5, emoji: "😊", label: "Excelente" }
            ]
          }
        ],
        feedback_analysis: {
          critical_areas: "Áreas com pontuação 1-2 que precisam de atenção urgente",
          attention_areas: "Áreas com pontuação 3 que podem ser melhoradas", 
          strong_areas: "Áreas com pontuação 4-5 que estão bem equilibradas",
          action_plan: "Plano personalizado baseado nas respostas do usuário"
        }
      }
    },
    roda_saude_completa: {
      title: "🩺 Roda da Saúde IDS - Avaliação Completa (147 Sintomas)",
      description: "Mapeamento completo de sintomas em 12 sistemas corporais com avaliação de frequência e intensidade. Sistema adaptativo que coleta dados para visualização em roda e evolução temporal.",
      type: "health_wheel_assessment",
      difficulty: "intermediate",
      estimated_time: 15,
      materials_needed: ["Concentração", "Local tranquilo", "15 minutos disponíveis"],
      target_saboteurs: ["Negligência com a saúde", "Negação de sintomas", "Autodiagnóstico inadequado"],
      follow_up_questions: [
        "Quais sistemas apresentaram maior concentração de sintomas?",
        "Há correlação entre sintomas de diferentes sistemas?",
        "Como está sua evolução comparando com avaliações anteriores?",
        "Que medidas preventivas são prioritárias para você?"
      ],
      content: {
        introduction: "Este questionário avalia 147 sintomas organizados em 12 sistemas corporais. Para sintomas presentes, você será questionado sobre a intensidade. Baseie suas respostas nos últimos 30 dias.",
        conditional_flow: true,
        results_display: "health_wheel",
        track_evolution: true,
        systems: [
          {
            name: "Cabeça e Neurológico",
            icon: "🧠",
            color: "#FF6B6B",
            questions: [
              { id: "cabeca_dor", text: "Nos últimos 30 dias, teve dor de cabeça?", type: "frequency_intensity" },
              { id: "cabeca_enxaqueca", text: "Nos últimos 30 dias, teve enxaqueca?", type: "frequency_intensity" },
              { id: "cabeca_tontura", text: "Nos últimos 30 dias, teve tontura?", type: "frequency_intensity" },
              { id: "cabeca_vertigem", text: "Nos últimos 30 dias, teve vertigem?", type: "frequency_intensity" },
              { id: "cabeca_pesada", text: "Nos últimos 30 dias, teve sensação de cabeça pesada?", type: "frequency_intensity" },
              { id: "cabeca_pressao", text: "Nos últimos 30 dias, teve pressão na cabeça?", type: "frequency_intensity" },
              { id: "cabeca_vazia", text: "Nos últimos 30 dias, teve sensação de cabeça vazia?", type: "frequency_intensity" },
              { id: "ouvido_zumbido", text: "Nos últimos 30 dias, teve zumbido no ouvido?", type: "frequency_intensity" },
              { id: "ouvido_tampado", text: "Nos últimos 30 dias, teve sensação de ouvido tampado?", type: "frequency_intensity" },
              { id: "ouvido_dor", text: "Nos últimos 30 dias, teve dor no ouvido?", type: "frequency_intensity" },
              { id: "ouvido_secrecao", text: "Nos últimos 30 dias, teve secreção no ouvido?", type: "frequency_intensity" },
              { id: "ouvido_perda_auditiva", text: "Nos últimos 30 dias, teve perda auditiva?", type: "frequency_intensity" },
              { id: "ouvido_sensibilidade_sons", text: "Nos últimos 30 dias, teve sensibilidade a sons?", type: "frequency_intensity" },
              { id: "mandibula_dor", text: "Nos últimos 30 dias, teve dor na mandíbula?", type: "frequency_intensity" },
              { id: "dentes_ranger", text: "Nos últimos 30 dias, ranger os dentes?", type: "frequency_intensity" }
            ]
          },
          {
            name: "Olhos e Visual",
            icon: "👁️",
            color: "#4ECDC4",
            questions: [
              { id: "olhos_inchados", text: "Nos últimos 30 dias, seus olhos ficaram inchados, vermelhos ou com cílios colando?", type: "frequency_intensity" },
              { id: "olhos_visao_embacada", text: "Nos últimos 30 dias, teve visão embaçada?", type: "frequency_intensity" },
              { id: "olhos_coceira", text: "Nos últimos 30 dias, teve coceira nos olhos?", type: "frequency_intensity" },
              { id: "olhos_vermelhos", text: "Nos últimos 30 dias, teve olhos vermelhos?", type: "frequency_intensity" },
              { id: "olhos_sensibilidade_luz", text: "Nos últimos 30 dias, teve sensibilidade à luz?", type: "frequency_intensity" },
              { id: "olhos_secos", text: "Nos últimos 30 dias, teve olhos secos?", type: "frequency_intensity" },
              { id: "olhos_lacrimejantes", text: "Nos últimos 30 dias, teve olhos lacrimejantes?", type: "frequency_intensity" },
              { id: "palpebras_inchadas", text: "Nos últimos 30 dias, teve pálpebras inchadas?", type: "frequency_intensity" },
              { id: "olheiras", text: "Nos últimos 30 dias, teve olheiras?", type: "frequency_intensity" },
              { id: "visao_dupla", text: "Nos últimos 30 dias, teve visão dupla?", type: "frequency_intensity" },
              { id: "pontos_flutuantes", text: "Nos últimos 30 dias, teve pontos flutuantes na visão?", type: "frequency_intensity" },
              { id: "perda_visao", text: "Nos últimos 30 dias, teve perda de visão?", type: "frequency_intensity" }
            ]
          },
          {
            name: "Nariz e Respiratório",
            icon: "👃",
            color: "#45B7D1",
            questions: [
              { id: "nariz_coriza", text: "Nos últimos 30 dias, teve coriza?", type: "frequency_intensity" },
              { id: "nariz_congestao", text: "Nos últimos 30 dias, teve congestão nasal?", type: "frequency_intensity" },
              { id: "nariz_espirros", text: "Nos últimos 30 dias, teve espirros frequentes?", type: "frequency_intensity" },
              { id: "nariz_sangramento", text: "Nos últimos 30 dias, teve sangramento nasal?", type: "frequency_intensity" },
              { id: "nariz_perda_olfato", text: "Nos últimos 30 dias, teve perda de olfato?", type: "frequency_intensity" },
              { id: "nariz_secrecao", text: "Nos últimos 30 dias, teve secreção nasal?", type: "frequency_intensity" },
              { id: "nariz_coceira", text: "Nos últimos 30 dias, teve coceira no nariz?", type: "frequency_intensity" },
              { id: "respiracao_boca", text: "Nos últimos 30 dias, respirou pela boca?", type: "frequency_intensity" },
              { id: "ronco", text: "Nos últimos 30 dias, teve ronco?", type: "frequency_intensity" },
              { id: "apneia_sono", text: "Nos últimos 30 dias, teve apneia do sono?", type: "frequency_intensity" }
            ]
          },
          {
            name: "Garganta e Vocal",
            icon: "🗣️",
            color: "#96CEB4",
            questions: [
              { id: "garganta_dor", text: "Nos últimos 30 dias, teve dor de garganta?", type: "frequency_intensity" },
              { id: "garganta_rouquidao", text: "Nos últimos 30 dias, teve rouquidão?", type: "frequency_intensity" },
              { id: "garganta_dificuldade_engolir", text: "Nos últimos 30 dias, teve dificuldade para engolir?", type: "frequency_intensity" },
              { id: "garganta_caroco", text: "Nos últimos 30 dias, teve sensação de caroço na garganta?", type: "frequency_intensity" },
              { id: "tosse_seca", text: "Nos últimos 30 dias, teve tosse seca?", type: "frequency_intensity" },
              { id: "tosse_catarro", text: "Nos últimos 30 dias, teve tosse com catarro?", type: "frequency_intensity" },
              { id: "garganta_seca", text: "Nos últimos 30 dias, teve garganta seca?", type: "frequency_intensity" },
              { id: "amigdalas_inchadas", text: "Nos últimos 30 dias, teve amígdalas inchadas?", type: "frequency_intensity" }
            ]
          },
          {
            name: "Pulmões e Respiratório",
            icon: "🫁",
            color: "#FECA57",
            questions: [
              { id: "pulmoes_falta_ar", text: "Nos últimos 30 dias, teve falta de ar?", type: "frequency_intensity" },
              { id: "pulmoes_tosse_catarro", text: "Nos últimos 30 dias, teve tosse com catarro?", type: "frequency_intensity" },
              { id: "pulmoes_chiado", text: "Nos últimos 30 dias, teve chiado no peito?", type: "frequency_intensity" },
              { id: "pulmoes_dor_respirar", text: "Nos últimos 30 dias, teve dor no peito ao respirar?", type: "frequency_intensity" },
              { id: "respiracao_curta", text: "Nos últimos 30 dias, teve respiração curta?", type: "frequency_intensity" },
              { id: "respiracao_ofegante", text: "Nos últimos 30 dias, teve respiração ofegante?", type: "frequency_intensity" },
              { id: "peito_apertado", text: "Nos últimos 30 dias, teve sensação de peito apertado?", type: "frequency_intensity" },
              { id: "tosse_noturna", text: "Nos últimos 30 dias, teve tosse noturna?", type: "frequency_intensity" },
              { id: "expectoracao", text: "Nos últimos 30 dias, teve expectoração?", type: "frequency_intensity" },
              { id: "respiracao_ruidosa", text: "Nos últimos 30 dias, teve respiração ruidosa?", type: "frequency_intensity" },
              { id: "sensacao_sufocamento", text: "Nos últimos 30 dias, teve sensação de sufocamento?", type: "frequency_intensity" },
              { id: "dor_costas_respirar", text: "Nos últimos 30 dias, teve dor nas costas ao respirar?", type: "frequency_intensity" }
            ]
          },
          {
            name: "Coração e Cardiovascular",
            icon: "❤️",
            color: "#FF9FF3",
            questions: [
              { id: "coracao_palpitacoes", text: "Nos últimos 30 dias, teve palpitações?", type: "frequency_intensity" },
              { id: "coracao_dor_peito", text: "Nos últimos 30 dias, teve dor no peito?", type: "frequency_intensity" },
              { id: "pressao_alta", text: "Nos últimos 30 dias, teve pressão alta?", type: "frequency_intensity" },
              { id: "pressao_baixa", text: "Nos últimos 30 dias, teve pressão baixa?", type: "frequency_intensity" },
              { id: "pernas_inchadas", text: "Nos últimos 30 dias, teve inchaço nas pernas?", type: "frequency_intensity" },
              { id: "batimentos_irregulares", text: "Nos últimos 30 dias, teve batimentos irregulares?", type: "frequency_intensity" },
              { id: "coracao_acelerado", text: "Nos últimos 30 dias, teve sensação de coração acelerado?", type: "frequency_intensity" },
              { id: "dor_braco_esquerdo", text: "Nos últimos 30 dias, teve dor no braço esquerdo?", type: "frequency_intensity" },
              { id: "sensacao_desmaio", text: "Nos últimos 30 dias, teve sensação de desmaio?", type: "frequency_intensity" },
              { id: "suor_frio", text: "Nos últimos 30 dias, teve suor frio?", type: "frequency_intensity" }
            ]
          },
          {
            name: "Estômago e Digestivo",
            icon: "🥙",
            color: "#54A0FF",
            questions: [
              { id: "estomago_dor", text: "Nos últimos 30 dias, teve dor de estômago?", type: "frequency_intensity" },
              { id: "estomago_azia", text: "Nos últimos 30 dias, teve azia?", type: "frequency_intensity" },
              { id: "estomago_nausea", text: "Nos últimos 30 dias, teve náusea?", type: "frequency_intensity" },
              { id: "vomito", text: "Nos últimos 30 dias, teve vômito?", type: "frequency_intensity" },
              { id: "estomago_pesado", text: "Nos últimos 30 dias, teve sensação de estômago pesado?", type: "frequency_intensity" },
              { id: "refluxo", text: "Nos últimos 30 dias, teve refluxo?", type: "frequency_intensity" },
              { id: "queimacao", text: "Nos últimos 30 dias, teve sensação de queimação?", type: "frequency_intensity" },
              { id: "perda_apetite", text: "Nos últimos 30 dias, teve perda de apetite?", type: "frequency_intensity" },
              { id: "estomago_vazio", text: "Nos últimos 30 dias, teve sensação de estômago vazio?", type: "frequency_intensity" },
              { id: "eructacao", text: "Nos últimos 30 dias, teve eructação (arrotos)?", type: "frequency_intensity" },
              { id: "empachamento", text: "Nos últimos 30 dias, teve sensação de empachamento?", type: "frequency_intensity" },
              { id: "dor_apos_comer", text: "Nos últimos 30 dias, teve dor após comer?", type: "frequency_intensity" }
            ]
          },
          {
            name: "Intestino e Digestivo",
            icon: "🔄",
            color: "#5F27CD",
            questions: [
              { id: "intestino_diarreia", text: "Nos últimos 30 dias, teve diarreia?", type: "frequency_intensity" },
              { id: "intestino_prisao_ventre", text: "Nos últimos 30 dias, teve prisão de ventre?", type: "frequency_intensity" },
              { id: "intestino_gases", text: "Nos últimos 30 dias, teve gases?", type: "frequency_intensity" },
              { id: "colicas_intestinais", text: "Nos últimos 30 dias, teve cólicas intestinais?", type: "frequency_intensity" },
              { id: "sangue_fezes", text: "Nos últimos 30 dias, teve sangue nas fezes?", type: "frequency_intensity" },
              { id: "fezes_moles", text: "Nos últimos 30 dias, teve fezes moles?", type: "frequency_intensity" },
              { id: "fezes_duras", text: "Nos últimos 30 dias, teve fezes duras?", type: "frequency_intensity" },
              { id: "evacuacao_incompleta", text: "Nos últimos 30 dias, teve sensação de evacuação incompleta?", type: "frequency_intensity" },
              { id: "dor_abdominal", text: "Nos últimos 30 dias, teve dor abdominal?", type: "frequency_intensity" },
              { id: "inchaco_abdominal", text: "Nos últimos 30 dias, teve inchaço abdominal?", type: "frequency_intensity" },
              { id: "urgencia_evacuar", text: "Nos últimos 30 dias, teve sensação de urgência para evacuar?", type: "frequency_intensity" },
              { id: "muco_fezes", text: "Nos últimos 30 dias, teve muco nas fezes?", type: "frequency_intensity" }
            ]
          },
          {
            name: "Fígado e Hepático",
            icon: "🥩",
            color: "#00D2D3",
            questions: [
              { id: "figado_dor_lado_direito", text: "Nos últimos 30 dias, teve dor no lado direito?", type: "frequency_intensity" },
              { id: "amarelamento_pele", text: "Nos últimos 30 dias, teve amarelamento da pele?", type: "frequency_intensity" },
              { id: "amarelamento_olhos", text: "Nos últimos 30 dias, teve amarelamento dos olhos?", type: "frequency_intensity" },
              { id: "urina_escura", text: "Nos últimos 30 dias, teve urina escura?", type: "frequency_intensity" },
              { id: "fezes_claras", text: "Nos últimos 30 dias, teve fezes claras?", type: "frequency_intensity" },
              { id: "coceira_pele", text: "Nos últimos 30 dias, teve coceira na pele?", type: "frequency_intensity" },
              { id: "estomago_inchado", text: "Nos últimos 30 dias, teve sensação de estômago inchado?", type: "frequency_intensity" },
              { id: "perda_apetite_figado", text: "Nos últimos 30 dias, teve perda de apetite?", type: "frequency_intensity" }
            ]
          },
          {
            name: "Rins e Urinário",
            icon: "🫘",
            color: "#FF6348",
            questions: [
              { id: "rins_dor_costas", text: "Nos últimos 30 dias, teve dor nas costas (região dos rins)?", type: "frequency_intensity" },
              { id: "alteracao_urina", text: "Nos últimos 30 dias, teve alteração na urina?", type: "frequency_intensity" },
              { id: "vontade_urinar_frequente", text: "Nos últimos 30 dias, teve vontade de urinar frequentemente?", type: "frequency_intensity" },
              { id: "dor_urinar", text: "Nos últimos 30 dias, teve dor ao urinar?", type: "frequency_intensity" },
              { id: "sangue_urina", text: "Nos últimos 30 dias, teve sangue na urina?", type: "frequency_intensity" },
              { id: "urina_espuma", text: "Nos últimos 30 dias, teve urina com espuma?", type: "frequency_intensity" },
              { id: "incontinencia_urinaria", text: "Nos últimos 30 dias, teve incontinência urinária?", type: "frequency_intensity" },
              { id: "retencao_urinaria", text: "Nos últimos 30 dias, teve retenção urinária?", type: "frequency_intensity" },
              { id: "urina_cheiro_forte", text: "Nos últimos 30 dias, teve urina com cheiro forte?", type: "frequency_intensity" },
              { id: "inchaco_pes", text: "Nos últimos 30 dias, teve inchaço nos pés?", type: "frequency_intensity" }
            ]
          },
          {
            name: "Músculos e Locomotor",
            icon: "💪",
            color: "#2ED573",
            questions: [
              { id: "musculos_dores", text: "Nos últimos 30 dias, teve dores musculares?", type: "frequency_intensity" },
              { id: "musculos_caibras", text: "Nos últimos 30 dias, teve cãibras?", type: "frequency_intensity" },
              { id: "fraqueza_muscular", text: "Nos últimos 30 dias, teve fraqueza muscular?", type: "frequency_intensity" },
              { id: "tremores", text: "Nos últimos 30 dias, teve tremores?", type: "frequency_intensity" },
              { id: "espasmos_musculares", text: "Nos últimos 30 dias, teve espasmos musculares?", type: "frequency_intensity" },
              { id: "rigidez_muscular", text: "Nos últimos 30 dias, teve rigidez muscular?", type: "frequency_intensity" },
              { id: "peso_pernas", text: "Nos últimos 30 dias, teve sensação de peso nas pernas?", type: "frequency_intensity" },
              { id: "peso_bracos", text: "Nos últimos 30 dias, teve sensação de peso nos braços?", type: "frequency_intensity" },
              { id: "fadiga_muscular", text: "Nos últimos 30 dias, teve fadiga muscular?", type: "frequency_intensity" },
              { id: "formigamento", text: "Nos últimos 30 dias, teve sensação de formigamento?", type: "frequency_intensity" },
              { id: "dormencia", text: "Nos últimos 30 dias, teve sensação de dormência?", type: "frequency_intensity" },
              { id: "queimacao_muscular", text: "Nos últimos 30 dias, teve sensação de queimação muscular?", type: "frequency_intensity" }
            ]
          },
          {
            name: "Ossos e Articulações",
            icon: "🦴",
            color: "#FFA502",
            questions: [
              { id: "ossos_dor_articulacoes", text: "Nos últimos 30 dias, teve dor nas articulações?", type: "frequency_intensity" },
              { id: "rigidez_matinal", text: "Nos últimos 30 dias, teve rigidez matinal?", type: "frequency_intensity" },
              { id: "inchaco_articulacoes", text: "Nos últimos 30 dias, teve inchaço nas articulações?", type: "frequency_intensity" },
              { id: "dificuldade_movimentar", text: "Nos últimos 30 dias, teve dificuldade para se movimentar?", type: "frequency_intensity" },
              { id: "fraturas", text: "Nos últimos 30 dias, teve fraturas?", type: "frequency_intensity" },
              { id: "dor_coluna", text: "Nos últimos 30 dias, teve dor na coluna?", type: "frequency_intensity" },
              { id: "dor_pescoco", text: "Nos últimos 30 dias, teve dor no pescoço?", type: "frequency_intensity" },
              { id: "dor_ombros", text: "Nos últimos 30 dias, teve dor nos ombros?", type: "frequency_intensity" },
              { id: "dor_joelhos", text: "Nos últimos 30 dias, teve dor nos joelhos?", type: "frequency_intensity" },
              { id: "dor_tornozelos", text: "Nos últimos 30 dias, teve dor nos tornozelos?", type: "frequency_intensity" }
            ]
          },
          {
            name: "Pele e Dermatológico",
            icon: "🧴",
            color: "#3742FA",
            questions: [
              { id: "pele_coceira", text: "Nos últimos 30 dias, teve coceira na pele?", type: "frequency_intensity" },
              { id: "pele_manchas", text: "Nos últimos 30 dias, teve manchas na pele?", type: "frequency_intensity" },
              { id: "pele_acne", text: "Nos últimos 30 dias, teve acne?", type: "frequency_intensity" },
              { id: "erupcoes_cutaneas", text: "Nos últimos 30 dias, teve erupções cutâneas?", type: "frequency_intensity" },
              { id: "feridas_nao_cicatrizam", text: "Nos últimos 30 dias, teve feridas que não cicatrizam?", type: "frequency_intensity" },
              { id: "pele_seca", text: "Nos últimos 30 dias, teve pele seca?", type: "frequency_intensity" },
              { id: "pele_oleosa", text: "Nos últimos 30 dias, teve pele oleosa?", type: "frequency_intensity" },
              { id: "queda_cabelo", text: "Nos últimos 30 dias, teve queda de cabelo?", type: "frequency_intensity" },
              { id: "unhas_quebradicas", text: "Nos últimos 30 dias, teve unhas quebradiças?", type: "frequency_intensity" },
              { id: "suor_excessivo", text: "Nos últimos 30 dias, teve suor excessivo?", type: "frequency_intensity" }
            ]
          },
          {
            name: "Sistema Imune",
            icon: "🛡️",
            color: "#FF3838",
            questions: [
              { id: "imune_febre", text: "Nos últimos 30 dias, teve febre?", type: "frequency_intensity" },
              { id: "infeccoes_frequentes", text: "Nos últimos 30 dias, teve infecções frequentes?", type: "frequency_intensity" },
              { id: "alergias", text: "Nos últimos 30 dias, teve alergias?", type: "frequency_intensity" },
              { id: "ganglios_inchados", text: "Nos últimos 30 dias, teve gânglios inchados?", type: "frequency_intensity" },
              { id: "cansaco_excessivo", text: "Nos últimos 30 dias, teve cansaço excessivo?", type: "frequency_intensity" },
              { id: "mal_estar_geral", text: "Nos últimos 30 dias, teve sensação de mal-estar geral?", type: "frequency_intensity" }
            ]
          }
        ],
        frequency_options: ["Não", "Ocasionalmente", "Frequentemente"],
        intensity_options: ["Leve", "Forte"],
        scoring: {
          frequency: { "Não": 0, "Ocasionalmente": 1, "Frequentemente": 2 },
          intensity: { "Leve": 1, "Forte": 2 }
        },
        results_interpretation: {
          "0-30": "Excelente estado de saúde geral",
          "31-60": "Bom estado geral com alguns pontos de atenção",
          "61-120": "Estado moderado - recomenda-se avaliação médica",
          "121-180": "Vários pontos de atenção - buscar orientação profissional",
          "181+": "Recomenda-se avaliação médica prioritária"
        }
      }
    },
    roda_abundancia: {
      title: "🌟 Roda da Abundância - Avaliação de Prosperidade Financeira",
      description: "Avalie os 8 pilares da sua prosperidade financeira através de uma interface interativa. Receba análises personalizadas e um plano de ação para impulsionar sua abundância.",
      type: "abundance_wheel_assessment",
      difficulty: "beginner",
      estimated_time: 15,
      materials_needed: ["Concentração", "Local tranquilo", "10-15 minutos disponíveis"],
      target_saboteurs: ["Mentalidade de escassez", "Falta de educação financeira", "Medo de investir"],
      follow_up_questions: [
        "Quais pilares da abundância estão mais desenvolvidos?",
        "Que áreas precisam de mais atenção para crescer?",
        "Como você pode aplicar os princípios de abundância no dia a dia?",
        "Qual seria sua prioridade número 1 para os próximos 30 dias?"
      ],
      content: {
        introduction: "A Roda da Abundância avalia os 8 pilares fundamentais da prosperidade financeira. Para cada pilar, selecione o emoji que melhor representa seu desenvolvimento atual.",
        wheel_interface: true,
        results_display: "abundance_wheel_radar",
        track_evolution: true,
        areas: [
          {
            id: "renda_ativa",
            name: "Renda Ativa",
            question: "Como está sua remuneração atual, crescimento salarial e valor agregado?",
            icon: "💼",
            color: "#3B82F6",
            emoji_options: [
              { value: 1, emoji: "😰", label: "Muito baixa" },
              { value: 2, emoji: "💰", label: "Baixa" },
              { value: 3, emoji: "💎", label: "Média" },
              { value: 4, emoji: "🚀", label: "Boa" },
              { value: 5, emoji: "✨", label: "Excelente" }
            ]
          },
          {
            id: "renda_passiva",
            name: "Renda Passiva",
            question: "Como estão seus investimentos, rendimentos automáticos e fontes de renda não ativa?",
            icon: "💰",
            color: "#10B981",
            emoji_options: [
              { value: 1, emoji: "😰", label: "Muito baixa" },
              { value: 2, emoji: "💰", label: "Baixa" },
              { value: 3, emoji: "💎", label: "Média" },
              { value: 4, emoji: "🚀", label: "Boa" },
              { value: 5, emoji: "✨", label: "Excelente" }
            ]
          },
          {
            id: "investimentos",
            name: "Investimentos",
            question: "Como está sua carteira de investimentos, diversificação e retornos?",
            icon: "📈",
            color: "#8B5CF6",
            emoji_options: [
              { value: 1, emoji: "😰", label: "Muito baixa" },
              { value: 2, emoji: "💰", label: "Baixa" },
              { value: 3, emoji: "💎", label: "Média" },
              { value: 4, emoji: "🚀", label: "Boa" },
              { value: 5, emoji: "✨", label: "Excelente" }
            ]
          },
          {
            id: "educacao_financeira",
            name: "Educação Financeira",
            question: "Como está seu conhecimento sobre finanças, planejamento e gestão de dinheiro?",
            icon: "📚",
            color: "#F59E0B",
            emoji_options: [
              { value: 1, emoji: "😰", label: "Muito baixa" },
              { value: 2, emoji: "💰", label: "Baixa" },
              { value: 3, emoji: "💎", label: "Média" },
              { value: 4, emoji: "🚀", label: "Boa" },
              { value: 5, emoji: "✨", label: "Excelente" }
            ]
          },
          {
            id: "planejamento_financeiro",
            name: "Planejamento Financeiro",
            question: "Como está seu orçamento, metas financeiras e controle de gastos?",
            icon: "📊",
            color: "#06B6D4",
            emoji_options: [
              { value: 1, emoji: "😰", label: "Muito baixa" },
              { value: 2, emoji: "💰", label: "Baixa" },
              { value: 3, emoji: "💎", label: "Média" },
              { value: 4, emoji: "🚀", label: "Boa" },
              { value: 5, emoji: "✨", label: "Excelente" }
            ]
          },
          {
            id: "protecao_financeira",
            name: "Proteção Financeira",
            question: "Como estão seus seguros, reserva de emergência e proteção patrimonial?",
            icon: "🛡️",
            color: "#6366F1",
            emoji_options: [
              { value: 1, emoji: "😰", label: "Muito baixa" },
              { value: 2, emoji: "💰", label: "Baixa" },
              { value: 3, emoji: "💎", label: "Média" },
              { value: 4, emoji: "🚀", label: "Boa" },
              { value: 5, emoji: "✨", label: "Excelente" }
            ]
          },
          {
            id: "legado_financeiro",
            name: "Legado Financeiro",
            question: "Como está sua herança, doações e impacto financeiro para futuras gerações?",
            icon: "🏛️",
            color: "#F97316",
            emoji_options: [
              { value: 1, emoji: "😰", label: "Muito baixa" },
              { value: 2, emoji: "💰", label: "Baixa" },
              { value: 3, emoji: "💎", label: "Média" },
              { value: 4, emoji: "🚀", label: "Boa" },
              { value: 5, emoji: "✨", label: "Excelente" }
            ]
          },
          {
            id: "mentalidade_abundancia",
            name: "Mentalidade de Abundância",
            question: "Como estão suas crenças sobre dinheiro, gratidão e atração de prosperidade?",
            icon: "✨",
            color: "#EC4899",
            emoji_options: [
              { value: 1, emoji: "😰", label: "Muito baixa" },
              { value: 2, emoji: "💰", label: "Baixa" },
              { value: 3, emoji: "💎", label: "Média" },
              { value: 4, emoji: "🚀", label: "Boa" },
              { value: 5, emoji: "✨", label: "Excelente" }
            ]
          }
        ],
        feedback_analysis: {
          critical_areas: "Pilares com pontuação 1-2 que precisam de atenção urgente",
          attention_areas: "Pilares com pontuação 3 que podem ser melhorados",
          strong_areas: "Pilares com pontuação 4-5 que estão bem desenvolvidos",
          action_plan: "Plano personalizado baseado nas respostas do usuário"
        }
      }
    },
    roda_competencia: {
      title: "🎯 Roda das Competências - Avaliação Profissional",
      description: "Avalie suas 8 competências profissionais fundamentais através de uma interface interativa. Receba análises personalizadas e um plano de desenvolvimento para impulsionar sua carreira.",
      type: "competency_wheel_assessment",
      difficulty: "beginner",
      estimated_time: 15,
      materials_needed: ["Concentração", "Local tranquilo", "10-15 minutos disponíveis"],
      target_saboteurs: ["Falta de autoconhecimento", "Medo de mudança", "Comparação inadequada"],
      follow_up_questions: [
        "Quais competências são seus pontos fortes?",
        "Que competências precisam de mais desenvolvimento?",
        "Como você pode aplicar essas competências no trabalho?",
        "Qual seria sua prioridade número 1 para os próximos 30 dias?"
      ],
      content: {
        introduction: "A Roda das Competências avalia as 8 competências profissionais fundamentais. Para cada competência, selecione o emoji que melhor representa seu desenvolvimento atual.",
        wheel_interface: true,
        results_display: "competency_wheel_radar",
        track_evolution: true,
        areas: [
          {
            id: "comunicacao",
            name: "Comunicação",
            question: "Como está sua capacidade de se expressar claramente e se conectar com outros?",
            icon: "💬",
            color: "#3B82F6",
            emoji_options: [
              { value: 1, emoji: "😰", label: "Muito baixa" },
              { value: 2, emoji: "💰", label: "Baixa" },
              { value: 3, emoji: "💎", label: "Média" },
              { value: 4, emoji: "🚀", label: "Boa" },
              { value: 5, emoji: "✨", label: "Excelente" }
            ]
          },
          {
            id: "lideranca",
            name: "Liderança",
            question: "Como está sua capacidade de inspirar, motivar e guiar equipes?",
            icon: "👑",
            color: "#10B981",
            emoji_options: [
              { value: 1, emoji: "😰", label: "Muito baixa" },
              { value: 2, emoji: "💰", label: "Baixa" },
              { value: 3, emoji: "💎", label: "Média" },
              { value: 4, emoji: "🚀", label: "Boa" },
              { value: 5, emoji: "✨", label: "Excelente" }
            ]
          },
          {
            id: "resolucao_problemas",
            name: "Resolução de Problemas",
            question: "Como está sua capacidade de analisar situações e encontrar soluções criativas?",
            icon: "🧩",
            color: "#8B5CF6",
            emoji_options: [
              { value: 1, emoji: "😰", label: "Muito baixa" },
              { value: 2, emoji: "💰", label: "Baixa" },
              { value: 3, emoji: "💎", label: "Média" },
              { value: 4, emoji: "🚀", label: "Boa" },
              { value: 5, emoji: "✨", label: "Excelente" }
            ]
          },
          {
            id: "trabalho_equipe",
            name: "Trabalho em Equipe",
            question: "Como está sua capacidade de colaborar e contribuir em grupos?",
            icon: "🤝",
            color: "#F59E0B",
            emoji_options: [
              { value: 1, emoji: "😰", label: "Muito baixa" },
              { value: 2, emoji: "💰", label: "Baixa" },
              { value: 3, emoji: "💎", label: "Média" },
              { value: 4, emoji: "🚀", label: "Boa" },
              { value: 5, emoji: "✨", label: "Excelente" }
            ]
          },
          {
            id: "adaptabilidade",
            name: "Adaptabilidade",
            question: "Como está sua capacidade de se adaptar a mudanças e novos desafios?",
            icon: "🔄",
            color: "#06B6D4",
            emoji_options: [
              { value: 1, emoji: "😰", label: "Muito baixa" },
              { value: 2, emoji: "💰", label: "Baixa" },
              { value: 3, emoji: "💎", label: "Média" },
              { value: 4, emoji: "🚀", label: "Boa" },
              { value: 5, emoji: "✨", label: "Excelente" }
            ]
          },
          {
            id: "gestao_tempo",
            name: "Gestão de Tempo",
            question: "Como está sua capacidade de organizar e priorizar tarefas eficientemente?",
            icon: "⏰",
            color: "#6366F1",
            emoji_options: [
              { value: 1, emoji: "😰", label: "Muito baixa" },
              { value: 2, emoji: "💰", label: "Baixa" },
              { value: 3, emoji: "💎", label: "Média" },
              { value: 4, emoji: "🚀", label: "Boa" },
              { value: 5, emoji: "✨", label: "Excelente" }
            ]
          },
          {
            id: "criatividade",
            name: "Criatividade",
            question: "Como está sua capacidade de gerar ideias inovadoras e soluções criativas?",
            icon: "🎨",
            color: "#F97316",
            emoji_options: [
              { value: 1, emoji: "😰", label: "Muito baixa" },
              { value: 2, emoji: "💰", label: "Baixa" },
              { value: 3, emoji: "💎", label: "Média" },
              { value: 4, emoji: "🚀", label: "Boa" },
              { value: 5, emoji: "✨", label: "Excelente" }
            ]
          },
          {
            id: "aprendizado_continuo",
            name: "Aprendizado Contínuo",
            question: "Como está sua disposição para aprender e se desenvolver constantemente?",
            icon: "📚",
            color: "#EC4899",
            emoji_options: [
              { value: 1, emoji: "😰", label: "Muito baixa" },
              { value: 2, emoji: "💰", label: "Baixa" },
              { value: 3, emoji: "💎", label: "Média" },
              { value: 4, emoji: "🚀", label: "Boa" },
              { value: 5, emoji: "✨", label: "Excelente" }
            ]
          }
        ],
        feedback_analysis: {
          critical_areas: "Competências com pontuação 1-2 que precisam de desenvolvimento urgente",
          attention_areas: "Competências com pontuação 3 que podem ser melhoradas",
          strong_areas: "Competências com pontuação 4-5 que estão bem desenvolvidas",
          action_plan: "Plano personalizado baseado nas respostas do usuário"
        }
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        loadSessions(),
        loadUserSessions(),
        loadProfiles()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setSessions(data || []);
    
    // Calcular estatísticas
    const total = data?.length || 0;
    const active = data?.filter(s => s.is_active).length || 0;
    setStats(prev => ({ ...prev, totalSessions: total, activeSessions: active }));
  };

  const loadUserSessions = async () => {
    const { data, error } = await supabase
      .from('user_sessions')
      .select(`
        *,
        sessions (*)
      `)
      .order('assigned_at', { ascending: false });

    if (error) throw error;
    setUserSessions((data || []).map(session => ({
      ...session,
      feedback: typeof session.feedback === 'string' ? session.feedback : JSON.stringify(session.feedback || '')
    })));
    
    // Calcular estatísticas
    const assigned = data?.length || 0;
    const completed = data?.filter(us => us.status === 'completed').length || 0;
    setStats(prev => ({ ...prev, assignedSessions: assigned, completedSessions: completed }));
  };

  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .order('full_name');

    if (error) throw error;
    setProfiles((data || []).map(p => ({ user_id: p.id, full_name: p.full_name })));
  };

  const createSession = async () => {
    try {
      let parsedContent = {};
      
      // Tentar fazer parse do JSON, se falhar usar objeto vazio
      if (formData.content && formData.content.trim()) {
        try {
          // Verificar se é JSON válido
          const trimmedContent = formData.content.trim();
          if (trimmedContent.startsWith('{') || trimmedContent.startsWith('[')) {
            parsedContent = JSON.parse(trimmedContent);
          } else {
            // Se não for JSON, tratar como texto simples
            parsedContent = { raw_content: trimmedContent };
          }
        } catch (parseError) {
          console.warn('Conteúdo não é JSON válido, usando objeto vazio:', parseError);
          parsedContent = { raw_content: formData.content };
        }
      }

      const sessionData = {
        ...formData,
        content: parsedContent,
        created_by: user?.id
      };

      const { error } = await supabase
        .from('sessions')
        .insert(sessionData);

      if (error) throw error;

      toast({
        title: "Sessão Criada! ✅",
        description: "A sessão foi criada com sucesso"
      });

      setIsCreateModalOpen(false);
      resetForm();
      loadSessions();
    } catch (error) {
      console.error('Error creating session:', error);
      
      let errorMessage = "Não foi possível criar a sessão";
      if (error instanceof SyntaxError) {
        errorMessage = "Erro no formato do JSON do conteúdo";
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const assignSessionToUser = async (sessionId: string, userId: string) => {
    try {
      // Verificar se já existe uma sessão atribuída
      const { data: existing } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        toast({
          title: "Atenção",
          description: "Esta sessão já foi atribuída a este usuário",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('user_sessions')
        .insert({
          session_id: sessionId,
          user_id: userId,
          status: 'pending',
          progress: 0,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
        });

      if (error) throw error;

      // Criar notificação para o usuário
      const session = sessions.find(s => s.id === sessionId);
      const userProfile = profiles.find(p => p.user_id === userId);
      
      // TODO: Create smart_notifications table and implement notification system
      console.log('Session notification would be created here:', {
        user_id: userId,
        title: '🎯 Nova Sessão Disponível!',
        message: `Você recebeu uma nova sessão: "${session?.title}". Acesse agora e comece sua jornada!`,
        type: 'session_assignment'
      });

      console.log(`Sessão ${sessionId} atribuída para usuário ${userId} (${userProfile?.email || 'sem email'})`);

      if (error) throw error;

      toast({
        title: "Sessão Atribuída! 📤",
        description: "A sessão foi enviada para o usuário"
      });

      loadUserSessions();
    } catch (error) {
      console.error('Error assigning session:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atribuir a sessão",
        variant: "destructive"
      });
    }
  };

  const assignSessionToAllUsers = async (sessionId: string) => {
    try {
      const assignments = profiles.map(profile => ({
        session_id: sessionId,
        user_id: profile.user_id,
        status: 'pending',
        progress: 0,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }));

      const { error } = await supabase
        .from('user_sessions')
        .insert(assignments);

      if (error) throw error;

      // Criar notificações para todos os usuários selecionados
      const notifications = selectedUserIds.map(userId => ({
        user_id: userId,
        title: '🎯 Nova Sessão Disponível!',
        message: `Você recebeu uma nova sessão: "${selectedSession?.title}". Acesse agora e comece sua jornada!`,
        type: 'session_assignment',
        category: 'sessions', 
        priority: 'high',
        trigger_conditions: JSON.stringify({ session_id: selectedSession?.id }),
        is_active: true
      }));

      // TODO: Create smart_notifications table and implement notification system
      console.log('Notifications would be created:', notifications);

      toast({
        title: "Sessões Enviadas! 🚀",
        description: `Sessão atribuída para ${profiles.length} usuários`
      });

      loadUserSessions();
    } catch (error) {
      console.error('Error assigning session to all users:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atribuir a sessão para todos os usuários",
        variant: "destructive"
      });
    }
  };

  const assignSessionToSelectedUsers = async (sessionId: string) => {
    try {
      if (selectedUserIds.length === 0) {
        toast({
          title: "Atenção",
          description: "Selecione pelo menos um usuário",
          variant: "destructive"
        });
        return;
      }

      const assignments = selectedUserIds.map(userId => ({
        session_id: sessionId,
        user_id: userId,
        status: 'pending',
        progress: 0,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }));

      const { error } = await supabase
        .from('user_sessions')
        .insert(assignments);

      if (error) throw error;

      toast({
        title: "Sessões Enviadas! 🚀",
        description: `Sessão atribuída para ${selectedUserIds.length} usuários`
      });

      setSelectedUserIds([]);
      loadUserSessions();
    } catch (error) {
      console.error('Error assigning session to selected users:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atribuir a sessão para os usuários selecionados",
        variant: "destructive"
      });
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUserIds.length === profiles.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(profiles.map(p => p.user_id));
    }
  };

  const sendSessionViaEmail = async (sessionId: string) => {
    try {
      const userIds = selectedUserIds.length > 0 ? selectedUserIds : profiles.map(p => p.user_id);
      
      const { data, error } = await supabase.functions.invoke('send-session-notifications', {
        body: {
          sessionId,
          userIds,
          sendVia: 'email',
          customMessage: 'Uma nova sessão foi atribuída para você. Acesse o Dr. Vita para começar!'
        }
      });

      if (error) throw error;

      toast({
        title: "Emails Enviados! 📧",
        description: `Sessão enviada por email para ${userIds.length} usuários`
      });

      setSelectedUserIds([]);
      loadUserSessions();
    } catch (error) {
      console.error('Error sending session via email:', error);
      toast({
        title: "Erro no Envio",
        description: "Não foi possível enviar a sessão por email",
        variant: "destructive"
      });
    }
  };

  const sendSessionViaWhatsApp = async (sessionId: string) => {
    try {
      const userIds = selectedUserIds.length > 0 ? selectedUserIds : profiles.map(p => p.user_id);
      
      const { data, error } = await supabase.functions.invoke('send-session-notifications', {
        body: {
          sessionId,
          userIds,
          sendVia: 'whatsapp',
          customMessage: 'Nova sessão disponível no Dr. Vita! 🎯'
        }
      });

      if (error) throw error;

      toast({
        title: "WhatsApp Enviado! 📱",
        description: `Sessão enviada por WhatsApp para ${userIds.length} usuários`
      });

      setSelectedUserIds([]);
      loadUserSessions();
    } catch (error) {
      console.error('Error sending session via WhatsApp:', error);
      toast({
        title: "Erro no Envio",
        description: "Não foi possível enviar a sessão por WhatsApp. Verifique se há webhooks n8n configurados.",
        variant: "destructive"
      });
    }
  };

  const sendSessionViaBoth = async (sessionId: string) => {
    try {
      const userIds = selectedUserIds.length > 0 ? selectedUserIds : profiles.map(p => p.user_id);
      
      const { data, error } = await supabase.functions.invoke('send-session-notifications', {
        body: {
          sessionId,
          userIds,
          sendVia: 'both',
          customMessage: 'Nova sessão disponível! Acesse o Dr. Vita para começar sua jornada. 🚀'
        }
      });

      if (error) throw error;

      toast({
        title: "Notificações Enviadas! 🚀",
        description: `Sessão enviada por email e WhatsApp para ${userIds.length} usuários`
      });

      setSelectedUserIds([]);
      loadUserSessions();
    } catch (error) {
      console.error('Error sending session notifications:', error);
      toast({
        title: "Erro no Envio",
        description: "Não foi possível enviar as notificações",
        variant: "destructive"
      });
    }
  };

  const sendTestEmailReport = async () => {
    try {
      console.log('🧪 Iniciando teste de email...');
      
      // Criar usuário teste com seu email para contornar limitação do Resend
      const testUser = {
        user_id: 'test-user-id',
        full_name: 'Teste Admin',
        email: 'tvmensal2025@gmail.com' // Seu email que funciona com Resend
      };

      console.log('👤 Usuário teste:', testUser);

      const { data, error } = await supabase.functions.invoke('send-weekly-email-report', {
        body: {
          testMode: true,
          testUser: testUser,
          customMessage: '🧪 TESTE COMPLETO - Este email foi enviado para testar o sistema de relatórios do Dr. Vita! O sistema está funcionando perfeitamente.'
        }
      });

      console.log('📤 Resposta da função:', { data, error });

      if (error) {
        console.error('❌ Erro completo:', error);
        throw new Error(error.message || JSON.stringify(error));
      }

      toast({
        title: "📧 Email de Teste Enviado!",
        description: `Enviado para ${testUser.email}. Para enviar para outros emails, você precisa verificar um domínio no Resend.`
      });

    } catch (error) {
      console.error('❌ Erro no teste de email:', error);
      toast({
        title: "Erro no Teste",
        description: `Erro: ${(error as Error).message}`,
        variant: "destructive"
      });
    }
  };

  const sendWeeklyEmailToAllClients = async () => {
    try {
      const allUserIds = profiles.map(p => p.user_id);
      
      const { data, error } = await supabase.functions.invoke('send-weekly-email-report', {
        body: {
          userIds: allUserIds,
          customMessage: '📊 Seu relatório semanal do Dr. Vita está pronto! Confira seu progresso de saúde.'
        }
      });

      if (error) throw error;

      toast({
        title: "📧 Relatórios Enviados!",
        description: `Relatório semanal enviado para todos os ${allUserIds.length} clientes`
      });

    } catch (error) {
      console.error('Error sending weekly emails to all clients:', error);
      toast({
        title: "Erro no Envio",
        description: "Não foi possível enviar os relatórios: " + (error as Error).message,
        variant: "destructive"
      });
    }
  };

  const toggleSessionStatus = async (sessionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ is_active: !currentStatus })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: !currentStatus ? "Sessão Ativada" : "Sessão Desativada",
        description: `A sessão foi ${!currentStatus ? 'ativada' : 'desativada'} com sucesso`
      });

      loadSessions();
    } catch (error) {
      console.error('Error toggling session:', error);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Sessão Excluída",
        description: "A sessão foi excluída permanentemente"
      });

      loadSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'saboteur_work',
      difficulty: 'beginner',
      estimated_time: 30,
      content: '{}',
      target_saboteurs: [],
      materials_needed: [],
      follow_up_questions: []
    });
  };

  const useTemplate = (templateKey: string) => {
    const template = sessionTemplates[templateKey as keyof typeof sessionTemplates];
    if (template) {
      setFormData({
        title: template.title,
        description: template.description,
        type: template.type,
        difficulty: template.difficulty,
        estimated_time: template.estimated_time,
        content: JSON.stringify(template.content, null, 2),
        target_saboteurs: template.target_saboteurs,
        materials_needed: template.materials_needed,
        follow_up_questions: template.follow_up_questions
      });
      
      toast({
        title: "Template Carregado! 📋",
        description: `Template "${template.title}" foi carregado no formulário`
      });
    }
  };

  const createSessionAndAssignToAll = async (template: any) => {
    try {
      const sessionData = {
        title: template.title,
        description: template.description,
        type: template.type,
        difficulty: template.difficulty,
        estimated_time: template.estimated_time,
        content: template.content,
        target_saboteurs: template.target_saboteurs,
        materials_needed: template.materials_needed,
        follow_up_questions: template.follow_up_questions,
        created_by: user?.id
      };

      // Criar a sessão
      const { data: newSession, error: sessionError } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Atribuir para todos os usuários
      const assignments = profiles.map(profile => ({
        session_id: newSession.id,
        user_id: profile.user_id,
        status: 'pending',
        progress: 0,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }));

      const { error: assignError } = await supabase
        .from('user_sessions')
        .insert(assignments);

      if (assignError) throw assignError;

      // Criar notificações para todos os usuários
      const notifications = profiles.map(profile => ({
        user_id: profile.user_id,
        title: '🎯 Nova Sessão Disponível!',
        message: `Você recebeu uma nova sessão: "${template.title}". Acesse agora e comece sua jornada!`,
        type: 'session_assignment',
        category: 'sessions',
        priority: 'high',
        trigger_conditions: JSON.stringify({ session_id: newSession.id }),
        is_active: true
      }));

      // TODO: Create smart_notifications table and implement notification system
      console.log('Template notifications would be created:', notifications);

      toast({
        title: "🚀 Template Enviado para Todos!",
        description: `"${template.title}" foi criado e enviado para ${profiles.length} usuários`
      });

      loadData();
    } catch (error) {
      console.error('Error creating and assigning template:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar e enviar o template",
        variant: "destructive"
      });
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || session.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const filteredUserSessions = userSessions.filter(userSession => {
    return filterStatus === 'all' || userSession.status === filterStatus;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-50 text-green-700';
      case 'intermediate': return 'bg-yellow-50 text-yellow-700';
      case 'advanced': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700';
      case 'in_progress': return 'bg-blue-50 text-blue-700';
      case 'completed': return 'bg-green-50 text-green-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando gestão de sessões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header e Estatísticas */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Sessões</h1>
            <p className="text-muted-foreground">
              Crie e gerencie sessões personalizadas para usuários
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={sendTestEmailReport}
            >
              📧 Teste Relatório Email
            </Button>
            <Button 
              onClick={sendWeeklyEmailToAllClients}
            >
              📧 Relatório Semanal - Todos Clientes
            </Button>
          </div>
        </div>
        
        {/* Templates de Sessão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              🎯 Templates de Sessão Prontos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-1">
              {/* Template Roda da Vida */}
              <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      🎯 Roda da Vida - Avaliação de Equilíbrio Geral
                      <Badge variant="secondary">12 Áreas</Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Avalie o equilíbrio das 12 áreas fundamentais da vida através de uma interface interativa com emojis. 
                      Receba análises personalizadas e um plano de ação para melhorar seu bem-estar geral.
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>⏱️ 10-15 minutos</span>
                      <span>😊 Seleção por Emojis</span>
                      <span>🎯 Roda Radar Visual</span>
                      <span>📋 Plano de Ação</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {["Saúde", "Família", "Carreira", "Financeiro", "Social", "Espiritual"].map(area => (
                        <Badge key={area} variant="outline" className="text-xs">{area}</Badge>
                      ))}
                      <Badge variant="outline" className="text-xs">+6 áreas</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => {
                        useTemplate('roda_vida');
                        setIsCreateModalOpen(true);
                      }}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Usar Template
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        useTemplate('roda_vida');
                        // Enviar diretamente para todos os usuários
                        if (profiles.length > 0) {
                          const template = sessionTemplates.roda_vida;
                          createSessionAndAssignToAll(template);
                        }
                      }}
                    >
                      🚀 Enviar p/ Todos
                    </Button>
                  </div>
                </div>
              </div>

              {/* Template Roda da Saúde */}
              <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-green-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      🩺 Roda da Saúde IDS - Avaliação Completa
                      <Badge variant="secondary">147 Perguntas</Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Mapeamento completo de sintomas em 12 sistemas corporais com avaliação de frequência e intensidade. 
                      Sistema adaptativo que coleta dados para visualização em roda e evolução temporal.
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>⏱️ 12-15 minutos</span>
                      <span>📊 Frequência + Intensidade</span>
                      <span>🎯 Roda Visual de Resultados</span>
                      <span>📈 Evolução Temporal</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {["Cabeça e Neurológico", "Olhos e Visual", "Coração", "Pulmões", "Estômago", "Músculos"].map(system => (
                        <Badge key={system} variant="outline" className="text-xs">{system}</Badge>
                      ))}
                      <Badge variant="outline" className="text-xs">+6 sistemas</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => {
                        useTemplate('roda_saude_completa');
                        setIsCreateModalOpen(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Usar Template
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        useTemplate('roda_saude_completa');
                        // Enviar diretamente para todos os usuários
                        if (profiles.length > 0) {
                          const template = sessionTemplates.roda_saude_completa;
                          createSessionAndAssignToAll(template);
                        }
                      }}
                    >
                      🚀 Enviar p/ Todos
                    </Button>
                  </div>
                </div>
              </div>

              {/* Template Roda da Abundância */}
              <div className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      🌟 Roda da Abundância - Avaliação de Prosperidade
                      <Badge variant="secondary">8 Pilares</Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Avaliação dos 8 pilares fundamentais da prosperidade financeira. Interface interativa com análise personalizada e plano de ação para impulsionar sua abundância.
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>⏱️ 10-15 minutos</span>
                      <span>💰 8 Pilares Financeiros</span>
                      <span>🎯 Roda Visual de Resultados</span>
                      <span>📈 Plano de Ação Personalizado</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {["Renda Ativa", "Renda Passiva", "Investimentos", "Educação Financeira", "Planejamento", "Proteção"].map(pilar => (
                        <Badge key={pilar} variant="outline" className="text-xs">{pilar}</Badge>
                      ))}
                      <Badge variant="outline" className="text-xs">+2 pilares</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => {
                        useTemplate('roda_abundancia');
                        setIsCreateModalOpen(true);
                      }}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Usar Template
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        useTemplate('roda_abundancia');
                        // Enviar diretamente para todos os usuários
                        if (profiles.length > 0) {
                          const template = sessionTemplates.roda_abundancia;
                          createSessionAndAssignToAll(template);
                        }
                      }}
                    >
                      🚀 Enviar p/ Todos
                    </Button>
                  </div>
                </div>
              </div>

              {/* Template Roda da Competência */}
              <div className="border rounded-lg p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      🎯 Roda das Competências - Avaliação Profissional
                      <Badge variant="secondary">8 Competências</Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Avaliação das 8 competências profissionais fundamentais. Interface interativa com análise personalizada e plano de desenvolvimento para impulsionar sua carreira.
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>⏱️ 10-15 minutos</span>
                      <span>💼 8 Competências Profissionais</span>
                      <span>🎯 Roda Visual de Resultados</span>
                      <span>📈 Plano de Desenvolvimento</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {["Comunicação", "Liderança", "Resolução de Problemas", "Trabalho em Equipe", "Adaptabilidade", "Gestão de Tempo"].map(competencia => (
                        <Badge key={competencia} variant="outline" className="text-xs">{competencia}</Badge>
                      ))}
                      <Badge variant="outline" className="text-xs">+2 competências</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => {
                        useTemplate('roda_competencia');
                        setIsCreateModalOpen(true);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Usar Template
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        useTemplate('roda_competencia');
                        // Enviar diretamente para todos os usuários
                        if (profiles.length > 0) {
                          const template = sessionTemplates.roda_competencia;
                          createSessionAndAssignToAll(template);
                        }
                      }}
                    >
                      🚀 Enviar p/ Todos
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Sessão Personalizada
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Nova Sessão</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Superando o Perfeccionismo"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o objetivo da sessão..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="difficulty">Dificuldade</Label>
                    <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Iniciante</SelectItem>
                        <SelectItem value="intermediate">Intermediário</SelectItem>
                        <SelectItem value="advanced">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="time">Tempo Estimado (min)</Label>
                    <Input
                      id="time"
                      type="number"
                      value={formData.estimated_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimated_time: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="content">Conteúdo (JSON)</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder='{"sections": [{"title": "Seção 1", "activities": ["Atividade 1", "Atividade 2"]}]}'
                    rows={4}
                  />
                  <div className="text-xs text-muted-foreground">
                    <details>
                      <summary className="cursor-pointer">Templates de exemplo</summary>
                      <div className="mt-2 space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            title: "Identificando Sabotadores Internos",
                            description: "Sessão para reconhecer padrões de sabotagem interna",
                            content: JSON.stringify({
                              sections: [
                                {
                                  title: "Autoconhecimento",
                                  activities: [
                                    "Reflexão sobre comportamentos autossabotadores",
                                    "Identificação de gatilhos emocionais",
                                    "Mapeamento de padrões negativos"
                                  ]
                                },
                                {
                                  title: "Exercícios Práticos",
                                  activities: [
                                    "Diário de sabotadores por 7 dias",
                                    "Técnica de mindfulness para observação",
                                    "Questionário de autoavaliação"
                                  ]
                                }
                              ]
                            }, null, 2)
                          }))}
                        >
                          Template: Sabotadores Internos
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            title: "Estratégias de Superação",
                            description: "Técnicas práticas para superar obstáculos mentais",
                            content: JSON.stringify({
                              sections: [
                                {
                                  title: "Técnicas de Reframing",
                                  activities: [
                                    "Identificação de pensamentos limitantes",
                                    "Prática de reframing cognitivo",
                                    "Criação de afirmações positivas"
                                  ]
                                },
                                {
                                  title: "Plano de Ação",
                                  activities: [
                                    "Definição de objetivos SMART",
                                    "Criação de estratégias personalizadas",
                                    "Sistema de acompanhamento semanal"
                                  ]
                                }
                              ]
                            }, null, 2)
                          }))}
                        >
                          Template: Estratégias de Superação
                        </Button>
                      </div>
                    </details>
                  </div>
                </div>
                <Button onClick={createSession} className="w-full">
                  Criar Sessão
                </Button>
              </div>
            </DialogContent>
          </Dialog>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
              <div className="text-sm text-muted-foreground">Total de Sessões</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activeSessions}</div>
              <div className="text-sm text-muted-foreground">Sessões Ativas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.assignedSessions}</div>
              <div className="text-sm text-muted-foreground">Atribuídas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.completedSessions}</div>
              <div className="text-sm text-muted-foreground">Completadas</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seção de Teste de Email */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Send className="h-5 w-5" />
            🧪 Debug - Teste de Relatórios por Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={sendTestEmailReport}
              variant="outline"
              className="border-blue-300 hover:bg-blue-100 text-blue-900 h-auto p-4 flex flex-col items-center gap-2"
            >
              <Send className="h-5 w-5" />
              <div className="text-center">
                <div className="font-medium">Teste para Rafael</div>
                <div className="text-xs text-blue-700">Enviar relatório com logs detalhados</div>
              </div>
            </Button>
            <Button 
              onClick={sendWeeklyEmailToAllClients}
              className="bg-green-600 hover:bg-green-700 h-auto p-4 flex flex-col items-center gap-2"
            >
              <Send className="h-5 w-5" />
              <div className="text-center">
                <div className="font-medium">Enviar para Todos</div>
                <div className="text-xs text-white/80">Relatório semanal completo</div>
              </div>
            </Button>
            <Button 
              onClick={() => window.open('/whatsapp-report-demo', '_blank')}
              variant="outline"
              className="border-purple-300 hover:bg-purple-100 text-purple-900 h-auto p-4 flex flex-col items-center gap-2"
            >
              <Send className="h-5 w-5" />
              <div className="text-center">
                <div className="font-medium">📱 Demo WhatsApp</div>
                <div className="text-xs text-purple-700">Como ficará no WhatsApp</div>
              </div>
            </Button>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Demos:</strong> Ver como ficará o relatório no Email e WhatsApp com gráficos de alta qualidade.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
          <TabsTrigger value="assignments">Atribuições</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar sessões..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as dificuldades</SelectItem>
                <SelectItem value="beginner">Iniciante</SelectItem>
                <SelectItem value="intermediate">Intermediário</SelectItem>
                <SelectItem value="advanced">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Sessões */}
          <div className="grid gap-4">
            {filteredSessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{session.title}</CardTitle>
                      <p className="text-muted-foreground text-sm mt-1">
                        {session.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.is_active ? (
                        <Badge className="bg-green-50 text-green-700">Ativa</Badge>
                      ) : (
                        <Badge variant="secondary">Inativa</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={getDifficultyColor(session.difficulty)}>
                      <Target className="w-3 h-3 mr-1" />
                      {session.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {session.estimated_time} min
                    </Badge>
                    <Badge variant="outline">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(session.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Tipo: {session.type} • Sabotadores: {session.target_saboteurs.length}
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Send className="w-4 h-4 mr-1" />
                            Atribuir
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Atribuir Sessão: {session.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-muted-foreground">
                                Selecione os usuários que receberão esta sessão:
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={selectAllUsers}
                              >
                                {selectedUserIds.length === profiles.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                              </Button>
                            </div>
                            
                             <div className="mb-3">
                              <Input
                                placeholder="Buscar por nome ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                              />
                            </div>
                            
                            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-3">
                              {profiles.filter(profile => 
                                (profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                                (profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
                              ).map((profile) => (
                                <div
                                  key={profile.user_id}
                                  className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded"
                                >
                                  <Checkbox
                                    id={profile.user_id}
                                    checked={selectedUserIds.includes(profile.user_id)}
                                    onCheckedChange={() => toggleUserSelection(profile.user_id)}
                                  />
                                   <label
                                    htmlFor={profile.user_id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                  >
                                    <div>
                                      <div>{profile.full_name || 'Usuário sem nome'}</div>
                                      {profile.email && (
                                        <div className="text-xs text-muted-foreground">{profile.email}</div>
                                      )}
                                    </div>
                                  </label>
                                </div>
                              ))}
                            </div>
                            
                            {selectedUserIds.length > 0 && (
                              <div className="bg-primary/5 p-3 rounded-lg">
                                <p className="text-sm text-primary font-medium">
                                  {selectedUserIds.length} usuário(s) selecionado(s)
                                </p>
                              </div>
                            )}
                            
                            <div className="border-t pt-4 space-y-3">
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => assignSessionToSelectedUsers(session.id)}
                                disabled={selectedUserIds.length === 0}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Atribuir para Selecionados ({selectedUserIds.length})
                              </Button>
                              
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => assignSessionToAllUsers(session.id)}
                              >
                                <Users className="w-4 h-4 mr-2" />
                                Atribuir para Todos os Usuários
                              </Button>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => sendSessionViaWhatsApp(session.id)}
                                  disabled={selectedUserIds.length === 0}
                                >
                                  📱 WhatsApp
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => sendSessionViaEmail(session.id)}
                                  disabled={selectedUserIds.length === 0}
                                >
                                  📧 Email
                                </Button>
                              </div>
                              
                              <Button
                                className="w-full"
                                onClick={() => sendSessionViaBoth(session.id)}
                                disabled={selectedUserIds.length === 0}
                              >
                                🚀 Enviar por Email + WhatsApp ({selectedUserIds.length})
                              </Button>
                            </div>
                          </div>
                         </DialogContent>
                       </Dialog>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => toggleSessionStatus(session.id, session.is_active)}
                       >
                         {session.is_active ? 'Desativar' : 'Ativar'}
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => deleteSession(session.id)}
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          {/* Filtro de Status */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Progresso</SelectItem>
              <SelectItem value="completed">Completa</SelectItem>
            </SelectContent>
          </Select>

          {/* Lista de Atribuições */}
          <div className="grid gap-4">
            {filteredUserSessions.map((userSession) => (
              <Card key={userSession.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{userSession.sessions?.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Usuário: {userSession.user_id}
                      </p>
                    </div>
                    <Badge className={getStatusColor(userSession.status)}>
                      {userSession.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso:</span>
                      <span>{userSession.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${userSession.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Atribuída: {new Date(userSession.assigned_at).toLocaleDateString()}</span>
                      {userSession.completed_at && (
                        <span>Completa: {new Date(userSession.completed_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}