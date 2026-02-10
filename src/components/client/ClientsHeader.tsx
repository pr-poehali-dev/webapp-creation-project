import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ClientsHeaderProps {
  selectedMatrixName: string | null;
  hasMatrices: boolean;
  onBack: () => void;
}

const ClientsHeader = ({ selectedMatrixName, hasMatrices, onBack }: ClientsHeaderProps) => {
  return (
    <div className="border-b border-border bg-card/50">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Клиенты</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {selectedMatrixName || 'Управление базой клиентов'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasMatrices ? (
              <Link to="/client/new">
                <Button className="gradient-primary" size="sm">
                  <Icon name="Plus" size={18} className="sm:mr-2" />
                  <span className="hidden sm:inline">Добавить</span>
                </Button>
              </Link>
            ) : (
              <Button className="gradient-primary" size="sm" disabled title="Сначала создайте матрицу">
                <Icon name="Plus" size={18} className="sm:mr-2" />
                <span className="hidden sm:inline">Добавить</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsHeader;
