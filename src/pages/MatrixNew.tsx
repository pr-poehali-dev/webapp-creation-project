import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QuadrantRulesEditor, { QuadrantRule } from '@/components/matrix/QuadrantRulesEditor';

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

const TEMPLATES_URL = 'https://functions.poehali.dev/76b771f4-a3b6-4259-be9c-4fda0848867a';

const DEFAULT_RULES: QuadrantRule[] = [
  { quadrant: 'focus', x_min: 7.0, y_min: 7.0, x_operator: 'AND', priority: 1 },
  { quadrant: 'monitor', x_min: 0.0, y_min: 7.0, x_operator: 'AND', priority: 2 },
  { quadrant: 'grow', x_min: 7.0, y_min: 0.0, x_operator: 'AND', priority: 3 },
  { quadrant: 'archive', x_min: 0.0, y_min: 0.0, x_operator: 'AND', priority: 4 }
];

const MatrixNew = () => {
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<'template' | 'params' | 'rules' | 'preview'>('template');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [matrixName, setMatrixName] = useState('');
  const [matrixDescription, setMatrixDescription] = useState('');
  const [axisXName, setAxisXName] = useState('');
  const [axisYName, setAxisYName] = useState('');
  const [quadrantRules, setQuadrantRules] = useState<QuadrantRule[]>(DEFAULT_RULES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch(TEMPLATES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list' })
      });

      const data = await response.json();
      if (response.ok) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Ошибка загрузки шаблонов:', error);
    }
  };

  const handleTemplateSelect = async (template: Template | null) => {
    if (template) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(TEMPLATES_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            action: 'get_template',
            template_id: template.id
          })
        });
        
        const data = await response.json();
        if (response.ok && data.template) {
          setSelectedTemplate(data.template);
          setAxisXName(data.template.axis_x_name || 'Ось X');
          setAxisYName(data.template.axis_y_name || 'Ось Y');
        }
      } catch (error) {
        console.error('Ошибка загрузки шаблона:', error);
      }
    } else {
      setSelectedTemplate(null);
      setAxisXName('Ось X');
      setAxisYName('Ось Y');
    }
    
    setCurrentStep('params');
  };

  const handleNextToRules = () => {
    if (!matrixName) {
      setError('Введите название матрицы');
      return;
    }
    setError('');
    setCurrentStep('rules');
  };

  const handleNextToPreview = () => {
    setError('');
    setCurrentStep('preview');
  };

  const createMatrix = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(TEMPLATES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: selectedTemplate === null ? 'create_custom' : 'create_from_template',
          template_id: selectedTemplate?.id,
          matrix_name: matrixName,
          matrix_description: matrixDescription,
          axis_x_name: axisXName,
          axis_y_name: axisYName,
          quadrant_rules: quadrantRules
        })
      });

      const data = await response.json();
      if (response.ok) {
        navigate(`/matrix/${data.matrix_id}`);
      } else {
        setError(data.error || 'Ошибка создания матрицы');
      }
    } catch (err) {
      setError('Ошибка создания матрицы');
    } finally {
      setLoading(false);
    }
  };

  const templateIcons: Record<string, string> = {
    'Продажи ИИ-продуктов': 'Brain',
    'Сложное техническое оборудование': 'Cog',
    'Корпоративное ПО': 'Code',
    'Консалтинг': 'Briefcase'
  };

  const canGoToParams = selectedTemplate !== null || selectedTemplate === null;
  const canGoToRules = matrixName.trim() !== '';
  const canGoToPreview = canGoToRules;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/matrices')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Создание новой матрицы</h1>
              <p className="text-sm text-muted-foreground">
                {currentStep === 'template' && 'Шаг 1: Выберите шаблон'}
                {currentStep === 'params' && 'Шаг 2: Настройте параметры'}
                {currentStep === 'rules' && 'Шаг 3: Правила квадрантов'}
                {currentStep === 'preview' && 'Шаг 4: Проверьте и создайте'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6 max-w-6xl">
        <Tabs value={currentStep} className="mb-8">
          <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-4">
            <TabsTrigger 
              value="template" 
              disabled={currentStep !== 'template'}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Icon name="Layout" size={16} className="mr-2" />
              Шаблон
            </TabsTrigger>
            <TabsTrigger 
              value="params" 
              disabled={!canGoToParams || currentStep === 'template'}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Icon name="Settings" size={16} className="mr-2" />
              Параметры
            </TabsTrigger>
            <TabsTrigger 
              value="rules" 
              disabled={!canGoToRules || (currentStep !== 'rules' && currentStep !== 'preview')}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Icon name="Grid" size={16} className="mr-2" />
              Квадранты
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              disabled={!canGoToPreview || currentStep !== 'preview'}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Icon name="Eye" size={16} className="mr-2" />
              Предпросмотр
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3 max-w-4xl mx-auto">
            <Icon name="AlertTriangle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {currentStep === 'template' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-semibold">Готовые шаблоны матриц</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates
                .filter(t => t.is_system)
                .map((template) => (
                  <Card
                    key={template.id}
                    className="p-6 cursor-pointer hover:border-primary/50 transition-all"
                    onClick={() => handleTemplateSelect(template)}
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Или</span>
              </div>
            </div>

            <Card
              className="p-6 cursor-pointer hover:border-primary/50 transition-all border-2 border-dashed"
              onClick={() => handleTemplateSelect(null)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="Plus" size={24} className="text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Создать пустую матрицу</h3>
                  <p className="text-sm text-muted-foreground">
                    Начните с нуля и добавьте свои критерии вручную
                  </p>
                </div>
                <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
              </div>
            </Card>
          </div>
        )}

        {currentStep === 'params' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Параметры матрицы</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Название матрицы <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={matrixName}
                    onChange={(e) => setMatrixName(e.target.value)}
                    placeholder="Например: B2B продажи Q1 2024"
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Описание (опционально)
                  </label>
                  <textarea
                    value={matrixDescription}
                    onChange={(e) => setMatrixDescription(e.target.value)}
                    placeholder="Краткое описание цели использования матрицы"
                    rows={3}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Название оси X
                    </label>
                    <input
                      type="text"
                      value={axisXName}
                      onChange={(e) => setAxisXName(e.target.value)}
                      placeholder="Ось X"
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Название оси Y
                    </label>
                    <input
                      type="text"
                      value={axisYName}
                      onChange={(e) => setAxisYName(e.target.value)}
                      placeholder="Ось Y"
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep('template')}
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Назад
              </Button>
              <Button 
                onClick={handleNextToRules}
                className="gradient-primary"
              >
                Далее
                <Icon name="ArrowRight" size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'rules' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
            <QuadrantRulesEditor 
              rules={quadrantRules}
              onChange={setQuadrantRules}
              maxScore={10}
            />

            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep('params')}
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Назад
              </Button>
              <Button 
                onClick={handleNextToPreview}
                className="gradient-primary"
              >
                Далее
                <Icon name="ArrowRight" size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'preview' && (
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
                onClick={() => setCurrentStep('rules')}
                disabled={loading}
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Назад
              </Button>
              <Button 
                onClick={createMatrix}
                disabled={loading}
                className="gradient-primary"
              >
                {loading ? 'Создание...' : 'Создать матрицу'}
                <Icon name="Check" size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatrixNew;