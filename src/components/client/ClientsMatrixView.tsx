import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

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

interface MatrixData {
  id: number;
  name: string;
  axis_x_name: string;
  axis_y_name: string;
}

interface ClientsMatrixViewProps {
  clients: Client[];
  matrixData: MatrixData | null;
  onQuadrantClick: (quadrant: string) => void;
}

const ClientsMatrixView = ({ clients, matrixData, onQuadrantClick }: ClientsMatrixViewProps) => {
  const MATRIX_SIZE = 600;

  const getQuadrantConfig = (quadrant: string) => {
    switch (quadrant) {
      case 'focus':
        return { label: 'Фокус сейчас', color: 'bg-gradient-to-br from-green-500/20 to-green-600/30 hover:from-green-500/30 hover:to-green-600/40', borderColor: 'border-green-500/40', icon: 'Zap', iconColor: 'text-green-400' };
      case 'grow':
        return { label: 'Выращивать', color: 'bg-gradient-to-br from-blue-500/20 to-blue-600/30 hover:from-blue-500/30 hover:to-blue-600/40', borderColor: 'border-blue-500/40', icon: 'TrendingUp', iconColor: 'text-blue-400' };
      case 'monitor':
        return { label: 'Мониторить', color: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 hover:from-yellow-500/30 hover:to-yellow-600/40', borderColor: 'border-yellow-500/40', icon: 'Eye', iconColor: 'text-yellow-400' };
      case 'archive':
        return { label: 'Архив', color: 'bg-gradient-to-br from-gray-500/20 to-gray-600/30 hover:from-gray-500/30 hover:to-gray-600/40', borderColor: 'border-gray-500/40', icon: 'Archive', iconColor: 'text-gray-400' };
      default:
        return { label: 'Не оценен', color: 'bg-gray-400/10', borderColor: 'border-gray-400/30', icon: 'HelpCircle', iconColor: 'text-gray-400' };
    }
  };

  const quadrantCounts = {
    focus: clients.filter(c => c.quadrant === 'focus').length,
    grow: clients.filter(c => c.quadrant === 'grow').length,
    monitor: clients.filter(c => c.quadrant === 'monitor').length,
    archive: clients.filter(c => c.quadrant === 'archive').length,
  };

  const quadrants = [
    { key: 'focus', position: { row: 0, col: 0 } },
    { key: 'monitor', position: { row: 0, col: 1 } },
    { key: 'grow', position: { row: 1, col: 0 } },
    { key: 'archive', position: { row: 1, col: 1 } },
  ];

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative bg-muted/20 rounded-xl p-12 border border-border/50">
        <div className="relative" style={{ width: MATRIX_SIZE + 80, height: MATRIX_SIZE + 80 }}>
          
          {/* Вертикальная ось Y (слева) */}
          <div className="absolute -left-16 top-0 bottom-0 flex flex-col items-center justify-between py-10">
            <div className="flex flex-col items-center gap-2">
              <Icon name="ChevronUp" size={28} className="text-primary" strokeWidth={3} />
              <div className="w-0.5 h-12 bg-gradient-to-b from-primary via-primary/60 to-transparent rounded-full"></div>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Высокий</span>
              <div className="w-6 h-px bg-primary/40"></div>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-px bg-border"></div>
              <span className="text-xs text-muted-foreground">50%</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-px bg-primary/40"></div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Низкий</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-0.5 h-12 bg-gradient-to-t from-primary via-primary/60 to-transparent rounded-full"></div>
            </div>
          </div>

          {/* Название оси Y (снизу горизонтально) */}
          <div className="absolute -bottom-16 left-0 right-0 flex justify-center">
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border/50">
              <Icon name="ArrowUpDown" size={18} className="text-primary" />
              <span className="text-sm font-bold text-foreground tracking-wide">
                {matrixData?.axis_y_name || 'Ось Y'}
              </span>
            </div>
          </div>

          {/* Горизонтальная ось X (снизу) */}
          <div className="absolute -bottom-8 left-10 right-10 flex items-center justify-between px-0">
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-12 bg-gradient-to-l from-primary via-primary/60 to-transparent rounded-full"></div>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Низкий</span>
              <div className="h-6 w-px bg-primary/40"></div>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">50%</span>
              <div className="h-6 w-px bg-border"></div>
            </div>
            
            <div className="flex items-center gap-1">
              <div className="h-6 w-px bg-primary/40"></div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Высокий</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-12 bg-gradient-to-r from-primary via-primary/60 to-transparent rounded-full"></div>
              <Icon name="ChevronRight" size={28} className="text-primary" strokeWidth={3} />
            </div>
          </div>

          {/* Название оси X (справа вертикально) */}
          <div className="absolute -right-16 top-1/2 -translate-y-1/2">
            <div className="flex flex-col items-center gap-2 bg-background/80 backdrop-blur-sm px-2 py-4 rounded-lg border border-border/50">
              <Icon name="ArrowLeftRight" size={18} className="text-primary" />
              <span 
                className="text-sm font-bold text-foreground tracking-wide"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              >
                {matrixData?.axis_x_name || 'Ось X'}
              </span>
            </div>
          </div>

          {/* Матрица квадрантов */}
          <div 
            className="grid grid-cols-2 grid-rows-2 gap-0 relative rounded-lg overflow-hidden border-2 border-border/60"
            style={{ width: MATRIX_SIZE, height: MATRIX_SIZE, margin: '40px' }}
          >
            {quadrants.map(({ key, position }) => {
              const config = getQuadrantConfig(key);
              const count = quadrantCounts[key as keyof typeof quadrantCounts];
              
              return (
                <button
                  key={key}
                  onClick={() => onQuadrantClick(key)}
                  className={`
                    relative border-2 ${config.borderColor} ${config.color}
                    transition-all duration-300 cursor-pointer
                    flex flex-col items-center justify-center
                    group
                  `}
                  style={{
                    width: MATRIX_SIZE / 2,
                    height: MATRIX_SIZE / 2,
                  }}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className={`${config.iconColor} transition-transform group-hover:scale-110`}>
                      <Icon name={config.icon} size={48} />
                    </div>
                    <div className="text-6xl font-bold text-foreground group-hover:scale-125 transition-transform">
                      {count}
                    </div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {config.label}
                    </div>
                  </div>
                </button>
              );
            })}

            <div 
              className="absolute left-1/2 top-0 bottom-0 w-1 bg-border -translate-x-1/2"
              style={{ boxShadow: '0 0 8px rgba(0,0,0,0.1)' }}
            ></div>
            <div 
              className="absolute top-1/2 left-0 right-0 h-1 bg-border -translate-y-1/2"
              style={{ boxShadow: '0 0 8px rgba(0,0,0,0.1)' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsMatrixView;