import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Criterion {
  id?: number;
  axis: 'x' | 'y';
  name: string;
  description: string;
  weight: number;
  min_value: number;
  max_value: number;
  sort_order: number;
}

const MatrixNew = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState<Criterion[]>([
    { axis: 'x', name: 'Стратегическое влияние', description: 'Потенциал клиента для бизнеса', weight: 1, min_value: 0, max_value: 10, sort_order: 0 },
    { axis: 'y', name: 'Зрелость потребности', description: 'Готовность к покупке', weight: 1, min_value: 0, max_value: 10, sort_order: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addCriterion = (axis: 'x' | 'y') => {
    setCriteria([
      ...criteria,
      {
        axis,
        name: '',
        description: '',
        weight: 1,
        min_value: 0,
        max_value: 10,
        sort_order: criteria.filter(c => c.axis === axis).length
      }
    ]);
  };

  const updateCriterion = (index: number, field: keyof Criterion, value: string | number) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };
    setCriteria(updated);
  };

  const removeCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError('');

    if (!name.trim()) {
      setError('Введите название матрицы');
      return;
    }

    const validCriteria = criteria.filter(c => c.name.trim());
    if (validCriteria.length === 0) {
      setError('Добавьте хотя бы один критерий');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/574d8d38-81d5-49c7-b625-a170daa667bc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'create',
          name,
          description,
          criteria: validCriteria
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания матрицы');
      }

      navigate('/matrices');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания матрицы');
    } finally {
      setLoading(false);
    }
  };

  const xCriteria = criteria.filter(c => c.axis === 'x');
  const yCriteria = criteria.filter(c => c.axis === 'y');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/matrices')}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
            <h1 className="text-xl font-bold">Новая матрица приоритизации</h1>
          </div>
          <Button
            className="gradient-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Создаём...
              </>
            ) : (
              <>
                <Icon name="Save" size={16} className="mr-2" />
                Создать матрицу
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
              <Icon name="AlertTriangle" size={20} className="text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Основная информация</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Название матрицы *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Матрица для B2B клиентов"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Описание</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                  placeholder="Описание матрицы, для каких целей используется..."
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Ось X: Стратегическое влияние</h2>
                <p className="text-sm text-muted-foreground">Критерии для оценки потенциала клиента</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => addCriterion('x')}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить
              </Button>
            </div>

            <div className="space-y-4">
              {xCriteria.map((criterion, index) => {
                const globalIndex = criteria.findIndex(c => c === criterion);
                return (
                  <div key={globalIndex} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={criterion.name}
                          onChange={(e) => updateCriterion(globalIndex, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                          placeholder="Название критерия"
                        />
                        <input
                          type="text"
                          value={criterion.description}
                          onChange={(e) => updateCriterion(globalIndex, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                          placeholder="Описание"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriterion(globalIndex)}
                      >
                        <Icon name="Trash2" size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Ось Y: Зрелость потребности</h2>
                <p className="text-sm text-muted-foreground">Критерии для оценки готовности к покупке</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => addCriterion('y')}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить
              </Button>
            </div>

            <div className="space-y-4">
              {yCriteria.map((criterion, index) => {
                const globalIndex = criteria.findIndex(c => c === criterion);
                return (
                  <div key={globalIndex} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={criterion.name}
                          onChange={(e) => updateCriterion(globalIndex, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                          placeholder="Название критерия"
                        />
                        <input
                          type="text"
                          value={criterion.description}
                          onChange={(e) => updateCriterion(globalIndex, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                          placeholder="Описание"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriterion(globalIndex)}
                      >
                        <Icon name="Trash2" size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Lightbulb" size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Совет по критериям</h3>
                <p className="text-sm text-muted-foreground">
                  Для эффективной матрицы рекомендуется 2-4 критерия на каждую ось. 
                  Критерии должны быть объективными и измеримыми.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MatrixNew;