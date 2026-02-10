import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Matrix {
  id: number;
  name: string;
}

interface ImportStepThreeProps {
  matrices: Matrix[];
  selectedMatrix: string;
  setSelectedMatrix: (matrixId: string) => void;
  newCriteria: string[];
  previewClients: any[];
  validCount: number;
  duplicatesCount: number;
  setStep: (step: 2) => void;
  executeImport: () => void;
  loading: boolean;
  resetImport: () => void;
}

const ImportStepThree = ({
  matrices,
  selectedMatrix,
  setSelectedMatrix,
  newCriteria,
  previewClients,
  validCount,
  duplicatesCount,
  setStep,
  executeImport,
  loading,
  resetImport,
}: ImportStepThreeProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Этап 3: Превью и импорт</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Будет импортировано {validCount} клиентов
              {duplicatesCount > 0 && (
                <span className="text-orange-500 ml-2">
                  ({duplicatesCount} дубликатов будут пропущены)
                </span>
              )}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setStep(2)}>
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Изменить маппинг
          </Button>
        </div>

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
                <tr key={idx} className={`border-b border-border hover:bg-muted/50 ${client.is_duplicate ? 'bg-orange-500/10' : ''}`}>
                  <td className="px-4 py-2 font-medium">
                    {client.company_name}
                    {client.is_duplicate && (
                      <Badge variant="outline" className="ml-2 text-xs text-orange-500 border-orange-500">
                        Дубликат
                      </Badge>
                    )}
                  </td>
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
  );
};

export default ImportStepThree;