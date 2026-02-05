import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Matrix {
  id: number;
  name: string;
}

interface Criterion {
  id: number;
  name: string;
  description: string;
  axis: string;
  weight: number;
  min_value: number;
  max_value: number;
}

interface Score {
  criterion_id: number;
  score: number;
  comment: string;
}

const ClientNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [matrices, setMatrices] = useState<Matrix[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    description: '',
    notes: '',
    matrix_id: '',
  });

  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchMatrices();
  }, [navigate]);

  const fetchMatrices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('MATRICES_FUNCTION_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'list' }),
      });

      const data = await response.json();
      if (response.ok) {
        setMatrices(data.matrices);
      }
    } catch (error) {
      console.error('Ошибка загрузки матриц:', error);
    }
  };

  const fetchMatrixCriteria = async (matrixId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('MATRICES_FUNCTION_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'get', matrix_id: parseInt(matrixId) }),
      });

      const data = await response.json();
      if (response.ok) {
        setCriteria(data.matrix.criteria);
        const initialScores = data.matrix.criteria.map((c: Criterion) => ({
          criterion_id: c.id,
          score: 0,
          comment: '',
        }));
        setScores(initialScores);
      }
    } catch (error) {
      console.error('Ошибка загрузки критериев:', error);
    }
  };

  const handleMatrixChange = (matrixId: string) => {
    setFormData({ ...formData, matrix_id: matrixId });
    if (matrixId) {
      fetchMatrixCriteria(matrixId);
    } else {
      setCriteria([]);
      setScores([]);
    }
  };

  const handleScoreChange = (criterionId: number, value: number) => {
    setScores(scores.map(s => 
      s.criterion_id === criterionId ? { ...s, score: value } : s
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.company_name) {
      setError('Название компании обязательно');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('CLIENTS_FUNCTION_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'create',
          ...formData,
          matrix_id: formData.matrix_id ? parseInt(formData.matrix_id) : null,
          scores: formData.matrix_id ? scores : [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания клиента');
      }

      navigate('/clients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания клиента');
    } finally {
      setLoading(false);
    }
  };

  const xCriteria = criteria.filter(c => c.axis === 'x');
  const yCriteria = criteria.filter(c => c.axis === 'y');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/clients')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Новый клиент</h1>
              <p className="text-sm text-muted-foreground">Добавьте информацию о клиенте</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <Icon name="AlertTriangle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium mb-2">
                  Название компании <span className="text-destructive">*</span>
                </label>
                <input
                  id="company_name"
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="ООО «Технологии будущего»"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact_person" className="block text-sm font-medium mb-2">
                    Контактное лицо
                  </label>
                  <input
                    id="contact_person"
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Иван Петров"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="ivan@company.ru"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Телефон
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Описание
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Крупный производитель оборудования..."
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-2">
                  Заметки
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Внутренние заметки о клиенте..."
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Матрица приоритизации</h2>
            
            <div className="mb-6">
              <label htmlFor="matrix_id" className="block text-sm font-medium mb-2">
                Выберите матрицу для оценки
              </label>
              <select
                id="matrix_id"
                value={formData.matrix_id}
                onChange={(e) => handleMatrixChange(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Без матрицы</option>
                {matrices.map((matrix) => (
                  <option key={matrix.id} value={matrix.id}>
                    {matrix.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-2">
                Выберите матрицу для автоматического определения квадранта
              </p>
            </div>

            {criteria.length > 0 && (
              <div className="space-y-6">
                {xCriteria.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Icon name="TrendingUp" size={20} className="text-primary" />
                      Ось X: Стратегическое влияние
                    </h3>
                    <div className="space-y-4">
                      {xCriteria.map((criterion) => {
                        const score = scores.find(s => s.criterion_id === criterion.id);
                        return (
                          <div key={criterion.id} className="p-4 bg-card/50 rounded-lg border border-border">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <p className="font-medium">{criterion.name}</p>
                                <p className="text-sm text-muted-foreground">{criterion.description}</p>
                              </div>
                              <span className="text-2xl font-bold text-primary ml-4">
                                {score?.score || 0}
                              </span>
                            </div>
                            <input
                              type="range"
                              min={criterion.min_value}
                              max={criterion.max_value}
                              value={score?.score || 0}
                              onChange={(e) => handleScoreChange(criterion.id, parseFloat(e.target.value))}
                              className="w-full accent-primary"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>{criterion.min_value}</span>
                              <span>{criterion.max_value}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {yCriteria.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Icon name="Target" size={20} className="text-secondary" />
                      Ось Y: Зрелость потребности
                    </h3>
                    <div className="space-y-4">
                      {yCriteria.map((criterion) => {
                        const score = scores.find(s => s.criterion_id === criterion.id);
                        return (
                          <div key={criterion.id} className="p-4 bg-card/50 rounded-lg border border-border">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <p className="font-medium">{criterion.name}</p>
                                <p className="text-sm text-muted-foreground">{criterion.description}</p>
                              </div>
                              <span className="text-2xl font-bold text-secondary ml-4">
                                {score?.score || 0}
                              </span>
                            </div>
                            <input
                              type="range"
                              min={criterion.min_value}
                              max={criterion.max_value}
                              value={score?.score || 0}
                              onChange={(e) => handleScoreChange(criterion.id, parseFloat(e.target.value))}
                              className="w-full accent-secondary"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>{criterion.min_value}</span>
                              <span>{criterion.max_value}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          <div className="flex items-center gap-4">
            <Button
              type="submit"
              className="gradient-primary flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <Icon name="Plus" size={20} className="mr-2" />
                  Создать клиента
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/clients')}
            >
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientNew;
