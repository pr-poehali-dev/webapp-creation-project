import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import AppLayout from '@/components/layout/AppLayout';
import ClientsHeader from '@/components/client/ClientsHeader';
import ClientsMatricesTab from '@/components/client/ClientsMatricesTab';
import ClientsKanbanTab from '@/components/client/ClientsKanbanTab';
import ClientsUnratedTab from '@/components/client/ClientsUnratedTab';
import { useClientsData } from '@/hooks/useClientsData';

const Clients = () => {
  const navigate = useNavigate();
  const {
    clients,
    matrices,
    selectedMatrix,
    setSelectedMatrix,
    dealStatuses,
    loading,
    selectedQuadrant,
    setSelectedQuadrant,
    filterDealStatus,
    setFilterDealStatus,
    filterResponsibleUser,
    setFilterResponsibleUser,
    hasMatrices,
    showList,
    setShowList,
    viewMode,
    setViewMode,
    unratedClients,
    userRole,
    kanbanClients,
    handleStatusChange,
    users,
  } = useClientsData();

  const handleQuadrantClick = (quadrant: string) => {
    setSelectedQuadrant(quadrant);
    setShowList(true);
  };

  const handleBackToMatrix = () => {
    setSelectedQuadrant('');
    setFilterDealStatus('');
    setFilterResponsibleUser('');
    setShowList(false);
  };

  const getQuadrantConfig = (quadrant: string) => {
    switch (quadrant) {
      case 'focus':
        return { label: 'Фокус сейчас', color: 'bg-green-900 text-green-100', icon: 'Zap' };
      case 'grow':
        return { label: 'Выращивать', color: 'bg-blue-900 text-blue-100', icon: 'TrendingUp' };
      case 'monitor':
        return { label: 'Мониторить', color: 'bg-yellow-900 text-yellow-100', icon: 'Eye' };
      case 'archive':
        return { label: 'Архив', color: 'bg-gray-700 text-gray-300', icon: 'Archive' };
      default:
        return { label: 'Не оценен', color: 'bg-gray-600 text-gray-300', icon: 'HelpCircle' };
    }
  };

  const handleClientClick = (id: number) => {
    navigate(`/client/${id}`);
  };

  return (
    <AppLayout>
      <ClientsHeader
        selectedMatrixName={selectedMatrix?.name || null}
        hasMatrices={hasMatrices}
        onBack={() => navigate('/dashboard')}
      />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'matrices' | 'unrated' | 'kanban')}>
          <TabsList className="mb-6">
            <TabsTrigger value="matrices" className="flex items-center gap-2">
              <Icon name="Grid3x3" size={16} />
              Матрицы ({matrices.length})
            </TabsTrigger>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <Icon name="Kanban" size={16} />
              Канбан статусов
            </TabsTrigger>
            <TabsTrigger value="unrated" className="flex items-center gap-2">
              <Icon name="Users" size={16} />
              Без оценки ({unratedClients.length})
            </TabsTrigger>
            {(userRole === 'owner' || userRole === 'admin') && (
              <TabsTrigger value="deleted" className="flex items-center gap-2" onClick={() => navigate('/clients/deleted')}>
                <Icon name="Trash2" size={16} />
                Удаленные
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="matrices">
            <ClientsMatricesTab
              hasMatrices={hasMatrices}
              matrices={matrices}
              selectedMatrix={selectedMatrix}
              setSelectedMatrix={setSelectedMatrix}
              loading={loading}
              showList={showList}
              setShowList={setShowList}
              selectedQuadrant={selectedQuadrant}
              setSelectedQuadrant={setSelectedQuadrant}
              filterDealStatus={filterDealStatus}
              setFilterDealStatus={setFilterDealStatus}
              filterResponsibleUser={filterResponsibleUser}
              setFilterResponsibleUser={setFilterResponsibleUser}
              clients={clients}
              dealStatuses={dealStatuses}
              users={users}
              onClientClick={handleClientClick}
              onQuadrantClick={handleQuadrantClick}
              onBackToMatrix={handleBackToMatrix}
              getQuadrantConfig={getQuadrantConfig}
            />
          </TabsContent>

          <TabsContent value="kanban">
            <ClientsKanbanTab
              kanbanClients={kanbanClients}
              dealStatuses={dealStatuses}
              onStatusChange={handleStatusChange}
              onClientClick={handleClientClick}
            />
          </TabsContent>

          <TabsContent value="unrated">
            <ClientsUnratedTab
              unratedClients={unratedClients}
              onClientClick={handleClientClick}
              getQuadrantConfig={getQuadrantConfig}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Clients;