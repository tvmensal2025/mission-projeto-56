import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Trophy, Star, Droplets, Moon } from 'lucide-react';
import { useDailyMissionsFinal } from '@/hooks/useDailyMissionsFinal';
import { getSectionTitleFinal } from '@/data/daily-questions-final';
import { DailyQuestion } from '@/types/daily-missions';

interface DailyMissionsFinalProps {
  user: User | null;
}

export const DailyMissionsFinal: React.FC<DailyMissionsFinalProps> = ({ user }) => {
  const [textInput, setTextInput] = useState('');
  const {
    currentQuestion,
    currentQuestionIndex,
    progress,
    answers,
    isLoading,
    isCompleted,
    session,
    handleScaleAnswer,
    handleMultipleChoice,
    handleYesNo,
    handleTextInput,
    handleStarRating,
    allQuestions
  } = useDailyMissionsFinal({ user });

  const renderQuestion = (question: DailyQuestion) => {
    // Verificação de segurança para evitar erros
    if (!question || !question.type) {
      console.error('Pergunta inválida:', question);
      return <div className="p-4 text-red-500">Erro: pergunta não encontrada</div>;
    }

    switch (question.type) {
      case 'scale':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {question.scale?.labels?.map((label, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Button
                    variant={answers[question.id] === index + 1 ? "default" : "outline"}
                    className={`w-16 h-16 p-0 question-button mobile-text-lg ${
                      answers[question.id] === index + 1 ? 'question-button-purple' : 'question-button-outline'
                    }`}
                    onClick={() => handleScaleAnswer(index + 1)}
                    disabled={isLoading}
                  >
                    {question.scale?.emojis ? (
                      <span className="text-2xl">{question.scale.emojis[index]}</span>
                    ) : (
                      <span className="mobile-text-xl font-bold">{index + 1}</span>
                    )}
                  </Button>
                  <span className="mobile-text-lg flex-1">{label}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'star_scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant={answers[question.id] === star ? "default" : "outline"}
                  className={`w-16 h-16 p-0 question-button ${
                    answers[question.id] === star ? 'question-button-purple' : 'question-button-outline'
                  }`}
                  onClick={() => {
                    console.log(`Estrela ${star} clicada`);
                    handleStarRating(star);
                  }}
                  disabled={isLoading}
                >
                  <Star className={`h-8 w-8 ${answers[question.id] === star ? 'fill-current' : ''}`} />
                </Button>
              ))}
            </div>
            <p className="text-center mobile-text-lg text-muted-foreground">
              {question.scale?.labels && answers[question.id] 
                ? question.scale.labels[(answers[question.id] as number) - 1] 
                : 'Selecione uma avaliação'}
            </p>
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <Button
                key={index}
                variant={answers[question.id] === option ? "default" : "outline"}
                className={`w-full justify-start text-left question-button ${
                  answers[question.id] === option ? 'question-button-purple' : 'question-button-outline'
                }`}
                onClick={() => handleMultipleChoice(option)}
                disabled={isLoading}
              >
                {answers[question.id] === option && <CheckCircle className="mr-2 h-5 w-5" />}
                <span className="mobile-text-lg">{option}</span>
              </Button>
            ))}
          </div>
        );

      case 'yes_no':
        return (
          <div className="flex gap-3">
            <Button
              variant={answers[question.id] === 'Sim' ? "default" : "outline"}
              className={`flex-1 question-button ${
                answers[question.id] === 'Sim' ? 'question-button-purple' : 'question-button-outline'
              }`}
              onClick={() => handleYesNo(true)}
              disabled={isLoading}
            >
              {answers[question.id] === 'Sim' && <CheckCircle className="mr-2 h-5 w-5" />}
              <span className="mobile-text-lg">Sim</span>
            </Button>
            <Button
              variant={answers[question.id] === 'Não' ? "default" : "outline"}
              className={`flex-1 question-button ${
                answers[question.id] === 'Não' ? 'question-button-purple' : 'question-button-outline'
              }`}
              onClick={() => handleYesNo(false)}
              disabled={isLoading}
            >
              {answers[question.id] === 'Não' && <CheckCircle className="mr-2 h-5 w-5" />}
              <span className="mobile-text-lg">Não</span>
            </Button>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <Textarea
              placeholder={question.placeholder || "Digite sua resposta..."}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="min-h-[120px]"
              disabled={isLoading}
            />
            <Button
              onClick={() => {
                if (textInput.trim()) {
                  handleTextInput(textInput);
                  setTextInput('');
                }
              }}
              disabled={!textInput.trim() || isLoading}
              className="w-full question-button question-button-purple"
            >
              <span className="mobile-text-lg">Continuar</span>
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  // Se já completou hoje
  if (isCompleted && session) {
    const totalPoints = session.total_points;

    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="bg-gradient-to-r from-green-900 to-blue-900 border-green-700">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="h-12 w-12 text-yellow-400" />
              <h2 className="text-3xl font-bold text-green-100">Missão Completa!</h2>
              <Trophy className="h-12 w-12 text-yellow-400" />
            </div>
            
            <p className="text-xl text-green-200 mb-6">
              Parabéns! Você completou todas as reflexões de hoje.
            </p>
            
            <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-white">Resumo das Respostas:</h3>
              <div className="space-y-2 text-left">
                {allQuestions.map((question) => (
                  <div key={question.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                    <span className="text-sm text-gray-200">{question.question}</span>
                    <Badge variant="secondary" className="bg-gray-600 text-gray-200">
                      {answers[question.id] || 'Não respondido'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-yellow-400">
              <Star className="h-8 w-8" />
              <span>{totalPoints} pontos ganhos!</span>
              <Star className="h-8 w-8" />
            </div>

            {/* Dados de tracking */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-blue-800 p-4 rounded-lg border border-blue-600">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="h-5 w-5 text-blue-300" />
                  <span className="font-semibold text-blue-100">Água</span>
                </div>
                <p className="text-sm text-blue-200">
                  {answers['water_intake'] || 'Não registrado'}
                </p>
              </div>
              
              <div className="bg-purple-800 p-4 rounded-lg border border-purple-600">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="h-5 w-5 text-purple-300" />
                  <span className="font-semibold text-purple-100">Sono</span>
                </div>
                <p className="text-sm text-purple-200">
                  {answers['sleep_hours'] || 'Não registrado'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="p-6 text-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Missão do Dia</h1>
        <p className="text-muted-foreground">
          Pergunta {currentQuestionIndex + 1} de {allQuestions.length}
        </p>
        
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {getSectionTitleFinal(currentQuestion.section)}
            </Badge>
            <span className="flex items-center gap-1 text-yellow-600">
              <Trophy className="h-4 w-4" />
              <span className="text-sm">{currentQuestion.points} pts</span>
            </span>
            {currentQuestion.tracking && (
              <Badge variant="secondary" className="text-xs">
                📊 Tracking
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>
          {renderQuestion(currentQuestion)}
          
          {isLoading && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Salvando resposta...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          disabled={currentQuestionIndex === 0}
        >
          Anterior
        </Button>
        
        <div className="text-sm text-muted-foreground">
          {currentQuestionIndex + 1} / {allQuestions.length}
        </div>
      </div>
    </div>
  );
}; 