import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import ClientEditHeader from '@/components/client/ClientEditHeader';
import ClientPositionCard from '@/components/client/ClientPositionCard';
import ClientBasicInfoForm from '@/components/client/ClientBasicInfoForm';
import ClientEditSelectors from '@/components/client/edit/ClientEditSelectors';
import ClientScoresDisplay from '@/components/client/edit/ClientScoresDisplay';
import ClientQuestionnaireDialog from '@/components/client/edit/ClientQuestionnaireDialog';
import AppLayout from '@/components/layout/AppLayout';

interface Matrix {
  id: number;
  name: string;
}

interface CriterionStatus {
  id: number;
  label: string;
  weight: number;
  sort_order: number;
}

interface Criterion {
  id: number;
  name: string;
  description: string;
  axis: string;
  weight: number;
  min_value: number;
  max_value: number;
  statuses: CriterionStatus[];
}

interface Score {
  criterion_id: number;
  score: number;
  comment: string;
}

interface Client {
  id: number;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  description: string;
  notes: string;
  score_x: number;
  score_y: number;
  quadrant: string;
  matrix_id: number;
  matrix_name: string;
  deal_status_id: number | null;
  deal_status_name: string | null;
  scores: Score[];
}

interface DealStatus {
  id: number;
  name: string;
  weight: number;
  sort_order: number;
}

const ClientEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [matrices, setMatrices] = useState<Matrix[]>([]);
  const [dealStatuses, setDealStatuses] = useState<DealStatus[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [error, setError] = useState('');
  const [client, setClient] = useState<Client | null>(null);
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);
  const [reassessMode, setReassessMode] = useState(false);

  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    description: '',
    notes: '',
    matrix_id: '',
    deal_status_id: '',
  });

  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchClient();
    fetchMatrices();
    fetchDealStatuses();
  }, [navigate, id]);

  const fetchClient = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/9347d703-acfe-4def-a4ae-a4a52329c037', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'get', client_id: parseInt(id!) }),
      });

      const data = await response.json();
      if (response.ok) {
        setClient(data.client);
        setFormData({
          company_name: data.client.company_name,
          contact_person: data.client.contact_person || '',
          email: data.client.email || '',
          phone: data.client.phone || '',
          description: data.client.description || '',
          notes: data.client.notes || '',
          matrix_id: data.client.matrix_id?.toString() || '',
          deal_status_id: data.client.deal_status_id?.toString() || '',
        });
        setScores(data.client.scores || []);

        if (data.client.matrix_id) {
          fetchMatrixCriteria(data.client.matrix_id.toString());
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки клиента:', error);
      setError('Не удалось загрузить данные клиента');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatrices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/574d8d38-81d5-49c7-b625-a170daa667bc', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        const activeMatrices = data.matrices.filter((m: Matrix & { deleted_at?: string; is_active?: boolean }) => !m.deleted_at && m.is_active);
        setMatrices(activeMatrices);
      }
    } catch (error) {
      console.error('Ошибка загрузки матриц:', error);
    }
  };

  const fetchDealStatuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/7a876a8c-dc4a-439e-aef5-23bde46d9fc2', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setDealStatuses(data.statuses);
      }
    } catch (error) {
      console.error('Ошибка загрузки статусов сделок:', error);
    }
  };

  const fetchMatrixCriteria = async (matrixId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://functions.poehali.dev/574d8d38-81d5-49c7-b625-a170daa667bc?id=${matrixId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setCriteria(data.matrix.criteria);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.company_name) {
      setError('Название компании обязательно');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/9347d703-acfe-4def-a4ae-a4a52329c037', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'update',
          client_id: parseInt(id!),
          ...formData,
          matrix_id: formData.matrix_id ? parseInt(formData.matrix_id) : null,
          deal_status_id: formData.deal_status_id ? parseInt(formData.deal_status_id) : null,
          scores: formData.matrix_id ? scores : [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка обновления клиента');
      }

      navigate('/clients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления клиента');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этого клиента?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/9347d703-acfe-4def-a4ae-a4a52329c037', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'delete',
          client_id: parseInt(id!),
        }),
      });

      if (response.ok) {
        navigate('/clients');
      }
    } catch (error) {
      setError('Ошибка удаления клиента');
    }
  };

  const handleStartQuestionnaire = async () => {
    if (!formData.matrix_id) {
      setError('Выберите матрицу для оценки');
      return;
    }
    
    await fetchMatrixCriteria(formData.matrix_id);
    setReassessMode(false);
    setQuestionnaireOpen(true);
  };

  const handleReassess = async () => {
    if (!formData.matrix_id) {
      setError('У клиента нет матрицы для переоценки');
      return;
    }
    
    await fetchMatrixCriteria(formData.matrix_id);
    setReassessMode(true);
    setQuestionnaireOpen(true);
  };

  const handleQuestionnaireComplete = async (newScores: Score[]) => {
    setScores(newScores);
    setQuestionnaireOpen(false);
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/9347d703-acfe-4def-a4ae-a4a52329c037', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'update',
          client_id: parseInt(id!),
          scores: newScores,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка сохранения оценок');
      }

      await fetchClient();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения оценок');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Icon name="Loader2" size={48} className="animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const handleSaveClick = () => {
    const form = document.querySelector('form');
    if (form) {
      form.requestSubmit();
    }
  };

  return (
    <AppLayout>
      <ClientEditHeader 
        client={client} 
        onDelete={handleDelete}
        onSave={handleSaveClick}
        saving={saving}
      />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <Icon name="AlertTriangle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {client && (
          <div className="mb-6">
            <ClientPositionCard 
              client={client}
              matrixId={formData.matrix_id}
              dealStatusId={formData.deal_status_id}
              matrices={matrices}
              dealStatuses={dealStatuses}
              hasScores={scores.length > 0}
              onMatrixChange={handleMatrixChange}
              onDealStatusChange={(value) => setFormData({ ...formData, deal_status_id: value })}
              onStartQuestionnaire={handleStartQuestionnaire}
              onReassess={handleReassess}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <ClientBasicInfoForm formData={formData} setFormData={setFormData} />

          <div className="flex items-center gap-4">
            <Button
              type="submit"
              className="gradient-primary flex-1"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" size={20} className="mr-2" />
                  Сохранить изменения
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

        <ClientQuestionnaireDialog
          open={questionnaireOpen}
          onOpenChange={setQuestionnaireOpen}
          reassessMode={reassessMode}
          criteria={criteria}
          scores={scores}
          onComplete={handleQuestionnaireComplete}
        />
      </div>
    </AppLayout>
  );
};

export default ClientEdit;