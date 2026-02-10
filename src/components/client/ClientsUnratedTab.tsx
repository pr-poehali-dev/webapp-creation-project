import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import ClientsListView from '@/components/client/ClientsListView';
import { Client } from '@/hooks/useClientsData';

interface ClientsUnratedTabProps {
  unratedClients: Client[];
  onClientClick: (id: number) => void;
  getQuadrantConfig: (quadrant: string) => { label: string; color: string; icon: string };
}

const ClientsUnratedTab = ({ 
  unratedClients, 
  onClientClick, 
  getQuadrantConfig 
}: ClientsUnratedTabProps) => {
  return (
    <Card>
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <Icon name="Users" size={24} className="text-primary" />
          <h2 className="text-xl font-semibold">Клиенты без оценки</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Клиенты, которые не привязаны ни к одной матрице приоритизации
        </p>
      </div>
      <div className="p-6">
        {unratedClients.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="CheckCircle" size={48} className="mx-auto mb-4 text-green-500" />
            <p className="text-muted-foreground">Все клиенты оценены!</p>
          </div>
        ) : (
          <ClientsListView
            clients={unratedClients}
            onClientClick={onClientClick}
            getQuadrantConfig={getQuadrantConfig}
          />
        )}
      </div>
    </Card>
  );
};

export default ClientsUnratedTab;
