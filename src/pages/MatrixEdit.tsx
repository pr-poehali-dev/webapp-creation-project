import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface CriterionStatus {
  label: string;
  weight: number;
  sort_order: number;
}

interface Criterion {
  id?: number;
  axis: 'x' | 'y';
  name: string;
  description: string;
  weight: number;
  min_value: number;
  max_value: number;
  sort_order: number;
  statuses: CriterionStatus[];
}

interface Matrix {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  created_by_name: string;
  criteria: Criterion[];
}

const MatrixEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [matrix, setMatrix] = useState<Matrix | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchMatrix(token);
  }, [id, navigate]);

  const fetchMatrix = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch(`https://functions.poehali.dev/574d8d38-81d5-49c7-b625-a170daa667bc?id=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMatrix(data.matrix);
        setName(data.matrix.name);
        setDescription(data.matrix.description || '');
        setCriteria(data.matrix.criteria || []);
      } else {
        setError('Матрица не найдена');
      }
    } catch (err) {
      setError('Ошибка загрузки матрицы');
    } finally {
      setLoading(false);
    }
  };

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
        sort_order: criteria.filter(c => c.axis === axis).length,
        statuses: []
      }
    ]);
  };

  const updateCriterion = (index: number, field: keyof Criterion, value: string | number) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };
    setCriteria(updated);
  };

  const updateCriterionStatuses = (index: number, statuses: CriterionStatus[]) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], statuses };
    setCriteria(updated);
  };

  const removeCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
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

    setSaving(true);

    try {
      const response = await fetch('https://functions.poehali.dev/574d8d38-81d5-49c7-b625-a170daa667bc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'update',
          matrix_id: id,
          name,
          description,
          criteria: validCriteria
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка сохранения');
      }

      navigate('/matrices');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Матрица будет автоматически удалена через 3 дня. Вы сможете удалить её раньше в разделе "Удалённые". Продолжить?')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('https://functions.poehali.dev/574d8d38-81d5-49c7-b625-a170daa667bc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'delete',
          matrix_id: id
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.info('Матрица будет удалена через 3 дня', {
          description: 'Вы можете удалить её навсегда в разделе "Матрицы"'
        });
        navigate('/matrices');
      } else {
        toast.error(data.error || 'Ошибка удаления');
      }
    } catch (err) {
      toast.error('Ошибка удаления матрицы');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader2" size={48} className="text-primary animate-spin" />
      </div>
    );
  }

  if (error && !matrix) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <Icon name="AlertTriangle" size={48} className="text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Ошибка</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/matrices')}>Вернуться к списку</Button>
        </Card>
      </div>
    );
  }

  const xCriteria = criteria.filter(c => c.axis === 'x');
  const yCriteria = criteria.filter(c => c.axis === 'y');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/matrices')}>
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Назад
              </Button>
              <h1 className="text-xl font-bold">Редактирование матрицы</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive"
              >
                <Icon name="Trash2" size={16} className="mr-2" />
                Деактивировать
              </Button>
              <Button
                className="gradient-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Сохраняем...
                  </>
                ) : (
                  <>
                    <Icon name="Save" size={16} className="mr-2" />
                    Сохранить
                  </>
                )}
              </Button>
            </div>
          </div>
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Описание</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Ось X: Стратегическое влияние</h2>
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
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="text"
                          value={criterion.name}
                          onChange={(e) => updateCriterion(globalIndex, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                          placeholder="Название критерия"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCriterion(globalIndex)}
                        >
                          <Icon name="Trash2" size={16} className="text-destructive" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Статусы критерия</label>
                        {criterion.statuses.map((status, statusIdx) => (
                          <div key={statusIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={status.label}
                              onChange={(e) => {
                                const updated = [...criterion.statuses];
                                updated[statusIdx] = { ...status, label: e.target.value };
                                updateCriterionStatuses(globalIndex, updated);
                              }}
                              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                              placeholder="Название статуса"
                            />
                            <select
                              value={status.weight}
                              onChange={(e) => {
                                const updated = [...criterion.statuses];
                                updated[statusIdx] = { ...status, weight: parseInt(e.target.value) };
                                updateCriterionStatuses(globalIndex, updated);
                              }}
                              className="w-20 px-2 py-2 bg-background border border-border rounded-lg text-sm"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(w => (
                                <option key={w} value={w}>{w}</option>
                              ))}
                            </select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = criterion.statuses.filter((_, i) => i !== statusIdx);
                                updateCriterionStatuses(globalIndex, updated);
                              }}
                            >
                              <Icon name="X" size={14} className="text-destructive" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updated = [...criterion.statuses, { label: '', weight: 1, sort_order: criterion.statuses.length }];
                            updateCriterionStatuses(globalIndex, updated);
                          }}
                          className="w-full text-xs"
                        >
                          <Icon name="Plus" size={14} className="mr-2" />
                          Добавить статус
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Ось Y: Зрелость потребности</h2>
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
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="text"
                          value={criterion.name}
                          onChange={(e) => updateCriterion(globalIndex, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                          placeholder="Название критерия"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCriterion(globalIndex)}
                        >
                          <Icon name="Trash2" size={16} className="text-destructive" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Статусы критерия</label>
                        {criterion.statuses.map((status, statusIdx) => (
                          <div key={statusIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={status.label}
                              onChange={(e) => {
                                const updated = [...criterion.statuses];
                                updated[statusIdx] = { ...status, label: e.target.value };
                                updateCriterionStatuses(globalIndex, updated);
                              }}
                              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                              placeholder="Название статуса"
                            />
                            <select
                              value={status.weight}
                              onChange={(e) => {
                                const updated = [...criterion.statuses];
                                updated[statusIdx] = { ...status, weight: parseInt(e.target.value) };
                                updateCriterionStatuses(globalIndex, updated);
                              }}
                              className="w-20 px-2 py-2 bg-background border border-border rounded-lg text-sm"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(w => (
                                <option key={w} value={w}>{w}</option>
                              ))}
                            </select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = criterion.statuses.filter((_, i) => i !== statusIdx);
                                updateCriterionStatuses(globalIndex, updated);
                              }}
                            >
                              <Icon name="X" size={14} className="text-destructive" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updated = [...criterion.statuses, { label: '', weight: 1, sort_order: criterion.statuses.length }];
                            updateCriterionStatuses(globalIndex, updated);
                          }}
                          className="w-full text-xs"
                        >
                          <Icon name="Plus" size={14} className="mr-2" />
                          Добавить статус
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MatrixEdit;