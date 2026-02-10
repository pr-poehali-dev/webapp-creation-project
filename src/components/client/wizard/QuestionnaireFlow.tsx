import { useState, useEffect } from 'react';
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
    
    setTimeout(() => {
      if (currentIndex < criteria.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onComplete(scores.map(s => 
          s.criterion_id === currentCriterion.id ? { ...s, score: weight } : s
        ));
      }
    }, 300);
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <Badge variant="outline" className="text-xs sm:text-sm mb-1 sm:mb-2">
              {currentIndex + 1} / {criteria.length}
            </Badge>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Опросник по критериям</h2>
          </div>
          <div className="text-right">
            <div className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Прогресс</div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary">{Math.round(progress)}%</div>
          </div>
        </div>

        <div className="w-full h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <Card key={`question-${currentCriterion.id}`} className="p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
        <div className="mb-4 sm:mb-6">
          <Badge className={`text-xs sm:text-sm mb-2 sm:mb-3 ${getAxisColor(currentCriterion.axis)}`}>
            {getAxisLabel(currentCriterion.axis)}
          </Badge>
          <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{currentCriterion.name}</h3>
          {currentCriterion.description && (
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">{currentCriterion.description}</p>
          )}
        </div>

        <div className="space-y-3 sm:space-y-4">
          {sortedStatuses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {sortedStatuses.map((status) => {
                const isSelected = selectedStatuses.get(currentCriterion.id) === status.id;
                return (
                  <Card
                    key={status.id}
                    onClick={() => handleStatusSelect(status.id, status.weight)}
                    className={`p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 ${
                      isSelected 
                        ? 'border-primary border-2 bg-primary/10 shadow-md' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm sm:text-base md:text-lg font-semibold leading-tight">{status.label}</h4>
                      {isSelected && (
                        <Icon name="CheckCircle2" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    <Badge variant={isSelected ? 'default' : 'secondary'} className="text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1">
                      {status.weight} {status.weight === 1 ? 'балл' : status.weight < 5 ? 'балла' : 'баллов'}
                    </Badge>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <Icon name="AlertCircle" size={40} className="mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="text-sm sm:text-base">Для этого критерия не настроены статусы</p>
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-between gap-2 sm:gap-4">
        <Button
          onClick={handlePrevious}
          variant="outline"
          size="default"
          className="flex-1 sm:flex-none"
        >
          <Icon name="ArrowLeft" size={18} className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{currentIndex === 0 ? 'К выбору опросника' : 'Назад'}</span>
          <span className="sm:hidden">Назад</span>
        </Button>

        <Button
          onClick={handleNext}
          className="gradient-primary flex-1 sm:flex-none"
          size="default"
          disabled={sortedStatuses.length > 0 && !selectedStatuses.has(currentCriterion.id)}
        >
          {currentIndex === criteria.length - 1 ? (
            <>
              <Icon name="CheckCircle2" size={18} className="mr-1 sm:mr-2" />
              Завершить
            </>
          ) : (
            <>
              Далее
              <Icon name="ArrowRight" size={18} className="ml-1 sm:ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default QuestionnaireFlow;