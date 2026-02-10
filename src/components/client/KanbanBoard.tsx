import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Client {
  id: number;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  description: string;
  score_x: number;
  score_y: number;
  quadrant: string;
  matrix_id: number;
  matrix_name: string;
  created_at: string;
  deal_status_id: number | null;
  deal_status_name: string | null;
  deal_status_weight: number | null;
}

interface DealStatus {
  id: number;
  name: string;
  weight: number;
  sort_order: number;
}

interface KanbanBoardProps {
  clients: Client[];
  dealStatuses: DealStatus[];
  onStatusChange: (clientId: number, newStatusId: number | null) => void;
  onClientClick: (clientId: number) => void;
}

const KanbanBoard = ({ clients, dealStatuses, onStatusChange, onClientClick }: KanbanBoardProps) => {
  const [draggedClient, setDraggedClient] = useState<number | null>(null);

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case 'focus':
        return 'bg-green-900/30 border-green-700';
      case 'grow':
        return 'bg-blue-900/30 border-blue-700';
      case 'monitor':
        return 'bg-yellow-900/30 border-yellow-700';
      case 'archive':
        return 'bg-gray-700/30 border-gray-600';
      default:
        return 'bg-card border-border';
    }
  };

  const getQuadrantBadgeColor = (quadrant: string) => {
    switch (quadrant) {
      case 'focus':
        return 'bg-green-900 text-green-100';
      case 'grow':
        return 'bg-blue-900 text-blue-100';
      case 'monitor':
        return 'bg-yellow-900 text-yellow-100';
      case 'archive':
        return 'bg-gray-700 text-gray-300';
      default:
        return 'bg-gray-600 text-gray-300';
    }
  };

  const handleDragStart = (clientId: number) => {
    setDraggedClient(clientId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (statusId: number | null) => {
    if (draggedClient !== null) {
      onStatusChange(draggedClient, statusId);
      setDraggedClient(null);
    }
  };

  const getClientsForStatus = (statusId: number | null) => {
    return clients.filter(c => c.deal_status_id === statusId);
  };

  const allStatuses = [
    { id: null, name: 'Без статуса', weight: -1, sort_order: -1 },
    ...dealStatuses.sort((a, b) => a.sort_order - b.sort_order)
  ];

  return (
    <div className="w-full">
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4 min-w-max">
          {allStatuses.map((status) => {
            const statusClients = getClientsForStatus(status.id);
            
            return (
              <div
                key={status.id || 'no-status'}
                className="flex-shrink-0 w-80"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(status.id)}
              >
                <Card className="p-4 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">{status.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {statusClients.length}
                    </Badge>
                  </div>

                  <div className="space-y-2 min-h-[200px]">
                    {statusClients.map((client) => (
                      <Card
                        key={client.id}
                        draggable
                        onDragStart={() => handleDragStart(client.id)}
                        onClick={() => onClientClick(client.id)}
                        className={`p-3 cursor-move hover:shadow-md transition-all border ${getQuadrantColor(client.quadrant)}`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm line-clamp-2 flex-1">
                              {client.company_name}
                            </h4>
                            <Icon name="GripVertical" size={16} className="text-muted-foreground flex-shrink-0" />
                          </div>
                          
                          {client.matrix_name && (
                            <div className="flex items-center gap-1">
                              <Icon name="Grid3x3" size={12} className="text-muted-foreground" />
                              <span className="text-xs text-muted-foreground truncate">
                                {client.matrix_name}
                              </span>
                            </div>
                          )}

                          {client.quadrant && (
                            <Badge className={`text-xs ${getQuadrantBadgeColor(client.quadrant)}`}>
                              {client.quadrant === 'focus' && 'Фокус'}
                              {client.quadrant === 'grow' && 'Выращивать'}
                              {client.quadrant === 'monitor' && 'Мониторить'}
                              {client.quadrant === 'archive' && 'Архив'}
                            </Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                    
                    {statusClients.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Пусто
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="Info" size={16} />
          <span>Перетаскивайте карточки клиентов между колонками для изменения статуса сделки</span>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
