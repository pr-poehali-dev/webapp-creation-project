import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import ClientsMatrixView from '@/components/client/ClientsMatrixView';
import ClientsListView from '@/components/client/ClientsListView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/components/layout/AppLayout';

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

interface Matrix {
  id: number;
  name: string;
  axis_x_name: string;
  axis_y_name: string;
}

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [matrices, setMatrices] = useState<Matrix[]>([]);
  const [selectedMatrix, setSelectedMatrix] = useState<Matrix | null>(null);
  const [dealStatuses, setDealStatuses] = useState<DealStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>('');
  const [filterDealStatus, setFilterDealStatus] = useState<string>('');
  const [hasMatrices, setHasMatrices] = useState(true);
  const [showList, setShowList] = useState(false);
  const [viewMode, setViewMode] = useState<'matrices' | 'unrated'>('matrices');
  const [unratedClients, setUnratedClients] = useState<Client[]>([]);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
      return;
    }

    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUserRole(parsedUser.role || '');
    }

    checkMatrices();
    fetchDealStatuses();
    fetchUnratedClients();
  }, [navigate]);

  useEffect(() => {
    if (selectedMatrix) {
      fetchClients();
    }
  }, [selectedMatrix]);

  useEffect(() => {
    if (selectedQuadrant || filterDealStatus) {
      filterClients();
    } else {
      setClients(allClients);
    }
  }, [selectedQuadrant, filterDealStatus, allClients]);

  useEffect(() => {
    if (viewMode === 'unrated') {
      fetchUnratedClients();
    }
  }, [viewMode]);

  const checkMatrices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/574d8d38-81d5-49c7-b625-a170daa667bc', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setMatrices(data.matrices || []);
        setHasMatrices(data.matrices && data.matrices.length > 0);
        if (data.matrices && data.matrices.length > 0) {
          const firstMatrix = data.matrices[0];
          setSelectedMatrix(firstMatrix);
        }
      }
    } catch (error) {
      console.error('Ошибка проверки матриц:', error);
    }
  };

  const fetchDealStatuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/7a876a8c-dc4a-439e-aef5-23bde46d9fc2', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setDealStatuses(data.statuses);
      }
    } catch (error) {
      console.error('Ошибка загрузки статусов сделок:', error);
    }
  };

  const fetchClients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/9347d703-acfe-4def-a4ae-a4a52329c037', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'list',
          matrix_id: selectedMatrix?.id,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setAllClients(data.clients);
        setClients(data.clients);
      }
    } catch (error) {
      console.error('Ошибка загрузки клиентов:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnratedClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/9347d703-acfe-4def-a4ae-a4a52329c037', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'list_unrated',
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setUnratedClients(data.clients);
      }
    } catch (error) {
      console.error('Ошибка загрузки клиентов без оценки:', error);
    }
  };

  const filterClients = () => {
    let filtered = [...allClients];

    if (selectedQuadrant) {
      filtered = filtered.filter(c => c.quadrant === selectedQuadrant);
    }

    if (filterDealStatus) {
      filtered = filtered.filter(c => c.deal_status_id === parseInt(filterDealStatus));
    }

    setClients(filtered);
  };

  const handleQuadrantClick = (quadrant: string) => {
    setSelectedQuadrant(quadrant);
    setShowList(true);
  };

  const handleBackToMatrix = () => {
    setSelectedQuadrant('');
    setFilterDealStatus('');
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
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Клиенты</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {selectedMatrix ? selectedMatrix.name : 'Управление базой клиентов'}
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

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'matrices' | 'unrated')}>
          <TabsList className="mb-6">
            <TabsTrigger value="matrices" className="flex items-center gap-2">
              <Icon name="Grid3x3" size={16} />
              Матрицы ({matrices.length})
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
                      setSelectedQuadrant('');
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
                onClick={handleBackToMatrix}
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
              onClientClick={handleClientClick}
              getQuadrantConfig={getQuadrantConfig}
            />
          </div>
        ) : (
          <ClientsMatrixView
            clients={clients}
            matrixData={selectedMatrix}
            onQuadrantClick={handleQuadrantClick}
          />
        )}
              </>
            )}
      </TabsContent>

      <TabsContent value="unrated">
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
                onClientClick={handleClientClick}
                getQuadrantConfig={getQuadrantConfig}
              />
            )}
          </div>
        </Card>
      </TabsContent>
    </Tabs>
      </div>
    </AppLayout>
  );
};

export default Clients;