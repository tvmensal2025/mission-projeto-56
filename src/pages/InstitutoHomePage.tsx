import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, Sparkles, ArrowRight, Star, Target, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const InstitutoHomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-primary py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Instituto dos Sonhos
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Transforme seu corpo e sua vida com nosso método exclusivo de emagrecimento integral
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link to="/auth">
                Comece sua Transformação
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Conheça nossos Programas
            </Button>
          </div>
        </div>
      </section>

      {/* Missão Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Nossa Missão</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Guiar pessoas na transformação integral da saúde física e emocional, proporcionando 
            emagrecimento sustentável, autoestima elevada, bem-estar e qualidade de vida. 
            Rafael e Sirlene acreditam que a verdadeira mudança acontece de dentro para fora, 
            por meio do equilíbrio entre corpo, mente e emoções.
          </p>
        </div>
      </section>

      {/* Programas Section */}
      <section className="py-16 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Programas de Transformação
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="health-card">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Programa de Recomeço</h3>
                <p className="text-muted-foreground mb-4">
                  Um programa para quem já tentou de tudo. Aqui, você encontra acolhimento, 
                  estratégia e motivação real. Entenda como desinflamar seu corpo e transforme 
                  sua rotina com o apoio de especialistas.
                </p>
                <Button variant="outline" className="w-full">
                  Saiba Mais
                </Button>
              </CardContent>
            </Card>

            <Card className="health-card">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Emagreça com Consciência</h3>
                <p className="text-muted-foreground mb-4">
                  Você não precisa sofrer para emagrecer. Oferecemos uma abordagem integrativa 
                  com foco em bem-estar físico e emocional. Com hipnose, coaching e práticas 
                  saudáveis, o emagrecimento vira consequência.
                </p>
                <Button variant="outline" className="w-full">
                  Saiba Mais
                </Button>
              </CardContent>
            </Card>

            <Card className="health-card">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Academia Sem Dor</h3>
                <p className="text-muted-foreground mb-4">
                  Acesso a uma academia completa com musculação, pilates, fisioterapia e 
                  orientação profissional. Cuidar da saúde física faz parte da transformação 
                  que você merece viver.
                </p>
                <Button variant="outline" className="w-full">
                  Saiba Mais
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sobre Nós Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Sobre Rafael e Sirlene
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                O Instituto dos Sonhos foi fundado por Rafael Ferreira e Sirlene Freitas, 
                especialistas em emagrecimento, saúde emocional e estética integrativa.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Award className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Rafael Ferreira</h4>
                    <p className="text-muted-foreground">
                      Coach, hipnólogo, psicoterapeuta, master coach e estudante de Biomedicina
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="h-6 w-6 text-secondary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Sirlene Freitas</h4>
                    <p className="text-muted-foreground">
                      Coach, hipnose, psicoterapia, inteligência emocional e estudante de Nutrição
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-card rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-4">Nossa Equipe Multidisciplinar</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Nutricionistas especializados</li>
                <li>• Biomédicos qualificados</li>
                <li>• Fisioterapeutas experientes</li>
                <li>• Educadores físicos</li>
                <li>• Academia Sem Dor completa</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Valores Section */}
      <section className="py-16 px-4 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Nossos Valores
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Heart className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Humanização e Empatia</h4>
                <p className="text-muted-foreground">
                  Tratamos cada cliente como parte da família Instituto dos Sonhos
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Star className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Ética e Transparência</h4>
                <p className="text-muted-foreground">
                  Compromisso com métodos saudáveis e verdadeiros
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Inovação Constante</h4>
                <p className="text-muted-foreground">
                  Uso de tecnologia e ciência de ponta
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Equilíbrio Corpo-Mente</h4>
                <p className="text-muted-foreground">
                  Acreditamos que saúde emocional e física andam juntas
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            "Tudo Começa com Uma Escolha"
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Neste exato momento, milhares de pessoas enfrentam dores, inseguranças e o peso 
            de tantas tentativas frustradas. Mas também existem aquelas que decidiram mudar. 
            E você pode ser a próxima.
          </p>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
            <Link to="/auth">
              Começar Minha Transformação
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">Instituto dos Sonhos</h3>
          <p className="text-muted-foreground mb-6">
            Transformação integral da saúde física e emocional
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Cadastrar</Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InstitutoHomePage;