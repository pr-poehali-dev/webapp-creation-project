import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import MatrixEditBasicInfo from '@/components/matrix/MatrixEditBasicInfo';
import MatrixEditCriteriaList from '@/components/matrix/MatrixEditCriteriaList';
import { QuadrantRulesEditor, QuadrantRule } from '@/components/matrix/QuadrantRulesEditor';

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
  quadrant_rules?: QuadrantRule[];
}

const MatrixEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [matrix, setMatrix] = useState<Matrix | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [quadrantRules, setQuadrantRules] = useState<QuadrantRule[]>([]);
  const [quadrantDialogOpen, setQuadrantDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingQuadrants, setSavingQuadrants] = useState(false);
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
        setQuadrantRules(data.matrix.quadrant_rules || []);
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

  const handleSaveQuadrantRules = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setSavingQuadrants(true);

    try {
      const response = await fetch('https://functions.poehali.dev/574d8d38-81d5-49c7-b625-a170daa667bc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'update_quadrant_rules',
          matrix_id: id,
          quadrant_rules: quadrantRules
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка сохранения правил');
      }

      toast.success('Правила квадрантов обновлены');
      setQuadrantDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка сохранения правил');
    } finally {
      setSavingQuadrants(false);
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

          <MatrixEditBasicInfo
            name={name}
            description={description}
            onNameChange={setName}
            onDescriptionChange={setDescription}
          />

          <MatrixEditCriteriaList
            axis="x"
            title="Ось X: Стратегическое влияние"
            criteria={xCriteria}
            allCriteria={criteria}
            onAddCriterion={() => addCriterion('x')}
            onUpdateCriterion={updateCriterion}
            onUpdateCriterionStatuses={updateCriterionStatuses}
            onRemoveCriterion={removeCriterion}
          />

          <MatrixEditCriteriaList
            axis="y"
            title="Ось Y: Зрелость потребности"
            criteria={yCriteria}
            allCriteria={criteria}
            onAddCriterion={() => addCriterion('y')}
            onUpdateCriterion={updateCriterion}
            onUpdateCriterionStatuses={updateCriterionStatuses}
            onRemoveCriterion={removeCriterion}
          />

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Правила распределения по квадрантам</h2>
                <p className="text-sm text-muted-foreground mt-1">Настройте условия для автоматического распределения клиентов</p>
              </div>
              <Dialog open={quadrantDialogOpen} onOpenChange={setQuadrantDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Icon name="Settings" size={16} className="mr-2" />
                    Редактировать
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Редактирование правил квадрантов</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <QuadrantRulesEditor
                      rules={quadrantRules}
                      onChange={setQuadrantRules}
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setQuadrantDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleSaveQuadrantRules} disabled={savingQuadrants}>
                      {savingQuadrants ? (
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
                </DialogContent>
              </Dialog>
            </div>

            {quadrantRules.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 border border-border rounded-lg overflow-hidden">
                {(['monitor', 'focus', 'archive', 'grow'] as const).map((quadrantKey) => {
                  const rule = quadrantRules.find(r => r.quadrant === quadrantKey);
                  if (!rule) return null;
                  
                  const config = {
                    focus: { label: 'Фокус', icon: 'Target', color: 'text-green-500' },
                    monitor: { label: 'Мониторить', icon: 'Eye', color: 'text-blue-500' },
                    grow: { label: 'Выращивать', icon: 'TrendingUp', color: 'text-yellow-500' },
                    archive: { label: 'Архив', icon: 'Archive', color: 'text-gray-500' }
                  }[quadrantKey];

                  return (
                    <div 
                      key={quadrantKey}
                      className="p-4 bg-card flex flex-col items-center justify-center text-center min-h-[100px]"
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="AlertCircle" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Правила квадрантов не настроены</p>
                <p className="text-sm mt-2">Нажмите "Редактировать" для настройки</p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MatrixEdit;