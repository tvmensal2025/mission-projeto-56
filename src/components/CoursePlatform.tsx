import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Star, 
  Users,
  ChevronRight,
  CheckCircle,
  Lock,
  Gift,
  Dumbbell,
  Brain
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string;
  is_published: boolean;
  is_premium: boolean;
  instructor_name: string;
  duration_minutes: number;
  difficulty_level: string;
  price: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  course_id: string;
  order_index: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  module_id: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
  is_free: boolean;
  created_at: string;
}

interface CoursePlatformProps {
  viewMode: 'courses' | 'modules';
}

export const CoursePlatform: React.FC<CoursePlatformProps> = ({ viewMode }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Erro ao buscar cursos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cursos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error('Erro ao buscar módulos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os módulos",
        variant: "destructive"
      });
    }
  };

  const fetchLessons = async (moduleId: string) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Erro ao buscar aulas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as aulas",
        variant: "destructive"
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'culinaria':
        return <Gift className="h-5 w-5" />;
      case 'fitness':
        return <Dumbbell className="h-5 w-5" />;
      case 'desenvolvimento-pessoal':
        return <Brain className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'culinaria':
        return 'Doces dos Sonhos';
      case 'fitness':
        return 'Exercícios dos Sonhos';
      case 'desenvolvimento-pessoal':
        return 'Plataforma dos Sonhos';
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'culinaria':
        return 'bg-pink-500';
      case 'fitness':
        return 'bg-blue-500';
      case 'desenvolvimento-pessoal':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setSelectedModule(null);
    setLessons([]);
    fetchModules(course.id);
  };

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module);
    fetchLessons(module.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const coursesByCategory = courses.reduce((acc, course) => {
    if (!acc[course.category]) {
      acc[course.category] = [];
    }
    acc[course.category].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {viewMode === 'courses' && !selectedCourse && (
          <div className="space-y-8">
            {/* Hero Banner */}
            <div className="relative h-96 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg overflow-hidden mb-8">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-6">
                <h1 className="text-5xl font-bold text-white mb-4">
                  PLATAFORMA DOS SONHOS
                </h1>
                <p className="text-xl text-gray-200 mb-8">
                  Novo conteúdo mensalmente
                </p>
                <Button className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-lg">
                  ▶ Começar Agora
                </Button>
                <Button variant="outline" className="ml-4 border-white text-white hover:bg-white hover:text-gray-900 px-6 py-3">
                  Vídeo
                </Button>
              </div>
            </div>

            {/* Todos os Cursos */}
            <div className="px-6">
              <h2 className="text-3xl font-bold text-white mb-8">Todos os Cursos</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {courses.map((course) => (
                  <Card 
                    key={course.id} 
                    className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer group overflow-hidden"
                    onClick={() => handleCourseSelect(course)}
                  >
                    {/* Imagem do curso */}
                    <div className="relative h-48 w-full overflow-hidden bg-gray-600">
                      {course.thumbnail_url ? (
                        <>
                          <img 
                            src={course.thumbnail_url} 
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="w-16 h-16 bg-gray-500 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-gray-400" />
                          </div>
                        </div>
                      )}
                      
                      {course.is_premium && (
                        <Badge className="absolute top-3 right-3 bg-yellow-500 text-black">
                          Premium
                        </Badge>
                      )}
                    </div>
                    
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white group-hover:text-purple-300 transition-colors text-lg">
                        {course.title}
                      </CardTitle>
                      <Badge className={`w-fit ${getCategoryColor(course.category)} text-white text-xs`}>
                        {getCategoryName(course.category)}
                      </Badge>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-300 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration_minutes || 'N/A'} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{course.difficulty_level || 'Todos'}</span>
                        </div>
                      </div>

                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        <Play className="h-4 w-4 mr-2" />
                        Começar Curso
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedCourse && !selectedModule && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedCourse(null)}
                className="text-white hover:bg-white/10"
              >
                ← Voltar aos Cursos
              </Button>
              <div className={`p-2 rounded-lg ${getCategoryColor(selectedCourse.category)}`}>
                {getCategoryIcon(selectedCourse.category)}
              </div>
              <h1 className="text-3xl font-bold text-white">
                {selectedCourse.title}
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {modules.map((module) => (
                  <Card 
                    key={module.id}
                    className="bg-black/40 border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer"
                    onClick={() => handleModuleSelect(module)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          <span className="text-purple-400">📂</span>
                          {module.title}
                        </CardTitle>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                      <CardDescription className="text-gray-400">
                        {module.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <Card className="bg-black/40 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Sobre o Curso</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-gray-300">
                    <p>{selectedCourse.description}</p>
                    {selectedCourse.instructor_name && (
                      <div>
                        <h4 className="font-semibold text-white mb-1">Instrutor</h4>
                        <p>{selectedCourse.instructor_name}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-white mb-1">Categoria</h4>
                      <Badge className={`${getCategoryColor(selectedCourse.category)} text-white`}>
                        {getCategoryName(selectedCourse.category)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {selectedModule && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedModule(null)}
                className="text-white hover:bg-white/10"
              >
                ← Voltar aos Módulos
              </Button>
              <span className="text-purple-400">📂</span>
              <h1 className="text-3xl font-bold text-white">
                {selectedModule.title}
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {lessons.map((lesson) => (
                  <Card 
                    key={lesson.id}
                    className="bg-black/40 border-gray-700 hover:border-purple-500 transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          {lesson.is_free ? (
                            <Play className="h-5 w-5 text-purple-400" />
                          ) : (
                            <Lock className="h-5 w-5 text-yellow-500" />
                          )}
                          {lesson.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {lesson.duration_minutes && (
                            <Badge variant="secondary" className="text-xs">
                              {lesson.duration_minutes} min
                            </Badge>
                          )}
                        </div>
                      </div>
                      {lesson.description && (
                        <CardDescription className="text-gray-400">
                          {lesson.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent>
                      <Button 
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        disabled={!lesson.is_free}
                      >
                        {lesson.is_free ? (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Começar Aula
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Premium
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <Card className="bg-black/40 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Progresso do Módulo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>Concluído</span>
                        <span>0/{lessons.length}</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Sobre o Módulo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{selectedModule.description}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};