import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import ClientsMatrixView from '@/components/client/ClientsMatrixView';
import ClientsListView from '@/components/client/ClientsListView';

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
}

type ViewMode = 'matrix' | 'list';

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [matrices, setMatrices] = useState<Matrix[]>([]);
  const [dealStatuses, setDealStatuses] = useState<DealStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuadrant, setFilterQuadrant] = useState<string>('');
  const [filterDealStatus, setFilterDealStatus] = useState<string>('');
  const [filterMatrix, setFilterMatrix] = useState<string>('');
  const [hasMatrices, setHasMatrices] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('matrix');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    checkMatrices();
    fetchDealStatuses();
  }, [navigate]);

  useEffect(() => {
    if (filterMatrix) {
      fetchClients();
    }
  }, [filterQuadrant, filterDealStatus, filterMatrix]);

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
        if (data.matrices && data.matrices.length > 0 && !filterMatrix) {
          setFilterMatrix(data.matrices[0].id.toString());
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
          quadrant: filterQuadrant || undefined,
          deal_status_id: filterDealStatus ? parseInt(filterDealStatus) : undefined,
          matrix_id: filterMatrix ? parseInt(filterMatrix) : undefined,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setClients(data.clients);
      }
    } catch (error) {
      console.error('Ошибка загрузки клиентов:', error);
    } finally {
      setLoading(false);
    }
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

  const quadrantCounts = {
    focus: clients.filter(c => c.quadrant === 'focus').length,
    grow: clients.filter(c => c.quadrant === 'grow').length,
    monitor: clients.filter(c => c.quadrant === 'monitor').length,
    archive: clients.filter(c => c.quadrant === 'archive').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Клиенты</h1>
                <p className="text-sm text-muted-foreground">Управление базой клиентов</p>
              </div>
            </div>
            {hasMatrices ? (
              <Link to="/client/new">
                <Button className="gradient-primary">
                  <Icon name="Plus" size={20} className="mr-2" />
                  Добавить клиента
                </Button>
              </Link>
            ) : (
              <Button className="gradient-primary" disabled title="Сначала создайте матрицу">
                <Icon name="Plus" size={20} className="mr-2" />
                Добавить клиента
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
              <Button
                variant={viewMode === 'matrix' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('matrix')}
                className="flex items-center gap-2"
              >
                <Icon name="Grid3x3" size={16} />
                Матрица клиентов
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2"
              >
                <Icon name="List" size={16} />
                Список клиентов
              </Button>
            </div>

            {matrices.length > 1 && viewMode === 'matrix' && (
              <div className="flex items-center gap-2">
                <Icon name="Layout" size={20} className="text-muted-foreground" />
                <select
                  value={filterMatrix}
                  onChange={(e) => setFilterMatrix(e.target.value)}
                  className="px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {matrices.map((matrix) => (
                    <option key={matrix.id} value={matrix.id}>
                      {matrix.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Icon name="Filter" size={20} className="text-muted-foreground" />
            <span className="text-sm font-medium">Фильтр по статусу сделки:</span>
          </div>
          <select
            value={filterDealStatus}
            onChange={(e) => setFilterDealStatus(e.target.value)}
            className="px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Все статусы</option>
            {dealStatuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
          {filterDealStatus && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilterDealStatus('')}
            >
              <Icon name="X" size={16} className="mr-2" />
              Сбросить
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card
            className={`p-4 cursor-pointer transition-all hover:scale-105 ${filterQuadrant === 'focus' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setFilterQuadrant(filterQuadrant === 'focus' ? '' : 'focus')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">🔴 Фокус сейчас</p>
                <p className="text-3xl font-bold text-green-500">{quadrantCounts.focus}</p>
              </div>
              <div className="w-12 h-12 rounded-lg quadrant-focus flex items-center justify-center">
                <Icon name="Zap" size={24} className="text-white" />
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 cursor-pointer transition-all hover:scale-105 ${filterQuadrant === 'grow' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setFilterQuadrant(filterQuadrant === 'grow' ? '' : 'grow')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">🟠 Выращивать</p>
                <p className="text-3xl font-bold text-blue-500">{quadrantCounts.grow}</p>
              </div>
              <div className="w-12 h-12 rounded-lg quadrant-grow flex items-center justify-center">
                <Icon name="TrendingUp" size={24} className="text-white" />
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 cursor-pointer transition-all hover:scale-105 ${filterQuadrant === 'monitor' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setFilterQuadrant(filterQuadrant === 'monitor' ? '' : 'monitor')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">🟡 Мониторить</p>
                <p className="text-3xl font-bold text-yellow-500">{quadrantCounts.monitor}</p>
              </div>
              <div className="w-12 h-12 rounded-lg quadrant-monitor flex items-center justify-center">
                <Icon name="Eye" size={24} className="text-white" />
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 cursor-pointer transition-all hover:scale-105 ${filterQuadrant === 'archive' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setFilterQuadrant(filterQuadrant === 'archive' ? '' : 'archive')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">⚪ Архив</p>
                <p className="text-3xl font-bold text-gray-500">{quadrantCounts.archive}</p>
              </div>
              <div className="w-12 h-12 rounded-lg quadrant-archive flex items-center justify-center">
                <Icon name="Archive" size={24} className="text-gray-300" />
              </div>
            </div>
          </Card>
        </div>

        {filterQuadrant && (
          <div className="mb-4">
            <Badge variant="outline" className="text-sm">
              <Icon name="Filter" size={14} className="mr-2" />
              Фильтр: {getQuadrantConfig(filterQuadrant).label}
              <button onClick={() => setFilterQuadrant('')} className="ml-2">
                <Icon name="X" size={14} />
              </button>
            </Badge>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="Loader2" size={32} className="animate-spin text-primary" />
          </div>
        ) : clients.length === 0 && viewMode === 'list' ? (
          <Card className="p-12 text-center border-dashed">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Icon name="Building2" size={40} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Пока нет клиентов</h3>
            {!hasMatrices ? (
              <p className="text-muted-foreground mb-6">
                Сначала <Link to="/matrices/new" className="text-primary hover:underline">создайте матрицу</Link>, чтобы начать добавлять клиентов
              </p>
            ) : (
              <p className="text-muted-foreground mb-6">
                Добавьте первого клиента и начните работу с матрицей приоритизации
              </p>
            )}
            <Link to="/client/new">
              <Button className="gradient-primary">
                <Icon name="Plus" size={20} className="mr-2" />
                Добавить первого клиента
              </Button>
            </Link>
          </Card>
        ) : viewMode === 'matrix' ? (
          <ClientsMatrixView
            clients={clients}
            onClientClick={(id) => navigate(`/client/${id}`)}
            getQuadrantConfig={getQuadrantConfig}
          />
        ) : (
          <ClientsListView
            clients={clients}
            onClientClick={(id) => navigate(`/client/${id}`)}
            getQuadrantConfig={getQuadrantConfig}
          />
        )}
      </div>
    </div>
  );
};

export default Clients;