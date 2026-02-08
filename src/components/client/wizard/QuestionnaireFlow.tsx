import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Criterion {
  id: number;
  name: string;
  description: string;
  axis: string;
  weight: number;
  min_value: number;
  max_value: number;
}

interface Score {
  criterion_id: number;
  score: number;
  comment: string;
}

interface QuestionnaireFlowProps {
  criteria: Criterion[];
  initialScores?: Score[];
  onComplete: (scores: Score[]) => void;
  onBack: () => void;
}

const QuestionnaireFlow = ({ 
  criteria, 
  initialScores = [],
  onComplete, 
  onBack 
}: QuestionnaireFlowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Score[]>(
    initialScores.length > 0 
      ? initialScores 
      : criteria.map(c => ({ criterion_id: c.id, score: c.min_value, comment: '' }))
  );

  const currentCriterion = criteria[currentIndex];
  const currentScore = scores.find(s => s.criterion_id === currentCriterion.id);
  const progress = ((currentIndex + 1) / criteria.length) * 100;

  const handleScoreChange = (value: number) => {
    setScores(scores.map(s => 
      s.criterion_id === currentCriterion.id ? { ...s, score: value } : s
    ));
  };

  const handleNext = () => {
    if (currentIndex < criteria.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(scores);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      onBack();
    }
  };

  const getAxisLabel = (axis: string) => {
    if (axis === 'x') return 'Ось X: Стратегическое влияние';
    if (axis === 'y') return 'Ось Y: Зрелость потребности';
    return 'Универсальный критерий';
  };

  const getAxisColor = (axis: string) => {
    if (axis === 'x') return 'text-primary';
    if (axis === 'y') return 'text-secondary';
    return 'text-muted-foreground';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Badge variant="outline" className="mb-2">
              Вопрос {currentIndex + 1} из {criteria.length}
            </Badge>
            <h2 className="text-2xl font-bold">Опросник по критериям</h2>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">Прогресс</div>
            <div className="text-2xl font-bold text-primary">{Math.round(progress)}%</div>
          </div>
        </div>

        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <Card className="p-8 mb-6">
        <div className="mb-8">
          <Badge className={`mb-4 ${getAxisColor(currentCriterion.axis)}`}>
            {getAxisLabel(currentCriterion.axis)}
          </Badge>
          <h3 className="text-2xl font-bold mb-3">{currentCriterion.name}</h3>
          {currentCriterion.description && (
            <p className="text-muted-foreground text-lg">{currentCriterion.description}</p>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">
                {currentScore?.score.toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground">Текущая оценка</p>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="range"
              min={currentCriterion.min_value}
              max={currentCriterion.max_value}
              step="0.1"
              value={currentScore?.score || currentCriterion.min_value}
              onChange={(e) => handleScoreChange(parseFloat(e.target.value))}
              className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              style={{
                background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((currentScore?.score || currentCriterion.min_value) - currentCriterion.min_value) / (currentCriterion.max_value - currentCriterion.min_value) * 100}%, hsl(var(--muted)) ${((currentScore?.score || currentCriterion.min_value) - currentCriterion.min_value) / (currentCriterion.max_value - currentCriterion.min_value) * 100}%, hsl(var(--muted)) 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{currentCriterion.min_value}</span>
              <span>{currentCriterion.max_value}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          variant="outline"
          size="lg"
        >
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          {currentIndex === 0 ? 'К выбору опросника' : 'Назад'}
        </Button>

        <Button
          onClick={handleNext}
          className="gradient-primary"
          size="lg"
        >
          {currentIndex === criteria.length - 1 ? (
            <>
              <Icon name="CheckCircle2" size={20} className="mr-2" />
              Завершить
            </>
          ) : (
            <>
              Далее
              <Icon name="ArrowRight" size={20} className="ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default QuestionnaireFlow;
