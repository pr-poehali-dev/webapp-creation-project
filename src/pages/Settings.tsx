import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Organization {
  id: number;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  description: string | null;
}

interface DealStatus {
  id: number;
  name: string;
  weight: number;
  sort_order: number;
}

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [dealStatuses, setDealStatuses] = useState<DealStatus[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingStatus, setEditingStatus] = useState<number | null>(null);

  const [orgForm, setOrgForm] = useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    description: '',
  });

  const [newStatus, setNewStatus] = useState({
    name: '',
    weight: 5,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchSettings();
    fetchDealStatuses();
  }, [navigate]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/acdf6580-785a-4a65-963a-b46134c33f8b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'get_settings' }),
      });

      const data = await response.json();
      if (response.ok) {
        setOrganization(data.organization);
        setOrgForm({
          name: data.organization.name || '',
          contact_email: data.organization.contact_email || '',
          contact_phone: data.organization.contact_phone || '',
          description: data.organization.description || '',
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
      setError('Ошибка загрузки настроек');
    }
  };

  const fetchDealStatuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/acdf6580-785a-4a65-963a-b46134c33f8b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'list_deal_statuses' }),
      });

      const data = await response.json();
      if (response.ok) {
        setDealStatuses(data.statuses);
      }
    } catch (error) {
      console.error('Ошибка загрузки статусов:', error);
    }
  };

  const handleSaveOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/acdf6580-785a-4a65-963a-b46134c33f8b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'update_settings',
          ...orgForm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка сохранения настроек');
      }

      setSuccess('Настройки организации обновлены');
      fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения настроек');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newStatus.name.trim()) {
      setError('Название статуса обязательно');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/acdf6580-785a-4a65-963a-b46134c33f8b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'create_deal_status',
          name: newStatus.name,
          weight: newStatus.weight,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания статуса');
      }

      setSuccess('Статус сделки создан');
      setNewStatus({ name: '', weight: 5 });
      fetchDealStatuses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания статуса');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (statusId: number, name: string, weight: number) => {
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/acdf6580-785a-4a65-963a-b46134c33f8b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'update_deal_status',
          status_id: statusId,
          name,
          weight,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка обновления статуса');
      }

      setSuccess('Статус обновлён');
      setEditingStatus(null);
      fetchDealStatuses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления статуса');
    }
  };

  const handleDeleteStatus = async (statusId: number) => {
    if (!confirm('Удалить этот статус? Связанные с ним клиенты не будут удалены.')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/acdf6580-785a-4a65-963a-b46134c33f8b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'delete_deal_status',
          status_id: statusId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка удаления статуса');
      }

      setSuccess('Статус деактивирован');
      fetchDealStatuses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления статуса');
    }
  };

  const handleInitDefaultStatuses = async () => {
    if (!confirm('Создать 5 дефолтных статусов сделок?')) {
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/acdf6580-785a-4a65-963a-b46134c33f8b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'init_default_statuses' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания статусов');
      }

      setSuccess(data.message);
      fetchDealStatuses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания статусов');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Настройки</h1>
                <p className="text-sm text-muted-foreground">Управление организацией и статусами сделок</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <Icon name="AlertTriangle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
            <Icon name="CheckCircle" size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-500">{success}</p>
          </div>
        )}

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Icon name="Building2" size={24} />
              Настройки организации
            </h2>

            <form onSubmit={handleSaveOrganization} className="space-y-4">
              <div>
                <label htmlFor="org_name" className="block text-sm font-medium mb-2">
                  Название организации <span className="text-destructive">*</span>
                </label>
                <input
                  id="org_name"
                  type="text"
                  required
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="ООО «Технологии»"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact_email" className="block text-sm font-medium mb-2">
                    Контактный Email
                  </label>
                  <input
                    id="contact_email"
                    type="email"
                    value={orgForm.contact_email}
                    onChange={(e) => setOrgForm({ ...orgForm, contact_email: e.target.value })}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="contact@company.ru"
                  />
                </div>

                <div>
                  <label htmlFor="contact_phone" className="block text-sm font-medium mb-2">
                    Контактный телефон
                  </label>
                  <input
                    id="contact_phone"
                    type="tel"
                    value={orgForm.contact_phone}
                    onChange={(e) => setOrgForm({ ...orgForm, contact_phone: e.target.value })}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Описание
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={orgForm.description}
                  onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Краткое описание вашей организации..."
                />
              </div>

              <Button
                type="submit"
                className="gradient-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Icon name="Save" size={20} className="mr-2" />
                    Сохранить настройки
                  </>
                )}
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Icon name="ListChecks" size={24} />
                Статусы сделок
              </h2>
              {dealStatuses.length === 0 && (
                <Button variant="outline" size="sm" onClick={handleInitDefaultStatuses}>
                  <Icon name="Sparkles" size={16} className="mr-2" />
                  Создать дефолтные
                </Button>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Управляйте статусами сделок. Каждый статус имеет вес от 0 до 10 для ранжирования клиентов. Максимум 15 статусов.
            </p>

            <form onSubmit={handleCreateStatus} className="mb-6 p-4 bg-card/50 rounded-lg border border-border">
              <h3 className="text-sm font-semibold mb-3">Добавить новый статус</h3>
              <div className="grid md:grid-cols-[1fr_150px_auto] gap-3">
                <input
                  type="text"
                  placeholder="Название статуса"
                  value={newStatus.name}
                  onChange={(e) => setNewStatus({ ...newStatus, name: e.target.value })}
                  className="px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div>
                  <select
                    value={newStatus.weight}
                    onChange={(e) => setNewStatus({ ...newStatus, weight: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((w) => (
                      <option key={w} value={w}>
                        Вес: {w}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" disabled={loading || dealStatuses.length >= 15}>
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить
                </Button>
              </div>
            </form>

            <div className="space-y-3">
              {dealStatuses.map((status) => (
                <div
                  key={status.id}
                  className="p-4 bg-card/50 rounded-lg border border-border flex items-center gap-4"
                >
                  {editingStatus === status.id ? (
                    <>
                      <input
                        type="text"
                        defaultValue={status.name}
                        id={`edit-name-${status.id}`}
                        className="flex-1 px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <select
                        defaultValue={status.weight}
                        id={`edit-weight-${status.id}`}
                        className="px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        onClick={() => {
                          const nameInput = document.getElementById(`edit-name-${status.id}`) as HTMLInputElement;
                          const weightSelect = document.getElementById(`edit-weight-${status.id}`) as HTMLSelectElement;
                          handleUpdateStatus(status.id, nameInput.value, parseInt(weightSelect.value));
                        }}
                      >
                        <Icon name="Check" size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingStatus(null)}
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="font-medium">{status.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                          Вес: {status.weight}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingStatus(status.id)}
                        >
                          <Icon name="Edit" size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteStatus(status.id)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {dealStatuses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="ListX" size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Нет статусов сделок</p>
                  <p className="text-sm">Создайте дефолтные статусы или добавьте свои</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
