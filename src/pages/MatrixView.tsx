import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Client {
  id: number;
  company_name: string;
  contact_person: string;
  score_x: number;
  score_y: number;
  quadrant: string;
}

interface Matrix {
  id: number;
  name: string;
  description: string;
}

const MatrixView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [matrix, setMatrix] = useState<Matrix | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchMatrix();
    fetchClients();
  }, [navigate, id]);

  const fetchMatrix = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/574d8d38-81d5-49c7-b625-a170daa667bc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'get', matrix_id: parseInt(id!) }),
      });

      const data = await response.json();
      if (response.ok) {
        setMatrix(data.matrix);
      }
    } catch (error) {
      console.error('Ошибка загрузки матрицы:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/9347d703-acfe-4def-a4ae-a4a52329c037', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'list', matrix_id: parseInt(id!) }),
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

  const getQuadrantClients = (quadrant: string) => {
    return clients.filter(c => c.quadrant === quadrant);
  };

  const focusClients = getQuadrantClients('focus');
  const growClients = getQuadrantClients('grow');
  const monitorClients = getQuadrantClients('monitor');
  const archiveClients = getQuadrantClients('archive');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/matrices')}>
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{matrix?.name}</h1>
                <p className="text-sm text-muted-foreground">2D визуализация клиентов</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate(`/matrix/${id}`)}>
                <Icon name="Settings" size={20} className="mr-2" />
                Настроить матрицу
              </Button>
              <Button className="gradient-primary" onClick={() => navigate('/client/new')}>
                <Icon name="Plus" size={20} className="mr-2" />
                Добавить клиента
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Статистика по квадрантам</h2>
              <Badge variant="outline">
                Всего клиентов: {clients.length}
              </Badge>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg quadrant-focus">
                <p className="text-sm text-white/90 mb-1">🔴 Фокус сейчас</p>
                <p className="text-3xl font-bold text-white">{focusClients.length}</p>
              </div>
              <div className="text-center p-4 rounded-lg quadrant-grow">
                <p className="text-sm text-white/90 mb-1">🟠 Выращивать</p>
                <p className="text-3xl font-bold text-white">{growClients.length}</p>
              </div>
              <div className="text-center p-4 rounded-lg quadrant-monitor">
                <p className="text-sm text-white/90 mb-1">🟡 Мониторить</p>
                <p className="text-3xl font-bold text-white">{monitorClients.length}</p>
              </div>
              <div className="text-center p-4 rounded-lg quadrant-archive">
                <p className="text-sm text-gray-300 mb-1">⚪ Архив</p>
                <p className="text-3xl font-bold text-gray-300">{archiveClients.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Матрица приоритизации</h2>
          
          <div className="relative" style={{ height: '600px' }}>
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1">
              <div className="quadrant-grow relative rounded-tl-lg p-4 overflow-auto">
                <div className="absolute top-4 left-4">
                  <p className="text-white font-bold text-lg">🟠 Выращивать</p>
                  <p className="text-white/80 text-sm">Высокое влияние, низкая зрелость</p>
                </div>
                <div className="pt-16 space-y-2">
                  {growClients.map(client => (
                    <div
                      key={client.id}
                      className="bg-white/10 backdrop-blur-sm p-3 rounded-lg cursor-pointer hover:bg-white/20 transition-all"
                      onClick={() => navigate(`/client/${client.id}`)}
                    >
                      <p className="text-white font-semibold text-sm">{client.company_name}</p>
                      {client.contact_person && (
                        <p className="text-white/70 text-xs">{client.contact_person}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
                        <span>X: {client.score_x.toFixed(1)}</span>
                        <span>Y: {client.score_y.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="quadrant-focus relative rounded-tr-lg p-4 overflow-auto">
                <div className="absolute top-4 left-4">
                  <p className="text-white font-bold text-lg">🔴 Фокус сейчас</p>
                  <p className="text-white/80 text-sm">Высокое влияние, высокая зрелость</p>
                </div>
                <div className="pt-16 space-y-2">
                  {focusClients.map(client => (
                    <div
                      key={client.id}
                      className="bg-white/10 backdrop-blur-sm p-3 rounded-lg cursor-pointer hover:bg-white/20 transition-all"
                      onClick={() => navigate(`/client/${client.id}`)}
                    >
                      <p className="text-white font-semibold text-sm">{client.company_name}</p>
                      {client.contact_person && (
                        <p className="text-white/70 text-xs">{client.contact_person}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
                        <span>X: {client.score_x.toFixed(1)}</span>
                        <span>Y: {client.score_y.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="quadrant-archive relative rounded-bl-lg p-4 overflow-auto">
                <div className="absolute top-4 left-4">
                  <p className="text-gray-300 font-bold text-lg">⚪ Архив</p>
                  <p className="text-gray-400 text-sm">Низкое влияние, низкая зрелость</p>
                </div>
                <div className="pt-16 space-y-2">
                  {archiveClients.map(client => (
                    <div
                      key={client.id}
                      className="bg-white/5 backdrop-blur-sm p-3 rounded-lg cursor-pointer hover:bg-white/10 transition-all"
                      onClick={() => navigate(`/client/${client.id}`)}
                    >
                      <p className="text-gray-300 font-semibold text-sm">{client.company_name}</p>
                      {client.contact_person && (
                        <p className="text-gray-400 text-xs">{client.contact_person}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>X: {client.score_x.toFixed(1)}</span>
                        <span>Y: {client.score_y.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="quadrant-monitor relative rounded-br-lg p-4 overflow-auto">
                <div className="absolute top-4 left-4">
                  <p className="text-white font-bold text-lg">🟡 Мониторить</p>
                  <p className="text-white/80 text-sm">Низкое влияние, высокая зрелость</p>
                </div>
                <div className="pt-16 space-y-2">
                  {monitorClients.map(client => (
                    <div
                      key={client.id}
                      className="bg-white/10 backdrop-blur-sm p-3 rounded-lg cursor-pointer hover:bg-white/20 transition-all"
                      onClick={() => navigate(`/client/${client.id}`)}
                    >
                      <p className="text-white font-semibold text-sm">{client.company_name}</p>
                      {client.contact_person && (
                        <p className="text-white/70 text-xs">{client.contact_person}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
                        <span>X: {client.score_x.toFixed(1)}</span>
                        <span>Y: {client.score_y.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-8">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Icon name="TrendingUp" size={16} className="text-primary" />
                <span>Стратегическое влияние (X)</span>
              </div>
            </div>

            <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-12 -rotate-90">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Icon name="Target" size={16} className="text-secondary" />
                <span>Зрелость потребности (Y)</span>
              </div>
            </div>
          </div>
        </Card>

        {clients.length === 0 && (
          <Card className="p-12 text-center border-dashed mt-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Icon name="Building2" size={40} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Нет клиентов в этой матрице</h3>
            <p className="text-muted-foreground mb-6">
              Добавьте клиентов и оцените их по критериям матрицы
            </p>
            <Button className="gradient-primary" onClick={() => navigate('/client/new')}>
              <Icon name="Plus" size={20} className="mr-2" />
              Добавить клиента
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MatrixView;