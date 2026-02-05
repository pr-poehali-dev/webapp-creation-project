import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

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
  
  // State management
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Step 1: File upload
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'csv' | 'json'>('csv');
  const [fileContent, setFileContent] = useState('');
  
  // Step 2: Column mapping
  const [columns, setColumns] = useState<string[]>([]);
  const [preview, setPreview] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  
  // Step 3: Preview & import
  const [matrices, setMatrices] = useState<Matrix[]>([]);
  const [selectedMatrix, setSelectedMatrix] = useState<string>('');
  const [previewClients, setPreviewClients] = useState<any[]>([]);
  const [newCriteria, setNewCriteria] = useState<string[]>([]);
  const [validCount, setValidCount] = useState(0);
  
  // Templates
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
        body: JSON.dumps({
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

  const crmFields = [
    { value: 'skip', label: '⊘ Пропустить колонку' },
    { value: 'company_name', label: 'Название компании' },
    { value: 'contact_person', label: 'Контактное лицо' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Телефон' },
    { value: 'description', label: 'Описание' },
  ];

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
        {/* Progress indicator */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-muted'}`}>
              1
            </div>
            <span className="text-sm font-medium">Загрузка файла</span>
          </div>
          <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-muted'}`}>
              2
            </div>
            <span className="text-sm font-medium">Маппинг колонок</span>
          </div>
          <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-muted'}`}>
              3
            </div>
            <span className="text-sm font-medium">Превью и импорт</span>
          </div>
        </div>

        {/* Error/Success messages */}
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

        {/* Step 1: File upload */}
        {step === 1 && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Этап 1: Загрузка файла</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">
                Выберите файл для импорта (CSV или JSON)
              </label>
              
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon name="Upload" size={32} className="text-primary" />
                  </div>
                  <p className="text-lg font-medium mb-2">
                    {file ? file.name : 'Выберите файл или перетащите сюда'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Поддерживаются форматы: CSV, JSON
                  </p>
                </label>
              </div>
            </div>

            <Button
              className="w-full gradient-primary"
              size="lg"
              onClick={parseFile}
              disabled={!file || loading}
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <Icon name="ArrowRight" size={20} className="mr-2" />
                  Далее: Настроить маппинг
                </>
              )}
            </Button>

            <Card className="mt-6 p-4 border-primary/20 bg-primary/5">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-2">Требования к файлу</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• CSV: первая строка должна содержать заголовки колонок</li>
                    <li>• JSON: должен быть массив объектов с одинаковой структурой</li>
                    <li>• Обязательное поле: название компании</li>
                    <li>• Рекомендуемая кодировка: UTF-8</li>
                  </ul>
                </div>
              </div>
            </Card>
          </Card>
        )}

        {/* Step 2: Column mapping */}
        {step === 2 && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Этап 2: Маппинг колонок</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Найдено {columns.length} колонок, {totalRows} строк
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={resetImport}>
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Загрузить другой файл
                </Button>
              </div>

              {/* Templates */}
              {templates.length > 0 && (
                <div className="mb-6 p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Icon name="Bookmark" size={16} className="text-secondary" />
                    Сохраненные шаблоны маппинга
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {templates.map((template) => (
                      <Button
                        key={template.id}
                        variant="outline"
                        size="sm"
                        onClick={() => applyTemplate(template)}
                      >
                        <Icon name="FileCheck" size={14} className="mr-2" />
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview table */}
              <div className="mb-6 overflow-x-auto">
                <h3 className="text-sm font-semibold mb-3">Превью первых 5 строк:</h3>
                <table className="w-full text-sm border border-border rounded-lg">
                  <thead className="bg-muted">
                    <tr>
                      {columns.map((col) => (
                        <th key={col} className="px-4 py-2 text-left font-medium border-b border-border">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-muted/50">
                        {columns.map((col) => (
                          <td key={col} className="px-4 py-2">
                            {row[col] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Column mapping */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold mb-3">Сопоставление колонок с полями CRM:</h3>
                {columns.map((col) => (
                  <div key={col} className="flex items-center gap-4 p-3 bg-card border border-border rounded-lg">
                    <div className="flex-1">
                      <Badge variant="outline" className="font-mono text-xs">
                        {col}
                      </Badge>
                    </div>
                    <Icon name="ArrowRight" size={20} className="text-muted-foreground" />
                    <div className="flex-1">
                      <select
                        value={mapping[col] || 'skip'}
                        onChange={(e) => setMapping({ ...mapping, [col]: e.target.value })}
                        className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      >
                        {crmFields.map((field) => (
                          <option key={field.value} value={field.value}>
                            {field.label}
                          </option>
                        ))}
                        <option value={`criterion_${col}`}>
                          ➕ Создать критерий "{col}"
                        </option>
                      </select>
                    </div>
                    <div className="w-24 text-right">
                      {mapping[col] === 'skip' ? (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Пропущено
                        </Badge>
                      ) : mapping[col]?.startsWith('criterion_') ? (
                        <Badge className="text-xs bg-accent/10 text-accent border-accent/20">
                          Критерий
                        </Badge>
                      ) : (
                        <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                          Сопоставлено
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => setShowSaveTemplate(!showSaveTemplate)}
              >
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить как шаблон
              </Button>
              
              <Button
                className="gradient-primary"
                size="lg"
                onClick={generatePreview}
                disabled={loading || !Object.values(mapping).some(v => v !== 'skip')}
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Генерация превью...
                  </>
                ) : (
                  <>
                    <Icon name="ArrowRight" size={20} className="mr-2" />
                    Далее: Превью импорта
                  </>
                )}
              </Button>
            </div>

            {/* Save template form */}
            {showSaveTemplate && (
              <Card className="p-4 border-secondary/20 bg-secondary/5">
                <h3 className="font-semibold mb-3">Сохранить шаблон маппинга</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Название шаблона (например: Импорт из Bitrix24)"
                    className="flex-1 px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button onClick={saveTemplate} disabled={loading || !templateName}>
                    <Icon name="Check" size={16} className="mr-2" />
                    Сохранить
                  </Button>
                  <Button variant="ghost" onClick={() => setShowSaveTemplate(false)}>
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Step 3: Preview and import */}
        {step === 3 && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Этап 3: Превью и импорт</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Будет импортировано {validCount} клиентов
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Изменить маппинг
                </Button>
              </div>

              {/* Matrix selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Выберите матрицу для импорта клиентов
                </label>
                <select
                  value={selectedMatrix}
                  onChange={(e) => setSelectedMatrix(e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Выберите матрицу --</option>
                  {matrices.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* New criteria warning */}
              {newCriteria.length > 0 && (
                <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Icon name="Sparkles" size={20} className="text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-2">Будут созданы новые критерии:</h4>
                      <div className="flex flex-wrap gap-2">
                        {newCriteria.map((criterion) => (
                          <Badge key={criterion} className="bg-accent/20 text-accent border-accent/30">
                            {criterion}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Критерии будут добавлены на ось X с весом 1.0 и диапазоном 0-10
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview table */}
              <div className="mb-6 overflow-x-auto">
                <h3 className="text-sm font-semibold mb-3">Превью импорта (первые 10 клиентов):</h3>
                <table className="w-full text-sm border border-border rounded-lg">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium border-b border-border">Компания</th>
                      <th className="px-4 py-2 text-left font-medium border-b border-border">Контакт</th>
                      <th className="px-4 py-2 text-left font-medium border-b border-border">Email</th>
                      <th className="px-4 py-2 text-left font-medium border-b border-border">Телефон</th>
                      <th className="px-4 py-2 text-left font-medium border-b border-border">Критерии</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewClients.map((client, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-2 font-medium">{client.company_name}</td>
                        <td className="px-4 py-2">{client.contact_person || '-'}</td>
                        <td className="px-4 py-2">{client.email || '-'}</td>
                        <td className="px-4 py-2">{client.phone || '-'}</td>
                        <td className="px-4 py-2">
                          {client.custom_scores && Object.keys(client.custom_scores).length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(client.custom_scores).map(([name, score]) => (
                                <Badge key={name} variant="outline" className="text-xs">
                                  {name}: {score}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="flex items-center justify-between gap-4">
              <Button variant="outline" onClick={resetImport}>
                <Icon name="X" size={16} className="mr-2" />
                Отменить импорт
              </Button>
              
              <Button
                className="gradient-primary"
                size="lg"
                onClick={executeImport}
                disabled={loading || !selectedMatrix}
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Импорт...
                  </>
                ) : (
                  <>
                    <Icon name="Upload" size={20} className="mr-2" />
                    Импортировать {validCount} клиентов
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

export default Import;