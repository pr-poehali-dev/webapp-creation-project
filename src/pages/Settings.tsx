import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import OrganizationSettingsForm from '@/components/settings/OrganizationSettingsForm';
import DealStatusCreateForm from '@/components/settings/DealStatusCreateForm';
import DealStatusList from '@/components/settings/DealStatusList';
import UserPermissionsSection from '@/components/settings/UserPermissionsSection';

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
  const [activeTab, setActiveTab] = useState<'organization' | 'statuses' | 'permissions' | 'telegram'>('organization');
  const [telegramLinkUrl, setTelegramLinkUrl] = useState<string>('');

  const [orgForm, setOrgForm] = useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    description: '',
  });

  const [newStatus, setNewStatus] = useState({
    name: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchSettings();
    fetchDealStatuses();
    generateTelegramLink();
  }, [navigate]);

  const generateTelegramLink = () => {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    const user = JSON.parse(userData);
    const token = localStorage.getItem('token');
    
    const deepLink = `https://t.me/your_bot?start=link_${btoa(`${user.id}_${user.organization_id}_${token}`)}`;
    setTelegramLinkUrl(deepLink);
  };

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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания статуса');
      }

      setSuccess('Статус сделки создан');
      setNewStatus({ name: '' });
      await fetchDealStatuses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания статуса');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (statusId: number, name: string) => {
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
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Настройки</h1>
                <p className="text-sm text-muted-foreground">Управление организацией, статусами и правами доступа</p>
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

        <div className="mb-6 flex flex-wrap gap-2 border-b border-border">
          <Button
            variant={activeTab === 'organization' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('organization')}
            className="rounded-b-none text-xs sm:text-sm px-2 sm:px-4"
          >
            <Icon name="Building2" size={14} className="sm:mr-2" />
            <span className="hidden sm:inline">Организация</span>
          </Button>
          <Button
            variant={activeTab === 'statuses' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('statuses')}
            className="rounded-b-none text-xs sm:text-sm px-2 sm:px-4"
          >
            <Icon name="ListChecks" size={14} className="sm:mr-2" />
            <span className="hidden sm:inline">Статусы сделок</span>
            <span className="sm:hidden">Статусы</span>
          </Button>
          <Button
            variant={activeTab === 'permissions' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('permissions')}
            className="rounded-b-none text-xs sm:text-sm px-2 sm:px-4"
          >
            <Icon name="Shield" size={14} className="sm:mr-2" />
            <span className="hidden sm:inline">Права доступа</span>
            <span className="sm:hidden">Права</span>
          </Button>
          <Button
            variant={activeTab === 'telegram' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('telegram')}
            className="rounded-b-none text-xs sm:text-sm px-2 sm:px-4"
          >
            <Icon name="Send" size={14} className="sm:mr-2" />
            <span className="hidden sm:inline">Telegram</span>
          </Button>
        </div>

        <div className="space-y-6">
          {activeTab === 'organization' && (
            <OrganizationSettingsForm
            orgForm={orgForm}
            setOrgForm={setOrgForm}
            onSubmit={handleSaveOrganization}
            loading={loading}
          />
          )}

          {activeTab === 'statuses' && (
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

            <DealStatusCreateForm
              newStatus={newStatus}
              setNewStatus={setNewStatus}
              onSubmit={handleCreateStatus}
              loading={loading}
              disabled={dealStatuses.length >= 15}
            />

            <DealStatusList
              statuses={dealStatuses}
              editingStatus={editingStatus}
              setEditingStatus={setEditingStatus}
              onUpdate={handleUpdateStatus}
              onDelete={handleDeleteStatus}
            />
          </Card>
          )}

          {activeTab === 'permissions' && (
            <UserPermissionsSection
              onError={(err) => setError(err)}
              onSuccess={(msg) => setSuccess(msg)}
            />
          )}

          {activeTab === 'telegram' && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Icon name="Send" size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Привязка Telegram бота</h2>
                  <p className="text-sm text-muted-foreground">Добавляйте клиентов прямо из Telegram</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-3 mb-4">
                    <Icon name="Info" size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-600">
                      <p className="font-semibold mb-1">Зачем привязывать бота?</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Добавляйте клиентов мобильно после переговоров</li>
                        <li>• Заполняйте данные через удобный диалог</li>
                        <li>• Получайте уведомления о важных событиях</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Как привязать бота:</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">1</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Нажмите кнопку ниже</p>
                        <p className="text-sm text-muted-foreground">Откроется Telegram с ботом</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">2</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Нажмите "Start" в боте</p>
                        <p className="text-sm text-muted-foreground">Бот автоматически привяжется к вашему аккаунту</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">3</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Готово!</p>
                        <p className="text-sm text-muted-foreground">Используйте кнопку "Добавить клиента" в боте</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button
                    className="w-full gradient-primary h-12 text-base font-semibold"
                    onClick={() => window.open(telegramLinkUrl, '_blank')}
                  >
                    <Icon name="Send" size={20} className="mr-2" />
                    Привязать Telegram бота
                  </Button>

                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Ссылка действительна только для вашего аккаунта
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Icon name="Smartphone" size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      <strong>Мобильный режим:</strong> На мобильных устройствах вы увидите уведомление о привязке бота прямо в интерфейсе CRM
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;