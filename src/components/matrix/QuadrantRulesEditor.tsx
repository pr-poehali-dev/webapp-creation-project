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
    color: 'text-green-500',
    description: 'Клиенты с высоким приоритетом'
  },
  monitor: {
    label: 'Мониторить',
    icon: 'Eye',
    color: 'text-blue-500',
    description: 'Клиенты требующие наблюдения'
  },
  grow: {
    label: 'Выращивать',
    icon: 'TrendingUp',
    color: 'text-yellow-500',
    description: 'Клиенты с потенциалом роста'
  },
  archive: {
    label: 'Архив',
    icon: 'Archive',
    color: 'text-gray-500',
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

      <div className="grid gap-3">
        {editableQuadrants.map((rule) => {
          const config = QUADRANT_CONFIG[rule.quadrant];
          return (
            <Card 
              key={rule.quadrant} 
              className="p-4 bg-card border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon name={config.icon} size={18} className={config.color} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-sm">{config.label}</h4>
                    <span className="text-xs text-muted-foreground">· {config.description}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">X более или равно</Label>
                      <Input
                        type="number"
                        min={0}
                        max={maxScore}
                        step={0.5}
                        value={rule.x_min}
                        onChange={(e) => updateRule(rule.quadrant, 'x_min', parseFloat(e.target.value) || 0)}
                        className="w-16 h-8 text-sm"
                      />
                    </div>

                    <Select
                      value={rule.x_operator}
                      onValueChange={(value) => updateRule(rule.quadrant, 'x_operator', value)}
                    >
                      <SelectTrigger className="w-20 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">И</SelectItem>
                        <SelectItem value="OR">ИЛИ</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">Y более или равно</Label>
                      <Input
                        type="number"
                        min={0}
                        max={maxScore}
                        step={0.5}
                        value={rule.y_min}
                        onChange={(e) => updateRule(rule.quadrant, 'y_min', parseFloat(e.target.value) || 0)}
                        className="w-16 h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {archiveRule && (
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Icon name={QUADRANT_CONFIG.archive.icon} size={18} className={QUADRANT_CONFIG.archive.color} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{QUADRANT_CONFIG.archive.label}</h4>
                  <span className="text-xs text-muted-foreground">· {QUADRANT_CONFIG.archive.description}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Все клиенты, не попавшие в другие квадранты, автоматически попадут в архив
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Icon name="Info" size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Клиенты проверяются по приоритету (Фокус → Мониторить → Выращивать → Архив). Первое совпадение определяет квадрант.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuadrantRulesEditor;