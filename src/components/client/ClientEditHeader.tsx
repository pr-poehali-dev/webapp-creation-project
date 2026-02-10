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
  onSave: () => void;
  saving: boolean;
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

const ClientEditHeader = ({ client, onDelete, onSave, saving }: ClientEditHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => navigate('/clients')} className="flex-shrink-0">
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-bold truncate">{client?.company_name}</h1>
                {client?.quadrant && (
                  <Badge className={`${getQuadrantConfig(client.quadrant).color} text-xs whitespace-nowrap`}>
                    {getQuadrantConfig(client.quadrant).label}
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Редактирование информации о клиенте</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button 
              className="gradient-primary hidden sm:flex" 
              onClick={onSave}
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
                  Сохранить
                </>
              )}
            </Button>
            <Button 
              className="gradient-primary sm:hidden" 
              size="icon"
              onClick={onSave}
              disabled={saving}
            >
              {saving ? (
                <Icon name="Loader2" size={20} className="animate-spin" />
              ) : (
                <Icon name="Save" size={20} />
              )}
            </Button>
            <Button variant="destructive" onClick={onDelete} className="hidden sm:flex">
              <Icon name="Trash2" size={20} className="mr-2" />
              Удалить
            </Button>
            <Button variant="destructive" size="icon" onClick={onDelete} className="sm:hidden">
              <Icon name="Trash2" size={20} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ClientEditHeader;