import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import KanbanBoard from '@/components/client/KanbanBoard';
import { Client, DealStatus } from '@/hooks/useClientsData';

interface ClientsKanbanTabProps {
  kanbanClients: Client[];
  dealStatuses: DealStatus[];
  onStatusChange: (clientId: number, newStatusId: number | null) => void;
  onClientClick: (id: number) => void;
}

const ClientsKanbanTab = ({ 
  kanbanClients, 
  dealStatuses, 
  onStatusChange, 
  onClientClick 
}: ClientsKanbanTabProps) => {
  return (
    <Card>
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <Icon name="Kanban" size={24} className="text-primary" />
          <h2 className="text-xl font-semibold">Канбан статусов сделок</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Управляйте статусами сделок, перетаскивая карточки клиентов между колонками
        </p>
      </div>
      <div className="p-6">
        <KanbanBoard
          clients={kanbanClients}
          dealStatuses={dealStatuses}
          onStatusChange={onStatusChange}
          onClientClick={onClientClick}
        />
      </div>
    </Card>
  );
};

export default ClientsKanbanTab;
