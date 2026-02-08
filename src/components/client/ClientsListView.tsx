import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

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

interface ClientsListViewProps {
  clients: Client[];
  onClientClick: (id: number) => void;
  getQuadrantConfig: (quadrant: string) => { label: string; color: string; icon: string };
}

const ClientsListView = ({ clients, onClientClick, getQuadrantConfig }: ClientsListViewProps) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clients.map((client) => {
        const quadrantConfig = getQuadrantConfig(client.quadrant);
        return (
          <Card
            key={client.id}
            className="p-6 hover:shadow-xl transition-all cursor-pointer border-border"
            onClick={() => onClientClick(client.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{client.company_name}</h3>
                {client.contact_person && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Icon name="User" size={14} />
                    {client.contact_person}
                  </p>
                )}
              </div>
              <Badge className={quadrantConfig.color}>
                {quadrantConfig.label}
              </Badge>
            </div>

            {client.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {client.description}
              </p>
            )}

            <div className="space-y-2 mb-4">
              {client.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="Mail" size={14} />
                  <span className="truncate">{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="Phone" size={14} />
                  <span>{client.phone}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">X: </span>
                  <span className="font-semibold">{client.score_x.toFixed(1)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Y: </span>
                  <span className="font-semibold">{client.score_y.toFixed(1)}</span>
                </div>
              </div>
              {client.matrix_name && (
                <Badge variant="outline" className="text-xs">
                  {client.matrix_name}
                </Badge>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ClientsListView;
