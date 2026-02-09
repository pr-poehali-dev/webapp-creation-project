import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Template {
  id: number;
  name: string;
  mapping: Record<string, string>;
}

interface ImportStepTwoProps {
  columns: string[];
  preview: any[];
  totalRows: number;
  mapping: Record<string, string>;
  setMapping: (mapping: Record<string, string>) => void;
  templates: Template[];
  applyTemplate: (template: Template) => void;
  resetImport: () => void;
  generatePreview: () => void;
  loading: boolean;
  saveTemplate: () => void;
  showSaveTemplate: boolean;
  setShowSaveTemplate: (show: boolean) => void;
  templateName: string;
  setTemplateName: (name: string) => void;
}

const ImportStepTwo = ({
  columns,
  preview,
  totalRows,
  mapping,
  setMapping,
  templates,
  applyTemplate,
  resetImport,
  generatePreview,
  loading,
  saveTemplate,
  showSaveTemplate,
  setShowSaveTemplate,
  templateName,
  setTemplateName,
}: ImportStepTwoProps) => {
  const crmFields = [
    { value: 'skip', label: '⊘ Пропустить колонку' },
    { value: 'company_name', label: 'Название компании' },
    { value: 'contact_person', label: 'Контактное лицо' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Телефон' },
    { value: 'description', label: 'Описание' },
  ];

  return (
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

        <div className="mb-6 overflow-x-auto -mx-2 sm:mx-0">
          <h3 className="text-sm font-semibold mb-3 px-2 sm:px-0">Превью первых 5 строк:</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs sm:text-sm border border-border rounded-lg">
              <thead className="bg-muted">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="px-2 sm:px-4 py-2 text-left font-medium border-b border-border whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/50">
                    {columns.map((col) => (
                      <td key={col} className="px-2 sm:px-4 py-2 whitespace-nowrap">
                        {row[col] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold mb-3">Сопоставление колонок с полями CRM:</h3>
          {columns.map((col) => (
            <div key={col} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 bg-card border border-border rounded-lg">
              <div className="flex-1 w-full sm:w-auto">
                <Badge variant="outline" className="font-mono text-xs">
                  {col}
                </Badge>
              </div>
              <Icon name="ArrowRight" size={16} className="text-muted-foreground hidden sm:block" />
              <Icon name="ArrowDown" size={16} className="text-muted-foreground sm:hidden ml-2" />
              <div className="flex-1 w-full">
                <select
                  value={mapping[col] || 'skip'}
                  onChange={(e) => setMapping({ ...mapping, [col]: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-xs sm:text-sm"
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
              <div className="w-full sm:w-24 text-left sm:text-right">
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
  );
};

export default ImportStepTwo;