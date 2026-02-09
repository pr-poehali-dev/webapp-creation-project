import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface QuadrantRule {
  quadrant: 'focus' | 'grow' | 'monitor' | 'archive';
  x_min: number;
  y_min: number;
  x_operator: 'AND' | 'OR';
  priority: number;
}

interface QuadrantRulesEditorProps {
  rules: QuadrantRule[];
  onChange: (rules: QuadrantRule[]) => void;
  maxScore?: number;
}

const DEFAULT_RULES: QuadrantRule[] = [
  { quadrant: 'focus', x_min: 7.0, y_min: 7.0, x_operator: 'AND', priority: 1 },
  { quadrant: 'monitor', x_min: 0.0, y_min: 7.0, x_operator: 'AND', priority: 2 },
  { quadrant: 'grow', x_min: 7.0, y_min: 0.0, x_operator: 'AND', priority: 3 },
  { quadrant: 'archive', x_min: 0.0, y_min: 0.0, x_operator: 'AND', priority: 4 }
];

const QUADRANT_CONFIG = {
  focus: {
    label: 'Фокус',
    icon: 'Target',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Клиенты с высоким приоритетом'
  },
  monitor: {
    label: 'Мониторить',
    icon: 'Eye',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Клиенты требующие наблюдения'
  },
  grow: {
    label: 'Выращивать',
    icon: 'TrendingUp',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    description: 'Клиенты с потенциалом роста'
  },
  archive: {
    label: 'Архив',
    icon: 'Archive',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    description: 'Остальные клиенты'
  }
};

const PRESETS = [
  { label: 'Строгая', rules: [
    { quadrant: 'focus' as const, x_min: 8.0, y_min: 8.0, x_operator: 'AND' as const, priority: 1 },
    { quadrant: 'monitor' as const, x_min: 0.0, y_min: 8.0, x_operator: 'AND' as const, priority: 2 },
    { quadrant: 'grow' as const, x_min: 8.0, y_min: 0.0, x_operator: 'AND' as const, priority: 3 },
    { quadrant: 'archive' as const, x_min: 0.0, y_min: 0.0, x_operator: 'AND' as const, priority: 4 }
  ]},
  { label: 'Умеренная', rules: DEFAULT_RULES },
  { label: 'Мягкая', rules: [
    { quadrant: 'focus' as const, x_min: 5.0, y_min: 5.0, x_operator: 'AND' as const, priority: 1 },
    { quadrant: 'monitor' as const, x_min: 0.0, y_min: 5.0, x_operator: 'AND' as const, priority: 2 },
    { quadrant: 'grow' as const, x_min: 5.0, y_min: 0.0, x_operator: 'AND' as const, priority: 3 },
    { quadrant: 'archive' as const, x_min: 0.0, y_min: 0.0, x_operator: 'AND' as const, priority: 4 }
  ]}
];

export const QuadrantRulesEditor = ({ 
  rules, 
  onChange,
  maxScore = 10
}: QuadrantRulesEditorProps) => {
  const [localRules, setLocalRules] = useState<QuadrantRule[]>(
    rules.length > 0 ? rules : DEFAULT_RULES
  );

  const updateRule = (quadrant: QuadrantRule['quadrant'], field: keyof QuadrantRule, value: number | string) => {
    const newRules = localRules.map(rule => {
      if (rule.quadrant === quadrant) {
        return { ...rule, [field]: value };
      }
      return rule;
    });
    setLocalRules(newRules);
    onChange(newRules);
  };

  const applyPreset = (presetRules: QuadrantRule[]) => {
    setLocalRules(presetRules);
    onChange(presetRules);
  };

  const resetToDefault = () => {
    setLocalRules(DEFAULT_RULES);
    onChange(DEFAULT_RULES);
  };

  const editableQuadrants = localRules.filter(r => r.quadrant !== 'archive');
  const archiveRule = localRules.find(r => r.quadrant === 'archive');

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">Правила распределения клиентов</h3>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Настройте пороговые значения для каждого квадранта. Клиенты будут автоматически 
            распределяться по квадрантам в порядке приоритета.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <span className="text-sm text-muted-foreground">Пресеты:</span>
        {PRESETS.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            onClick={() => applyPreset(preset.rules)}
          >
            {preset.label}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={resetToDefault}
        >
          <Icon name="RotateCcw" size={16} className="mr-2" />
          Сброс
        </Button>
      </div>

      <div className="grid gap-4">
        {editableQuadrants.map((rule) => {
          const config = QUADRANT_CONFIG[rule.quadrant];
          return (
            <Card 
              key={rule.quadrant} 
              className={`p-5 border-2 ${config.borderColor} ${config.bgColor}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0 border ${config.borderColor}`}>
                  <Icon name={config.icon} size={20} className={config.color} />
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{config.label}</h4>
                      <span className="text-xs text-muted-foreground px-2 py-0.5 bg-background/60 rounded">
                        Приоритет {rule.priority}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Ось X (минимум)</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">≥</span>
                        <Input
                          type="number"
                          min={0}
                          max={maxScore}
                          step={0.5}
                          value={rule.x_min}
                          onChange={(e) => updateRule(rule.quadrant, 'x_min', parseFloat(e.target.value) || 0)}
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground">баллов</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Ось Y (минимум)</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">≥</span>
                        <Input
                          type="number"
                          min={0}
                          max={maxScore}
                          step={0.5}
                          value={rule.y_min}
                          onChange={(e) => updateRule(rule.quadrant, 'y_min', parseFloat(e.target.value) || 0)}
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground">баллов</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Условие</Label>
                      <Select
                        value={rule.x_operator}
                        onValueChange={(value) => updateRule(rule.quadrant, 'x_operator', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">И (оба условия)</SelectItem>
                          <SelectItem value="OR">ИЛИ (любое условие)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground bg-background/60 p-3 rounded">
                    <Icon name="Info" size={14} className="inline mr-1" />
                    {rule.x_operator === 'AND' 
                      ? `Клиент попадёт в "${config.label}", если X ≥ ${rule.x_min} И Y ≥ ${rule.y_min}`
                      : `Клиент попадёт в "${config.label}", если X ≥ ${rule.x_min} ИЛИ Y ≥ ${rule.y_min}`
                    }
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {archiveRule && (
          <Card className={`p-5 border-2 ${QUADRANT_CONFIG.archive.borderColor} ${QUADRANT_CONFIG.archive.bgColor}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg ${QUADRANT_CONFIG.archive.bgColor} flex items-center justify-center flex-shrink-0 border ${QUADRANT_CONFIG.archive.borderColor}`}>
                <Icon name={QUADRANT_CONFIG.archive.icon} size={20} className={QUADRANT_CONFIG.archive.color} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{QUADRANT_CONFIG.archive.label}</h4>
                  <span className="text-xs text-muted-foreground px-2 py-0.5 bg-background/60 rounded">
                    Приоритет {archiveRule.priority}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{QUADRANT_CONFIG.archive.description}</p>
                <div className="text-xs text-muted-foreground bg-background/60 p-3 rounded">
                  <Icon name="Info" size={14} className="inline mr-1" />
                  Все клиенты, не попавшие в другие квадранты, автоматически попадут в архив
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="Lightbulb" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Как работает распределение?</p>
            <p className="text-blue-700">
              Правила проверяются последовательно по приоритету (1→2→3→4). 
              Клиент попадает в первый подходящий квадрант. 
              Если не подходит ни одно правило — попадает в Архив.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuadrantRulesEditor;
