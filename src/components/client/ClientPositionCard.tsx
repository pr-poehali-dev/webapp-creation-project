import { Card } from '@/components/ui/card';

interface Client {
  score_x: number;
  score_y: number;
  matrix_name: string | null;
}

interface ClientPositionCardProps {
  client: Client;
}

const ClientPositionCard = ({ client }: ClientPositionCardProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Позиция в матрице</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Влияние (X)</p>
          <p className="text-3xl font-bold text-primary">{client.score_x.toFixed(1)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Зрелость (Y)</p>
          <p className="text-3xl font-bold text-secondary">{client.score_y.toFixed(1)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Матрица</p>
          <p className="text-sm font-medium">{client.matrix_name || 'Не указана'}</p>
        </div>
      </div>
    </Card>
  );
};

export default ClientPositionCard;
