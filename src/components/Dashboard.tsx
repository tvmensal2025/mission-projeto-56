import React from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip
} from 'recharts';
import { 
  Heart, Activity, Droplets, Target, TrendingUp, Scale, 
  Zap, Calendar, Award, Timer
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { PersonIcon, BodyCompositionIcon, HealthIndicatorIcon } from './ui/person-icon';

// Mock data
const weightData = [
  { date: '01/01', peso: 75.5, meta: 70 },
  { date: '01/02', peso: 75.2, meta: 70 },
  { date: '01/03', peso: 74.8, meta: 70 },
  { date: '01/04', peso: 74.9, meta: 70 },
  { date: '01/05', peso: 74.4, meta: 70 },
  { date: '01/06', peso: 74.0, meta: 70 },
  { date: '01/07', peso: 73.8, meta: 70 },
];

const bodyComposition = [
  { name: 'Massa Muscular', value: 35, color: '#10B981' },
  { name: 'Gordura', value: 20, color: '#F59E0B' },
  { name: 'Água', value: 45, color: '#3B82F6' },
];

const weeklyStats = [
  { day: 'Seg', exercicio: 45, hidratacao: 1.8, sono: 7.5 },
  { day: 'Ter', exercicio: 30, hidratacao: 2.1, sono: 8.0 },
  { day: 'Qua', exercicio: 60, hidratacao: 2.0, sono: 7.0 },
  { day: 'Qui', exercicio: 40, hidratacao: 1.9, sono: 7.5 },
  { day: 'Sex', exercicio: 50, hidratacao: 2.2, sono: 8.5 },
  { day: 'Sab', exercicio: 75, hidratacao: 2.0, sono: 9.0 },
  { day: 'Dom', exercicio: 35, hidratacao: 1.7, sono: 8.0 },
];

const chartConfig = {
  peso: { label: 'Peso', color: '#F97316' },
  meta: { label: 'Meta', color: '#10B981' },
  exercicio: { label: 'Exercício (min)', color: '#3B82F6' },
  hidratacao: { label: 'Hidratação (L)', color: '#06B6D4' },
  sono: { label: 'Sono (h)', color: '#8B5CF6' },
};

const StatCard = ({ 
  title, 
  value, 
  unit, 
  change, 
  icon: Icon, 
  color,
  description 
}: {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description?: string;
}) => (
  <Card className="stat-card">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className={`h-4 w-4 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-foreground">
        {value}
        {unit && <span className="text-base text-muted-foreground ml-1">{unit}</span>}
      </div>
      {change && (
        <p className="text-xs text-muted-foreground">
          {change}
        </p>
      )}
      {description && (
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      )}
    </CardContent>
  </Card>
);

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Acompanhe sua jornada de saúde</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Peso Atual"
          value="73.8"
          unit="kg"
          change="-1.7kg este mês"
          icon={Scale}
          color="text-primary"
        />
        <StatCard
          title="IMC"
          value="22.1"
          change="Normal"
          icon={Target}
          color="text-success"
          description="Faixa saudável"
        />
        <StatCard
          title="Água Hoje"
          value="1.8"
          unit="L"
          change="Meta: 2.0L"
          icon={Droplets}
          color="text-health-hydration"
        />
        <StatCard
          title="Exercício"
          value="45"
          unit="min"
          change="Meta: 30min"
          icon={Activity}
          color="text-health-steps"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Evolution Chart */}
        <Card className="health-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PersonIcon size="md" variant="filled" color="#F97316" />
              <span>Evolução do Peso</span>
            </CardTitle>
            <CardDescription>
              Últimos 7 dias - Meta: 70kg
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <PersonIcon size="lg" variant="gradient" color="#F97316" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Seu progresso de peso ao longo do tempo</p>
                <p className="text-xs text-muted-foreground">O boneco representa você e sua jornada de saúde</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                  <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="peso" 
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="meta" 
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Body Composition */}
        <Card className="health-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PersonIcon size="md" variant="filled" color="#10B981" />
              <span>Composição Corporal</span>
            </CardTitle>
            <CardDescription>
              Análise atual do seu corpo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <PersonIcon size="lg" variant="gradient" color="#10B981" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Distribuição dos componentes do seu corpo</p>
                <p className="text-xs text-muted-foreground">Cada seção representa uma parte da sua composição</p>
              </div>
            </div>
            
            {/* Ícones de composição corporal */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <BodyCompositionIcon type="muscle" size="sm" />
              <BodyCompositionIcon type="fat" size="sm" />
              <BodyCompositionIcon type="water" size="sm" />
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bodyComposition}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {bodyComposition.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                  <Tooltip />
              </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity Chart */}
      <Card className="health-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-health-steps" />
            <span>Atividade Semanal</span>
          </CardTitle>
          <CardDescription>
            Exercício, hidratação e qualidade do sono
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
                <Tooltip />
              <Legend />
              <Bar 
                dataKey="exercicio" 
                fill="hsl(var(--health-steps))"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="hidratacao" 
                fill="hsl(var(--health-hydration))"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="sono" 
                fill="hsl(var(--accent))"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Daily Goals Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="mission-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Heart className="w-4 h-4 text-health-heart" />
              <span>Exercício Diário</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>45 min</span>
                <span>Meta: 30 min</span>
              </div>
              <Progress value={150} className="h-2" />
              <p className="text-xs text-success font-medium">Meta superada! 🎉</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mission-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-health-hydration" />
              <span>Hidratação</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>1.8 L</span>
                <span>Meta: 2.0 L</span>
              </div>
              <Progress value={90} className="h-2" />
              <p className="text-xs text-muted-foreground">Falta apenas 200ml</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mission-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Timer className="w-4 h-4 text-accent" />
              <span>Sono</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>7.5 h</span>
                <span>Meta: 8.0 h</span>
              </div>
              <Progress value={94} className="h-2" />
              <p className="text-xs text-muted-foreground">Quase na meta!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}