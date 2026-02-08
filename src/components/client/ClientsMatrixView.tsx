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

interface ClientsMatrixViewProps {
  clients: Client[];
  onClientClick: (id: number) => void;
  getQuadrantConfig: (quadrant: string) => { label: string; color: string; icon: string };
}

const ClientsMatrixView = ({ clients, onClientClick, getQuadrantConfig }: ClientsMatrixViewProps) => {
  const GRAPH_SIZE = 800;
  const CARD_WIDTH = 180;
  const CARD_HEIGHT = 120;

  const getClientPosition = (client: Client) => {
    const x = (client.score_x / 10) * GRAPH_SIZE - CARD_WIDTH / 2;
    const y = GRAPH_SIZE - (client.score_y / 10) * GRAPH_SIZE - CARD_HEIGHT / 2;
    return { x, y };
  };

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case 'focus':
        return 'bg-green-500/10 border-green-500/30';
      case 'grow':
        return 'bg-blue-500/10 border-blue-500/30';
      case 'monitor':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'archive':
        return 'bg-gray-500/10 border-gray-500/30';
      default:
        return 'bg-gray-400/10 border-gray-400/30';
    }
  };

  return (
    <div className="flex justify-center">
      <div className="relative bg-card border border-border rounded-lg p-8" style={{ width: GRAPH_SIZE + 100, height: GRAPH_SIZE + 100 }}>
        <div className="relative" style={{ width: GRAPH_SIZE, height: GRAPH_SIZE }}>
          <div className={`absolute ${getQuadrantColor('focus')} border-2`} style={{ left: 0, top: 0, width: GRAPH_SIZE / 2, height: GRAPH_SIZE / 2 }}></div>
          <div className={`absolute ${getQuadrantColor('monitor')} border-2`} style={{ left: GRAPH_SIZE / 2, top: 0, width: GRAPH_SIZE / 2, height: GRAPH_SIZE / 2 }}></div>
          <div className={`absolute ${getQuadrantColor('grow')} border-2`} style={{ left: 0, top: GRAPH_SIZE / 2, width: GRAPH_SIZE / 2, height: GRAPH_SIZE / 2 }}></div>
          <div className={`absolute ${getQuadrantColor('archive')} border-2`} style={{ left: GRAPH_SIZE / 2, top: GRAPH_SIZE / 2, width: GRAPH_SIZE / 2, height: GRAPH_SIZE / 2 }}></div>

          <div className="absolute flex items-center justify-center" style={{ left: GRAPH_SIZE / 4 - 60, top: GRAPH_SIZE / 4 - 20, width: 120 }}>
            <Badge className="bg-green-900/80 text-green-100">Фокус сейчас</Badge>
          </div>
          <div className="absolute flex items-center justify-center" style={{ left: GRAPH_SIZE * 3 / 4 - 60, top: GRAPH_SIZE / 4 - 20, width: 120 }}>
            <Badge className="bg-yellow-900/80 text-yellow-100">Мониторить</Badge>
          </div>
          <div className="absolute flex items-center justify-center" style={{ left: GRAPH_SIZE / 4 - 60, top: GRAPH_SIZE * 3 / 4 - 20, width: 120 }}>
            <Badge className="bg-blue-900/80 text-blue-100">Выращивать</Badge>
          </div>
          <div className="absolute flex items-center justify-center" style={{ left: GRAPH_SIZE * 3 / 4 - 60, top: GRAPH_SIZE * 3 / 4 - 20, width: 120 }}>
            <Badge className="bg-gray-700/80 text-gray-300">Архив</Badge>
          </div>

          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border"></div>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border"></div>

          <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col items-center">
            <Icon name="ArrowUp" size={16} className="text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground writing-mode-vertical">Y</span>
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center">
            <span className="text-xs text-muted-foreground mr-1">X</span>
            <Icon name="ArrowRight" size={16} className="text-muted-foreground" />
          </div>

          {clients.map((client) => {
            const position = getClientPosition(client);
            const quadrantConfig = getQuadrantConfig(client.quadrant);
            
            return (
              <Card
                key={client.id}
                className="absolute p-3 hover:shadow-xl transition-all cursor-pointer border-border bg-card/95 backdrop-blur-sm"
                style={{ 
                  left: position.x, 
                  top: position.y, 
                  width: CARD_WIDTH, 
                  height: CARD_HEIGHT,
                  zIndex: 10
                }}
                onClick={() => onClientClick(client.id)}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold line-clamp-1 flex-1">{client.company_name}</h3>
                    <div className={`${quadrantConfig.color} text-xs px-1 py-0 ml-1 rounded flex items-center justify-center`}>
                      <Icon name={quadrantConfig.icon} size={12} />
                    </div>
                  </div>
                  
                  {client.contact_person && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                      <Icon name="User" size={10} className="inline mr-1" />
                      {client.contact_person}
                    </p>
                  )}
                  
                  <div className="mt-auto pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">X: <span className="font-semibold">{client.score_x.toFixed(1)}</span></span>
                        <span className="text-muted-foreground">Y: <span className="font-semibold">{client.score_y.toFixed(1)}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          <div className="absolute -left-6 bottom-2 text-xs text-muted-foreground">0</div>
          <div className="absolute -left-8 top-2 text-xs text-muted-foreground">10</div>
          <div className="absolute -bottom-6 left-2 text-xs text-muted-foreground">0</div>
          <div className="absolute -bottom-6 right-2 text-xs text-muted-foreground">10</div>
        </div>
      </div>
    </div>
  );
};

export default ClientsMatrixView;