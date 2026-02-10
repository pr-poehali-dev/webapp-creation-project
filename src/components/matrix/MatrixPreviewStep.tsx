import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { QuadrantRule } from './QuadrantRulesEditor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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

const QUADRANT_CONFIG = {
  focus: { label: 'Фокус', icon: 'Target', color: 'text-green-500' },
  monitor: { label: 'Мониторить', icon: 'Eye', color: 'text-blue-500' },
  grow: { label: 'Выращивать', icon: 'TrendingUp', color: 'text-yellow-500' },
  archive: { label: 'Архив', icon: 'Archive', color: 'text-gray-500' }
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
  const [criteriaDialogOpen, setCriteriaDialogOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Предпросмотр матрицы</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-1">Название</h3>
              <p className="text-sm font-medium">{matrixName}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-1">Шаблон</h3>
              <div className="flex items-center gap-2">
                <Icon 
                  name={selectedTemplate ? templateIcons[selectedTemplate.name] || 'Layers' : 'Plus'} 
                  size={16} 
                  className="text-primary" 
                />
                <p className="text-sm">
                  {selectedTemplate ? selectedTemplate.name : 'Пустая матрица'}
                </p>
              </div>
            </div>
          </div>

          {matrixDescription && (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-1">Описание</h3>
              <p className="text-sm text-muted-foreground">{matrixDescription}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-1">Ось X</h3>
              <p className="text-sm">{axisXName}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-1">Ось Y</h3>
              <p className="text-sm">{axisYName}</p>
            </div>
          </div>

          {selectedTemplate && selectedTemplate.criteria && selectedTemplate.criteria.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-2">Критерии</h3>
              <Dialog open={criteriaDialogOpen} onOpenChange={setCriteriaDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Icon name="List" size={14} className="mr-2" />
                    Критерии из шаблона ({selectedTemplate.criteria.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Критерии оценки</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <h4 className="text-sm font-medium mb-3">Ось X - {axisXName}</h4>
                      <div className="space-y-2">
                        {selectedTemplate.criteria
                          .filter(c => c.axis === 'x')
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map((criterion, idx) => (
                            <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-start justify-between mb-1">
                                <p className="text-sm font-medium">{criterion.name}</p>
                                <span className="text-xs text-muted-foreground">Вес: {criterion.weight}</span>
                              </div>
                              {criterion.hint && (
                                <p className="text-xs text-muted-foreground">{criterion.hint}</p>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-3">Ось Y - {axisYName}</h4>
                      <div className="space-y-2">
                        {selectedTemplate.criteria
                          .filter(c => c.axis === 'y')
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map((criterion, idx) => (
                            <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-start justify-between mb-1">
                                <p className="text-sm font-medium">{criterion.name}</p>
                                <span className="text-xs text-muted-foreground">Вес: {criterion.weight}</span>
                              </div>
                              {criterion.hint && (
                                <p className="text-xs text-muted-foreground">{criterion.hint}</p>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          <div>
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Правила квадрантов</h3>
            <div className="grid grid-cols-2 gap-2 border border-border rounded-lg overflow-hidden">
              {(['monitor', 'focus', 'archive', 'grow'] as const).map((quadrantKey) => {
                const rule = quadrantRules.find(r => r.quadrant === quadrantKey);
                if (!rule) return null;
                const config = QUADRANT_CONFIG[quadrantKey];
                return (
                  <div 
                    key={quadrantKey}
                    className="p-4 bg-card border-border flex flex-col items-center justify-center text-center min-h-[100px]"
                    style={{
                      borderRight: quadrantKey === 'monitor' || quadrantKey === 'archive' ? '1px solid hsl(var(--border))' : 'none',
                      borderBottom: quadrantKey === 'monitor' || quadrantKey === 'focus' ? '1px solid hsl(var(--border))' : 'none'
                    }}
                  >
                    <Icon name={config.icon} size={20} className={`${config.color} mb-2`} />
                    <div className="text-sm font-medium mb-1">{config.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {quadrantKey === 'archive' ? (
                        'Остальные'
                      ) : (
                        <>
                          X ≥ {rule.x_min}
                          <br />
                          {rule.x_operator === 'AND' ? 'и' : 'или'} Y ≥ {rule.y_min}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
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