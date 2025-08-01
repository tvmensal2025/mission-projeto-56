import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Edit3 } from 'lucide-react';
import SimpleWeightForm from './SimpleWeightForm';
import { XiaomiScaleFlow } from '../XiaomiScaleFlow';
import { XiaomiScaleConnection } from '../XiaomiScaleConnection';
import { XiaomiScaleTroubleshooter } from '../XiaomiScaleTroubleshooter';
import { XiaomiScaleAdjuster } from '../XiaomiScaleAdjuster';
import PersonagemCorporal3D from '../PersonagemCorporal3D';
import { supabase } from '@/integrations/supabase/client';
import { useUserGender } from '@/hooks/useUserGender';
import type { User } from '@supabase/supabase-js';
import BodyAnalysisCharts from './BodyAnalysisCharts';

const CompleteWeighingSystem: React.FC = () => {
  const [activeWeighingType, setActiveWeighingType] = useState<'manual' | 'automatic'>('manual');
  const [user, setUser] = useState<User | null>(null);
  const { gender } = useUserGender(user);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  return (
    <div className="space-y-8">
      {/* Elegante Selector de Tipo de Pesagem */}
      <div className="flex gap-6 justify-center">
        <button
          onClick={() => setActiveWeighingType('manual')}
          className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
            activeWeighingType === 'manual'
              ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 scale-105'
              : 'bg-card/60 text-muted-foreground hover:bg-card/80 hover:scale-105 border border-border/20'
          }`}
        >
          <Edit3 className="h-5 w-5 inline mr-3" />
          Pesagem Manual
        </button>
        <button
          onClick={() => setActiveWeighingType('automatic')}
          className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
            activeWeighingType === 'automatic'
              ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 scale-105'
              : 'bg-card/60 text-muted-foreground hover:bg-card/80 hover:scale-105 border border-border/20'
          }`}
        >
          <Scale className="h-5 w-5 inline mr-3" />
          Pesagem Automática
        </button>
      </div>

      {/* Conteúdo de Pesagem */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Área de Pesagem */}
        <div className="space-y-6">
          {activeWeighingType === 'manual' ? (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Edit3 className="h-6 w-6 text-primary" />
                  Pesagem Manual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleWeightForm />
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Scale className="h-6 w-6 text-primary" />
                  Balança Xiaomi Mi Body Scale 2
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  Conecte sua balança Xiaomi para pesagem automática e análise completa de composição corporal
                </p>
                
                <div className="grid gap-4">
                  <XiaomiScaleFlow />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <XiaomiScaleConnection />
                    <XiaomiScaleTroubleshooter />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Personagem 3D */}
        <div className="flex items-center justify-center">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-8">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Análise Corporal</h3>
              <div className="relative">
                <PersonagemCorporal3D 
                  genero={gender === 'male' ? 'masculino' : gender === 'female' ? 'feminino' : 'masculino'} 
                  className="w-full h-80" 
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Visualização da composição corporal baseada em suas medições
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Gráficos de Análise Corporal */}
      <div className="mt-8">
        <BodyAnalysisCharts />
      </div>
    </div>
  );
};

export default CompleteWeighingSystem;