import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { QuadrantRule } from './QuadrantRulesEditor';

interface Template {
  id: number;
  name: string;
  description: string;
  is_system: boolean;
  axis_x_name?: string;
  axis_y_name?: string;
  criteria?: Criterion[];
}

interface Criterion {
  id: number;
  axis: string;
  name: string;
  weight: number;
  min_value: number;
  max_value: number;
  hint: string;
  sort_order: number;
}

interface MatrixPreviewStepProps {
  matrixName: string;
  matrixDescription: string;
  axisXName: string;
  axisYName: string;
  selectedTemplate: Template | null;
  quadrantRules: QuadrantRule[];
  loading: boolean;
  onBack: () => void;
  onCreate: () => void;
}

const templateIcons: Record<string, string> = {
  'Продажи ИИ-продуктов': 'Brain',
  'Сложное техническое оборудование': 'Cog',
  'Корпоративное ПО': 'Code',
  'Консалтинг': 'Briefcase'
};

export const MatrixPreviewStep = ({
  matrixName,
  matrixDescription,
  axisXName,
  axisYName,
  selectedTemplate,
  quadrantRules,
  loading,
  onBack,
  onCreate
}: MatrixPreviewStepProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Предпросмотр матрицы</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Название</h3>
            <p className="text-lg font-semibold">{matrixName}</p>
          </div>

          {matrixDescription && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Описание</h3>
              <p className="text-sm">{matrixDescription}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Ось X</h3>
              <p className="font-medium">{axisXName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Ось Y</h3>
              <p className="font-medium">{axisYName}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Шаблон</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon 
                  name={selectedTemplate ? templateIcons[selectedTemplate.name] || 'Layers' : 'Plus'} 
                  size={20} 
                  className="text-primary" 
                />
              </div>
              <p className="font-medium">
                {selectedTemplate ? selectedTemplate.name : 'Пустая матрица (без шаблона)'}
              </p>
            </div>
          </div>

          {selectedTemplate && selectedTemplate.criteria && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Критерии из шаблона ({selectedTemplate.criteria.length})
              </h3>
              <div className="space-y-3">
                {selectedTemplate.criteria
                  .filter(c => c.axis === 'x')
                  .slice(0, 3)
                  .map((criterion, idx) => (
                    <div key={idx} className="text-sm flex items-center gap-2">
                      <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
                      <span>{criterion.name}</span>
                    </div>
                  ))}
                {selectedTemplate.criteria.filter(c => c.axis === 'x').length > 3 && (
                  <p className="text-xs text-muted-foreground pl-5">
                    и ещё {selectedTemplate.criteria.filter(c => c.axis === 'x').length - 3} критериев...
                  </p>
                )}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Правила квадрантов</h3>
            <div className="grid grid-cols-2 gap-3">
              {quadrantRules.filter(r => r.quadrant !== 'archive').map((rule) => {
                const labels: Record<string, string> = {
                  focus: 'Фокус',
                  monitor: 'Мониторить',
                  grow: 'Выращивать'
                };
                return (
                  <div key={rule.quadrant} className="text-sm p-3 bg-muted/50 rounded-lg">
                    <div className="font-medium mb-1">{labels[rule.quadrant]}</div>
                    <div className="text-xs text-muted-foreground">
                      X ≥ {rule.x_min} {rule.x_operator === 'AND' ? 'и' : 'или'} Y ≥ {rule.y_min}
                    </div>
                  </div>
                );
              })}
              <div className="text-sm p-3 bg-muted/50 rounded-lg col-span-2">
                <div className="font-medium mb-1">Архив</div>
                <div className="text-xs text-muted-foreground">
                  Все остальные клиенты
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
          disabled={loading}
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          Назад
        </Button>
        <Button 
          onClick={onCreate}
          disabled={loading}
          className="gradient-primary"
        >
          {loading ? 'Создание...' : 'Создать матрицу'}
          <Icon name="Check" size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default MatrixPreviewStep;
