import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import AppLayout from '@/components/layout/AppLayout';
import { toast } from 'sonner';

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
  deleted_at: string;
  deal_status_id: number | null;
  deal_status_name: string | null;
  deal_status_weight: number | null;
}

const ClientsDeleted = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchDeletedClients();
  }, [navigate]);

  const fetchDeletedClients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/9347d703-acfe-4def-a4ae-a4a52329c037', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'list_deleted' }),
      });

      const data = await response.json();
      if (response.ok) {
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки удаленных клиентов:', error);
      toast.error('Не удалось загрузить удаленных клиентов');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (clientId: number) => {
    setRestoring(clientId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/9347d703-acfe-4def-a4ae-a4a52329c037', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'restore', client_id: clientId }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Клиент восстановлен');
        fetchDeletedClients();
      } else {
        toast.error(data.error || 'Ошибка восстановления');
      }
    } catch (error) {
      console.error('Ошибка восстановления клиента:', error);
      toast.error('Не удалось восстановить клиента');
    } finally {
      setRestoring(null);
    }
  };

  const getQuadrantConfig = (quadrant: string) => {
    const configs = {
      focus: { label: 'Фокус', icon: 'Target', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
      monitor: { label: 'Мониторить', icon: 'Eye', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      grow: { label: 'Выращивать', icon: 'TrendingUp', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
      archive: { label: 'Архив', icon: 'Archive', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' }
    };
    return configs[quadrant as keyof typeof configs] || configs.archive;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Icon name="Loader2" size={48} className="animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/clients')}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Удаленные клиенты</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {clients.length} {clients.length === 1 ? 'клиент' : 'клиентов'}
              </p>
            </div>
          </div>
        </div>

        {clients.length === 0 ? (
          <Card className="p-12 text-center">
            <Icon name="Trash2" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-bold mb-2">Нет удаленных клиентов</h2>
            <p className="text-muted-foreground mb-6">
              Удаленные клиенты будут отображаться здесь
            </p>
            <Button onClick={() => navigate('/clients')}>
              <Icon name="Building2" size={16} className="mr-2" />
              Перейти к клиентам
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {clients.map((client) => {
              const quadrantConfig = getQuadrantConfig(client.quadrant);
              
              return (
                <Card key={client.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-1">{client.company_name}</h3>
                          {client.contact_person && (
                            <p className="text-sm text-muted-foreground mb-2">
                              <Icon name="User" size={14} className="inline mr-1" />
                              {client.contact_person}
                            </p>
                          )}
                        </div>
                        {client.quadrant && (
                          <Badge variant="outline" className={quadrantConfig.color}>
                            <Icon name={quadrantConfig.icon} size={14} className="mr-1" />
                            {quadrantConfig.label}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                        {client.matrix_name && (
                          <span className="flex items-center">
                            <Icon name="Grid3x3" size={14} className="mr-1" />
                            {client.matrix_name}
                          </span>
                        )}
                        {client.deal_status_name && (
                          <span className="flex items-center">
                            <Icon name="Tag" size={14} className="mr-1" />
                            {client.deal_status_name}
                          </span>
                        )}
                      </div>

                      {client.matrix_id && (
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            X: <span className="font-medium text-foreground">{client.score_x.toFixed(1)}</span>
                          </span>
                          <span className="text-muted-foreground">
                            Y: <span className="font-medium text-foreground">{client.score_y.toFixed(1)}</span>
                          </span>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-3">
                        Удален: {new Date(client.deleted_at).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleRestore(client.id)}
                      disabled={restoring === client.id}
                      className="w-full sm:w-auto"
                    >
                      {restoring === client.id ? (
                        <>
                          <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                          Восстановление...
                        </>
                      ) : (
                        <>
                          <Icon name="RotateCcw" size={16} className="mr-2" />
                          Восстановить
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ClientsDeleted;
