import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuadrantRule } from '@/components/matrix/QuadrantRulesEditor';
import TemplateSelectionStep from '@/components/matrix/TemplateSelectionStep';
import MatrixParamsStep from '@/components/matrix/MatrixParamsStep';
import QuadrantRulesStep from '@/components/matrix/QuadrantRulesStep';
import MatrixPreviewStep from '@/components/matrix/MatrixPreviewStep';

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
          <TemplateSelectionStep 
            templates={templates}
            onSelectTemplate={handleTemplateSelect}
          />
        )}

        {currentStep === 'params' && (
          <MatrixParamsStep
            matrixName={matrixName}
            matrixDescription={matrixDescription}
            axisXName={axisXName}
            axisYName={axisYName}
            onMatrixNameChange={setMatrixName}
            onMatrixDescriptionChange={setMatrixDescription}
            onAxisXNameChange={setAxisXName}
            onAxisYNameChange={setAxisYName}
            onBack={() => setCurrentStep('template')}
            onNext={handleNextToRules}
          />
        )}

        {currentStep === 'rules' && (
          <QuadrantRulesStep
            quadrantRules={quadrantRules}
            onQuadrantRulesChange={setQuadrantRules}
            onBack={() => setCurrentStep('params')}
            onNext={handleNextToPreview}
          />
        )}

        {currentStep === 'preview' && (
          <MatrixPreviewStep
            matrixName={matrixName}
            matrixDescription={matrixDescription}
            axisXName={axisXName}
            axisYName={axisYName}
            selectedTemplate={selectedTemplate}
            quadrantRules={quadrantRules}
            loading={loading}
            onBack={() => setCurrentStep('rules')}
            onCreate={createMatrix}
          />
        )}
      </div>
    </div>
  );
};

export default MatrixNew;
