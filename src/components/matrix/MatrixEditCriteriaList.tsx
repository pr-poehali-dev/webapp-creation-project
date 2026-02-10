import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import CriterionCard from './CriterionCard';

interface CriterionStatus {
  label: string;
  weight: number;
  sort_order: number;
}

interface Criterion {
  id?: number;
  axis: 'x' | 'y';
  name: string;
  description: string;
  weight: number;
  min_value: number;
  max_value: number;
  sort_order: number;
  statuses: CriterionStatus[];
}

interface MatrixEditCriteriaListProps {
  axis: 'x' | 'y';
  title: string;
  criteria: Criterion[];
  allCriteria: Criterion[];
  onAddCriterion: () => void;
  onUpdateCriterion: (index: number, field: keyof Criterion, value: string | number) => void;
  onUpdateCriterionStatuses: (index: number, statuses: CriterionStatus[]) => void;
  onRemoveCriterion: (index: number) => void;
}

export const MatrixEditCriteriaList = ({
  axis,
  title,
  criteria,
  allCriteria,
  onAddCriterion,
  onUpdateCriterion,
  onUpdateCriterionStatuses,
  onRemoveCriterion
}: MatrixEditCriteriaListProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <Button variant="outline" size="sm" onClick={onAddCriterion}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить
        </Button>
      </div>

      <div className="space-y-4">
        {criteria.map((criterion) => {
          const globalIndex = allCriteria.findIndex(c => c === criterion);
          return (
            <CriterionCard
              key={globalIndex}
              criterion={criterion}
              onUpdateName={(value) => onUpdateCriterion(globalIndex, 'name', value)}
              onUpdateStatuses={(statuses) => onUpdateCriterionStatuses(globalIndex, statuses)}
              onRemove={() => onRemoveCriterion(globalIndex)}
            />
          );
        })}
      </div>
    </Card>
  );
};

export default MatrixEditCriteriaList;
