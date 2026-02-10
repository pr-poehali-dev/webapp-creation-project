import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import MatrixEditBasicInfo from '@/components/matrix/MatrixEditBasicInfo';
import MatrixEditCriteriaList from '@/components/matrix/MatrixEditCriteriaList';

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
        
        const criteriaWithUniqueStatuses = (data.matrix.criteria || []).map((criterion: Criterion) => {
          const uniqueStatuses = criterion.statuses.reduce((acc: CriterionStatus[], status: CriterionStatus) => {
            const exists = acc.find(s => s.label === status.label && s.weight === status.weight);
            if (!exists) {
              acc.push(status);
            }
            return acc;
          }, []);
          return { ...criterion, statuses: uniqueStatuses };
        });
        
        setCriteria(criteriaWithUniqueStatuses);
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
        </div>
      </main>
    </div>
  );
};

export default MatrixEdit;
