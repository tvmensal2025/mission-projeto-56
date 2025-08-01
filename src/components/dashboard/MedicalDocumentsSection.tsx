import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  Stethoscope, 
  Calendar,
  Activity,
  Heart,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Download,
  Share2,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Award,
  Target,
  Zap,
  Shield,
  FileImage,
  File,
  FileArchive
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface MedicalDocument {
  id: string;
  user_id: string;
  title: string;
  type: 'exame_laboratorial' | 'exame_imagem' | 'relatorio_medico' | 'prescricao' | 'historico_clinico' | 'certificado_medico';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  description?: string;
  doctor_name?: string;
  clinic_name?: string;
  exam_date?: string;
  results?: string;
  status: 'normal' | 'alterado' | 'critico' | 'pendente';
  created_at: string;
  updated_at: string;
}

interface DocumentStats {
  totalDocuments: number;
  recentUploads: number;
  criticalAlerts: number;
  upcomingExams: number;
  healthScore: number;
  documentTypes: Record<string, number>;
}

const MedicalDocumentsSection: React.FC = () => {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { toast } = useToast();

  const [newDocument, setNewDocument] = useState({
    title: '',
    type: 'exame_laboratorial' as MedicalDocument['type'],
    description: '',
    doctor_name: '',
    clinic_name: '',
    exam_date: '',
    results: '',
    status: 'normal' as MedicalDocument['status']
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('medical_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar documentos:', error);
        return;
      }

      setDocuments(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (docs: MedicalDocument[]) => {
    const totalDocuments = docs.length;
    const recentUploads = docs.filter(d => {
      const docDate = new Date(d.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return docDate >= thirtyDaysAgo;
    }).length;

    const criticalAlerts = docs.filter(d => d.status === 'critico').length;
    const upcomingExams = docs.filter(d => d.status === 'pendente').length;

    // Calcular score de saúde baseado nos documentos
    const healthScore = Math.min(100, Math.max(0, 
      100 - (criticalAlerts * 20) + (recentUploads * 5) - (upcomingExams * 10)
    ));

    const documentTypes = docs.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setStats({
      totalDocuments,
      recentUploads,
      criticalAlerts,
      upcomingExams,
      healthScore,
      documentTypes
    });
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Upload do arquivo para o Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('medical-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Criar registro no banco
      const { error: insertError } = await supabase
        .from('medical_documents')
        .insert({
          user_id: user.id,
          title: newDocument.title || file.name,
          type: newDocument.type,
          file_url: uploadData.path,
          file_name: file.name,
          file_size: file.size,
          description: newDocument.description,
          doctor_name: newDocument.doctor_name,
          clinic_name: newDocument.clinic_name,
          exam_date: newDocument.exam_date,
          results: newDocument.results,
          status: newDocument.status
        });

      if (insertError) throw insertError;

      toast({
        title: "Documento enviado",
        description: "Seu documento foi enviado com sucesso!",
      });

      setShowUploadModal(false);
      setNewDocument({
        title: '',
        type: 'exame_laboratorial',
        description: '',
        doctor_name: '',
        clinic_name: '',
        exam_date: '',
        results: '',
        status: 'normal'
      });
      
      loadDocuments();
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar o documento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'exame_laboratorial': return <Activity className="w-4 h-4" />;
      case 'exame_imagem': return <FileImage className="w-4 h-4" />;
      case 'relatorio_medico': return <FileText className="w-4 h-4" />;
      case 'prescricao': return <Stethoscope className="w-4 h-4" />;
      case 'historico_clinico': return <Brain className="w-4 h-4" />;
      case 'certificado_medico': return <Shield className="w-4 h-4" />;
      default: return <FileArchive className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'alterado': return 'bg-yellow-100 text-yellow-800';
      case 'critico': return 'bg-red-100 text-red-800';
      case 'pendente': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'exame_laboratorial': return 'Exame Laboratorial';
      case 'exame_imagem': return 'Exame de Imagem';
      case 'relatorio_medico': return 'Relatório Médico';
      case 'prescricao': return 'Prescrição';
      case 'historico_clinico': return 'Histórico Clínico';
      case 'certificado_medico': return 'Certificado Médico';
      default: return 'Documento';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || doc.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5" />
            <span>Documentos Médicos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Total de Documentos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
              <p className="text-xs opacity-90">Documentos armazenados</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Score de Saúde</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.healthScore}/100</div>
              <p className="text-xs opacity-90">
                {stats.healthScore >= 80 ? 'Excelente!' : 
                 stats.healthScore >= 60 ? 'Bom' : 'Precisa melhorar'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Alertas Críticos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.criticalAlerts}</div>
              <p className="text-xs opacity-90">Documentos críticos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Próximos Exames</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingExams}</div>
              <p className="text-xs opacity-90">Agendados</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Seção Principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5" />
                <span>Documentos Médicos</span>
              </CardTitle>
              <CardDescription>
                Gerencie seus exames, relatórios e documentos médicos
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Documento</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros e Busca */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Todos os tipos</option>
                <option value="exame_laboratorial">Exames Laboratoriais</option>
                <option value="exame_imagem">Exames de Imagem</option>
                <option value="relatorio_medico">Relatórios Médicos</option>
                <option value="prescricao">Prescrições</option>
                <option value="historico_clinico">Histórico Clínico</option>
                <option value="certificado_medico">Certificados</option>
              </select>
            </div>
          </div>

          {/* Lista de Documentos */}
          <div className="space-y-4">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getDocumentIcon(doc.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                          <Badge className={getStatusColor(doc.status)}>
                            {doc.status === 'normal' ? 'Normal' :
                             doc.status === 'alterado' ? 'Alterado' :
                             doc.status === 'critico' ? 'Crítico' : 'Pendente'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {getTypeLabel(doc.type)}
                          {doc.doctor_name && ` • Dr. ${doc.doctor_name}`}
                          {doc.clinic_name && ` • ${doc.clinic_name}`}
                        </p>
                        {doc.description && (
                          <p className="text-sm text-gray-500 mb-2">{doc.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {doc.exam_date && (
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{format(new Date(doc.exam_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                            </span>
                          )}
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {doc.file_url && (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || filterType !== 'all' 
                    ? 'Nenhum documento encontrado com os filtros aplicados.'
                    : 'Nenhum documento médico encontrado. Adicione seu primeiro documento!'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Adicionar Documento Médico</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUploadModal(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título do Documento</Label>
                <Input
                  id="title"
                  value={newDocument.title}
                  onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
                  placeholder="Ex: Hemograma Completo"
                />
              </div>

              <div>
                <Label htmlFor="type">Tipo de Documento</Label>
                <select
                  id="type"
                  value={newDocument.type}
                  onChange={(e) => setNewDocument({...newDocument, type: e.target.value as MedicalDocument['type']})}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="exame_laboratorial">Exame Laboratorial</option>
                  <option value="exame_imagem">Exame de Imagem</option>
                  <option value="relatorio_medico">Relatório Médico</option>
                  <option value="prescricao">Prescrição</option>
                  <option value="historico_clinico">Histórico Clínico</option>
                  <option value="certificado_medico">Certificado Médico</option>
                </select>
              </div>

              <div>
                <Label htmlFor="file">Arquivo</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  value={newDocument.description}
                  onChange={(e) => setNewDocument({...newDocument, description: e.target.value})}
                  placeholder="Detalhes do documento..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="doctor">Médico (opcional)</Label>
                  <Input
                    id="doctor"
                    value={newDocument.doctor_name}
                    onChange={(e) => setNewDocument({...newDocument, doctor_name: e.target.value})}
                    placeholder="Nome do médico"
                  />
                </div>
                <div>
                  <Label htmlFor="clinic">Clínica (opcional)</Label>
                  <Input
                    id="clinic"
                    value={newDocument.clinic_name}
                    onChange={(e) => setNewDocument({...newDocument, clinic_name: e.target.value})}
                    placeholder="Nome da clínica"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="exam_date">Data do Exame (opcional)</Label>
                <Input
                  id="exam_date"
                  type="date"
                  value={newDocument.exam_date}
                  onChange={(e) => setNewDocument({...newDocument, exam_date: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={newDocument.status}
                  onChange={(e) => setNewDocument({...newDocument, status: e.target.value as MedicalDocument['status']})}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="normal">Normal</option>
                  <option value="alterado">Alterado</option>
                  <option value="critico">Crítico</option>
                  <option value="pendente">Pendente</option>
                </select>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    // Trigger file input
                    document.getElementById('file')?.click();
                  }}
                  disabled={uploading}
                  className="flex-1"
                >
                  {uploading ? 'Enviando...' : 'Enviar Documento'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalDocumentsSection; 