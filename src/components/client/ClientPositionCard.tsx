import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Client {
  score_x: number;
  score_y: number;
  matrix_name: string | null;
}

interface Matrix {
  id: number;
  name: string;
}

interface DealStatus {
  id: number;
  name: string;
  weight: number;
  sort_order: number;
}

interface ClientPositionCardProps {
  client: Client;
  matrixId: string;
  dealStatusId: string;
  matrices: Matrix[];
  dealStatuses: DealStatus[];
  hasScores: boolean;
  onMatrixChange: (value: string) => void;
  onDealStatusChange: (value: string) => void;
  onStartQuestionnaire: () => void;
  onReassess: () => void;
}

const ClientPositionCard = ({ 
  client, 
  matrixId, 
  dealStatusId,
  matrices,
  dealStatuses,
  hasScores,
  onMatrixChange,
  onDealStatusChange,
  onStartQuestionnaire,
  onReassess
}: ClientPositionCardProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Позиция в матрице</h3>
        {matrixId && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={hasScores ? onReassess : onStartQuestionnaire}
          >
            <Icon name={hasScores ? "RefreshCw" : "Play"} size={16} className="mr-2" />
            {hasScores ? 'Переоценить' : 'Оценить'}
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="matrix_id" className="block text-sm font-medium mb-2">
              Матрица оценки
            </label>
            <select
              id="matrix_id"
              value={matrixId}
              onChange={(e) => onMatrixChange(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="">Без матрицы</option>
              {matrices.map((matrix) => (
                <option key={matrix.id} value={matrix.id}>
                  {matrix.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="deal_status_id" className="block text-sm font-medium mb-2">
              Статус сделки
            </label>
            <select
              id="deal_status_id"
              value={dealStatusId}
              onChange={(e) => onDealStatusChange(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="">Не выбран</option>
              {dealStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {client.score_x > 0 && client.score_y > 0 && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Влияние (X)</p>
              <p className="text-2xl font-bold text-primary">{client.score_x.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Зрелость (Y)</p>
              <p className="text-2xl font-bold text-secondary">{client.score_y.toFixed(1)}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ClientPositionCard;