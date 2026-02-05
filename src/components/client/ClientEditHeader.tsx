import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Client {
  company_name: string;
  quadrant: string;
}

interface ClientEditHeaderProps {
  client: Client | null;
  onDelete: () => void;
}

const getQuadrantConfig = (quadrant: string) => {
  switch (quadrant) {
    case 'focus':
      return { label: '🔴 Фокус сейчас', color: 'bg-green-900 text-green-100' };
    case 'grow':
      return { label: '🟠 Выращивать', color: 'bg-blue-900 text-blue-100' };
    case 'monitor':
      return { label: '🟡 Мониторить', color: 'bg-yellow-900 text-yellow-100' };
    case 'archive':
      return { label: '⚪ Архив', color: 'bg-gray-700 text-gray-300' };
    default:
      return { label: 'Не оценен', color: 'bg-gray-600 text-gray-300' };
  }
};

const ClientEditHeader = ({ client, onDelete }: ClientEditHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/clients')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{client?.company_name}</h1>
                {client?.quadrant && (
                  <Badge className={getQuadrantConfig(client.quadrant).color}>
                    {getQuadrantConfig(client.quadrant).label}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Редактирование информации о клиенте</p>
            </div>
          </div>
          <Button variant="destructive" onClick={onDelete}>
            <Icon name="Trash2" size={20} className="mr-2" />
            Удалить
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ClientEditHeader;
