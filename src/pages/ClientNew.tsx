import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import ClientWizardStep1 from '@/components/client/wizard/ClientWizardStep1';
import ClientWizardStep2 from '@/components/client/wizard/ClientWizardStep2';
import ClientWizardStep3 from '@/components/client/wizard/ClientWizardStep3';
import ClientWizardStep4 from '@/components/client/wizard/ClientWizardStep4';
import QuestionnaireFlow from '@/components/client/wizard/QuestionnaireFlow';

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

type WizardStep = 1 | 2 | 3 | 4 | 'questionnaire';

const ClientNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [matrices, setMatrices] = useState<Matrix[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [error, setError] = useState('');

  const [wizardData, setWizardData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
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

    const savedData = localStorage.getItem('clientWizardData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setWizardData(parsed);
      } catch (e) {
        console.error('Failed to parse saved wizard data');
      }
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('clientWizardData', JSON.stringify(wizardData));
  }, [wizardData]);

  const fetchMatrices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/574d8d38-81d5-49c7-b625-a170daa667bc', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setMatrices(data.matrices);
        if (data.matrices.length === 1) {
          setWizardData(prev => ({ ...prev, matrix_id: data.matrices[0].id.toString() }));
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки матриц:', error);
    }
  };

  const fetchMatrixCriteria = async (matrixId: string): Promise<boolean> => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://functions.poehali.dev/574d8d38-81d5-49c7-b625-a170daa667bc?id=${matrixId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.matrix && data.matrix.criteria && data.matrix.criteria.length > 0) {
        setCriteria(data.matrix.criteria);
        return true;
      } else {
        throw new Error(data.error || 'Не удалось загрузить критерии матрицы');
      }
    } catch (error) {
      console.error('Ошибка загрузки критериев:', error);
      setError(error instanceof Error ? error.message : 'Ошибка загрузки критериев');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleStep1Next = () => {
    setCurrentStep(2);
  };

  const handleStep2Next = () => {
    if (matrices.length >= 2) {
      setCurrentStep(3);
    } else {
      if (matrices.length === 1 && !wizardData.matrix_id) {
        setWizardData(prev => ({ ...prev, matrix_id: matrices[0].id.toString() }));
      }
      setCurrentStep(4);
    }
  };

  const handleStep2Skip = () => {
    setWizardData(prev => ({ ...prev, contact_person: '', email: '', phone: '' }));
    if (matrices.length >= 2) {
      setCurrentStep(3);
    } else {
      setCurrentStep(4);
    }
  };

  const handleStep3Next = () => {
    setCurrentStep(4);
  };

  const handleStartQuestionnaire = async () => {
    const matrixId = wizardData.matrix_id || matrices[0]?.id.toString();
    if (matrixId) {
      const success = await fetchMatrixCriteria(matrixId);
      if (success) {
        setCurrentStep('questionnaire');
      }
    }
  };

  const handleSkipQuestionnaire = async () => {
    await createClient([]);
  };

  const handleQuestionnaireComplete = async (completedScores: Score[]) => {
    await createClient(completedScores);
  };

  const createClient = async (clientScores: Score[]) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const matrixId = wizardData.matrix_id || matrices[0]?.id.toString();
      
      const payload: {
        action: string;
        company_name: string;
        contact_person: string | null;
        email: string | null;
        phone: string | null;
        matrix_id: number | null;
        scores?: Score[];
      } = {
        action: 'create',
        company_name: wizardData.company_name,
        contact_person: wizardData.contact_person || null,
        email: wizardData.email || null,
        phone: wizardData.phone || null,
        matrix_id: matrixId ? parseInt(matrixId) : null,
      };

      if (clientScores.length > 0) {
        payload.scores = clientScores;
      }

      const response = await fetch('https://functions.poehali.dev/9347d703-acfe-4def-a4ae-a4a52329c037', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания клиента');
      }

      localStorage.removeItem('clientWizardData');
      navigate('/clients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания клиента');
    } finally {
      setLoading(false);
    }
  };

  const getTotalSteps = () => {
    return matrices.length >= 2 ? 4 : 3;
  };

  const getCurrentStepNumber = () => {
    if (currentStep === 'questionnaire') return getTotalSteps();
    if (currentStep === 4 && matrices.length === 1) return 3;
    return currentStep;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/clients')}>
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Новый клиент</h1>
                <p className="text-sm text-muted-foreground">
                  {currentStep === 'questionnaire' 
                    ? 'Опросник по критериям'
                    : `Шаг ${getCurrentStepNumber()} из ${getTotalSteps()}`}
                </p>
              </div>
            </div>
            {currentStep !== 'questionnaire' && (
              <div className="flex gap-2">
                {Array.from({ length: getTotalSteps() }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      i + 1 <= getCurrentStepNumber()
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <Icon name="AlertTriangle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {currentStep === 1 && (
          <ClientWizardStep1
            companyName={wizardData.company_name}
            onChange={(value) => setWizardData({ ...wizardData, company_name: value })}
            onNext={handleStep1Next}
          />
        )}

        {currentStep === 2 && (
          <ClientWizardStep2
            contactPerson={wizardData.contact_person}
            email={wizardData.email}
            phone={wizardData.phone}
            onChange={(field, value) => {
              if (field === 'contactPerson') setWizardData({ ...wizardData, contact_person: value });
              if (field === 'email') setWizardData({ ...wizardData, email: value });
              if (field === 'phone') setWizardData({ ...wizardData, phone: value });
            }}
            onNext={handleStep2Next}
            onSkip={handleStep2Skip}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && matrices.length >= 2 && (
          <ClientWizardStep3
            matrices={matrices}
            selectedMatrixId={wizardData.matrix_id}
            onChange={(value) => setWizardData({ ...wizardData, matrix_id: value })}
            onNext={handleStep3Next}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <ClientWizardStep4
            loading={loading}
            onStartQuestionnaire={handleStartQuestionnaire}
            onSkipQuestionnaire={handleSkipQuestionnaire}
            onBack={() => setCurrentStep(matrices.length >= 2 ? 3 : 2)}
          />
        )}

        {currentStep === 'questionnaire' && (
          <QuestionnaireFlow
            criteria={criteria}
            initialScores={scores}
            onComplete={handleQuestionnaireComplete}
            onBack={() => setCurrentStep(4)}
          />
        )}
      </div>
    </div>
  );
};

export default ClientNew;