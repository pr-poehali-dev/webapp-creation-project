import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Template {
  id: number;
  name: string;
  description: string;
  is_system: boolean;
}

const TEMPLATES_URL = 'https://functions.poehali.dev/76b771f4-a3b6-4259-be9c-4fda0848867a';

const MatrixNew = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'select' | 'name'>('select');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [matrixName, setMatrixName] = useState('');
  const [matrixDescription, setMatrixDescription] = useState('');
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

  const handleTemplateSelect = (templateId: number | null) => {
    setSelectedTemplate(templateId);
    setStep('name');
  };

  const createMatrix = async () => {
    if (!matrixName) {
      setError('Введите название матрицы');
      return;
    }

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
          template_id: selectedTemplate,
          matrix_name: matrixName,
          matrix_description: matrixDescription
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

  const templateIcons = {
    'Продажи ИИ-продуктов': 'Brain',
    'Сложное техническое оборудование': 'Cog',
    'Корпоративное ПО': 'Code',
    'Консалтинг': 'Briefcase'
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/matrices')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Создание новой матрицы</h1>
              <p className="text-sm text-muted-foreground">
                {step === 'select' ? 'Выберите шаблон или создайте пустую матрицу' : 'Укажите название матрицы'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <Icon name="AlertTriangle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {step === 'select' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Готовые шаблоны матриц</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates
                .filter(t => t.is_system)
                .map((template) => (
                  <Card
                    key={template.id}
                    className="p-6 cursor-pointer hover:border-primary/50 transition-all"
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon 
                          name={templateIcons[template.name as keyof typeof templateIcons] || 'Layers'} 
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

        {step === 'name' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Параметры матрицы</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Название матрицы
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

                {selectedTemplate !== null && (
                  <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Icon name="Info" size={20} className="text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-accent">
                          Матрица будет создана на основе шаблона{' '}
                          <strong>{templates.find(t => t.id === selectedTemplate)?.name}</strong>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Вы сможете изменить критерии и веса после создания
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex items-center justify-between gap-4">
              <Button variant="outline" onClick={() => setStep('select')}>
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Назад
              </Button>
              
              <Button
                className="gradient-primary"
                size="lg"
                onClick={createMatrix}
                disabled={loading || !matrixName}
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Создание...
                  </>
                ) : (
                  <>
                    <Icon name="Check" size={20} className="mr-2" />
                    Создать матрицу
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatrixNew;