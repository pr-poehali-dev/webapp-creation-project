import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import ClientsMatrixView from '@/components/client/ClientsMatrixView';
import ClientsListView from '@/components/client/ClientsListView';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Client, Matrix, DealStatus } from '@/hooks/useClientsData';

interface ClientsMatricesTabProps {
  hasMatrices: boolean;
  matrices: Matrix[];
  selectedMatrix: Matrix | null;
  setSelectedMatrix: (matrix: Matrix | null) => void;
  loading: boolean;
  showList: boolean;
  setShowList: (show: boolean) => void;
  selectedQuadrant: string;
  setSelectedQuadrant: (quadrant: string) => void;
  filterDealStatus: string;
  setFilterDealStatus: (status: string) => void;
  clients: Client[];
  dealStatuses: DealStatus[];
  onClientClick: (id: number) => void;
  onQuadrantClick: (quadrant: string) => void;
  onBackToMatrix: () => void;
  getQuadrantConfig: (quadrant: string) => { label: string; color: string; icon: string };
}

const ClientsMatricesTab = ({
  hasMatrices,
  matrices,
  selectedMatrix,
  setSelectedMatrix,
  loading,
  showList,
  setShowList,
  selectedQuadrant,
  filterDealStatus,
  setFilterDealStatus,
  clients,
  dealStatuses,
  onClientClick,
  onQuadrantClick,
  onBackToMatrix,
  getQuadrantConfig,
}: ClientsMatricesTabProps) => {
  return (
    <>
      {!hasMatrices ? (
        <Card className="p-8 text-center">
          <Icon name="Layout" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Матриц пока нет</h3>
          <p className="text-muted-foreground mb-4">
            Создайте матрицу приоритизации для управления клиентами
          </p>
          <Link to="/matrix/new">
            <Button className="gradient-primary">
              <Icon name="Plus" size={20} className="mr-2" />
              Создать матрицу
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          {matrices.length > 1 && (
            <div className="mb-6">
              <Tabs 
                value={selectedMatrix?.id.toString() || ''} 
                onValueChange={(value) => {
                  const matrix = matrices.find(m => m.id === parseInt(value));
                  setSelectedMatrix(matrix || null);
                  setShowList(false);
                }}
              >
                <TabsList className="w-full justify-start h-auto flex-wrap gap-2">
                  {matrices.map((matrix) => (
                    <TabsTrigger 
                      key={matrix.id} 
                      value={matrix.id.toString()}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Icon name="Grid3x3" size={14} className="mr-2" />
                      {matrix.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          ) : showList ? (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={onBackToMatrix}
                  className="flex items-center gap-2"
                >
                  <Icon name="ArrowLeft" size={16} />
                  Вернуться к матрице
                </Button>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Icon name="Filter" size={20} className="text-muted-foreground" />
                    <select
                      value={filterDealStatus}
                      onChange={(e) => setFilterDealStatus(e.target.value)}
                      className="px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Все статусы сделок</option>
                      {dealStatuses.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {selectedQuadrant && (
                <div className="mb-4">
                  <Badge className={getQuadrantConfig(selectedQuadrant).color}>
                    {getQuadrantConfig(selectedQuadrant).label}
                  </Badge>
                </div>
              )}

              <ClientsListView
                clients={clients}
                onClientClick={onClientClick}
                getQuadrantConfig={getQuadrantConfig}
              />
            </div>
          ) : (
            <ClientsMatrixView
              clients={clients}
              matrixData={selectedMatrix}
              onQuadrantClick={onQuadrantClick}
            />
          )}
        </>
      )}
    </>
  );
};

export default ClientsMatricesTab;
