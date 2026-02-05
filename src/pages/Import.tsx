import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import ImportProgressBar from '@/components/import/ImportProgressBar';
import ImportStepOne from '@/components/import/ImportStepOne';
import ImportStepTwo from '@/components/import/ImportStepTwo';
import ImportStepThree from '@/components/import/ImportStepThree';

interface Matrix {
  id: number;
  name: string;
}

interface Template {
  id: number;
  name: string;
  mapping: Record<string, string>;
}

const IMPORT_FUNCTION_URL = 'https://functions.poehali.dev/33290691-9470-4059-a482-08ce98ddf826';
const MATRICES_FUNCTION_URL = 'https://functions.poehali.dev/574d8d38-81d5-49c7-b625-a170daa667bc';

const Import = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'csv' | 'json'>('csv');
  const [fileContent, setFileContent] = useState('');
  
  const [columns, setColumns] = useState<string[]>([]);
  const [preview, setPreview] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  
  const [matrices, setMatrices] = useState<Matrix[]>([]);
  const [selectedMatrix, setSelectedMatrix] = useState<string>('');
  const [previewClients, setPreviewClients] = useState<any[]>([]);
  const [newCriteria, setNewCriteria] = useState<string[]>([]);
  const [validCount, setValidCount] = useState(0);
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchMatrices();
    loadTemplates();
  }, [navigate]);

  const fetchMatrices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(MATRICES_FUNCTION_URL, {
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

  const loadTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(IMPORT_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'load_templates' }),
      });

      const data = await response.json();
      if (response.ok) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Ошибка загрузки шаблонов:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (extension === 'json') {
        setFileType('json');
      } else {
        setFileType('csv');
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = btoa(event.target?.result as string);
        setFileContent(base64);
      };
      reader.readAsText(selectedFile);
    }
  };

  const parseFile = async () => {
    if (!fileContent) {
      setError('Выберите файл для загрузки');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(IMPORT_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'parse',
          file_content: fileContent,
          file_type: fileType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка парсинга файла');
      }

      setColumns(data.columns);
      setPreview(data.preview);
      setTotalRows(data.total_rows);
      setMapping(data.auto_mapping);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка парсинга');
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = async () => {
    if (!selectedMatrix) {
      setError('Выберите матрицу для импорта');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(IMPORT_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'preview',
          file_content: fileContent,
          file_type: fileType,
          mapping: mapping,
          matrix_id: parseInt(selectedMatrix),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка генерации превью');
      }

      setPreviewClients(data.preview);
      setNewCriteria(data.new_criteria);
      setValidCount(data.valid_count);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка превью');
    } finally {
      setLoading(false);
    }
  };

  const executeImport = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(IMPORT_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'import',
          file_content: fileContent,
          file_type: fileType,
          mapping: mapping,
          matrix_id: parseInt(selectedMatrix),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка импорта');
      }

      setSuccess(`Успешно импортировано ${data.imported} из ${data.total} клиентов (пропущено: ${data.skipped})`);
      
      setTimeout(() => {
        navigate('/clients');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка импорта');
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    if (!templateName) {
      setError('Введите название шаблона');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(IMPORT_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'save_template',
          template_name: templateName,
          mapping: mapping,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка сохранения шаблона');
      }

      setSuccess('Шаблон успешно сохранен');
      setShowSaveTemplate(false);
      setTemplateName('');
      loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (template: Template) => {
    setMapping(template.mapping);
    setSuccess(`Применен шаблон "${template.name}"`);
  };

  const resetImport = () => {
    setStep(1);
    setFile(null);
    setFileContent('');
    setColumns([]);
    setPreview([]);
    setMapping({});
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Импорт данных</h1>
              <p className="text-sm text-muted-foreground">
                Загрузка клиентов из CSV/JSON с гибким маппингом полей
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <ImportProgressBar step={step} />

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <Icon name="AlertTriangle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-lg flex items-start gap-3">
            <Icon name="CheckCircle" size={20} className="text-accent flex-shrink-0 mt-0.5" />
            <p className="text-sm text-accent">{success}</p>
          </div>
        )}

        {step === 1 && (
          <ImportStepOne
            file={file}
            loading={loading}
            parseFile={parseFile}
            handleFileChange={handleFileChange}
          />
        )}

        {step === 2 && (
          <ImportStepTwo
            columns={columns}
            preview={preview}
            totalRows={totalRows}
            mapping={mapping}
            setMapping={setMapping}
            templates={templates}
            applyTemplate={applyTemplate}
            resetImport={resetImport}
            generatePreview={generatePreview}
            loading={loading}
            saveTemplate={saveTemplate}
            showSaveTemplate={showSaveTemplate}
            setShowSaveTemplate={setShowSaveTemplate}
            templateName={templateName}
            setTemplateName={setTemplateName}
          />
        )}

        {step === 3 && (
          <ImportStepThree
            matrices={matrices}
            selectedMatrix={selectedMatrix}
            setSelectedMatrix={setSelectedMatrix}
            newCriteria={newCriteria}
            previewClients={previewClients}
            validCount={validCount}
            setStep={setStep}
            executeImport={executeImport}
            loading={loading}
            resetImport={resetImport}
          />
        )}
      </div>
    </div>
  );
};

export default Import;
