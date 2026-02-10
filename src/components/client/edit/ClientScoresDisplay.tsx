import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface CriterionStatus {
  id: number;
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

interface ClientScoresDisplayProps {
  matrixId: string;
  scores: Score[];
  criteria: Criterion[];
  onStartQuestionnaire: () => void;
  onReassess: () => void;
}

const ClientScoresDisplay = ({
  matrixId,
  scores,
  criteria,
  onStartQuestionnaire,
  onReassess,
}: ClientScoresDisplayProps) => {
  if (!matrixId) {
    return null;
  }

  if (scores.length > 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Текущие оценки</h3>
            <p className="text-sm text-muted-foreground">
              Клиент оценен по {scores.length} {scores.length === 1 ? 'критерию' : scores.length < 5 ? 'критериям' : 'критериям'}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onReassess}
          >
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Переоценить
          </Button>
        </div>

        <div className="grid gap-3">
          {scores.map((score) => {
            const criterion = criteria.find(c => c.id === score.criterion_id);
            if (!criterion) return null;
            
            const selectedStatus = criterion.statuses.find(s => s.weight === score.score);
            
            return (
              <div key={score.criterion_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">{criterion.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {criterion.axis === 'x' ? 'Ось X' : 'Ось Y'}
                  </div>
                </div>
                <Badge variant="secondary">
                  {selectedStatus?.label || `${score.score} баллов`}
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="text-center py-8">
        <Icon name="ClipboardList" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Клиент не оценен</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Пройдите опросник для оценки клиента по выбранной матрице
        </p>
        <Button
          type="button"
          onClick={onStartQuestionnaire}
          className="gradient-primary"
        >
          <Icon name="Play" size={16} className="mr-2" />
          Начать оценку
        </Button>
      </div>
    </Card>
  );
};

export default ClientScoresDisplay;
