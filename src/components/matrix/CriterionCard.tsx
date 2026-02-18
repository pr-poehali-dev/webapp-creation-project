import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

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

interface CriterionCardProps {
  criterion: Criterion;
  onUpdateName: (value: string) => void;
  onUpdateStatuses: (statuses: CriterionStatus[]) => void;
  onRemove: () => void;
}

export const CriterionCard = ({
  criterion,
  onUpdateName,
  onUpdateStatuses,
  onRemove
}: CriterionCardProps) => {
  return (
    <div className="p-4 bg-muted/30 rounded-lg">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <input
            type="text"
            value={criterion.name}
            onChange={(e) => onUpdateName(e.target.value)}
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
            placeholder="Название критерия"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
          >
            <Icon name="Trash2" size={16} className="text-destructive" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="hidden sm:flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Статусы критерия</label>
            <label className="text-xs font-medium text-muted-foreground mr-24">Вес статуса</label>
          </div>
          <div className="sm:hidden text-xs font-medium text-muted-foreground mb-2">Статусы критерия</div>
          {criterion.statuses.map((status, statusIdx) => (
            <div key={statusIdx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground sm:hidden mb-1 block">Название</label>
                <input
                  type="text"
                  value={status.label}
                  onChange={(e) => {
                    const updated = [...criterion.statuses];
                    updated[statusIdx] = { ...status, label: e.target.value };
                    onUpdateStatuses(updated);
                  }}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  placeholder="Название статуса"
                />
              </div>
              <div className="flex items-center gap-2 sm:w-auto">
                <div className="flex-1 sm:flex-none sm:w-20">
                  <label className="text-xs font-medium text-muted-foreground sm:hidden mb-1 block">Вес</label>
                  <select
                    value={status.weight}
                    onChange={(e) => {
                      const updated = [...criterion.statuses];
                      updated[statusIdx] = { ...status, weight: parseInt(e.target.value) };
                      onUpdateStatuses(updated);
                    }}
                    className="w-full sm:w-20 px-2 py-2 bg-background border border-border rounded-lg text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const updated = criterion.statuses.filter((_, i) => i !== statusIdx);
                    onUpdateStatuses(updated);
                  }}
                  className="flex-shrink-0"
                >
                  <Icon name="X" size={14} className="text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const updated = [...criterion.statuses, { label: '', weight: 1, sort_order: criterion.statuses.length }];
              onUpdateStatuses(updated);
            }}
            className="w-full text-xs"
          >
            <Icon name="Plus" size={14} className="mr-2" />
            Добавить статус
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CriterionCard;