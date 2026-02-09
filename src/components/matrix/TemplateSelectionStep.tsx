import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Template {
  id: number;
  name: string;
  description: string;
  is_system: boolean;
  axis_x_name?: string;
  axis_y_name?: string;
}

interface TemplateSelectionStepProps {
  templates: Template[];
  onSelectTemplate: (template: Template | null) => void;
}

const templateIcons: Record<string, string> = {
  'Продажи ИИ-продуктов': 'Brain',
  'Сложное техническое оборудование': 'Cog',
  'Корпоративное ПО': 'Code',
  'Консалтинг': 'Briefcase'
};

export const TemplateSelectionStep = ({ templates, onSelectTemplate }: TemplateSelectionStepProps) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h2 className="text-xl font-semibold">Готовые шаблоны матриц</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates
          .filter(t => t.is_system)
          .map((template) => (
            <Card
              key={template.id}
              className="p-6 cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => onSelectTemplate(template)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon 
                    name={templateIcons[template.name] || 'Layers'} 
                    size={24} 
                    className="text-primary" 
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
                <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
              </div>
            </Card>
          ))}
      </div>

      <div className="pt-6 border-t border-border">
        <h3 className="text-lg font-semibold mb-4">Или создайте свою матрицу</h3>
        <Card
          className="p-6 cursor-pointer hover:border-primary/50 transition-all"
          onClick={() => onSelectTemplate(null)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name="Plus" size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Пустая матрица</h3>
              <p className="text-sm text-muted-foreground">Создайте матрицу с нуля без готовых критериев</p>
            </div>
            <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TemplateSelectionStep;
