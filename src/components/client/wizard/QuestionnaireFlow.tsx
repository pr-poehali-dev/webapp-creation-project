import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface CriterionStatus {
  id: number;
  criterion_id: number;
  label: string;
  weight: number;
  sort_order: number;
}

interface Criterion {
  id: number;
  name: string;
  description: string;
  axis: string;
  weight: number;
  min_value: number;
  max_value: number;
  statuses: CriterionStatus[];
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
      : criteria.map(c => ({ criterion_id: c.id, score: 0, comment: '' }))
  );
  const [selectedStatuses, setSelectedStatuses] = useState<Map<number, number>>(new Map());

  const currentCriterion = criteria[currentIndex];
  const currentScore = scores.find(s => s.criterion_id === currentCriterion.id);
  const progress = ((currentIndex + 1) / criteria.length) * 100;
  const sortedStatuses = [...(currentCriterion.statuses || [])].sort((a, b) => a.sort_order - b.sort_order);

  const handleStatusSelect = (statusId: number, weight: number) => {
    setSelectedStatuses(prev => new Map(prev).set(currentCriterion.id, statusId));
    setScores(scores.map(s => 
      s.criterion_id === currentCriterion.id ? { ...s, score: weight } : s
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
          {sortedStatuses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedStatuses.map((status) => {
                const isSelected = selectedStatuses.get(currentCriterion.id) === status.id;
                return (
                  <Card
                    key={status.id}
                    onClick={() => handleStatusSelect(status.id, status.weight)}
                    className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      isSelected 
                        ? 'border-primary border-2 bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xl font-semibold">{status.label}</h4>
                      {isSelected && (
                        <Icon name="CheckCircle2" size={24} className="text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {status.weight} {status.weight === 1 ? 'балл' : status.weight < 5 ? 'балла' : 'баллов'}
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="AlertCircle" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Для этого критерия не настроены статусы</p>
            </div>
          )}
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
          disabled={sortedStatuses.length > 0 && !selectedStatuses.has(currentCriterion.id)}
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